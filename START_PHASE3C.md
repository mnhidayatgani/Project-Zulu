# Quick Start Prompt for Phase 3C: API & Data Layer

Gunakan prompt ini untuk melanjutkan ke Phase 3C:

---

## PROMPT UNTUK PHASE 3C:

```
Saya ingin melanjutkan refactoring ke Phase 3C: API & Data Layer.

Context:
- Working directory: /root/zola
- Branch: refactor/foundation (13 commits ahead)
- Phase 3A & 3B sudah selesai (constants, utilities, hooks, dan component refactoring)
- Semua builds passing, zero breaking changes

Phase 3C Goals dari PHASE3_PLAN.md:
1. Create centralized API client (lib/api/client.ts)
2. Create API resource modules (chat, user, models, projects)
3. Standardize error handling
4. Add proper TypeScript types
5. Replace direct fetch calls with API client

Tolong:
1. Baca PHASE3_PLAN.md untuk memahami Phase 3C objectives
2. Baca FINAL_SESSION_SUMMARY.md untuk context dari session sebelumnya
3. Mulai dengan Phase 3C.1: Create API Client
4. Lakukan refactoring secara incremental dengan commit yang clean
5. Maintain zero breaking changes dan 100% type safety

Mari mulai dengan membuat centralized API client!
```

---

## ALTERNATIF PROMPT (Lebih Detail):

```
Continue refactoring Phase 3C: API & Data Layer

Previous work completed:
- ✅ Phase 3A: Extracted constants, utilities, and custom hooks
- ✅ Phase 3B: Refactored Sidebar (726→9 files), History (241 lines eliminated), Multi-Model Selector (525→271 lines)
- 📊 13 commits ahead, all tests passing

Phase 3C Objectives (from PHASE3_PLAN.md):
1. Create centralized API client with error handling and type safety
2. Create resource modules: lib/api/resources/{chat, user, models, projects}.ts
3. Replace direct fetch() calls throughout codebase
4. Standardize error handling patterns
5. Add request/response interceptors
6. Implement retry logic

Current API patterns to consolidate:
- Find all fetch() calls in lib/ and app/ directories
- Identify common patterns for error handling
- Look at lib/api.ts for existing API code

Start by:
1. Review PHASE3_PLAN.md Phase 3C section
2. Analyze current API usage patterns (grep for fetch calls)
3. Create lib/api/client.ts with core functionality
4. Create initial resource module as example
5. Document the new API client pattern

Let's begin with Phase 3C.1: Create API Client
```

---

## ATAU PROMPT SINGKAT:

```
lanjut phase 3C
```

(Context sudah tersimpan di PHASE3_PLAN.md dan FINAL_SESSION_SUMMARY.md)

---

## File Reference untuk Phase 3C:

**Baca terlebih dahulu**:
1. `/root/zola/PHASE3_PLAN.md` - Sections: Phase 3C (lines ~185-220)
2. `/root/zola/FINAL_SESSION_SUMMARY.md` - Context session sebelumnya

**File yang akan dimodifikasi**:
- `lib/api.ts` (existing API code)
- Create: `lib/api/client.ts`
- Create: `lib/api/resources/*.ts`
- Create: `lib/api/types.ts`

**Pattern yang dicari**:
```bash
grep -r "fetch(" lib/ app/ --include="*.ts" --include="*.tsx"
```

---

## Quick Commands untuk Memulai:

```bash
cd /root/zola
git status
cat PHASE3_PLAN.md | grep -A 50 "Phase 3C"
grep -r "fetch(" lib/ --include="*.ts" | head -20
```

---

Pilih salah satu prompt di atas sesuai preferensi!
