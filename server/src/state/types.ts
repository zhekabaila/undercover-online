export type RoleType = 'civilian' | 'undercover' | 'mrwhite';
export type GamePhase = 'lobby' | 'starting' | 'speaking' | 'discussion' | 'voting' | 'mrwhite_guessing' | 'ended';

export interface RoomSettings {
  maxPlayers: number;        // default: 8
  turnDurationSeconds: number; // custom per room, default: 30
  discussionDurationSeconds: number; // default: 120
  wordPairId?: string;       // optional: pilih kategori kata
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
  turnEndTime?: number;          // timestamp unix kapan giliran berakhir
  eliminatedPlayerId?: string;   // For showing vote results
  winnerRole?: RoleType | 'civilian';
}

export interface Room {
  id: string;                // 6-char uppercase code
  settings: RoomSettings;
  players: Map<string, Player>;
  game: GameState | null;
  createdAt: number;
}

export interface WordPair {
  id: string;
  civilian: string;
  undercover: string;
}
