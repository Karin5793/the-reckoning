require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const INITIAL_COUNTRY_RESOURCES = {
  'Osmanlı İmparatorluğu': { bugday: 80, demir: 40, petrol: 120, para: 150, nig: 25 },
  'Alman İmparatorluğu': { bugday: 90, demir: 180, petrol: 30, para: 200, nig: 80 },
  'Çarlık Rusyası': { bugday: 200, demir: 80, petrol: 60, para: 120, nig: 100 },
  'Avusturya-Macaristan': { bugday: 100, demir: 90, petrol: 40, para: 130, nig: 60 },
  'Büyük Britanya İmparatorluğu': { bugday: 60, demir: 120, petrol: 20, para: 300, nig: 90 },
  'Fransa Cumhuriyeti': { bugday: 80, demir: 140, petrol: 20, para: 180, nig: 70 },
  'İtalya Krallığı': { bugday: 70, demir: 50, petrol: 10, para: 100, nig: 40 },
  'Japon İmparatorluğu': { bugday: 60, demir: 80, petrol: 10, para: 120, nig: 60 },
  'Amerika Birleşik Devletleri': { bugday: 200, demir: 200, petrol: 200, para: 400, nig: 80 },
  'Sırbistan Krallığı': { bugday: 40, demir: 30, petrol: 5, para: 50, nig: 20 },
  'Romanya Krallığı': { bugday: 90, demir: 40, petrol: 100, para: 80, nig: 30 },
  'Bulgaristan Çarlığı': { bugday: 50, demir: 20, petrol: 5, para: 60, nig: 20 },
};

const turRetim = {
  'Osmanlı İmparatorluğu': { bugday: 15, demir: 8, petrol: 20, para: 20, nig: 3 },
  'Alman İmparatorluğu': { bugday: 20, demir: 35, petrol: 5, para: 35, nig: 12 },
  'Çarlık Rusyası': { bugday: 40, demir: 20, petrol: 15, para: 20, nig: 15 },
  'Avusturya-Macaristan': { bugday: 22, demir: 20, petrol: 8, para: 22, nig: 8 },
  'Büyük Britanya İmparatorluğu': { bugday: 15, demir: 25, petrol: 5, para: 50, nig: 12 },
  'Fransa Cumhuriyeti': { bugday: 18, demir: 28, petrol: 4, para: 30, nig: 10 },
  'İtalya Krallığı': { bugday: 15, demir: 12, petrol: 2, para: 18, nig: 5 },
  'Japon İmparatorluğu': { bugday: 12, demir: 18, petrol: 2, para: 20, nig: 8 },
  'Amerika Birleşik Devletleri': { bugday: 40, demir: 40, petrol: 40, para: 70, nig: 12 },
  'Sırbistan Krallığı': { bugday: 10, demir: 6, petrol: 1, para: 8, nig: 3 },
  'Romanya Krallığı': { bugday: 20, demir: 10, petrol: 22, para: 14, nig: 4 },
  'Bulgaristan Çarlığı': { bugday: 12, demir: 5, petrol: 1, para: 10, nig: 3 },
};

const UNIT_COST = {
  infantry: { bugday: 10, para: 5 },
  artillery: { demir: 15, para: 10 },
  cavalry: { bugday: 8, para: 8 },
};

const WAR_TACTIC_SECONDS = 60; // test: 60s; prod: 30 * 60

const gameState = {
  year: 1914,
  turn: 1,
  maxTurns: 4,
  players: {},
  units: {},
  territories: {},
  wars: {},
  countryResources: JSON.parse(JSON.stringify(INITIAL_COUNTRY_RESOURCES)),
  turnActive: false,
  turnDuration: 60000, // test: 1 dakika (prod: 7200000)
  turnEndTime: null,
  turnStartTime: null,
  turnLedger: { wars: [], territories: {}, interceptedTelegraphs: [] },
};

let hostId = null;
let turnTimerInterval = null;

function emitResourcesForCountry(country) {
  const snapshot = gameState.countryResources[country];
  if (!snapshot) return;
  const payload = { ...snapshot };
  Object.entries(gameState.players).forEach(([id, p]) => {
    if (p.country === country) io.to(id).emit('resourcesUpdate', payload);
  });
}

