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

// Oyun durumu
const gameState = {
  year: 1914,
  turn: 1,
  maxTurns: 4,
  players: {}
};

// Bağlantı
io.on('connection', (socket) => {
  console.log('Oyuncu bağlandı:', socket.id);

  // Oyun durumunu yeni oyuncuya gönder
  socket.emit('gameState', gameState);

  // Oyuncu ülke seçti
  socket.on('selectCountry', (countryName) => {
    gameState.players[socket.id] = {
      country: countryName,
      connectedAt: new Date()
    };
    console.log(`${socket.id} -> ${countryName} seçti`);
    io.emit('playersUpdate', gameState.players);
  });

  // Bağlantı kesildi
  socket.on('disconnect', () => {
    console.log('Oyuncu ayrıldı:', socket.id);
    delete gameState.players[socket.id];
    io.emit('playersUpdate', gameState.players);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', gameState });
});

server.listen(3001, () => {
  console.log('Server çalışıyor: http://localhost:3001');
});
