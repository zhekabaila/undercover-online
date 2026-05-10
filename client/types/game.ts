export type RoleType = 'civilian' | 'undercover' | 'mrwhite';
export type GamePhase = 'lobby' | 'starting' | 'speaking' | 'discussion' | 'voting' | 'mrwhite_guessing' | 'ended';

export interface RoomSettings {
  maxPlayers: number;        // default: 8
  turnDurationSeconds: number; // custom per room, default: 30
  discussionDurationSeconds: number; // default: 120
  wordPairId?: string;       // optional: pilih kategori kata
  isPublic: boolean;         // default: false
  undercoverCount?: number;  // custom undercover count
  mrWhiteCount?: number;     // custom mrwhite count
}

export interface Player {
  id: string;                // socket/peer id
  name: string;
  isHost: boolean;
  isReady: boolean;
  role?: RoleType;
  word?: string;             // kata rahasia (hanya dikirim ke player itu sendiri)
  isAlive: boolean;
  hasSpokenThisRound: boolean;
  description?: string;      // per-round description
}

export interface TurnOrder {
  playerIds: string[];       // urutan giliran berbicara (diacak saat game mulai)
  currentIndex: number;
}

export interface GameState {
  phase: GamePhase;
  roundNumber: number;
  turnOrder: TurnOrder;
  votes: Record<string, string>; // voterId -> targetId
  passes?: Record<string, boolean>; // voterId -> true if passed
  turnEndTime?: number;          // timestamp unix kapan giliran berakhir
  eliminatedPlayerId?: string;   // For showing vote results
  winnerRole?: RoleType | 'civilian';
  remainingUndercover?: number;
  remainingMrWhite?: number;
}

export interface Room {
  id: string;                // 6-char uppercase code
  settings: RoomSettings;
  players: Player[];
  game: GameState | null;
  createdAt: number;
  isPublic: boolean;
}

export interface PublicRoom {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

export interface WordPair {
  id: string;
  civilian: string;
  undercover: string;
}
export interface ChatMessage {
  playerId?: string;
  playerName: string;
  message: string;
  type?: 'chat' | 'vote' | 'pass' | 'system' | 'description_submitted';
  timestamp: number;
}