function emitResourcesToSocket(targetSocket) {
  const p = gameState.players[targetSocket.id];
  if (!p) return;
  const r = gameState.countryResources[p.country];
  if (r) targetSocket.emit('resourcesUpdate', { ...r });
}

function applyTurnProduction() {
  const seen = new Set();
  Object.values(gameState.players).forEach((p) => {
    if (!p.country || seen.has(p.country)) return;
    seen.add(p.country);
    const prod = turRetim[p.country];
    const res = gameState.countryResources[p.country];
    if (!prod || !res) return;
    Object.keys(prod).forEach((k) => {
      res[k] += prod[k];
    });
  });
}

function broadcastAllPlayerResources() {
  Object.entries(gameState.players).forEach(([id, p]) => {
    const r = gameState.countryResources[p.country];
    if (r) io.to(id).emit('resourcesUpdate', { ...r });
  });
}

function endTurn() {
  clearInterval(turnTimerInterval);
  turnTimerInterval = null;
  gameState.turnActive = false;
  gameState.turnEndTime = null;
  gameState.turnStartTime = null;

  const dispatchYear = gameState.year;
  const ledger = gameState.turnLedger || {
    wars: [],
    territories: {},
    interceptedTelegraphs: [],
  };
  const warsSnap = [...ledger.wars];
  const territoriesSnap = { ...ledger.territories };
  const interceptedSnap = [...(ledger.interceptedTelegraphs || [])];

  gameState.year += 1;
  gameState.turn += 1;
  gameState.turnLedger = { wars: [], territories: {}, interceptedTelegraphs: [] };

  console.log(`Tur bitti. Yeni yıl: ${gameState.year}, Tur: ${gameState.turn}`);
  io.emit('turnEnded', {
    year: gameState.year,
    turn: gameState.turn,
    dispatchYear,
    wars: warsSnap,
    territories: territoriesSnap,
    interceptedTelegraphs: interceptedSnap,
  });
}

function collectUnitsForCountry(units, country) {
  const totals = { infantry: 0, artillery: 0, cavalry: 0 };
  Object.entries(units || {}).forEach(([region, u]) => {
    if (!u || typeof u !== 'object') return;
    if (region === country || region.startsWith(`${country} (`)) {
      totals.infantry += u.infantry || 0;
      totals.artillery += u.artillery || 0;
      totals.cavalry += u.cavalry || 0;
    }
  });
  return totals;
}

function parseWarResult(text, attacker, defender) {
  const result = {
    winner: null,
    attackerLosses: { piyade: 0, topcu: 0, suvari: 0 },
    defenderLosses: { piyade: 0, topcu: 0, suvari: 0 },
  };

  const t = typeof text === 'string' ? text : '';
  if (t.includes('SALDIRAN KAZANDI')) result.winner = attacker;
  else if (t.includes('SAVUNAN KAZANDI')) result.winner = defender;
  else result.winner = 'BERABERLIK';

  const lines = t.split('\n');
  let parsingAttacker = false;
  let parsingDefender = false;

  const attackerHeader = `${attacker} KAYIPLARI`;
  const defenderHeader = `${defender} KAYIPLARI`;

  lines.forEach((line) => {
    if (line.includes(attackerHeader)) {
      parsingAttacker = true;
      parsingDefender = false;
    }
    if (line.includes(defenderHeader)) {
      parsingAttacker = false;
      parsingDefender = true;
    }

    const target =
      parsingAttacker ? result.attackerLosses : parsingDefender ? result.defenderLosses : null;
    if (!target) return;

    const numbers = line.match(/[\d.]+/g);
    if (!numbers) return;
    const num = parseInt(numbers[0].replace(/\./g, ''), 10);
    if (!Number.isFinite(num)) return;

    const lower = line.toLowerCase();
    if (lower.includes('piyade') || lower.includes('infantry')) {
      target.piyade = num;
    }
    if (lower.includes('topçu') || lower.includes('topcu') || lower.includes('artill')) {
      target.topcu = num;
    }
    if (
      lower.includes('süvari') ||
      lower.includes('suvari') ||
      lower.includes('cavalry')
    ) {
      target.suvari = num;
    }
  });

  return result;
}

