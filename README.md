# LIBRARYKU — School Library Management System 📚

**LIBRARYKU** adalah aplikasi web manajemen perpustakaan sekolah modern, aman, dan siap produksi yang dibangun untuk penilaian kompetensi kejuruan Pengembangan Perangkat Lunak dan Gim (**PPLG**). Aplikasi ini terhubung langsung ke basis data **MySQL** melalui Laragon dan menerapkan alur bisnis peminjaman buku nyata dengan integritas transaksi atomik.

---

## 🌟 Fitur Utama

### 1. Desain & Antarmuka Sesuai Standar Industri
- Dibuat dengan presisi tinggi mengacu pada desain **Stitch** (`LIBRARYKU Library Management System`).
- Palet warna profesional: Navy Blue (`#172554`), Royal Blue (`#2563EB`), dan Clean Background (`#F8FAFC`).
- Tipografi modern **Plus Jakarta Sans** dan **Inter**.
- Desain responsif di layar Desktop, Tablet, dan Ponsel.

### 2. Autentikasi & Otorisasi Mandiri
- **Portal Siswa** terpisah (`/login/student`): Login dengan NIS dan Password.
- **Panel Petugas / Admin** terpisah (`/login/admin`): Login dengan Email dan Password.
- Password dienkripsi dengan algoritma **bcryptjs**.
- Sesi aman menggunakan **HTTP-only cookie** dan token JWT bertandatangan kriptografis.
- Middleware pelindung rute berbasis peran (Role-Based Access Control / RBAC).

### 3. Alur Sirkulasi & Integritas Bisnis (Critical Business Logic)
- **Pengajuan Peminjaman**: Siswa memilih buku dan durasi pinjam. Status permohonan masuk ke status `PENDING`.
- **Konsistensi Stok**: Stok fisik buku **TIDAK** berkurang saat siswa baru mengajukan pinjaman.
- **Verifikasi & Persetujuan**: Petugas memeriksa ketersediaan stok fisik dan menyetujui (`APPROVED`). Pada tahap ini stok buku berkurang 1 secara atomik menggunakan **Prisma Transactions**.
- **Pengembalian Buku**: Petugas memproses pengembalian buku (`RETURNED`). Sistem menambah stok buku tersedia secara atomik dan mencatat tanggal pengembalian `returnedAt`.
- **Pencegahan Race Condition**: Sistem mencegah persetujuan ganda atau pengembalian ganda dari transaksi yang sama.
- **Pelacakan Denda Dinamis**: Denda keterlambatan dihitung otomatis secara *real-time* berdasarkan selisih tanggal jatuh tempo (`dueDate`) dan tanggal sekarang (Rp 1.000 / hari keterlambatan).
- **Pembatasan Kuota**: Siswa dibatasi maksimal meminjam 3 buku secara serentak.

### 4. Manajemen Master Data (Full CRUD)
- **Koleksi Buku**: Tambah, edit, hapus, filter kategori, pencarian multi-kolom, serta manajemen stok fisik. Penghapusan buku yang sedang aktif dipinjam dicegah secara ketat oleh sistem.
- **Kategori Buku**: Manajemen klasifikasi buku dengan pencegahan penghapusan kategori yang masih memuat buku.
- **Data Siswa**: Pendaftaran anggota baru, perubahan data profil, pembuatan kredensial login otomatis, dan pelacakan riwayat peminjaman per siswa.
- **Laporan & Rekapitulasi**: Ringkasan KPI perpustakaan, grafik sirkulasi bulanan dengan **Recharts**, buku paling populer, daftar keterlambatan, dan fitur cetak/ekspor PDF langsung.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Framework**: Next.js 16 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **ORM & Database**: Prisma ORM & MySQL (Laragon)
- **Autentikasi**: `jose` JWT + HTTP-only Cookie + `bcryptjs`
- **Validasi**: Zod & React Hook Form
- **Ikon**: Lucide React & Google Material Symbols
- **Visualisasi Data**: Recharts

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Lingkungan
Pastikan aplikasi berikut telah terpasang di sistem operasi Windows Anda:
- **Node.js** (v18.x atau lebih baru) & **npm**
- **Laragon** (dengan modul Apache/Nginx dan MySQL berjalan)

### 2. Konfigurasi Database di Laragon
1. Buka Laragon dan klik tombol **Start All** untuk menyalakan MySQL di port `3306`.
2. Buka terminal Laragon atau MySQL client (HeidiSQL / phpMyAdmin), lalu pastikan database telah dibuat:
   ```sql
   CREATE DATABASE IF NOT EXISTS libraryku CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 3. Konfigurasi Environment Variables
Buat atau periksa file `.env` pada direktori root proyek:
```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/libraryku"
JWT_SECRET="libraryku_super_secret_jwt_key_2024_pplg_assessment_secure"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
*(File `.env.example` telah disediakan sebagai referensi acuan)*.

