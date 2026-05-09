import { Socket, Server } from 'socket.io';
import { WSEvent } from './events.js';
import * as roomManager from '../managers/roomManager.js';
import * as gameManager from '../managers/gameManager.js';

export function handleConnection(ws: Socket, wss: Server) {
  let currentPlayerId: string | undefined;

  ws.on('message', (data: string) => {
    try {
      const { event, payload } = JSON.parse(data);

      // 1. Try to find/refresh playerId if not already known
      if (currentPlayerId === undefined && payload?.playerId) {
        currentPlayerId = String(payload.playerId);
        if (currentPlayerId && !roomManager.playerSockets.has(currentPlayerId)) {
          roomManager.playerSockets.set(currentPlayerId, ws);
        }
      }

      switch (event) {
        case WSEvent.CREATE_ROOM:
          currentPlayerId = roomManager.handleCreateRoom(ws, payload);
          break;
        case WSEvent.JOIN_ROOM:
          currentPlayerId = roomManager.handleJoinRoom(ws, payload);
          break;
        case WSEvent.LIST_PUBLIC_ROOMS:
          roomManager.handleListPublicRooms(ws);
          break;
        case WSEvent.LEAVE_ROOM:
          if (currentPlayerId) {
            roomManager.handleLeaveRoom(currentPlayerId);
          } else {
            console.warn(`[WS] Ignore LEAVE_ROOM: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.SET_READY:
          if (currentPlayerId) {
            roomManager.handleSetReady(currentPlayerId, payload);
          } else {
            console.warn(`[WS] Ignore SET_READY: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.START_GAME:
          if (currentPlayerId) {
            gameManager.handleStartGame(currentPlayerId);
          } else {
            console.warn(`[WS] Ignore START_GAME: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.TURN_DONE:
          if (currentPlayerId) {
            gameManager.handleTurnDone(currentPlayerId);
          } else {
            console.warn(`[WS] Ignore TURN_DONE: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.CAST_VOTE:
          if (currentPlayerId) {
            gameManager.handleCastVote(currentPlayerId, payload);
          } else {
            console.warn(`[WS] Ignore CAST_VOTE: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.SEND_CHAT:
          if (currentPlayerId) {
            gameManager.handleChat(currentPlayerId, payload);
          } else {
            console.warn(`[WS] Ignore SEND_CHAT: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.UPDATE_SETTINGS:
          if (currentPlayerId) {
            roomManager.handleUpdateSettings(currentPlayerId, payload);
          } else {
            console.warn(`[WS] Ignore UPDATE_SETTINGS: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.RECONNECT:
          roomManager.handleReconnect(ws, payload);
          // After reconnect, we immediately know the playerId
          currentPlayerId = payload.playerId || undefined;
          break;
        case WSEvent.MRWHITE_GUESS:
          if (currentPlayerId) {
            gameManager.handleMrWhiteGuess(currentPlayerId, payload);
          } else {
            console.warn(`[WS] Ignore MRWHITE_GUESS: No currentPlayerId for socket ${ws.id}`);
          }
          break;
        case WSEvent.SUBMIT_DESCRIPTION:
          if (currentPlayerId) {
            gameManager.handleSubmitDescription(currentPlayerId, payload);
          } else {
            console.warn(`[WS] Ignore SUBMIT_DESCRIPTION: No currentPlayerId for socket ${ws.id}`);
          }
          break;
      }



      // If we have a player ID now, clear the removal timeout
      if (currentPlayerId && roomManager.pendingRemovals.has(currentPlayerId)) {
        clearTimeout(roomManager.pendingRemovals.get(currentPlayerId));
        roomManager.pendingRemovals.delete(currentPlayerId);
      }

    } catch (err) {
      console.error('Error processing WS message:', err);
    }
  });

  ws.on('disconnect', () => {
    if (currentPlayerId) {
      console.log(`[WS] Connection closed for player ${currentPlayerId}. Starting 10s grace period.`);
      
      const timeout = setTimeout(() => {
        if (currentPlayerId) {
          console.log(`[WS] Grace period expired for player ${currentPlayerId}. Removing from room.`);
          roomManager.handleLeaveRoom(currentPlayerId);
          roomManager.pendingRemovals.delete(currentPlayerId);
        }
      }, 10000); // 10 seconds grace period
      
      roomManager.pendingRemovals.set(currentPlayerId, timeout);
    }
  });
}
