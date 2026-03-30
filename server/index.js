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
  wars: {},
  countryResources: JSON.parse(JSON.stringify(INITIAL_COUNTRY_RESOURCES)),
  turnActive: false,
  turnDuration: 60000, // test: 1 dakika (prod: 7200000)
  turnEndTime: null,
  turnStartTime: null,
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
  gameState.year += 1;
  gameState.turn += 1;
  console.log(`Tur bitti. Yeni yıl: ${gameState.year}, Tur: ${gameState.turn}`);
  io.emit('turnEnded', { year: gameState.year, turn: gameState.turn });
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
    };

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

  socket.on('submitDefense', (data) => {
    const { warId, defenderTactic } = data || {};
    const player = gameState.players[socket.id];
    if (!player || !warId) return;

    const war = gameState.wars[warId];
    if (!war || war.defender !== player.country) return;

    war.defenderTactic = defenderTactic || '';

    Object.entries(gameState.players).forEach(([id, p]) => {
      if (p.country === war.attacker) {
        io.to(id).emit('warDefenseSubmitted', {
          warId,
          defender: war.defender,
          defenderTactic: war.defenderTactic,
        });
      }
    });
  });

  socket.on('endTurn', () => {
    if (socket.id !== hostId) return;
    if (!gameState.turnActive) return;
    endTurn();
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
