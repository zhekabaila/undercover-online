# 🕵️ Undercover Game — GitHub Copilot Instructions

## Project Title
**Undercover Online** — Real-time multiplayer word-based social deduction game with text chat

---

## Project Overview

Undercover Online adalah game deduksi sosial berbasis kata secara real-time. Setiap pemain
mendapatkan kata rahasia sesuai rolenya, lalu bergiliran mendeskripsikan kata tersebut.
Pemain lain harus menebak siapa yang merupakan undercover atau Mr. White sebelum mereka terlalu
mencolok.

**Tech Stack:**
- **Backend:** Node.js + Express.js (REST API + state management)
- **Realtime:** WebSocket (`ws` library atau `socket.io`)
- **Frontend:** Next.js (App Router) + React
- **State:** In-memory (tidak ada database, semua state disimpan di server memory)

---

## Project Structure

```
undercover-online/
├── server/                        # Express.js backend
│   ├── src/
│   │   ├── index.ts               # Entry point: HTTP + WebSocket server
│   │   ├── state/
│   │   │   ├── roomStore.ts       # In-memory room & game state
│   │   │   └── types.ts           # TypeScript interfaces
│   │   ├── managers/
│   │   │   ├── roomManager.ts     # CRUD room, join, leave logic
│   │   │   ├── gameManager.ts     # Game flow: start, turns, vote, end
│   │   │   └── timerManager.ts    # Turn countdown logic
│   │   ├── ws/
│   │   │   ├── wsHandler.ts       # WebSocket connection handler
│   │   │   └── events.ts          # Enum / constants semua event WS
│   │   └── utils/
│   │       ├── roleAssigner.ts    # Random role distribution logic
│   │       └── wordPairs.ts       # Kumpulan pasangan kata (civilian vs undercover)
│   ├── package.json
│   └── tsconfig.json
│
└── client/                        # Next.js frontend
    ├── app/
    │   ├── page.tsx               # Landing: buat room / join room
    │   ├── room/[roomId]/
    │   │   ├── page.tsx           # Lobby: daftar pemain, tombol siap, room settings
    │   │   └── game/
    │   │       └── page.tsx       # Game screen: giliran bicara, vote, chat
    │   └── layout.tsx
    ├── components/
    │   ├── lobby/
    │   │   ├── RoomInfo.tsx       # Tampilkan kode room, host, settings
    │   │   ├── PlayerList.tsx     # Daftar pemain + status siap
    │   │   └── ReadyButton.tsx    # Tombol siap untuk semua user
    │   ├── game/
    │   │   ├── RoleCard.tsx       # Tampilkan role & kata rahasia pemain
    │   │   ├── TurnIndicator.tsx  # Giliran siapa, countdown timer
    │   │   ├── VotePanel.tsx      # Panel voting untuk kick pemain
    │   │   └── ChatBox.tsx        # Text chat
    │   └── shared/
    │       ├── Timer.tsx          # Countdown visual
    │       └── PlayerAvatar.tsx
    ├── hooks/
    │   ├── useWebSocket.ts        # WS connection & event handler
    │   └── useGameState.ts        # Local game state dari WS events
    ├── lib/
    │   └── wsClient.ts            # WebSocket client singleton
    └── package.json
```

---

## Core Data Types (TypeScript)

```typescript
// server/src/state/types.ts

export type RoleType = 'civilian' | 'undercover' | 'mrwhite';
export type GamePhase = 'lobby' | 'starting' | 'speaking' | 'discussion' | 'voting' | 'ended';

export interface RoomSettings {
  maxPlayers: number;        // default: 8
  turnDurationSeconds: number; // custom per room, default: 30
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
}

export interface Room {
  id: string;                // 6-char uppercase code
  settings: RoomSettings;
  players: Map<string, Player>;
  game: GameState | null;
  createdAt: number;
}

export interface WordPair {
  civilian: string;
  undercover: string;
}
```

---

## WebSocket Events

Semua komunikasi realtime menggunakan event-based messaging. Gunakan format JSON:
```json
{ "event": "EVENT_NAME", "payload": { ... } }
```

### Client → Server Events

