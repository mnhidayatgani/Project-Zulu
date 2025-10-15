#!/bin/bash

# ============================================================================
# PERSONALIZATION SCRIPT - Project Zulu
# ============================================================================
# 
# Script ini akan mengganti semua placeholder dengan informasi Anda
# 
# INSTRUKSI:
# 1. Edit variabel di bawah dengan informasi Anda
# 2. Simpan file ini
# 3. Jalankan: chmod +x personalize.sh
# 4. Jalankan: ./personalize.sh
# 
# ============================================================================

# ============================================================================
# EDIT BAGIAN INI DENGAN INFORMASI ANDA
# ============================================================================

# Nama lengkap Anda
YOUR_NAME="Muhammad Nurhidayat Gani"

# Username GitHub Anda (tanpa @)
YOUR_GITHUB="mnhidayatgani"

# Email Anda
YOUR_EMAIL="support@aistorytell.me"

# ============================================================================
# JANGAN EDIT DI BAWAH INI
# ============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Project Zulu - Personalization Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Verify information
echo -e "${YELLOW}Informasi yang akan digunakan:${NC}"
echo -e "  Nama      : ${GREEN}$YOUR_NAME${NC}"
echo -e "  GitHub    : ${GREEN}$YOUR_GITHUB${NC}"
echo -e "  Email     : ${GREEN}$YOUR_EMAIL${NC}"
echo ""

read -p "Apakah informasi ini sudah benar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Dibatalkan. Silakan edit variabel di atas script ini.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[1/5]${NC} Backup files..."

# Create backup directory
mkdir -p .backups
timestamp=$(date +%Y%m%d_%H%M%S)

# Backup files
cp package.json .backups/package.json.$timestamp
cp README_ZULU.md .backups/README_ZULU.md.$timestamp
cp CREDITS_ZULU.md .backups/CREDITS_ZULU.md.$timestamp
cp CONTRIBUTING.md .backups/CONTRIBUTING.md.$timestamp

echo -e "${GREEN}  ✓ Backup created in .backups/${NC}"

echo ""
echo -e "${GREEN}[2/5]${NC} Replacing in package.json..."

sed -i "s/\"Your Name\"/\"$YOUR_NAME\"/g" package.json
sed -i "s/your\.email@example\.com/$YOUR_EMAIL/g" package.json
sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" package.json

echo -e "${GREEN}  ✓ package.json updated${NC}"

echo ""
echo -e "${GREEN}[3/5]${NC} Replacing in README_ZULU.md..."

sed -i "s/\[Your Name\]/$YOUR_NAME/g" README_ZULU.md
sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" README_ZULU.md

echo -e "${GREEN}  ✓ README_ZULU.md updated${NC}"

echo ""
echo -e "${GREEN}[4/5]${NC} Replacing in CREDITS_ZULU.md..."

sed -i "s/\[Your Name\]/$YOUR_NAME/g" CREDITS_ZULU.md
sed -i "s/@your_github/@$YOUR_GITHUB/g" CREDITS_ZULU.md
sed -i "s/your\.email@example\.com/$YOUR_EMAIL/g" CREDITS_ZULU.md
sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" CREDITS_ZULU.md

echo -e "${GREEN}  ✓ CREDITS_ZULU.md updated${NC}"

echo ""
echo -e "${GREEN}[5/5]${NC} Replacing in CONTRIBUTING.md..."

sed -i "s/YOUR_USERNAME/$YOUR_GITHUB/g" CONTRIBUTING.md

echo -e "${GREEN}  ✓ CONTRIBUTING.md updated${NC}"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Personalization Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Verify
echo -e "${YELLOW}Verifying changes...${NC}"

remaining_placeholders=$(grep -r "\[Your Name\]" README_ZULU.md CREDITS_ZULU.md 2>/dev/null | wc -l)
remaining_username=$(grep -r "YOUR_USERNAME" README_ZULU.md CREDITS_ZULU.md CONTRIBUTING.md 2>/dev/null | wc -l)
remaining_email=$(grep -r "your\.email@example\.com" package.json CREDITS_ZULU.md 2>/dev/null | wc -l)

if [ $remaining_placeholders -eq 0 ] && [ $remaining_username -eq 0 ] && [ $remaining_email -eq 0 ]; then
    echo -e "${GREEN}  ✓ All placeholders replaced successfully!${NC}"
else
    echo -e "${YELLOW}  ⚠ Some placeholders may still exist:${NC}"
    echo -e "    [Your Name]: $remaining_placeholders"
    echo -e "    YOUR_USERNAME: $remaining_username"
    echo -e "    Email: $remaining_email"
    echo -e "${YELLOW}  Please check manually.${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Review the changes:"
echo -e "     ${YELLOW}cat package.json | grep -A 5 author${NC}"
echo -e "     ${YELLOW}head -50 README_ZULU.md${NC}"
echo ""
echo -e "  2. If everything looks good, run finalization:"
echo -e "     ${YELLOW}./finalize-rebrand.sh${NC}"
echo ""
echo -e "  3. Or manually copy files:"
echo -e "     ${YELLOW}cp README_ZULU.md README.md${NC}"
echo -e "     ${YELLOW}cp CREDITS_ZULU.md CREDITS.md${NC}"
echo ""
echo -e "${GREEN}Backup files saved in: .backups/${NC}"
echo ""