function rawCasualtiesToUnitLosses(losses) {
  const p = losses.piyade || 0;
  const t = losses.topcu || 0;
  const s = losses.suvari || 0;
  return {
    infantry: p === 0 ? 1 : Math.max(1, Math.floor(p / 1000)),
    artillery: t === 0 ? 1 : Math.max(1, t),
    cavalry: s === 0 ? 1 : Math.max(1, Math.floor(s / 100)),
  };
}

function findUnitKey(units, country) {
  if (!units || !country) return null;
  if (units[country]) return country;
  return Object.keys(units).find((k) => k.startsWith(country)) || null;
}

function subtractUnitsFromCountry(unitsObj, country, deltas) {
  const key = findUnitKey(unitsObj || {}, country);
  if (!key) return;
  const u = unitsObj[key];
  if (!u || typeof u !== 'object') return;
  const rem = { ...deltas };
  ['infantry', 'artillery', 'cavalry'].forEach((type) => {
    if (rem[type] <= 0) return;
    const cur = u[type] || 0;
    if (cur <= 0) return;
    const take = Math.min(cur, rem[type]);
    u[type] = Math.max(0, cur - take);
    rem[type] -= take;
  });
}

async function resolveWar(warData) {
  const {
    attacker,
    defender,
    attackerTactic,
    defenderTactic,
    attackerUnits,
    defenderUnits,
    year,
  } = warData;

  const prompt = `Sen deneyimli bir Birinci Dünya Savaşı tarihçisi ve savaş simülatörüsün. Gerçekçi, detaylı ve tarihi bağlamla uyumlu bir savaş değerlendirmesi yap.

SAVAŞ: ${attacker} vs ${defender}
YIL: ${year}

SALDIRAN (${attacker}):
- Birlikler: ${JSON.stringify(attackerUnits ?? {})}
- Taktik: ${attackerTactic || 'Taktik belirtilmedi - standart saldırı'}

SAVUNAN (${defender}):
- Birlikler: ${JSON.stringify(defenderUnits ?? {})}
- Taktik: ${defenderTactic || 'Taktik belirtilmedi - standart savunma'}

Şu formatta yanıt ver:

SONUÇ: [SALDIRAN KAZANDI / SAVUNAN KAZANDI / BERABERLİK]

SÜRE: [kaç gün sürdü]

AÇIKLAMA: [3-4 cümle, savaşın nasıl geliştiğini WW1 gerçekçiliğiyle anlat. Arazi, hava, moral, lojistik gibi faktörleri dahil et.]

${attacker} KAYIPLARI:
- Piyade: -[sayı] er
- Topçu: -[sayı] top
- Süvari: -[sayı] atlı

${defender} KAYIPLARI:
- Piyade: -[sayı] er
- Topçu: -[sayı] top
- Süvari: -[sayı] atlı

Kayıp sayılarını birim miktarına göre gerçekçi hesapla. Hiç piyade yoksa o satırı yazma.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'buraya_api_key_gelecek') {
    return [
      'SONUÇ: BERABERLİK',
      '',
      'SÜRE: —',
      '',
      'AÇIKLAMA: Anthropic API anahtarı ayarlanmadı; bu yer tutucu metindir.',
      '',
      `${attacker} KAYIPLARI:`,
      '- Piyade: -0 er',
      '',
      `${defender} KAYIPLARI:`,
      '- Piyade: -0 er',
    ].join('\n');
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content.find((b) => b.type === 'text');
  return block && block.text ? block.text : '';
}

async function finalizeWarResolution(warId) {
  const war = gameState.wars[warId];
  if (!war || war.resolved || war.resolving) return;
  war.resolving = true;
  if (war.resolveTimer) {
    clearTimeout(war.resolveTimer);
    war.resolveTimer = null;
  }

  const defenderUnits = collectUnitsForCountry(gameState.units, war.defender);

  const attackerUnits =
    war.attackerUnits && typeof war.attackerUnits === 'object'
      ? war.attackerUnits
      : collectUnitsForCountry(gameState.units, war.attacker);

  let rawText = '';
  try {
    rawText = await resolveWar({
      attacker: war.attacker,
      defender: war.defender,
      attackerTactic: war.attackerTactic,
      defenderTactic: war.defenderTactic,
      attackerUnits,
      defenderUnits,
      year: gameState.year,
    });
  } catch (err) {
    console.error('resolveWar hatası:', err);
    rawText = [
      'SONUÇ: BERABERLİK',
      '',
      'SÜRE: —',
      '',
      `AÇIKLAMA: Savaş çözümü alınamadı: ${err.message || String(err)}`,
    ].join('\n');
  }

  const aiResult = rawText;
  const attacker = war.attacker;
  const defender = war.defender;
  const parsed = parseWarResult(aiResult, attacker, defender);

  console.log(
    'PARSED RESULT:',
    JSON.stringify(parseWarResult(aiResult, attacker, defender), null, 2),
  );
  if (!gameState.units) gameState.units = {};
  console.log('UNITS BEFORE:', JSON.stringify(gameState.units, null, 2));

  subtractUnitsFromCountry(
    gameState.units,
    war.attacker,
    rawCasualtiesToUnitLosses(parsed.attackerLosses),
  );
  subtractUnitsFromCountry(
    gameState.units,
    war.defender,
    rawCasualtiesToUnitLosses(parsed.defenderLosses),
  );

  console.log('UNITS AFTER:', JSON.stringify(gameState.units, null, 2));

  if (!gameState.turnLedger) {
    gameState.turnLedger = { wars: [], territories: {}, interceptedTelegraphs: [] };
  }
  if (!Array.isArray(gameState.turnLedger.interceptedTelegraphs)) {
    gameState.turnLedger.interceptedTelegraphs = [];
  }
  gameState.turnLedger.wars.push({
    attacker: war.attacker,
    defender: war.defender,
    winner: parsed.winner,
  });
  if (parsed.winner === war.attacker) {
    gameState.territories[war.defender] = war.attacker;
    gameState.turnLedger.territories[war.defender] = war.attacker;
  }

  war.resolved = true;
  war.resolving = false;
  war.resultText = rawText;
  war.parsedResult = parsed;

  io.emit('warResult', {
    attacker: war.attacker,
    defender: war.defender,
    result: rawText,
    parsed,
  });

  io.emit('territoriesUpdate', gameState.territories);
  io.emit('unitsUpdate', gameState.units);
}

function scheduleWarAutoResolve(warId) {
  const war = gameState.wars[warId];
  if (!war) return;
  if (war.resolveTimer) clearTimeout(war.resolveTimer);
  war.resolveTimer = setTimeout(() => {
    finalizeWarResolution(warId).catch((e) => console.error(e));
  }, WAR_TACTIC_SECONDS * 1000);
}

io.on('connection', (socket) => {
  if (!hostId) {
    hostId = socket.id;
    console.log('Host belirlendi:', hostId);
  }

  console.log('Oyuncu bağlandı:', socket.id, hostId === socket.id ? '(host)' : '');

  socket.emit('gameState', {
    ...gameState,
    isHost: socket.id === hostId,
  });

  socket.emit('territoriesUpdate', gameState.territories);

  emitResourcesToSocket(socket);

  socket.on('selectCountry', ({ name, country }) => {
    gameState.players[socket.id] = { name, country, connectedAt: new Date() };
    console.log(`${name} -> ${country} seçti`);
    io.emit('playersUpdate', gameState.players);
    emitResourcesToSocket(socket);
  });

  socket.on('startTurn', () => {
    if (socket.id !== hostId) return;
    if (gameState.turnActive) return;

    applyTurnProduction();

    gameState.turnLedger = { wars: [], territories: {}, interceptedTelegraphs: [] };

    gameState.turnActive = true;
    gameState.turnStartTime = Date.now();
    gameState.turnEndTime = Date.now() + gameState.turnDuration;

    console.log(`Tur başladı. Bitiş: ${new Date(gameState.turnEndTime).toLocaleTimeString()}`);
    io.emit('turnStarted', {
      year: gameState.year,
      turn: gameState.turn,
      turnEndTime: gameState.turnEndTime,
    });

    broadcastAllPlayerResources();

    turnTimerInterval = setInterval(() => {
      const remaining = Math.max(0, gameState.turnEndTime - Date.now());
      io.emit('turnTimer', { remaining });
      if (remaining <= 0) endTurn();
    }, 1000);
  });

  socket.on('placeUnit', (data) => {
    const { country, unitType, playerId } = data;
    console.log(`${playerId} -> ${country} -> ${unitType} yerleştirdi`);

    if (!country || !unitType) return;
    if (playerId !== socket.id) return;

    const player = gameState.players[socket.id];
    if (!player) return;

    const cost = UNIT_COST[unitType];
    if (!cost) return;

    const r = gameState.countryResources[player.country];
    if (!r) return;

    const canAfford = Object.entries(cost).every(([k, amt]) => r[k] >= amt);
    if (!canAfford) return;

    Object.entries(cost).forEach(([k, amt]) => {
      r[k] -= amt;
    });

    if (!gameState.units) gameState.units = {};
    if (!gameState.units[country]) gameState.units[country] = {};
    if (!gameState.units[country][unitType]) gameState.units[country][unitType] = 0;

    gameState.units[country][unitType]++;

    io.emit('unitsUpdate', gameState.units);
    emitResourcesForCountry(player.country);
  });

  socket.on('declareWar', (data) => {
    const { attacker, defender, attackerTactic, attackerUnits } = data || {};
    const player = gameState.players[socket.id];
    if (!player || !attacker || !defender) return;
    if (player.country !== attacker) return;
    if (attacker === defender) return;
    if (!gameState.turnActive) return;

    const defenderExists = Object.values(gameState.players).some(
      (p) => p.country === defender && p.country !== attacker
    );
    if (!defenderExists) return;

    const warId = `w_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    gameState.wars[warId] = {
      attacker,
      defender,
      attackerTactic: attackerTactic || '',
      attackerUnits: attackerUnits && typeof attackerUnits === 'object' ? attackerUnits : {},
      defenderTactic: null,
      declaredAt: Date.now(),
      resolved: false,
      resolving: false,
      resolveTimer: null,
    };

    scheduleWarAutoResolve(warId);

    console.log(`Savaş ilanı: ${attacker} -> ${defender} (${warId})`);

    Object.entries(gameState.players).forEach(([id, p]) => {
      if (p.country === defender) {
        io.to(id).emit('warDeclared', {
          warId,
          attacker,
          defender,
          attackerTactic: attackerTactic || '',
          timeLeft: WAR_TACTIC_SECONDS,
        });
      }
    });
  });

  socket.on('submitDefense', async (data) => {
    const { warId, defenderTactic } = data || {};
    const player = gameState.players[socket.id];
    if (!player || !warId) return;

    const war = gameState.wars[warId];
    if (!war || war.defender !== player.country) return;
    if (war.resolved) return;

    war.defenderTactic = defenderTactic || '';

    await finalizeWarResolution(warId);
  });

  socket.on('endTurn', () => {
    if (socket.id !== hostId) return;
    if (!gameState.turnActive) return;
    endTurn();
  });

  socket.on('sendTelegraph', (data) => {
    const { to, message } = data || {};
    const sender = gameState.players[socket.id];
    if (!sender?.country || !to) return;

    const from = sender.country;
    if (from === to) return;

    const msg = String(message ?? '')
      .trim()
      .slice(0, 2000);
    if (!msg) return;

    const targetEntry = Object.entries(gameState.players).find(([, p]) => p.country === to);
    if (!targetEntry) return;

    const intercepted = Math.random() < 0.2;
    if (intercepted) {
      if (!gameState.turnLedger) {
        gameState.turnLedger = { wars: [], territories: {}, interceptedTelegraphs: [] };
      }
      if (!Array.isArray(gameState.turnLedger.interceptedTelegraphs)) {
        gameState.turnLedger.interceptedTelegraphs = [];
      }
      gameState.turnLedger.interceptedTelegraphs.push({ from, to, message: msg });
      io.emit('telegraphIntercepted', { from, to, message: msg });
      console.log(`TELEGRAF ELE GEÇİRİLDİ: ${from} -> ${to}`);
      return;
    }

    const [targetSocketId] = targetEntry;
    io.to(targetSocketId).emit('telegraphReceived', { from, message: msg });
  });

  socket.on('disconnect', () => {
    console.log('Oyuncu ayrıldı:', socket.id);
    delete gameState.players[socket.id];

    if (hostId === socket.id) {
      const remaining = Object.keys(gameState.players);
      hostId = remaining.length > 0 ? remaining[0] : null;
      if (hostId) {
        console.log('Yeni host:', hostId);
        io.to(hostId).emit('promotedToHost');
      }
    }

    io.emit('playersUpdate', gameState.players);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', gameState, hostId });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