| Event | Payload | Keterangan |
|---|---|---|
| `CREATE_ROOM` | `{ name, settings }` | Buat room baru, jadi host |
| `JOIN_ROOM` | `{ roomId, name }` | Masuk ke room yang ada |
| `LEAVE_ROOM` | `{}` | Keluar dari room |
| `SET_READY` | `{ isReady: boolean }` | Pemain toggle status siap |
| `START_GAME` | `{}` | Host memulai game (semua harus ready) |
| `TURN_DONE` | `{}` | Pemain selesai giliran bicara |
| `CAST_VOTE` | `{ targetId }` | Pemain vote kick seseorang |
| `SEND_CHAT` | `{ message }` | Kirim pesan chat |
| `CAST_VOTE` | `{ targetId }` | Pemain vote kick seseorang |

### Server → Client Events

| Event | Payload | Keterangan |
|---|---|---|
| `ROOM_CREATED` | `{ room, playerId }` | Konfirmasi room dibuat |
| `ROOM_JOINED` | `{ room, playerId }` | Konfirmasi berhasil join |
| `PLAYER_JOINED` | `{ player }` | Broadcast: ada pemain baru |
| `PLAYER_LEFT` | `{ playerId }` | Broadcast: pemain keluar |
| `PLAYER_READY` | `{ playerId, isReady }` | Broadcast: update status ready |
| `GAME_STARTING` | `{ countdown: 3 }` | Semua siap, game akan dimulai |
| `ROLE_ASSIGNED` | `{ role, word }` | Dikirim private ke masing-masing player |
| `TURN_STARTED` | `{ playerId, endsAt }` | Giliran mulai + timestamp akhir |
| `TURN_ENDED` | `{ nextPlayerId }` | Giliran selesai |
| `ROUND_ENDED` | `{}` | Satu putaran selesai, masuk diskusi |
| `DISCUSSION_STARTED` | `{ durationSeconds }` | Semua pemain masuk fase diskusi via chat |
| `VOTE_STARTED` | `{}` | Fase voting dimulai |
| `VOTE_CAST` | `{ voterId, targetId }` | Broadcast vote (anonim opsional) |
| `VOTE_RESULT` | `{ eliminatedId, role }` | Hasil voting + reveal role |
| `GAME_ENDED` | `{ winnerRole, players }` | Game selesai + reveal semua role |
| `CHAT_MESSAGE` | `{ playerId, name, message, timestamp }` | Pesan chat masuk |
| `ERROR` | `{ code, message }` | Error dari server |

---

## Module Implementation Guide

### 1. In-Memory State (`server/src/state/roomStore.ts`)

```typescript
// Simpan semua room di Map, tidak perlu database
const rooms = new Map<string, Room>();

// Helper functions yang harus diimplementasi:
// - createRoom(hostPlayer, settings): Room
// - getRoom(roomId): Room | undefined
// - addPlayerToRoom(roomId, player): void
// - removePlayerFromRoom(roomId, playerId): void
// - updatePlayer(roomId, playerId, updates): void
// - deleteRoom(roomId): void
// - generateRoomId(): string  // 6-char uppercase alphanumeric
```

**Catatan:** Bersihkan room yang sudah tidak aktif setelah N menit menggunakan `setInterval`.

---

### 2. Room Manager (`server/src/managers/roomManager.ts`)

Tangani lifecycle room:
- `handleCreateRoom`: Buat room baru, assign host, kembalikan room ID
- `handleJoinRoom`: Validasi room exists + belum penuh + fase lobby, tambahkan player
- `handleLeaveRoom`: Hapus player, jika host pindahkan ke player lain, jika room kosong hapus
- `handleSetReady`: Update `isReady` player, cek apakah semua ready → emit notifikasi ke host

**Rules:**
- Game hanya bisa dimulai oleh host
- Minimum 3 pemain untuk memulai game
- Hanya bisa join di fase `lobby`

---

### 3. Role Assigner (`server/src/utils/roleAssigner.ts`)

