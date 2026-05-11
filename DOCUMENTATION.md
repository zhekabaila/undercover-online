# Undercover Online - Dokumentasi Teknis Komprehensif

Selamat datang di dokumentasi teknis lengkap untuk **Undercover Online**. Dokumen ini dirancang sebagai referensi utama bagi pengembang, mencakup segala hal mulai dari arsitektur tingkat tinggi hingga logika fungsi individual.

---

## 1. Ikhtisar Proyek & Tech Stack

**Undercover Online** adalah game deduksi sosial multiplayer waktu nyata (real-time). Game ini menantang pemain untuk mengidentifikasi "penyusup" (Undercover dan Mr. White) di antara kelompok "Warga Sipil" melalui deskripsi taktis dan perang psikologis.

### 🏛️ Arsitektur
Proyek ini mengikuti arsitektur **Client-Server** dengan model **Server-Side Authority**.
- **Server**: Aplikasi Node.js/Express yang menjaga sumber kebenaran tunggal (single source of truth) untuk semua status permainan.
- **Client**: Aplikasi Next.js 16 (App Router) yang merender status permainan secara reaktif.
- **Komunikasi**: Komunikasi dua arah berbasis event melalui **Socket.io**.

### 🛠️ Teknologi yang Digunakan
| Layer | Teknologi |
| :--- | :--- |
| **Frontend** | Next.js 16, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | MySQL, Prisma ORM |
| **Autentikasi** | JWT (JSON Web Tokens) |
| **DevOps** | Docker, Docker Compose, TypeScript |

---

## 2. Struktur Folder Presisi

```text
undercover-online/
├── client/                 # Frontend Next.js
│   ├── app/                # Halaman App Router
│   │   ├── room/[roomId]/  # Rute Ruangan Dinamis
│   │   │   ├── game/       # Antarmuka Permainan Real-time
│   │   │   └── page.tsx    # Tampilan Lobby
│   │   ├── history/        # Halaman Riwayat Permainan
│   │   ├── layout.tsx      # Layout Utama
│   │   ├── page.tsx        # Halaman Utama (Masuk/Buat Ruangan)
│   │   ├── leaderboard/    # Halaman Pemeringkatan (Global/Per Peran)
│   │   └── globals.css     # Style Global (Neobrutalism)
│   ├── components/         # Komponen UI Reusable
│   ├── hooks/              # Custom React Hooks
│   │   └── useGameState.ts # Mesin Utama Client (Socket Listener)
│   ├── lib/                # Utilitas Client (Wrapper Socket)
│   ├── types/              # Definisi TypeScript Sisi Client
│   └── public/             # Aset Statis (Gambar, Suara)
├── server/                 # Backend Node.js
│   ├── src/                # Kode Sumber
│   │   ├── managers/       # Kontroler Logika Bisnis
│   │   │   ├── gameManager.ts  # Loop & Aturan Permainan
│   │   │   ├── roomManager.ts  # Siklus Hidup Pemain & Ruangan
│   │   │   └── timerManager.ts # Kontrol Timer Global
│   │   ├── ws/             # Layer WebSocket
│   │   │   ├── events.ts   # Konstanta Event
│   │   │   └── wsHandler.ts# Router Event
│   │   ├── state/          # Manajemen State In-memory
│   │   │   ├── roomStore.ts# Penyimpanan Data Ruangan Aktif
│   │   │   └── types.ts    # Interface Global
│   │   ├── utils/          # Fungsi Pembantu
│   │   │   ├── roleAssigner.ts # Logika Inisialisasi Game
│   │   │   └── wordPairs.ts    # Database Kosakata
│   │   ├── routes/         # Rute REST API (Auth/User)
│   │   │   ├── auth.ts     # Manajemen Sesi & Registrasi
│   │   │   └── leaderboard.ts # Endpoint Pemeringkatan Pemain
│   │   └── index.ts        # Entry Point Server
│   ├── prisma/             # Schema Database
│   └── Dockerfile          # Build Image Server
├── DOCUMENTATION.md        # File Ini
├── docker-compose.yml      # Orchestration Produksi
└── README.md               # Panduan Cepat
```

