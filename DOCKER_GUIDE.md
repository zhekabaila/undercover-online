# Undercover Online - Docker Deployment Guide

Panduan singkat untuk menjalankan aplikasi Undercover Online menggunakan Docker.

## 🚀 Port Utama
- **Client (Frontend)**: `3020`
- **Server (Backend/WS)**: `3021`

---

## 🛠️ Lingkungan Pengembangan (Development)
Gunakan mode ini untuk pengembangan lokal. Mendukung *hot-reloading* (perubahan kode langsung terlihat).

**Perintah:**
```bash
docker-compose -f docker-compose.local.yml up --build
```
- **Akses**: `http://localhost:3020`
- **Fitur**: Sinkronisasi folder lokal ke dalam container.

---

## 🏗️ Lingkungan Produksi (Production)
Gunakan mode ini untuk deployment di server. Dioptimalkan untuk **Server 1 Core**.

**Perintah:**
```bash
docker-compose up --build -d
```
- **Akses**: `http://localhost:3020`
- **Fitur**:
  - Limitasi CPU (1.0 Core) & Memory.
  - Restart otomatis jika container mati.
  - Image yang jauh lebih ringan.

---

## ⚙️ Variabel Lingkungan (Environment Variables)
Jika Anda men-deploy di server dengan domain/IP publik, jalankan dengan variabel berikut:

```bash
NEXT_PUBLIC_WS_URL=https://api.domainanda.com docker-compose up -d
```

---

## 🧹 Perintah Berguna Lainnya
- **Menghentikan aplikasi**: `docker-compose down` (atau tambahkan `-f docker-compose.local.yml` jika di dev).
- **Melihat log**: `docker-compose logs -f`
- **Membersihkan image lama**: `docker system prune -a`
