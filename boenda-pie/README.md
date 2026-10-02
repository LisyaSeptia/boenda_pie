# Boenda Pie Purwokerto System
### Perancangan Sistem Kasir, Manajemen Stok, dan Pelaporan Berbasis Web

Aplikasi web Full-Stack terintegrasi untuk **Boenda Pie Purwokerto** yang mencakup sistem kasir (Point of Sale), manajemen stok produk & bahan baku, pencatatan produksi otomatis, audit pergerakan stok (stock movement), dan pelaporan penjualan secara real-time.

---

## 1. Teknologi

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB / MongoDB Atlas (Mongoose ODM)
- **Autentikasi**: JWT (JSON Web Token) & bcryptjs (Password Hashing)
- **Database Fallback**: MongoDB Memory Server (Otomatis aktif jika MongoDB server lokal belum di-start)

---

## 2. Struktur Folder Project

```text
boenda-pie/
├── frontend/
│   ├── src/
│   │   ├── components/       # Component UI (Navbar, Sidebar, Modal, Toast, ReceiptModal)
│   │   ├── pages/            # Views (Login, Dashboard, Products, Materials, Production, Stock, POS, Transactions, Reports)
│   │   ├── layouts/          # Layouts (MainLayout, AuthLayout)
│   │   ├── services/         # Axios API Services
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── utils/            # Formatters (Rupiah & Tanggal)
│   │   ├── App.jsx           # Router & Role Authorization
│   │   └── main.jsx          # Entry point Vite React
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/           # db.js (Koneksi Database Mongoose)
│   │   ├── controllers/      # Controller Logika Bisnis
│   │   ├── middleware/       # JWT Auth & Role Authorization
│   │   ├── models/           # Mongoose Schemas (User, Product, Material, Production, StockMovement, Transaction)
│   │   ├── routes/           # REST API Routes
│   │   ├── utils/            # Response Formatter & Seed Script
│   │   └── server.js         # Entry Point Server Express
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 3. Akun Pengguna Standar (Seed Data)

| Username | Password | Role | Akses |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **ADMIN** | Full Akses (Dashboard Admin, Produk, Bahan Baku, Produksi, Stok, Transaksi, Laporan) |
| **kasir** | `kasir123` | **KASIR** | Mode Kasir (Dashboard Kasir, Aplikasi POS Kasir, Riwayat Transaksi) |

---

## 4. Cara Instalasi & Menjalankan Aplikasi

### A. Prasyarat System
- **Node.js**: Version 18.0.0 atau yang lebih baru.
- **NPM**: Version 9.0.0 atau yang lebih baru.

### B. Langkah 1: Setup Backend
```bash
cd backend
npm install
npm run seed     # Memasukkan data awal (Admin, Kasir, Bahan Baku, Produk, Sample Transaksi)
npm run dev      # Menjalankan backend di http://localhost:5000
```

### C. Langkah 2: Setup Frontend
```bash
cd ../frontend
npm install
npm run dev      # Menjalankan frontend di http://localhost:5173
```

Buka browser Anda dan akses:
```text
http://localhost:5173
```

---

## 5. Konfigurasi Environment Variables (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/boenda_pie
JWT_SECRET=boenda_pie_purwokerto_super_secret_jwt_key_2026
NODE_ENV=development
```

---

## 6. Daftar Endpoint REST API Utama

### Autentikasi (`/api/auth`)
- `POST /api/auth/login` - Login pengguna (JWT Token)
- `POST /api/auth/logout` - Logout pengguna
- `GET /api/auth/me` - Profile pengguna aktif

### Produk (`/api/products`)
- `GET /api/products` - Ambil daftar produk
- `POST /api/products` - Tambah produk baru (Admin)
- `PUT /api/products/:id` - Update produk (Admin)
- `DELETE /api/products/:id` - Hapus produk (Admin)

### Bahan Baku (`/api/materials`)
- `GET /api/materials` - Ambil daftar bahan baku
- `POST /api/materials` - Tambah bahan baku (Admin)
- `PUT /api/materials/:id` - Update bahan baku (Admin)
- `DELETE /api/materials/:id` - Hapus bahan baku (Admin)

### Produksi (`/api/productions`)
- `GET /api/productions` - Riwayat produksi (Admin)
- `POST /api/productions` - Catat produksi & potong bahan baku (Admin)

### Transaksi Kasir (`/api/transactions`)
- `POST /api/transactions` - Process Checkout POS & potong stok produk
- `GET /api/transactions` - Ambil daftar transaksi penjualan

### Stok & Laporan (`/api/stock` & `/api/reports`)
- `GET /api/stock/movements` - Audit pergerakan stok
- `POST /api/stock/adjust` - Penyesuaian stok manual (Adjustment)
- `GET /api/reports/dashboard` - Ringkasan dashboard
- `GET /api/reports/sales` - Laporan penjualan per periode

---
