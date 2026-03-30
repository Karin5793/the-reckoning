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

const gameState = {
  year: 1914,
  turn: 1,
  maxTurns: 4,
  players: {},
  units: {},
  turnActive: false,
  turnDuration: 60000, // test: 1 dakika (prod: 7200000)
  turnEndTime: null,
  turnStartTime: null,
};

let hostId = null;
let turnTimerInterval = null;

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

  socket.on('selectCountry', ({ name, country }) => {
    gameState.players[socket.id] = { name, country, connectedAt: new Date() };
    console.log(`${name} -> ${country} seçti`);
    io.emit('playersUpdate', gameState.players);
  });

  socket.on('startTurn', () => {
    if (socket.id !== hostId) return;
    if (gameState.turnActive) return;

    gameState.turnActive = true;
    gameState.turnStartTime = Date.now();
    gameState.turnEndTime = Date.now() + gameState.turnDuration;

    console.log(`Tur başladı. Bitiş: ${new Date(gameState.turnEndTime).toLocaleTimeString()}`);
    io.emit('turnStarted', {
      year: gameState.year,
      turn: gameState.turn,
      turnEndTime: gameState.turnEndTime,
    });

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

    if (!gameState.units) gameState.units = {};
    if (!gameState.units[country]) gameState.units[country] = {};
    if (!gameState.units[country][unitType]) gameState.units[country][unitType] = 0;

    gameState.units[country][unitType]++;

    io.emit('unitsUpdate', gameState.units);
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
