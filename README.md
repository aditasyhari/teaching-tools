# WaliKelas Teaching Tools — V1

<div align="center">
  <img src="apps/web/public/logo.png" alt="WaliKelas Logo" width="96" height="96" />
  <h3>Platform Interaksi & Manajemen Ruang Kelas Realtime untuk Guru Modern</h3>
  <p>Standalone classroom teaching tools — Cepat, interaktif, dan fokus pada proses belajar mengajar di kelas.</p>

  <p>
    <a href="https://tools.walikelas.id"><strong>tools.walikelas.id</strong></a>
  </p>
</div>

---

## 📌 Tentang Produk

**WaliKelas Teaching Tools V1** adalah produk tersendiri yang berfokus pada alat bantu mengajar di ruang kelas interaktif (*classroom teaching tools*). Produk ini **bukan LMS** dan tidak mengurusi administrasi sekolah (bukan absensi sekolah, rapor, atau perpesanan orang tua).

### 🎯 Prinsip Utama
> **Guru buka** ➔ **Pilih alat** ➔ **Jalankan** ➔ **Siswa bergabung** ➔ **Aktivitas berlangsung** ➔ **Hasil langsung terlihat di proyektor**.

- **Tanpa Hambatan Siswa**: Siswa bergabung instan menggunakan kode sesi 6-digit atau scan QR Code tanpa wajib membuat akun/password.
- **Otentikasi Guru Simpel**: Menggunakan **Google OAuth / OIDC** secara eksklusif. Tidak ada login email/password manual.
- **Projector-First**: Tampilan khusus proyektor (*Projector Mode*) yang bersih, nyaman dibaca dari jarak jauh oleh seluruh siswa di kelas, dan bebas dari panel navigasi guru.

---

## 🛠️ Fitur & Alat Pembelajaran (V1 Scope)

### 1. Alat Utilitas / Lokal (Dapat Berjalan Offline)
* **Timer Kelas**: Pengatur waktu mundur, hitung maju, interval, dan stopwatch dengan preset cepat dan alarm visual/suara.
* **Random Picker (Acak Siswa)**: Pengacak nama siswa dengan animasi roda putar (*spinner wheel*) dan mode tanpa pengulangan (*no repeat*).
* **Group Maker (Bagi Kelompok)**: Pembagi kelompok otomatis berdasarkan ukuran kelompok atau jumlah tim yang diinginkan.
* **Papan Skor (Scoreboard)**: Pencatat skor tim/kelompok interaktif untuk gamifikasi kuis atau cerdas cermat.
* **Catatan Guru (Teacher Notes)**: Catatan cepat agenda pembelajaran yang tersimpan lokal di browser guru.

### 2. Alat Interaktif Realtime (Classroom Session Engine)
* **Live Quiz**: Kuis pilihan ganda kompetitif realtime dengan hitung mundur dan papan peringkat (*leaderboard*).
* **Live Poll**: Jajak pendapat kilat untuk mengukur pemahaman materi secara instan.
* **Papan Ide (Brainstorm Board)**: Siswa mengirimkan gagasan/post-it secara langsung ke kanvas interaktif proyektor.
* **Kotak Tanya (Question Box)**: Siswa dapat mengajukan pertanyaan anonim/terbuka selama penjelasan materi.
* **Angkat Tangan (Raise Hand)**: Antrean bertanya siswa secara tertib dengan sorotan pembicara (*Speaker Spotlight*) di proyektor.
* **Awan Kata (Word Cloud)**: Visualisasi kata kunci jawaban siswa yang membesar sesuai frekuensi jawaban terbanyak.
* **Tiket Keluar (Exit Ticket)**: Refleksi pemahaman materi sebelum kelas berakhir dengan statistik instan.

### 3. Konten Pembelajaran
* **Kartu Pintar (Flashcards)**: Kartu hafalan bolak-balik digital untuk review materi atau pengayaan kosakata.

---

## 🖥️ Multi-Surface Experience

| Layar / Surface | Jalur Akses | Deskripsi |
| :--- | :--- | :--- |
| **Teacher Console** | `/teacher` | Dashboard guru untuk mengontrol sesi, merilis pertanyaan, dan memantau siswa. |
| **Layar Proyektor** | `/projector/:code` | Tampilan fullscreen di proyektor kelas tanpa panel kontrol guru (hanya menampilkan visual aktivitas). |
| **Siswa Mobile Web** | `/join/:code` | Antarmuka siswa responsif dan ramah sentuhan (*touch-first*) untuk menjawab kuis/ide. |
| **Admin Console** | `/admin` | Dashboard manajemen sistem, pemantauan sesi aktif, analitik produk, dan log audit. |

---

## 🏛️ Arsitektur Monorepo

Proyek ini dibangun menggunakan arsitektur **pnpm workspaces** yang modular dan terisolasi:

```text
tools.walikelas.id/
├── apps/
│   ├── web/           # Frontend Next.js 15 (App Router, Tailwind CSS, Atomic Design UI)
│   ├── api/           # Backend NestJS 10 (Prisma ORM, PostgreSQL, Socket.io Realtime Gateway)
│   └── mobile/        # Aplikasi Guru Android (Expo / React Native)
├── packages/
│   ├── ui/            # Komponen Design System (Atoms, Molecules, Organisms)
│   ├── types/         # Kontrak tipe TypeScript & Event Realtime
│   ├── validation/    # Skema validasi runtime Zod
│   ├── api-client/    # Type-safe Fetch API Client
│   └── config/        # Konfigurasi bersama (ESLint, TSConfig, Tailwind)
├── docs/              # Dokumentasi lengkap spesifikasi produk & arsitektur
├── ecosystem.config.js# Konfigurasi deployment proses PM2
└── package.json       # Root scripts
```

