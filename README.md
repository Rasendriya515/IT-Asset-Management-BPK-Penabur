# 🏫 IT Asset Management - BPK PENABUR

![React](https://img.shields.io/badge/Frontend-React.js-blue?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Python](https://img.shields.io/badge/Python-3.10%2B-yellow?style=for-the-badge&logo=python)

Sistem Informasi Manajemen Aset IT berbasis web yang dirancang untuk memodernisasi pengelolaan inventaris di lingkungan sekolah BPK PENABUR. Sistem ini menggantikan pencatatan manual dengan solusi digital yang terintegrasi, _real-time_, dan mendukung mobilitas tinggi dengan fitur QR Code.

> **Project Magang / Internship** - Rafi Rasendriya (Universitas Bina Sarana Informatika)

---

## 📸 Tampilan Aplikasi

|               **Dashboard Admin**                |             **Halaman Login**             |
| :----------------------------------------------: | :---------------------------------------: |
| ![Dashboard](screenshots/Dashboard%20Admin.jpeg) |  ![Login](screenshots/Login%20Page.jpeg)  |
|   _Statistik aset realtime & grafik pengadaan_   | _Portal masuk dengan keamanan role-based_ |

---

## 🔥 Fitur Utama

- **🔐 Multi-Role Authentication:** Hak akses terpisah untuk Admin, Operator, dan User (IT Support).
- **📊 Real-time Dashboard:** Visualisasi data total aset dan grafik pengadaan.
- **📱 QR Code Integration:** Generator & Scanner QR Code untuk identifikasi aset instan.
- **🛠 Service History:** Pencatatan riwayat perbaikan dan pemeliharaan aset.
- **🔄 Asset Transfer:** Fitur mutasi aset antar sekolah/ruangan dengan Log Audit otomatis.

---

## 🛠️ Teknologi (Tech Stack)

- **Frontend:** React.js (Vite), Tailwind CSS, Axios.
- **Backend:** Python FastAPI, SQLAlchemy, Pydantic.
- **Database:** PostgreSQL.
- **Tools:** Visual Studio Code, Git.

---

## 🚀 Cara Menjalankan Project (Panduan Instalasi)

Panduan ini untuk pengguna yang ingin mencoba menjalankan project ini di komputer lokal (Localhost).

### 1. Clone Repository

```bash
git clone https://github.com/Rasendriya515/it-asset-management-bpk-penabur.git
cd it-asset-management-bpk-penabur
```

### 2. Setup Backend

Buka terminal baru, masuk ke folder backend, dan jalankan server:

```bash
cd backend
# Install Dependencies
pip install -r requirements.txt
# Jalankan Server Backend
uvicorn app.main:app --reload --port 8000
```

### 3. Setup Frontend

Buka terminal baru lagi, masuk ke folder frontend, dan jalankan:

```bash
cd frontend
# Install Dependencies
npm install
# Jalankan Server Frontend
npm run dev
```

Akses aplikasi di browser: http://localhost:5173

---

## 📂 Struktur Database (ERD)

Sistem ini menggunakan 7 tabel utama yang saling berelasi untuk menyimpan data operasional:

- Users: Data pengguna (Admin/Operator).
- Assets: Data inventaris utama (Laptop, PC, dll).
- Schools & Areas: Data lokasi dan wilayah sekolah.
- ServiceHistories: Riwayat perbaikan aset.
- UpdateLogs: Audit trail perubahan data.

---

### 👤 Author

**Rafi Rasendriya**

- Mahasiswa Ilmu Komputer - UBSI
- Intern at BPK PENABUR (2025)
