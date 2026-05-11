# Undercover Online 🕵️‍♂️

Permainan multiplayer online berbasis kata yang diadaptasi dari game populer "Undercover". Mainkan bersama teman-temanmu untuk menemukan penyusup atau kelabui para warga sipil!

## 🚀 Memulai Cepat

### 1. Clone Project
Pertama, clone repositori ini ke komputer lokal Anda:
```bash
git clone https://github.com/zhekabaila/undercover-online.git
cd undercover-online
```

---

## 🛠️ Instalasi Manual (Pengembangan Lokal)

### Prasyarat
- **Node.js** (v18 atau lebih baru)
- **MySQL** (Berjalan secara lokal atau melalui Docker)

### 1. Konfigurasi Server
1. Masuk ke direktori server:
   ```bash
   cd server
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` berdasarkan variabel lingkungan berikut:
   ```env
   DATABASE_URL="mysql://root:root@127.0.0.1:3306/undercover"
   JWT_SECRET="isi_dengan_secret_key_anda"
   ```
4. **Push Schema Prisma ke Database**:
   Jalankan perintah ini untuk sinkronisasi database dengan schema Prisma (ini akan membuat tabel secara otomatis):
   ```bash
   npx prisma db push
   ```
5. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
6. Jalankan server:
   ```bash
   npm run dev
   ```
   *Server akan berjalan di port `3021`.*

### 2. Konfigurasi Client
1. Masuk ke direktori client (dari root project):
   ```bash
   cd client
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env.local`:
   ```env
   NEXT_PUBLIC_WS_URL=http://localhost:3021
   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3020
   ```
4. Jalankan client:
   ```bash
   npm run dev
   ```
   *Client akan dapat diakses di [http://localhost:3020](http://localhost:3020).*

---

## 🐳 Instalasi Menggunakan Docker (Direkomendasikan)

Anda dapat menjalankan seluruh stack (Database, Server, dan Client) dengan satu perintah:

1. **Jalankan container**:
   ```bash
   docker compose up -d
   ```
2. **Push schema database** (jika pertama kali dijalankan):
   ```bash
   docker compose exec server npx prisma db push
   ```

Aplikasi akan tersedia di:
- **Client**: [http://localhost:3020](http://localhost:3020)
- **Server**: [http://localhost:3021](http://localhost:3021)

---

## 🏗️ Arsitektur Project

- **Frontend**: Next.js 16 (App Router), TailwindCSS, Framer Motion.
- **Backend**: Express.js, Socket.io untuk komunikasi real-time.
- **Database**: MySQL dengan Prisma ORM.

## 📝 Pemecahan Masalah

- **Error Prisma**: Jika Anda menemui masalah koneksi database, pastikan layanan MySQL Anda sudah berjalan dan `DATABASE_URL` di server `.env` sudah benar.
- **Koneksi Socket**: Jika game tertahan di status "Connecting...", periksa apakah server sudah berjalan di port `3021` dan `NEXT_PUBLIC_WS_URL` sudah sesuai di client `.env.local`.

---

Dibuat dengan ❤️ untuk para penggemar game deduksi sosial.