### 4. Sinkronisasi Skema Database & Migrasi Prisma
Jalankan perintah berikut untuk menyinkronkan seluruh tabel ke MySQL:
```bash
npx prisma db push
```

### 5. Seeding Data Demo (Akun, Buku, dan Transaksi)
Jalankan skrip seeder untuk mengisi data awal:
```bash
npx prisma db seed
```
Skrip ini akan membuat:
- 1 Akun Administrator
- 5 Akun Siswa
- 5 Kategori Koleksi (Teknologi, Sains, Sastra, Pengembangan Diri, dsb.)
- 16 Judul Buku lengkap dengan cover dan nomor ISBN valid
- Transaksi peminjaman realistis (status PENDING, APPROVED, RETURNED, REJECTED)

### 6. Menjalankan Server Pengembangan
Jalankan server aplikasi Next.js:
```bash
npm run dev
```
Buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Kredensial Akun Uji Coba (Demo Accounts)

Untuk mempermudah pengujian dan demonstrasi asesmen:

### 👤 1. Administrator / Petugas Perpustakaan
- **URL Login**: [http://localhost:3000/login/admin](http://localhost:3000/login/admin)
- **Email**: `admin@libraryku.com`
- **Password**: `Admin123!`
- *Fitur*: Dashboard analitik, approval peminjaman, proses pengembalian buku, CRUD buku & kategori, manajemen siswa, dan laporan.

### 🎓 2. Siswa (Anggota Perpustakaan)
- **URL Login**: [http://localhost:3000/login/student](http://localhost:3000/login/student)
- **NIS**: `123456`
- **Password**: `Student123!`
- *Fitur*: Eksplorasi katalog buku, pencarian & filter, permohonan pinjam mandiri, melihat batas jatuh tempo, perpanjangan masa pinjam (+7 hari), dan cetak token QR pengembalian.

*(Tersedia tombol satu-klik **"Isi Kredensial Demo"** di kedua halaman login untuk demonstrasi instan).*

---

## 📂 Struktur Direktori Proyek

```
library/
├── prisma/
│   ├── schema.prisma            # Skema model basis data (User, Book, Category, Borrowing)
│   └── seed.ts                  # Seeder akun, buku, kategori, dan transaksi
├── public/
│   └── assets/                  # Aset gambar cover buku dan grafis Stitch
├── src/
│   ├── app/
│   │   ├── (auth)/              # Rute login siswa dan admin
│   │   │   ├── login/student/   # Halaman login portal siswa
│   │   │   └── login/admin/     # Halaman login panel petugas
│   │   ├── admin/               # Panel administrator (Dashboard, Books, Categories, Students, Borrowings, Reports)
│   │   ├── student/             # Portal siswa (Dashboard, Catalog, Book Details, Borrowings, History)
│   │   ├── api/                 # Endpoint RESTful API & Server Actions
│   │   │   ├── auth/            # Login, logout, dan verifikasi sesi
│   │   │   ├── books/           # CRUD buku dan proteksi penghapusan
│   │   │   ├── categories/      # CRUD kategori koleksi
│   │   │   ├── students/        # CRUD anggota siswa
│   │   │   └── borrowings/      # Alur request, approve, reject, return, dan extend
│   │   ├── layout.tsx           # Layout root dengan konfigurasi font
│   │   ├── page.tsx             # Halaman portal gerbang utama
│   │   └── globals.css          # Desain tokens, tema warna, dan utilitas
│   ├── components/              # Komponen antarmuka (Header, Sidebar, Modals, Badges)
│   ├── lib/
│   │   ├── prisma.ts            # Client singleton Prisma
│   │   ├── auth.ts              # Pengelolaan sesi JWT, hashing bcryptjs, dan cookie
│   │   └── validations.ts       # Skema validasi Zod
│   └── middleware.ts            # Proteksi rute berbasis peran (RBAC Guard)
├── .env                         # Konfigurasi basis data lokal
├── .env.example                 # Contoh variabel lingkungan
└── README.md                    # Dokumentasi lengkap proyek
```

---

## 🛡️ Aturan Bisnis & Penanganan Transaksi
- **Pencegahan Stok Negatif**: Validasi ganda di tingkat API dan transaksi kondisional Prisma memastikan `availableStock` tidak pernah bernilai di bawah nol.
- **Persetujuan Bersyarat**: Hanya transaksi berstatus `PENDING` yang dapat disetujui atau ditolak.
- **Pengembalian Buku Akurat**: Pengembalian hanya dapat diproses pada transaksi berstatus `APPROVED` dan segera menambahkan stok buku ke kuota tersedia.
- **Keamanan Password**: Semua password siswa dan administrator di-hash menggunakan `bcryptjs` dengan salt round 10 sebelum disimpan ke database.

---
*Dikembangkan dengan dedikasi untuk penilaian Uji Kompetensi Keahlian (UKK) Rekayasa Perangkat Lunak / PPLG.*