```typescript
// Distribusi role berdasarkan jumlah pemain:
// 3-4 pemain : 1 undercover, 0 mr.white, sisanya civilian
// 5-6 pemain : 1 undercover, 1 mr.white, sisanya civilian
// 7+  pemain : 2 undercover, 1 mr.white, sisanya civilian

function assignRoles(playerIds: string[], wordPair: WordPair): Map<string, { role: RoleType, word: string }>;

// Mr. White tidak mendapatkan kata apapun (word = '')
// Civilian mendapat wordPair.civilian
// Undercover mendapat wordPair.undercover
// Urutan giliran bicara diacak secara independen dari role
```

---

### 4. Game Manager (`server/src/managers/gameManager.ts`)

Tangani semua logika alur game:

```
START_GAME
  → assignRoles() → kirim ROLE_ASSIGNED private ke setiap player
  → acak turnOrder
  → emit GAME_STARTING (countdown 3 detik)
  → mulai putaran pertama: emit TURN_STARTED untuk player pertama

Saat giliran aktif:
  → server jalankan timer sesuai room.settings.turnDurationSeconds
  → bila timer habis ATAU player kirim TURN_DONE → emit TURN_ENDED
  → lanjut ke player berikutnya
  → bila semua player sudah bicara dalam putaran → emit ROUND_ENDED
  → emit DISCUSSION_STARTED (buka semua mic)

Saat diskusi:
  → pemain bebas bicara, chat aktif
  → host atau semua sepakat → emit VOTE_STARTED

Saat voting:
  → kumpulkan semua vote, saat semua sudah vote (atau timeout)
  → hitung suara terbanyak → emit VOTE_RESULT + reveal role target
  → cek kondisi menang:
      - semua undercover & mr.white tereliminasi → civilian menang
      - undercover tersisa sama dengan civilian → undercover menang
      - mr.white tereliminasi, dia bisa tebak kata civilian → mr.white menang
  → jika game belum selesai, mulai putaran baru
```

---

### 5. Timer Manager (`server/src/managers/timerManager.ts`)

```typescript
// Simpan active timers per room agar bisa dibatalkan
const timers = new Map<string, NodeJS.Timeout>();

function startTurnTimer(roomId: string, durationMs: number, onExpire: () => void): void;
function clearTurnTimer(roomId: string): void;
```

---

### 6. Chat Module (`server/src/ws/chatHandler.ts`)

Tangani pengiriman dan broadcast pesan chat:
- Validasi panjang pesan (max 300 karakter)
- Sertakan `playerId`, `name`, `message`, dan `timestamp` di setiap broadcast
- Chat aktif di semua fase game kecuali `starting`

---

### 7. Game Flow UI (`client/app/room/[roomId]/game/page.tsx`)

Tampilan berubah berdasarkan `gamePhase`:

| Phase | Yang Ditampilkan |
|---|---|
| `lobby` | Daftar pemain, tombol ready, room settings (host) |
| `starting` | Animasi countdown 3-2-1, reveal role card |
| `speaking` | Turn indicator + timer, input chat aktif, pemain lain read-only |
| `discussion` | Chat bebas untuk semua, countdown diskusi, tombol mulai vote |
| `voting` | Panel vote: pilih siapa yang dikeluarkan |
| `ended` | Reveal semua role + kata, siapa yang menang |

---

## Room Settings (Host Configuration)

Sebelum game dimulai, host dapat mengatur:

```typescript
interface RoomSettings {
  maxPlayers: number;                  // 3–10, default: 8
  turnDurationSeconds: number;         // 10–120, default: 30
  discussionDurationSeconds: number;   // 30–300, default: 120
  wordPairId?: string;                 // pilih kategori kata (opsional)
}
```

Settings hanya bisa diubah saat fase `lobby` dan hanya oleh host.
Setiap kali settings berubah, server broadcast `ROOM_UPDATED` ke semua pemain di room.

---

## Word Pairs (`server/src/utils/wordPairs.ts`)

Contoh struktur data pasangan kata:

```typescript
const wordPairs: WordPair[] = [
  { civilian: 'apel', undercover: 'pir' },
  { civilian: 'kucing', undercover: 'anjing' },
  { civilian: 'bola basket', undercover: 'bola voli' },
  { civilian: 'kopi', undercover: 'teh' },
  { civilian: 'dokter', undercover: 'perawat' },
  // ... tambah lebih banyak
];

// Pilih secara random saat game dimulai
function getRandomWordPair(): WordPair;
```

