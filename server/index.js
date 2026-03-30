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
  socket.on('selectCountry', ({ name, country }) => {
    gameState.players[socket.id] = {
      name,
      country,
      connectedAt: new Date()
    };
    console.log(`${name} -> ${country} seçti`);
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
