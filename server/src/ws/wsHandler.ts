import { WebSocket, WebSocketServer } from 'ws';
import { WSEvent } from './events.js';
import * as roomManager from '../managers/roomManager.js';
import * as gameManager from '../managers/gameManager.js';

export function handleConnection(ws: WebSocket, wss: WebSocketServer) {
  let currentPlayerId: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const { event, payload } = JSON.parse(data);

      switch (event) {
        case WSEvent.CREATE_ROOM:
          roomManager.handleCreateRoom(ws, payload);
          // After room is created, we'll have a playerId. We need to track it.
          // The handleCreateRoom should ideally return it or we intercept it.
          // For now, let's assume we can get it from the map after it's set.
          break;
        case WSEvent.JOIN_ROOM:
          roomManager.handleJoinRoom(ws, payload);
          break;
        case WSEvent.LEAVE_ROOM:
          if (currentPlayerId) roomManager.handleLeaveRoom(currentPlayerId);
          break;
        case WSEvent.SET_READY:
          if (currentPlayerId) roomManager.handleSetReady(currentPlayerId, payload);
          break;
        case WSEvent.START_GAME:
          if (currentPlayerId) gameManager.handleStartGame(currentPlayerId);
          break;
        case WSEvent.TURN_DONE:
          if (currentPlayerId) gameManager.handleTurnDone(currentPlayerId);
          break;
        case WSEvent.CAST_VOTE:
          if (currentPlayerId) gameManager.handleCastVote(currentPlayerId, payload);
          break;
        case WSEvent.SEND_CHAT:
          if (currentPlayerId) gameManager.handleChat(currentPlayerId, payload);
          break;
        case WSEvent.UPDATE_SETTINGS:
          if (currentPlayerId) roomManager.handleUpdateSettings(currentPlayerId, payload);
          break;
        case WSEvent.RECONNECT:
          roomManager.handleReconnect(ws, payload);
          break;
        case WSEvent.MRWHITE_GUESS:
          if (currentPlayerId) gameManager.handleMrWhiteGuess(currentPlayerId, payload);
          break;
      }

      // Hacky way to track playerId for this connection
      if (!currentPlayerId) {
          roomManager.playerSockets.forEach((socket, pId) => {
              if (socket === ws) currentPlayerId = pId;
          });
      }

      // If reconnecting, clear the removal timeout
      if (currentPlayerId && roomManager.pendingRemovals.has(currentPlayerId)) {
        clearTimeout(roomManager.pendingRemovals.get(currentPlayerId));
        roomManager.pendingRemovals.delete(currentPlayerId);
      }

    } catch (err) {
      console.error('Error processing WS message:', err);
    }
  });

  ws.on('close', () => {
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
