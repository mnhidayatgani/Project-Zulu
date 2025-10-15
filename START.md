# 🚀 Cara Menjalankan Server Zola

## Metode 1: Quick Start (Paling Mudah)

```bash
cd /root/zola
npm run dev
```

Buka browser: **http://localhost:3000**

---

## Metode 2: Dengan Script Helper

```bash
cd /root/zola
./quick-start.sh
```

Script ini akan:
- ✅ Check konfigurasi .env.local
- ✅ Install dependencies jika perlu
- ✅ Memberikan instruksi selanjutnya

---

## Metode 3: Step by Step (Detail)

### 1. Masuk ke folder project
```bash
cd /root/zola
```

### 2. Install dependencies (jika belum)
```bash
npm install
```

### 3. Check konfigurasi (optional)
```bash
./setup-check.sh
```

### 4. Jalankan development server
```bash
npm run dev
```

### 5. Akses aplikasi
Buka browser ke: **http://localhost:3000**

---

## Perintah Server Lainnya

### Stop Server
Tekan: **Ctrl + C** di terminal

### Build Production
```bash
npm run build
npm start
```

### Check Status
```bash
curl http://localhost:3000/api/health
```

---

## Troubleshooting

### Server tidak mau start?
```bash
# Kill process yang sedang jalan
pkill -f "next dev"

# Start ulang
npm run dev
```

### Port 3000 sudah dipakai?
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

### Error saat install?
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Info Penting

- **Development Server**: `npm run dev` (dengan hot reload)
- **Production Server**: `npm start` (setelah `npm run build`)
- **Port Default**: 3000
- **Auto-reload**: File changes otomatis ter-refresh di browser

---

## Status Server

✅ Server sudah berjalan jika muncul:
```
✓ Ready in 1.9s
- Local:   http://localhost:3000
```

❌ Server belum jalan jika ada error merah di terminal

---

## Quick Commands

```bash
# Start server
npm run dev

# Stop server
Ctrl + C

# Restart server
Ctrl + C lalu npm run dev

# Check health
curl http://localhost:3000/api/health
```
