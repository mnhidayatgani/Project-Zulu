# 🚀 START HERE - Project Zulu Personalization

## TL;DR - Super Quick Start

### Option 1: Automatic (Easiest) ⚡

1. Edit file `personalize.sh` (baris 20-27):
```bash
nano personalize.sh
```

2. Ganti 3 variabel ini:
```bash
YOUR_NAME="Nama Anda"              # ← Edit ini
YOUR_GITHUB="username_github_anda"  # ← Edit ini  
YOUR_EMAIL="email@anda.com"         # ← Edit ini
```

3. Jalankan script:
```bash
./personalize.sh
```

4. Finalisasi:
```bash
./finalize-rebrand.sh
```

**SELESAI!** ✅

---

### Option 2: Manual Edit 📝

Edit 4 file ini dengan text editor favorit Anda:

#### File 1: `package.json` (baris 7-11)
```json
"author": {
  "name": "Nama Anda",        ← Ganti
  "email": "email@anda.com",  ← Ganti
  "url": "https://github.com/username_anda"  ← Ganti
}
```

#### File 2: `README_ZULU.md`
Find & Replace (Ctrl+H):
- `[Your Name]` → `Nama Anda`
- `YOUR_USERNAME` → `username_github_anda`

#### File 3: `CREDITS_ZULU.md`
Find & Replace:
- `[Your Name]` → `Nama Anda`
- `@your_github` → `@username_anda`
- `your.email@example.com` → `email@anda.com`
- `YOUR_USERNAME` → `username_github_anda`

#### File 4: `CONTRIBUTING.md`
Find & Replace:
- `YOUR_USERNAME` → `username_github_anda`

Kemudian jalankan:
```bash
./finalize-rebrand.sh
```

---

## 📍 Lokasi File yang Perlu Di-Edit

```
/root/zola/
├── personalize.sh        ← EDIT INI (option 1 - otomatis)
├── package.json         ← atau EDIT INI (option 2 - manual)
├── README_ZULU.md       ← dan INI
├── CREDITS_ZULU.md      ← dan INI
└── CONTRIBUTING.md      ← dan INI
```

---

## 🎯 Informasi yang Dibutuhkan

Siapkan 3 informasi ini:

1. **Nama Lengkap**: Contoh `Yat Hidayat`
2. **GitHub Username**: Contoh `mnhidayatgani` (tanpa @)
3. **Email**: Contoh `yat@example.com`

---

## 📚 Dokumentasi Lengkap

Jika butuh penjelasan detail:
- **WHERE_TO_ADD_YOUR_INFO.md** - Penjelasan lengkap setiap file
- **REBRANDING_GUIDE.md** - Step-by-step guide
- **QUICKSTART_REBRAND.md** - Quick reference

---

## ✅ Verify Setelah Edit

Cek apakah masih ada placeholder:
```bash
grep -r "\[Your Name\]" README_ZULU.md CREDITS_ZULU.md
grep -r "YOUR_USERNAME" README_ZULU.md CREDITS_ZULU.md CONTRIBUTING.md

# Jika tidak ada output = BERHASIL! ✅
```

---

## 🎊 After Personalization

Setelah personalisasi selesai:

1. **Build & Test**:
```bash
npm install
npm run type-check
npm run build
npm run dev
```

2. **New Git Repository** (optional):
```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit: Project Zulu v1.0.0"
git remote add origin https://github.com/YOUR_USERNAME/zulu.git
git push -u origin main
```

3. **Deploy** to Vercel/your platform!

---

## 💡 Quick Tips

- ✅ Gunakan editor dengan Find & Replace (VS Code, nano, vim)
- ✅ Edit option 1 (script) lebih cepat dan aman
- ✅ Review hasil sebelum finalize
- ✅ Backup otomatis dibuat di folder `.backups/`

---

## ❓ Bantuan

| Dokumentasi | Tujuan |
|-------------|--------|
| **START_HERE.md** (file ini) | Quick start |
| WHERE_TO_ADD_YOUR_INFO.md | Penjelasan detail |
| personalize.sh | Script otomatis |
| finalize-rebrand.sh | Script finalisasi |

---

**Pilih option 1 untuk cara tercepat!** ⚡
