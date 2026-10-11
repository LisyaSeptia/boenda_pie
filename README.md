# 🥧 Boenda Pie Purwokerto - Point of Sale (POS) & ERP System

Sistem Informasi Manajemen Penjualan, Kasir (POS), Inventaris Bahan Baku, dan Produksi untuk **Boenda Pie Purwokerto** — Produsen Pie Krispi Khas Purwokerto & Minuman Jus Buah Segar.

---

## 📋 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Proyek](#-struktur-proyek)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
  - [Prasyarat](#prasyarat)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Setup Backend](#2-setup-backend)
  - [3. Setup Frontend](#3-setup-frontend)
- [Akun Pengguna Default (Demo)](#-akun-pengguna-default-demo)
- [Fitur Laporan & Struk](#-fitur-laporan--struk)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🛒 1. Point of Sale (POS Kasir)
- Tampilan katalog interaktif terpisah untuk **Produk Pie** dan **Minuman Jus Buah**.
- Pemilihan opsi packaging (**Kardus** berbayar / **Kertas** gratis).
- Input catatan pesanan / request pelanggan.
- Metode pembayaran: **Tunai (Cash)** dengan kalkulasi kembalian otomatis, **QRIS**, dan **Transfer Bank**.
- Cetak struk belanja thermal & fitur simpan gambar struk format PNG.

### 📊 2. Laporan Penjualan & Analytics Bisnis
- **4 Ringkasan Metrik Utama:**
  1. Total Omset Penjualan (Rp)
  2. Jumlah Transaksi Sukses
  3. Total Pie Terjual (Pieces)
  4. Total Jus Terjual (Cups)
- Peringkat produk terlaris dengan pemisahan kategori (**Pie Terlaris** & **Jus Terlaris**).
- Filter periode fleksibel: *Hari Ini*, *Minggu Ini*, *Bulan Ini*, dan *Rentang Tanggal Kustom*.
- Ekspor laporan ke **Excel (.xls)** dengan border & format tabel rapi, serta **PDF Siap Cetak**.

### 📦 3. Manajemen Produk, Bahan Baku & Kemasan
- Katalog master produk pie dan minuman jus lengkap dengan harga, kode SKU, dan stok minimum.
- Inventaris bahan baku dan kemasan dengan status peringatan stok (*Tersedia*, *Stok Menipis*, *Habis*).
- Tracking masa kadaluwarsa bahan baku.

### 🏭 4. Manajemen Produksi & Log Aktivitas Stok
- Input batch produksi pie dan jus.
- Pemotongan otomatis bahan baku sesuai resep produksi (*BOM / Bill of Materials*).
- Pencatatan riwayat mutasi keluar/masuk stok barang secara transparan.

### 👥 5. Manajemen Pengguna (Role-Based Access Control)
- **Admin**: Akses penuh ke seluruh menu (Dashboard Analitik, Master Produk, Bahan Baku, Produksi, Stok, Riwayat Transaksi, Laporan, Manajemen User).
- **Kasir**: Akses fokus operasional (Dashboard Kasir, Transaksi POS, dan Riwayat Penjualan Kasir).

---

## 🛠 Teknologi yang Digunakan

### Backend
- **Node.js** & **Express.js** — RESTful API Framework
- **MongoDB** & **Mongoose** — Database NoSQL & ODM
- **JWT (JSON Web Token)** & **bcryptjs** — Autentikasi aman & hashing password
- **Nodemon** — Hot reloading untuk development

### Frontend
- **React.js (Vite)** — Antarmuka pengguna modern dan cepat
- **Tailwind CSS** — Utility-first styling dengan tema pastel modern khas Boenda Pie
- **Lucide React** — Icon library
- **Axios** — HTTP Client terintegrasi dengan interceptor JWT token

---

## 📁 Struktur Proyek

```plaintext
Capstone_Project/
├── boenda-pie/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/         # Konfigurasi database MongoDB
│   │   │   ├── controllers/    # Handler logika bisnis (auth, product, transaction, report, dll)
│   │   │   ├── middleware/     # Auth & Role verification middleware
│   │   │   ├── models/         # Schema Mongoose (User, Product, Material, Transaction, dll)
│   │   │   ├── routes/         # Routing API endpoints
│   │   │   ├── utils/          # Seeder data awal & response helper
│   │   │   └── server.js       # Entry point Express backend
│   │   ├── .env                # Variabel lingkungan backend
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/     # Komponen UI (Modal, Sidebar, Navbar, ReceiptModal, dll)
│       │   ├── context/        # React Context (AuthContext, CartContext)
│       │   ├── pages/          # Halaman aplikasi (POS, Dashboard, Reports, Products, dll)
│       │   ├── services/       # Integrasi API Axios
│       │   ├── utils/          # Helper formatter Rupiah, tanggal WIB, data cache
│       │   ├── App.jsx         # Routing & Protected Routes
│       │   └── main.jsx        # Entry point React
│       └── package.json
└── README.md
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru)
- [npm](https://www.npmjs.com/) atau yarn
- Koneksi Internet untuk database MongoDB Atlas (atau gunakan MongoDB lokal)

### 1. Clone Repository
```bash
git clone https://github.com/LisyaSeptia/boenda_pie.git
cd boenda_pie
```

### 2. Setup Backend
Masuk ke direktori backend:
```bash
cd boenda-pie/backend
```

Instal dependensi:
```bash
npm install
```

Buat file `.env` di folder `boenda-pie/backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.lxnogem.mongodb.net/boenda_pie
JWT_SECRET=boenda_pie_purwokerto_super_secret_jwt_key_2026
NODE_ENV=development
```

*(Opsional)* Mengisi data awal / seeder produk, bahan, dan akun:
```bash
npm run seed
```

Jalankan server backend:
```bash
npm run dev
```
Backend akan aktif di `http://localhost:5000`.

### 3. Setup Frontend
Buka terminal baru, masuk ke direktori frontend:
```bash
cd boenda-pie/frontend
```

Instal dependensi:
```bash
npm install
```

Jalankan server frontend:
```bash
npm run dev
```
Aplikasi web akan dapat dibuka di browser pada alamat `http://localhost:5173`.

---

## 🔑 Akun Pengguna Default (Demo)

| Role | Username | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Akses penuh seluruh sistem & laporan |
| **Kasir** | `kasir` | `kasir123` | Akses operasional POS & Riwayat Transaksi |

---

## 🧾 Fitur Laporan & Struk

1. **Laporan Penjualan**:
   - Menampilkan total omset, transaksi sukses, jumlah pie terjual, dan jumlah jus terjual.
   - Peringkat produk pie dan minuman jus terlaris secara real-time.
   - Pilihan ekspor dokumen:
     - **Excel (.xls)**: Format sheet terstruktur dengan styling border, alignment, dan currency format.
     - **PDF Siap Cetak**: Layout bersih berstandar laporan keuangan lengkap dengan metadata toko dan cap waktu WIB.
2. **Struk Digital & Thermal Print**:
   - Format standar struk kasir 80mm/58mm.
   - Dilengkapi rincian jenis packaging dan request catatan dari pembeli.
   - Pilihan cetak langsung ke printer atau unduh struk sebagai file gambar PNG.

---

## 📄 Lisensi
Dikembangkan untuk keperluan **Capstone Project - Boenda Pie Purwokerto**.
Hak Cipta © 2026 Boenda Pie Purwokerto. Seluruh hak cipta dilindungi undang-undang.
