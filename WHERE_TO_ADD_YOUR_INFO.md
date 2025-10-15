# Personalization Guide - Where to Add Your Info

## 🎯 Quick Overview

Ganti 4 placeholder ini di semua file:
1. `[Your Name]` → Nama lengkap Anda
2. `YOUR_USERNAME` → Username GitHub Anda
3. `your.email@example.com` → Email Anda
4. `YOUR_GITHUB_URL` → URL repository GitHub Anda (opsional)

---

## 📁 File 1: package.json

**Lokasi**: Root directory (`/root/zola/package.json`)

### Yang Perlu Diganti:

```json
"author": {
  "name": "Your Name",              ← GANTI INI
  "email": "your.email@example.com", ← GANTI INI
  "url": "https://github.com/YOUR_USERNAME" ← GANTI INI
},
```

### Contoh Setelah Diganti:

```json
"author": {
  "name": "Yat Hidayat",
  "email": "yat@example.com",
  "url": "https://github.com/mnhidayatgani"
},
```

### Command untuk Edit:
```bash
nano package.json
# atau
code package.json
```

Cari bagian "author" (sekitar baris 7-11) dan edit.

---

## 📁 File 2: README_ZULU.md (akan jadi README.md)

**Lokasi**: Root directory (`/root/zola/README_ZULU.md`)

### 6 Tempat yang Perlu Diganti:

1. **Line 9** - Fork description:
```markdown
with enhancements developed by [Your Name] and    ← GANTI INI
```

2. **Line 116** - Clone command:
```bash
git clone https://github.com/YOUR_USERNAME/zulu.git  ← GANTI INI
```

3. **Line 235** - Modifications copyright:
```markdown
**Modifications and enhancements**: Copyright © 2025 [Your Name]  ← GANTI INI
```

4. **Line 245** - Project lead credit:
```markdown
Enhanced and extended by:
- **[Your Name]** - Project lead and development  ← GANTI INI
```

5. **Line 271** - Issues link:
```markdown
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/zulu/issues)  ← GANTI INI
```

6. **Line 272** - Discussions link:
```markdown
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/zulu/discussions)  ← GANTI INI
```

### Command untuk Edit:
```bash
nano README_ZULU.md
# atau
code README_ZULU.md
```

Gunakan Find & Replace (Ctrl+F):
- Find: `[Your Name]` → Replace with: `Yat Hidayat` (contoh)
- Find: `YOUR_USERNAME` → Replace with: `mnhidayatgani` (contoh)

---

## 📁 File 3: CREDITS_ZULU.md (akan jadi CREDITS.md)

**Lokasi**: Root directory (`/root/zola/CREDITS_ZULU.md`)

### 4 Tempat yang Perlu Diganti:

1. **Line 19** - Project Lead section:
```markdown
#### Project Lead
- **[Your Name]** ([@your_github](https://github.com/your_github))  ← GANTI KEDUA INI
```

2. **Line 36** - Modifications copyright:
```markdown
Enhancements: © 2025 [Your Name]  ← GANTI INI
```

3. **Line 185** - Fork Copyright:
```markdown
Modifications: Copyright © 2025 [Your Name]  ← GANTI INI
```

4. **Line 228** - Contact:
```markdown
- **Project Lead**: [Your Name] - [your.email@example.com]  ← GANTI KEDUA INI
- **Repository**: [github.com/YOUR_USERNAME/zulu](https://github.com/YOUR_USERNAME/zulu)  ← GANTI INI
```

### Command untuk Edit:
```bash
nano CREDITS_ZULU.md
# atau
code CREDITS_ZULU.md
```

Gunakan Find & Replace:
- `[Your Name]` → Nama Anda
- `@your_github` → @username_anda
- `your.email@example.com` → email Anda
- `YOUR_USERNAME` → username GitHub

---

## 📁 File 4: CONTRIBUTING.md

**Lokasi**: Root directory (`/root/zola/CONTRIBUTING.md`)

### 3 Tempat yang Perlu Diganti:

1. **Line 23** - Fork command:
```bash
git clone https://github.com/YOUR_USERNAME/zulu.git  ← GANTI INI
```

2. **Line 247** - Push command:
```bash
git push origin feature/your-feature-name
```
(Ini hanya contoh, tidak perlu diganti)

3. **Line 322** - Security email:
```
Email: security@yourdomain.com  ← GANTI INI (opsional)
```

