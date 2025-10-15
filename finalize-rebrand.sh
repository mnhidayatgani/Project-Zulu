#!/bin/bash

# Project Zulu - Finalization Script
# This script helps finalize the rebranding from Zola to Zulu

set -e  # Exit on error

echo "=========================================="
echo "Project Zulu - Finalization Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

echo "This script will help you finalize the Project Zulu rebranding."
echo ""
echo "It will:"
echo "  1. Backup original files"
echo "  2. Activate new README and CREDITS"
echo "  3. Verify changes"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warn "Aborted by user"
    exit 0
fi

echo ""
print_info "Step 1: Backing up original files..."

# Backup README if not already backed up
if [ -f "README.md" ] && [ ! -f "README.original.backup.md" ]; then
    cp README.md README.original.backup.md
    print_info "  ✓ README.md backed up to README.original.backup.md"
else
    print_warn "  - README.md already backed up or doesn't exist"
fi

# Backup CREDITS if not already backed up
if [ -f "CREDITS.md" ] && [ ! -f "CREDITS.original.backup.md" ]; then
    cp CREDITS.md CREDITS.original.backup.md
    print_info "  ✓ CREDITS.md backed up to CREDITS.original.backup.md"
else
    print_warn "  - CREDITS.md already backed up or doesn't exist"
fi

echo ""
print_info "Step 2: Activating new files..."

# Activate new README
if [ -f "README_ZULU.md" ]; then
    cp README_ZULU.md README.md
    print_info "  ✓ README_ZULU.md → README.md"
else
    print_error "  ✗ README_ZULU.md not found!"
    exit 1
fi

# Activate new CREDITS
if [ -f "CREDITS_ZULU.md" ]; then
    cp CREDITS_ZULU.md CREDITS.md
    print_info "  ✓ CREDITS_ZULU.md → CREDITS.md"
else
    print_error "  ✗ CREDITS_ZULU.md not found!"
    exit 1
fi

echo ""
print_info "Step 3: Verifying changes..."

# Check package.json
if grep -q '"name": "zulu"' package.json; then
    print_info "  ✓ package.json updated"
else
    print_warn "  - package.json may need manual update"
fi

# Check app constants
if grep -q "NAME: 'Zulu'" lib/constants/app.ts 2>/dev/null; then
    print_info "  ✓ app constants updated"
else
    print_warn "  - app constants may need manual update"
fi

echo ""
print_info "=========================================="
print_info "Finalization Complete!"
print_info "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Personalize your information:"
echo "   - Edit README.md and replace:"
echo "     • [Your Name]"
echo "     • YOUR_USERNAME"
echo "     • your.email@example.com"
echo ""
echo "   - Edit CREDITS.md with same replacements"
echo "   - Edit CONTRIBUTING.md with same replacements"
echo "   - Edit package.json author section"
echo ""
echo "2. Review changes:"
echo "   git diff README.md"
echo "   git diff CREDITS.md"
echo ""
echo "3. Clean build:"
echo "   npm install"
echo "   npm run type-check"
echo "   npm run build"
echo ""
echo "4. Test:"
echo "   npm run dev"
echo ""
echo "See REBRANDING_GUIDE.md for detailed instructions."
echo ""
print_info "Original files backed up as *.backup.md"
echo ""