---

## Error Handling

Gunakan kode error yang konsisten:

```typescript
enum ErrorCode {
  ROOM_NOT_FOUND      = 'ROOM_NOT_FOUND',
  ROOM_FULL           = 'ROOM_FULL',
  GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
  NOT_HOST            = 'NOT_HOST',
  NOT_ENOUGH_PLAYERS  = 'NOT_ENOUGH_PLAYERS',
  PLAYER_NOT_READY    = 'PLAYER_NOT_READY',  // tidak semua ready
  INVALID_VOTE        = 'INVALID_VOTE',
  INVALID_PAYLOAD     = 'INVALID_PAYLOAD',
}
```

Selalu emit `ERROR` event ke client yang bersangkutan dengan `{ code, message }`.

---

## Setup Instructions

### Backend Setup

```bash
cd server
npm init -y
npm install express ws cors
npm install -D typescript @types/node @types/express @types/ws ts-node nodemon
npx tsc --init
```

`tsconfig.json` minimal:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

`package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Entry point (`server/src/index.ts`):**
```typescript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { handleConnection } from './ws/wsHandler';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// WebSocket handler
wss.on('connection', (ws) => handleConnection(ws, wss));

const PORT = process.env.PORT || 3021;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### Frontend Setup

```bash
cd client
npx create-next-app@latest . --typescript --app --tailwind --eslint
npm install
```

**Environment variable (`client/.env.local`):**
```
NEXT_PUBLIC_WS_URL=ws://localhost:3021
```

**WebSocket singleton (`client/lib/wsClient.ts`):**
```typescript
// Buat satu instance WS yang bisa digunakan di seluruh app
// Gunakan EventEmitter atau simple callback pattern
// Reconnect otomatis bila koneksi putus
```

---

## Important Implementation Notes

1. **Security:** Validasi semua payload di server sebelum diproses. Jangan percaya data dari client.

2. **Player disconnect:** Tangani `ws.on('close')` — hapus player dari room, broadcast `PLAYER_LEFT`, 
   jika game sedang berlangsung skip giliran mereka.

3. **Host migration:** Jika host disconnect, otomatis pindahkan host ke player berikutnya yang terhubung.

4. **Turn timer sync:** Server yang menjadi sumber kebenaran waktu. Kirim `endsAt` (unix timestamp) 
   ke semua client, bukan durasi — ini mencegah desync antara client.

5. **Mr. White win condition:** Saat Mr. White tereliminasi lewat vote, beri dia kesempatan satu 
   tebakan kata civilian. Implementasikan sebagai phase `mrwhite_guess` sebelum `GAME_ENDED`.

6. **State recovery:** Saat client reconnect dengan playerId yang sama (simpan di localStorage), 
   kirimkan ulang state game yang aktif.

---

## Checklist Fitur

- [ ] Buat room + generate room code unik
- [ ] Join room via kode
- [ ] Daftar pemain di lobby realtime
- [ ] Room settings oleh host (turn duration, max players)
- [ ] Tombol siap untuk semua pemain
- [ ] Start game hanya saat semua ready (min. 3 pemain)
- [ ] Random role assignment (Civilian / Undercover / Mr. White)
- [ ] Distribusi role proporsional berdasarkan jumlah pemain
- [ ] Kirim kata rahasia secara private ke masing-masing pemain
- [ ] Giliran berbicara berurutan (acak di awal game)
- [ ] Turn timer custom (dari room settings)
- [ ] Auto-advance giliran saat timer habis
- [ ] Text chat aktif di semua fase game
- [ ] Pembatasan chat: hanya player giliran yang bisa kirim saat fase speaking
- [ ] Fase diskusi: semua pemain bebas chat
- [ ] Sistem vote: semua pilih satu pemain
- [ ] Reveal role setelah tereliminasi
- [ ] Cek kondisi menang setelah setiap eliminasi
- [ ] Mr. White guess mechanic
- [ ] Game over screen + reveal semua peran & kata
- [ ] Handle player disconnect gracefully
- [ ] Host migration jika host disconnect
