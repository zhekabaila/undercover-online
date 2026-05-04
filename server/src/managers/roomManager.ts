import { Socket, Server } from 'socket.io';
import * as roomStore from '../state/roomStore.js';
import { Player, RoomSettings } from '../state/types.js';
import { WSEvent, ErrorCode } from '../ws/events.js';

export function sendToPlayer(ws: Socket, event: WSEvent, payload: any) {
  if (ws.connected) {
    ws.emit('message', JSON.stringify({ event, payload }));
  }
}

export function broadcastToRoom(wss: Server, roomId: string, event: WSEvent, payload: any) {
  const room = roomStore.getRoom(roomId);
  if (!room) return;

  Array.from(wss.sockets.sockets.values()).forEach((client) => {
    // In a real app, we should map ws -> playerId or room
    // For simplicity, we check if the player is in this room
    // Note: This requires us to store ws in Player or have a map ws -> player
  });
}

// Better broadcast approach: use a Map of playerId -> ws
export const playerSockets = new Map<string, Socket>();
export const pendingRemovals = new Map<string, NodeJS.Timeout>();

export function cancelPendingRemoval(playerId: string) {
  const timeout = pendingRemovals.get(playerId);
  if (timeout) {
    clearTimeout(timeout);
    pendingRemovals.delete(playerId);
    console.log(`[WS] Cancelled pending removal for player ${playerId}`);
  }
}

export function broadcast(roomId: string, event: WSEvent, payload: any) {
  const room = roomStore.getRoom(roomId);
  if (!room) return;

  room.players.forEach((player) => {
    const ws = playerSockets.get(player.id);
    if (ws) {
      sendToPlayer(ws, event, payload);
    }
  });
}

export function handleCreateRoom(ws: Socket, payload: { name: string, settings: RoomSettings }): string {
  const playerId = Math.random().toString(36).substring(7);
  const host: Player = {
    id: playerId,
    name: payload.name || 'Host',
    isHost: true,
    isReady: true, // Host is always ready
    isAlive: true,
    hasSpokenThisRound: false,
  };

  const settings: RoomSettings = {
    maxPlayers: payload.settings?.maxPlayers ?? 8,
    turnDurationSeconds: payload.settings?.turnDurationSeconds ?? 30,
    discussionDurationSeconds: payload.settings?.discussionDurationSeconds ?? 60,
    wordPairId: payload.settings?.wordPairId
  };

  const room = roomStore.createRoom(host, settings);
  playerSockets.set(playerId, ws);

  sendToPlayer(ws, WSEvent.ROOM_CREATED, { room: { ...room, players: Array.from(room.players.values()) }, playerId });
  return playerId;
}

export function handleJoinRoom(ws: Socket, payload: { roomId: string, name: string }): string | undefined {
  const room = roomStore.getRoom(payload.roomId);

  console.log(`[JoinRoom] Player "${payload.name}" attempting to join "${payload.roomId}"`);

  if (!room) {
    console.error(`[JoinRoom] Room "${payload.roomId}" not found`);
    sendToPlayer(ws, WSEvent.ERROR, { code: ErrorCode.ROOM_NOT_FOUND, message: 'Room not found' });
    return;
  }

  console.log(`[JoinRoom] Room state: ${room.players.size} / ${room.settings.maxPlayers}`);

  if (room.players.size >= room.settings.maxPlayers) {
    console.error(`[JoinRoom] Room "${payload.roomId}" is full (${room.players.size}/${room.settings.maxPlayers})`);
    sendToPlayer(ws, WSEvent.ERROR, { code: ErrorCode.ROOM_FULL, message: 'Room is full' });
    return;
  }

  if (room.game && room.game.phase !== 'lobby') {
    sendToPlayer(ws, WSEvent.ERROR, { code: ErrorCode.GAME_ALREADY_STARTED, message: 'Game already started' });
    return;
  }

  const playerId = Math.random().toString(36).substring(7);
  const player: Player = {
    id: playerId,
    name: payload.name || `Player ${room.players.size + 1}`,
    isHost: false,
    isReady: false,
    isAlive: true,
    hasSpokenThisRound: false,
  };

  roomStore.addPlayerToRoom(room.id, player);
  playerSockets.set(playerId, ws);

  sendToPlayer(ws, WSEvent.ROOM_JOINED, { room: { ...room, players: Array.from(room.players.values()) }, playerId });
  broadcast(room.id, WSEvent.PLAYER_JOINED, { player });
  return playerId;
}

export function handleReconnect(ws: Socket, payload: { roomId: string, playerId: string }) {
  // Cancel any pending removal for this player
  cancelPendingRemoval(payload.playerId);

  const room = roomStore.getRoom(payload.roomId);

  if (!room) {
    sendToPlayer(ws, WSEvent.ERROR, { code: ErrorCode.ROOM_NOT_FOUND, message: 'Room not found' });
    return;
  }

  const player = room.players.get(payload.playerId);
  if (!player) {
    sendToPlayer(ws, WSEvent.ERROR, { code: ErrorCode.ROOM_NOT_FOUND, message: 'Player not found in room' });
    return;
  }

  // Update socket
  playerSockets.set(payload.playerId, ws);

  // Send current state
  sendToPlayer(ws, WSEvent.ROOM_JOINED, { 
    room: { ...room, players: Array.from(room.players.values()) }, 
    playerId: payload.playerId 
  });

  // If role is already assigned, send it again
  if (player.role) {
    sendToPlayer(ws, WSEvent.ROLE_ASSIGNED, { role: player.role, word: player.word });
  }
}

export function handleLeaveRoom(playerId: string) {
  // Find which room this player is in
  const rooms = roomStore.getAllRooms();
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.has(playerId)) {
      const player = room.players.get(playerId)!;
      const wasHost = player.isHost;

      roomStore.removePlayerFromRoom(roomId, playerId);
      playerSockets.delete(playerId);

      broadcast(roomId, WSEvent.PLAYER_LEFT, { playerId });

      if (wasHost && room.players.size > 0) {
        const nextPlayerId = room.players.keys().next().value as string;
        const nextPlayer = room.players.get(nextPlayerId)!;
        nextPlayer.isHost = true;
        broadcast(roomId, WSEvent.ROOM_UPDATED, { room: { ...room, players: Array.from(room.players.values()) } });
      }
      break;
    }
  }
}

export function handleSetReady(playerId: string, payload: { isReady: boolean }) {
  const rooms = roomStore.getAllRooms();
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.has(playerId)) {
      roomStore.updatePlayer(roomId, playerId, { isReady: payload.isReady });
      broadcast(roomId, WSEvent.PLAYER_READY, { playerId, isReady: payload.isReady });
      break;
    }
  }
}

export function handleUpdateSettings(playerId: string, payload: { settings: RoomSettings }) {
    const rooms = roomStore.getAllRooms();
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(playerId)) {
        const player = room.players.get(playerId)!;
        if (!player.isHost) {
          sendToPlayer(playerSockets.get(playerId)!, WSEvent.ERROR, { code: ErrorCode.NOT_HOST, message: 'Only host can update settings' });
          return;
        }
        room.settings = { ...room.settings, ...payload.settings };
        broadcast(roomId, WSEvent.ROOM_UPDATED, { room: { ...room, players: Array.from(room.players.values()) } });
        break;
      }
    }
}
