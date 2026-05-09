import { Room, Player, RoomSettings } from './types.js';

const rooms = new Map<string, Room>();

export function createRoom(hostPlayer: Player, settings: RoomSettings): Room {
  const roomId = generateRoomId();
  const room: Room = {
    id: roomId,
    settings,
    players: new Map([[hostPlayer.id, hostPlayer]]),
    game: null,
    createdAt: Date.now(),
    isPublic: settings.isPublic,
  };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  if (!roomId) return undefined;
  return rooms.get(roomId.trim().toUpperCase());
}

export function addPlayerToRoom(roomId: string, player: Player): void {
  const room = getRoom(roomId);
  if (room) {
    room.players.set(player.id, player);
    
    // If there was a pending deletion, cancel it
    const pending = pendingDeletions.get(room.id);
    if (pending) {
      clearTimeout(pending);
      pendingDeletions.delete(room.id);
    }
  }
}

// Map to store pending deletions
const pendingDeletions = new Map<string, NodeJS.Timeout>();

export function removePlayerFromRoom(roomId: string, playerId: string): void {
  const room = getRoom(roomId);
  if (room) {
    room.players.delete(playerId);
    if (room.players.size === 0) {
      // Clear any existing pending deletion
      const existing = pendingDeletions.get(room.id);
      if (existing) clearTimeout(existing);

      // Set a new timeout to delete the room if it stays empty for 30 seconds
      const timeout = setTimeout(() => {
        const r = getRoom(roomId);
        if (r && r.players.size === 0) {
          deleteRoom(roomId);
        }
        pendingDeletions.delete(room.id);
      }, 30000); // 30 seconds grace period
      
      pendingDeletions.set(room.id, timeout);
    }
  }
}

export function updatePlayer(roomId: string, playerId: string, updates: Partial<Player>): void {
  const room = getRoom(roomId);
  if (room) {
    const player = room.players.get(playerId);
    if (player) {
      Object.assign(player, updates);
    }
  }
}

export function deleteRoom(roomId: string): void {
  if (!roomId) return;
  rooms.delete(roomId.trim().toUpperCase());
}

export function generateRoomId(): string {
  let id = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  do {
    id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(id));
  return id;
}

// Cleanup inactive rooms every 10 minutes
let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupInterval() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;
    for (const [id, room] of rooms.entries()) {
      if (now - room.createdAt > TEN_MINUTES && room.players.size === 0) {
        deleteRoom(id);
      }
    }
  }, 10 * 60 * 1000);
}

export function stopCleanupInterval() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// Start by default
startCleanupInterval();

export function getAllRooms() {
  return rooms;
}