---

## 3. Modul & Fungsi Sisi Server

### 📦 `roomStore.ts` (Layer Status)
Mengelola `Map` in-memory untuk ruangan yang aktif.
- `createRoom(host, settings)`: Menghasilkan ID alfanumerik 6 digit dan menginisialisasi objek ruangan.
- `getRoom(roomId)`: Mengambil data ruangan (tidak peka huruf besar/kecil).
- `addPlayerToRoom(roomId, player)`: Menambahkan pemain dan membatalkan timeout penghapusan ruangan yang tertunda.
- `removePlayerFromRoom(roomId, playerId)`: Menghapus pemain. Jika ruangan kosong, memulai timer penghapusan 30 detik.
- `generateRoomId()`: Utilitas internal untuk membuat string unik 6 karakter.

### 👔 `roomManager.ts` (Manajer Siklus Hidup)
Menangani interaksi WebSocket yang terkait dengan ruangan.
- `handleCreateRoom(ws, payload)`: Membuat ruangan, menetapkan peran host, dan mengembalikan ID pemain.
- `handleJoinRoom(ws, payload)`: Menambahkan pemain ke ruangan yang ada jika belum penuh/dimulai.
- `handleReconnect(ws, payload)`: Memulihkan sesi pemain berdasarkan ID yang tersimpan.
- `handleLeaveRoom(playerId)`: Membersihkan data pemain dan mempromosikan host baru jika diperlukan.
- `broadcast(roomId, event, payload)`: Mengirim pesan ke setiap pemain yang terhubung di ruangan tertentu.

### 🎮 `gameManager.ts` (Mesin Permainan)
Mengatur logika permainan yang sebenarnya.
- `handleStartGame(playerId)`: Memvalidasi status host dan kesiapan pemain sebelum memanggil `startGameFlow`.
- `startGameFlow(room)`: Menetapkan peran, memilih kata, dan memicu hitung mundur `starting`.
- `startSpeakingPhase(room)`: Transisi ke fase giliran deskripsi.
- `handleTurnDone(playerId)`: Memindahkan indeks giliran ke pemain berikutnya yang masih hidup atau mengakhiri fase.
- `processVotes(room)`: Menghitung suara, menangani seri/pass, dan menjalankan logika eliminasi.
- `checkWinConditions(room)`: Memvalidasi apakah Warga Sipil atau Penyusup menang berdasarkan jumlah pemain.
- `handleMrWhiteGuess(playerId, payload)`: Memvalidasi jika Mr. White yang tereliminasi berhasil menebak kata warga sipil.
- `saveGameHistory(room, winnerRole)`: Menyimpan hasil pertandingan ke database MySQL melalui Prisma.

### ⏱️ `timerManager.ts` (Utilitas Sinkronisasi)
Memusatkan logika `setTimeout` dan `clearTimeout` untuk memastikan fase permainan tetap sinkron di semua client.

---

## 4. Hook & Komponen Sisi Client

### 🧠 `useGameState.ts` (Otak Reaktif)
Custom hook yang berfungsi sebagai pintu masuk tunggal untuk semua data permainan.
- **Global State**: Menggunakan pola singleton (di luar hook) untuk menjaga status permainan tetap ada meskipun komponen di-unmount.
- **Listeners**: Berlangganan event Socket.io dan memperbarui status global sesuai kebutuhan.
- **Actions**:
    - `createRoom()` / `joinRoom()`: Memulai masuk ke ruangan.
    - `setReady()`: Mengubah status kesiapan pemain.
    - `submitDescription()`: Mengirim deskripsi selama giliran.
    - `castVote()` / `passVote()`: Mengirimkan suara pemain.
    - `mrWhiteGuess()`: Kesempatan terakhir bagi Mr. White.