### Command untuk Edit:
```bash
nano CONTRIBUTING.md
# atau
code CONTRIBUTING.md
```

---

## 🚀 Quick Replace Script

Saya akan buat script untuk replace otomatis. Anda tinggal edit variabel di atas:

```bash
#!/bin/bash

# EDIT VARIABEL INI DULU:
YOUR_NAME="Yat Hidayat"           # ← Ganti dengan nama Anda
YOUR_GITHUB="mnhidayatgani"        # ← Ganti dengan username GitHub
YOUR_EMAIL="yat@example.com"       # ← Ganti dengan email Anda

# Jangan edit di bawah ini
echo "Replacing placeholders..."

# Replace in package.json
sed -i "s/Your Name/$YOUR_NAME/g" package.json
sed -i "s/your.email@example.com/$YOUR_EMAIL/g" package.json
sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" package.json

# Replace in README_ZULU.md
sed -i "s/\[Your Name\]/$YOUR_NAME/g" README_ZULU.md
sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" README_ZULU.md

# Replace in CREDITS_ZULU.md
sed -i "s/\[Your Name\]/$YOUR_NAME/g" CREDITS_ZULU.md
sed -i "s/@your_github/@$YOUR_GITHUB/g" CREDITS_ZULU.md
sed -i "s/your.email@example.com/$YOUR_EMAIL/g" CREDITS_ZULU.md
sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" CREDITS_ZULU.md

# Replace in CONTRIBUTING.md
sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" CONTRIBUTING.md

echo "Done! Please review the changes."
```

---

## 📝 Template Informasi

Copy dan isi ini:

```
NAMA LENGKAP:
[Isi di sini]

USERNAME GITHUB:
[Isi di sini, contoh: mnhidayatgani]

EMAIL:
[Isi di sini, contoh: your@email.com]

URL REPOSITORY (opsional):
[Isi di sini, contoh: https://github.com/yourusername/zulu]
```

---

## ✅ Checklist Setelah Edit

Setelah edit semua file, jalankan command ini untuk verify:

```bash
# Cek apakah masih ada placeholder
grep -r "\[Your Name\]" README_ZULU.md CREDITS_ZULU.md
grep -r "YOUR_USERNAME" README_ZULU.md CREDITS_ZULU.md CONTRIBUTING.md
grep -r "your.email@example.com" package.json CREDITS_ZULU.md

# Jika tidak ada output, berarti sudah bersih!
```

---

## 🎯 Prioritas Edit

**WAJIB (High Priority):**
1. ✅ package.json - Author info
2. ✅ README_ZULU.md - All placeholders
3. ✅ CREDITS_ZULU.md - All placeholders

**OPSIONAL (Low Priority):**
4. ⭕ CONTRIBUTING.md - Repository URLs
5. ⭕ Other documentation files

---

## 💡 Tips

1. **Gunakan editor dengan Find & Replace**:
   - VS Code: Ctrl+H (Windows/Linux) atau Cmd+H (Mac)
   - Nano: Ctrl+W lalu Ctrl+R
   - Vim: `:%s/old/new/g`

2. **Edit satu file sekaligus**:
   Lebih aman daripada mass replace

3. **Backup dulu**:
   ```bash
   cp README_ZULU.md README_ZULU.md.backup
   ```

4. **Review sebelum finalize**:
   Baca ulang file yang sudah di-edit

---

## 🔧 Quick Edit Commands

### Menggunakan sed (otomatis):
```bash
# Set variables
export MY_NAME="Yat Hidayat"
export MY_GITHUB="mnhidayatgani"
export MY_EMAIL="yat@example.com"

# Replace in all files at once
find . -name "*.md" -o -name "package.json" | xargs sed -i "s/\[Your Name\]/$MY_NAME/g"
find . -name "*.md" -o -name "package.json" | xargs sed -i "s/YOUR_USERNAME/$MY_GITHUB/g"
find . -name "*.md" -o -name "package.json" | xargs sed -i "s/your.email@example.com/$MY_EMAIL/g"
```

### Menggunakan editor interaktif:
```bash
# Edit satu per satu
nano package.json        # Edit author section
nano README_ZULU.md      # Find & Replace
nano CREDITS_ZULU.md     # Find & Replace
nano CONTRIBUTING.md     # Edit URLs
```

---

**Setelah semua di-edit, jalankan finalization script untuk activate files!**

```bash
./finalize-rebrand.sh
```
