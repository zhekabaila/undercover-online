import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { handleConnection } from './ws/wsHandler.js';
import { getAllRooms } from './state/roomStore.js';

const app = express();
const server = createServer(app);
const wss = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Debug: List all rooms (REMOVE IN PRODUCTION)
app.get('/rooms', (_, res) => {
  const rooms = getAllRooms();
  const roomsList = Array.from(rooms.values()).map(r => ({
    id: r.id,
    players: Array.from(r.players.values()).map(p => p.name),
    game: !!r.game
  }));
  res.json(roomsList);
});

// WebSocket handler
wss.on('connection', (ws) => handleConnection(ws, wss));

const PORT = process.env.PORT || 3021;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