- **Auto-Reconnect**: Secara otomatis memeriksa `localStorage` untuk `party_roomId` saat mount untuk melanjutkan permainan.

---

## 5. Mekanisme & Alur Permainan Detail

### Langkah 1: Fase Lobby
- Pemain bergabung dan memilih nama/avatar.
- Host mengonfigurasi:
    - **Jumlah Pemain Maksimal**
    - **Durasi Giliran** (Batas waktu fase Berbicara)
    - **Durasi Diskusi**
    - **Jumlah Undercover/Mr. White** (Otomatis atau Manual)
- Setiap pemain harus mengklik **"Siap"**.

### Langkah 2: Penetapan Peran
- Server memilih pasangan kata acak (misalnya, *Kopi* vs *Teh*).
- **Warga Sipil**: Mendapatkan kata A.
- **Undercover**: Mendapatkan kata B.
- **Mr. White**: TIDAK mendapatkan kata. Mereka melihat "???" dan harus berpura-pura.

### Langkah 3: Fase Berbicara (Speaking Phase)
- Pemain bergiliran (urutan diacak).
- Setiap pemain memiliki waktu `X` detik untuk mengetik deskripsi satu kata.
- Deskripsi muncul di atas avatar pemain secara real-time.

### Langkah 4: Fase Diskusi
- Periode obrolan bebas di mana pemain berdebat, membela diri, dan mencurigai satu sama lain.

### Langkah 5: Fase Pemungutan Suara (Voting Phase)
- Pemain memilih siapa yang mereka pikir adalah penyusup.
- **Pass**: Jika pemain ragu, mereka bisa memilih 'Pass'.
- **Hasil**:
    - Jika mayoritas `Pass` -> Tidak ada yang tereliminasi.
    - Jika mayoritas `Vote` -> Pemain dengan suara terbanyak tereliminasi.
    - Jika `Seri` (Draw) -> Tidak ada yang tereliminasi.

### Langkah 6: Pembalasan Mr. White
- Jika pemain yang tereliminasi adalah **Mr. White**, mereka memasuki fase menebak khusus selama 30 detik.
- Jika mereka mengetik kata warga sipil dengan **tepat**, **Mr. White menang seketika** secara solo.

### Langkah 7: Permainan Berakhir
- **Warga Sipil Menang**: Semua Undercover dan Mr. White telah tereliminasi.
- **Penyusup Menang**: Jumlah penyusup sama dengan atau melebihi jumlah Warga Sipil.

---

## 6. Registri Event WebSocket

### Client → Server (`Emit`)
| Event | Payload | Deskripsi |
| :--- | :--- | :--- |
| `CREATE_ROOM` | `{ name, settings, token? }` | Membuat ruangan baru |
| `JOIN_ROOM` | `{ roomId, name, token? }` | Bergabung ke ruangan |
| `START_GAME` | `{ roomId, playerId }` | Memulai game (Hanya Host) |
| `SUBMIT_DESCRIPTION` | `{ description, roomId, playerId }` | Mengirim deskripsi kata |
| `CAST_VOTE` | `{ targetId, pass?, roomId, playerId }` | Mengirimkan suara |
| `SEND_CHAT` | `{ message, roomId, playerId }` | Mengirim pesan chat |

### Server → Client (`Broadcast`)
| Event | Payload | Deskripsi |
| :--- | :--- | :--- |
| `ROOM_UPDATED` | `{ room }` | Sinkronisasi status ruangan penuh |
| `ROLE_ASSIGNED` | `{ role, word }` | Informasi peran rahasia |
| `TURN_STARTED` | `{ playerId, endsAt }` | Memulai giliran pemain |
| `VOTE_RESULT` | `{ eliminatedId, role, isDraw }` | Mengungkap hasil voting |
| `GAME_ENDED` | `{ winnerRole, players }` | Ringkasan akhir permainan |

---

## 7. Pengaturan & Konfigurasi

### Prasyarat
- **Node.js 18+**
- **Docker & Docker Compose**
- **MySQL** (Jika dijalankan secara manual)