---

## 🚀 Memulai (Local Development)

### Prasyarat Sistem
* **Node.js**: Versi `20.x` atau `22.x` (Direkomendasikan Node 22+)
* **pnpm**: Versi `9.x` atau `11.x` (`npm install -g pnpm`)
* **PostgreSQL**: Database PostgreSQL (Dapat menggunakan PostgreSQL lokal atau layanan cloud seperti [Neon.tech](https://neon.tech))
* **Google Cloud Console**: OAuth 2.0 Client ID untuk autentikasi Google.

### Langkah Instalasi

1. **Clone repositori**:
   ```bash
   git clone https://github.com/walikelas-team/tools.walikelas.id.git
   cd tools.walikelas.id
   ```

2. **Install dependensi monorepo**:
   ```bash
   pnpm install
   ```

3. **Konfigurasi Environment Variables**:
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Sesuaikan nilai-nilai penting di dalam `.env`:
   ```env
   # Database PostgreSQL
   DATABASE_URL="postgresql://user:password@localhost:5432/walikelas_tools?schema=public"

   # Google OAuth Credentials
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_CALLBACK_URL="http://localhost:4006/api/v1/auth/google/callback"

   # Admin Accounts (Dipisahkan tanda koma)
   ADMIN_EMAILS="admin@walikelas.id,email.anda@gmail.com"

   # Session Secret (Minimal 32 karakter acak)
   SESSION_SECRET="ganti-dengan-random-string-kriptografis"
   ```

4. **Siapkan Database & Seeder**:
   ```bash
   # Generate Prisma client & sinkronisasi migrasi
   pnpm --filter @walikelas/api prisma:generate
   pnpm --filter @walikelas/api prisma:migrate

   # Jalankan seeder akun Administrator dari ADMIN_EMAILS
   pnpm db:seed
   ```

5. **Jalankan Aplikasi dalam Mode Pengembangan**:
   ```bash
   pnpm dev
   ```
   * Web App akan berjalan di: `http://localhost:3006`
   * API Server akan berjalan di: `http://localhost:4006`

---

## ⚙️ Variabel Lingkungan (`.env`)

| Variabel | Deskripsi | Default / Rekomendasi |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode lingkungan Node.js | `development` / `production` |
| `WEB_PORT` | Port aplikasi web Next.js | `3006` |
| `API_PORT` | Port aplikasi backend NestJS | `4006` |
| `NEXT_PUBLIC_APP_URL` | Base URL frontend publik | `http://localhost:3006` |
| `NEXT_PUBLIC_API_URL` | Base URL endpoint REST API | `http://localhost:4006/api/v1` |
| `CORS_ALLOWED_ORIGINS` | Domain yang diizinkan untuk CORS | `http://localhost:3006` |
| `DATABASE_URL` | Connection string PostgreSQL (Gunakan pooled connection di Neon) | `postgresql://...` |
| `SESSION_SECRET` | Kunci enkripsi sesi otentikasi guru/admin | Random 32+ bytes |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth 2.0 | Dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth 2.0 | Dari Google Cloud Console |
| `ADMIN_EMAILS` | Daftar email akun Google yang berstatus **ADMIN** | `admin@walikelas.id` |

---

## 🧪 Pengujian & Verifikasi Kualitas

Repositori dilengkapi dengan pengujian unit, integrasi, dan type-checking ketat:

```bash
# Typecheck seluruh package TypeScript
pnpm typecheck

# Linting kode
pnpm lint

# Format kode dengan Prettier
pnpm format

# Jalankan seluruh test suite (Web & API)
pnpm test

# Build seluruh aplikasi untuk produksi
pnpm build
```

---

## 🚢 Deployment Produksi (Linux VPS / PM2)

Proyek ini telah dikonfigurasi untuk kemudahan deployment pada Linux VPS (Ubuntu/Debian) menggunakan Nginx dan PM2:

### 1. Build & Migrate di Server
```bash
pnpm install --frozen-lockfile
pnpm -r typecheck
pnpm -r build
npx prisma migrate deploy
pnpm db:seed
```

### 2. Jalankan Proses via PM2
Gunakan file `ecosystem.config.js` bawaan:
```bash
# Menjalankan walikelas-web (port 3006) dan walikelas-api (port 4006)
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Konfigurasi Nginx Reverse Proxy & WebSocket
Pastikan Nginx meneruskan header WebSocket untuk mendukung komunikasi realtime:
```nginx
server {
    server_name tools.walikelas.id;

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Backend API & Socket.io
    location /api/ {
        proxy_pass http://127.0.0.1:4006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:4006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

---

## 🔒 Kebijakan Keamanan

* **Otentikasi Aman**: Perlindungan CSRF pada state OAuth, cookie berflag `HttpOnly`, `Secure`, dan `SameSite`.
* **Otorisasi Server-Side**: Semua mutasi sesi dan aktivitas ruang kelas divalidasi secara otoritatif oleh NestJS Backend.
* **Rate Limiting**: Proteksi *brute-force* pada endpoint join kode sesi dan submission respons siswa.

---

## 📄 Lisensi & Hak Cipta

Hak Cipta © 2026 **walikelas.id**. Seluruh hak cipta dilindungi undang-undang.

