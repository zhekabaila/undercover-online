import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import * as roomStore from '../state/roomStore.js';
import { Player, RoomSettings } from '../state/types.js';

describe('Room Store', () => {
  const mockHost: Player = {
    id: 'host1',
    name: 'Host User',
    isHost: true,
    isReady: true,
    isAlive: true,
    hasSpokenThisRound: false
  };

  const mockSettings: RoomSettings = {
    maxPlayers: 8,
    turnDurationSeconds: 30,
    discussionDurationSeconds: 60
  };

  beforeEach(() => {
    // Clear all rooms before each test
    const rooms = roomStore.getAllRooms();
    rooms.clear();
  });

  test('createRoom should create and store a new room', () => {
    const room = roomStore.createRoom(mockHost, mockSettings);
    expect(room).toBeDefined();
    expect(room.id).toHaveLength(6);
    expect(room.players.get(mockHost.id)).toEqual(mockHost);
    
    const storedRoom = roomStore.getRoom(room.id);
    expect(storedRoom).toEqual(room);
  });

  test('addPlayerToRoom should add a player to an existing room', () => {
    const room = roomStore.createRoom(mockHost, mockSettings);
    const newPlayer: Player = {
      id: 'p2',
      name: 'Player 2',
      isHost: false,
      isReady: false,
      isAlive: true,
      hasSpokenThisRound: false
    };

    roomStore.addPlayerToRoom(room.id, newPlayer);
    
    const updatedRoom = roomStore.getRoom(room.id);
    expect(updatedRoom?.players.size).toBe(2);
    expect(updatedRoom?.players.get('p2')).toEqual(newPlayer);
  });

  test('removePlayerFromRoom should remove player and delete room if empty', () => {
    const room = roomStore.createRoom(mockHost, mockSettings);
    roomStore.removePlayerFromRoom(room.id, mockHost.id);
    
    expect(roomStore.getRoom(room.id)).toBeUndefined();
  });

  test('updatePlayer should partially update player state', () => {
    const room = roomStore.createRoom(mockHost, mockSettings);
    roomStore.updatePlayer(room.id, mockHost.id, { isReady: false, name: 'Updated Name' });
    
    const player = roomStore.getRoom(room.id)?.players.get(mockHost.id);
    expect(player?.isReady).toBe(false);
    expect(player?.name).toBe('Updated Name');
  });

  test('generateRoomId should create unique 6-character IDs', () => {
    const id1 = roomStore.generateRoomId();
    const id2 = roomStore.generateRoomId();
    expect(id1).toHaveLength(6);
    expect(id2).toHaveLength(6);
    expect(id1).not.toBe(id2);
  });
  afterAll(() => {
    roomStore.stopCleanupInterval();
  });
});