### Variabel Lingkungan (.env)
#### Server
- `PORT`: Port server (default 3021)
- `JWT_SECRET`: Rahasia untuk token pengguna
- `DATABASE_URL`: String koneksi (`mysql://user:pass@host:3306/db`)

#### Client
- `NEXT_PUBLIC_WS_URL`: Endpoint WebSocket (contoh: `ws://localhost:3021`)

### Setup Docker (Manual)
```bash
# 1. Jalankan Database
docker compose up -d db

# 2. Jalankan Layanan
docker compose up -d server client

# 3. Setup Schema Database
docker compose exec server npx prisma migrate dev
```

### Setup Manual (Tanpa Docker)
```bash
# 1. Instal dependensi
cd server && npm install
cd ../client && npm install

# 2. Setup Prisma
cd server
npx prisma migrate dev
npx prisma generate

# 3. Jalankan Server Pengembangan
# Terminal 1
cd server && npm run dev
# Terminal 2
cd client && npm run dev
```

---

## 8. Database & Prisma

Proyek ini menggunakan Prisma sebagai ORM untuk berinteraksi dengan MySQL.
- **Model `User`**: Menyimpan akun pemain dan kredensial.
- **Model `GameHistory`**: Menyimpan log permainan yang selesai untuk dashboard "Riwayat".

Untuk memperbarui schema:
1. Ubah `server/prisma/schema.prisma`.
2. Jalankan `npx prisma migrate dev --name <deskripsi>`.
3. Client akan secara otomatis memiliki akses ke tipe yang diperbarui jika dibagikan.

---

## 9. Sistem Leaderboard

Fitur Leaderboard memungkinkan pemain untuk melihat peringkat pemain terbaik berdasarkan jumlah kemenangan mereka.

### 🛠️ Mekanisme Pengambilan Data (Backend)
Pemeringkatan dilakukan secara dinamis melalui query agregasi pada model `GameHistory`:
1.  **Agregasi**: Server menggunakan fungsi `groupBy` dari Prisma untuk mengelompokkan data berdasarkan `userId`.
2.  **Filter Kemenangan**: Hanya record dengan `isWinner: true` yang dihitung.
3.  **Filter Peran (Opsional)**: Mendukung query parameter `role` untuk melihat peringkat spesifik (misalnya: peringkat khusus *Mr. White*).
4.  **Sorting**: Hasil diurutkan berdasarkan jumlah (`_count`) `userId` secara menurun (descending).
5.  **Limitasi**: Mengambil Top 20 pemain untuk menjaga performa query tetap optimal.
6.  **Resolusi Username**: Setelah mendapatkan ID pemenang, server melakukan query kedua ke tabel `User` untuk mendapatkan `username` yang sesuai sebelum dikirim ke client.

**Endpoint API**: `GET /api/leaderboard?role=[civilian|undercover|mrwhite]`

### 🎨 Implementasi Frontend
- **Tab Dinamis**: Menggunakan state untuk beralih antara kategori "Global", "Civilian", "Undercover", dan "Mr. White".
- **Real-time Fetching**: Data diambil setiap kali user berpindah tab menggunakan `useEffect`.
- **Visual Rank**: Memberikan identitas visual khusus (Mahkota/Medali) untuk peringkat 1-3.
- **Optimistic Loading**: Menggunakan `AnimatePresence` dari Framer Motion untuk transisi halus saat memuat data.

---

## 10. Sistem Desain: Neobrutalism

UI dibangun menggunakan bahasa desain **Neobrutalist**:
- **Kontras Tinggi**: Border hitam tebal (`border-4 border-black`).
- **Warna Cerah**: Hijau neon, kuning, dan ungu.
- **Bayangan Tegas**: Bayangan offset yang tidak buram untuk kedalaman.
- **Animasi**: Framer Motion digunakan untuk efek "pop" pada kartu dan modal.

---

*Dokumentasi disusun oleh Antigravity AI untuk Tim Undercover Online.*
