import { jest, describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { WSEvent, ErrorCode } from '../ws/events.js';
import { Player, RoomSettings, Room } from '../state/types.js';

// Mock dependencies using unstable_mockModule for ESM
jest.unstable_mockModule('../managers/roomManager.js', () => ({
  broadcast: jest.fn(),
  sendToPlayer: jest.fn(),
  playerSockets: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }
}));

jest.unstable_mockModule('../managers/timerManager.js', () => ({
  startTimer: jest.fn(),
  clearTimer: jest.fn()
}));

// Dynamic imports are required when using unstable_mockModule in ESM
const roomStore = await import('../state/roomStore.js');
const gameManager = await import('../managers/gameManager.js');
const roomManager = await import('../managers/roomManager.js') as any;
const timerManager = await import('../managers/timerManager.js') as any;

describe('Game Manager', () => {
  let room: Room;
  const hostId = 'host-123';
  const player2Id = 'p2-123';
  const player3Id = 'p3-123';

  beforeEach(() => {
    jest.clearAllMocks();
    roomStore.getAllRooms().clear();

    const host: Player = { id: hostId, name: 'Host', isHost: true, isReady: true, isAlive: true, hasSpokenThisRound: false };
    const settings: RoomSettings = { 
        turnDurationSeconds: 30, 
        discussionDurationSeconds: 60,
        maxPlayers: 8 
    };
    room = roomStore.createRoom(host, settings);

    const mockWs = { readyState: 1, send: jest.fn() };
    roomManager.playerSockets.get.mockReturnValue(mockWs);

    roomStore.addPlayerToRoom(room.id, { id: player2Id, name: 'P2', isHost: false, isReady: true, isAlive: true, hasSpokenThisRound: false });
    roomStore.addPlayerToRoom(room.id, { id: player3Id, name: 'P3', isHost: false, isReady: true, isAlive: true, hasSpokenThisRound: false });
  });

  test('handleStartGame should fail if not host', () => {
    gameManager.handleStartGame(player2Id);
    expect(roomManager.sendToPlayer).toHaveBeenCalledWith(
        expect.anything(), 
        WSEvent.ERROR, 
        expect.objectContaining({ code: ErrorCode.NOT_HOST })
    );
  });

  test('handleStartGame should fail if not enough players', () => {
    room.players.delete(player3Id);
    gameManager.handleStartGame(hostId);
    expect(roomManager.sendToPlayer).toHaveBeenCalledWith(
        expect.anything(), 
        WSEvent.ERROR, 
        expect.objectContaining({ code: ErrorCode.NOT_ENOUGH_PLAYERS })
    );
  });

  test('handleStartGame should fail if players not ready', () => {
    room.players.get(player2Id)!.isReady = false;
    gameManager.handleStartGame(hostId);
    expect(roomManager.sendToPlayer).toHaveBeenCalledWith(
        expect.anything(), 
        WSEvent.ERROR, 
        expect.objectContaining({ code: ErrorCode.PLAYER_NOT_READY })
    );
  });

  test('successful startGameFlow should assign roles and start timer', () => {
    gameManager.handleStartGame(hostId);

    // Should assign roles to all 3 players
    const players = Array.from(room.players.values());
    expect(players.every(p => p.role !== undefined)).toBe(true);
    expect(players.every(p => p.isAlive)).toBe(true);

    // Should have 1 undercover, 0 mrwhite, 2 civilians for 3 players
    expect(players.filter(p => p.role === 'undercover').length).toBe(1);
    expect(players.filter(p => p.role === 'civilian').length).toBe(2);

    expect(roomManager.broadcast).toHaveBeenCalledWith(room.id, WSEvent.GAME_STARTING, { countdown: 3 });
    expect(timerManager.startTimer).toHaveBeenCalledWith(room.id, 3000, expect.any(Function));
  });

  test('handleCastVote should record vote and process if all voted', () => {
    // Set up game state
    room.game = {
        phase: 'voting',
        roundNumber: 1,
        turnOrder: { playerIds: [hostId, player2Id, player3Id], currentIndex: 0 },
        votes: {}
    };

    gameManager.handleCastVote(hostId, { targetId: player2Id });
    expect(room.game.votes[hostId]).toBe(player2Id);
    expect(roomManager.broadcast).toHaveBeenCalledWith(room.id, WSEvent.VOTE_CAST, { voterId: hostId, targetId: player2Id });

    // Last vote should trigger processVotes
    gameManager.handleCastVote(player2Id, { targetId: player3Id });
    gameManager.handleCastVote(player3Id, { targetId: player2Id });

    // player2Id should be eliminated (2 votes)
    expect(room.players.get(player2Id)!.isAlive).toBe(false);
    expect(roomManager.broadcast).toHaveBeenCalledWith(room.id, WSEvent.VOTE_RESULT, expect.objectContaining({ eliminatedId: player2Id }));
  });

  test('handleChat should respect speaking phase restriction', () => {
    room.game = {
        phase: 'speaking',
        roundNumber: 1,
        turnOrder: { playerIds: [hostId, player2Id, player3Id], currentIndex: 0 },
        votes: {}
    };

    // It is host's turn (currentIndex 0)
    gameManager.handleChat(player2Id, { message: 'I am undercover' });
    expect(roomManager.broadcast).not.toHaveBeenCalledWith(room.id, WSEvent.CHAT_MESSAGE, expect.any(Object));

    gameManager.handleChat(hostId, { message: 'I am civilian' });
    expect(roomManager.broadcast).toHaveBeenCalledWith(room.id, WSEvent.CHAT_MESSAGE, expect.objectContaining({ message: 'I am civilian' }));
  });
  afterAll(async () => {
    const roomStore = await import('../state/roomStore.js');
    roomStore.stopCleanupInterval();
  });
});
