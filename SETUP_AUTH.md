# Panduan Aktivasi Google OAuth dan Email Login

## ✅ Yang Sudah Dikonfigurasi

Aplikasi Anda sudah memiliki:
- ✅ Login dengan Google OAuth
- ✅ Login dengan Email/Password
- ✅ Sign Up dengan Email
- ✅ Reset Password
- ✅ Halaman login dengan tab interface
- ✅ Konfigurasi Supabase aktif

## 🔧 Langkah Setup Google OAuth di Supabase

### 1. Buat Google OAuth Credentials

1. **Buka Google Cloud Console:**
   - Kunjungi: https://console.cloud.google.com/
   - Login dengan akun Google Anda

2. **Buat Project Baru (jika belum ada):**
   - Klik dropdown project di bagian atas
   - Klik "New Project"
   - Beri nama project (contoh: "Zola Auth")
   - Klik "Create"

3. **Aktifkan Google+ API:**
   - Di sidebar, pilih "APIs & Services" > "Library"
   - Cari "Google+ API"
   - Klik dan aktifkan

4. **Buat OAuth Consent Screen:**
   - Di sidebar, pilih "APIs & Services" > "OAuth consent screen"
   - Pilih "External" (untuk testing)
   - Isi informasi yang diperlukan:
     - App name: Zola
     - User support email: email Anda
     - Developer contact: email Anda
   - Klik "Save and Continue"
   - Skip Scopes (klik "Save and Continue")
   - Tambahkan Test Users jika diperlukan
   - Klik "Save and Continue"

5. **Buat OAuth 2.0 Credentials:**
   - Di sidebar, pilih "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Zola Web Client"
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://bxlwowlthbyyhcvdjcwz.supabase.co
     https://your-domain.com  (ganti dengan domain production Anda)
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/auth/callback
     https://bxlwowlthbyyhcvdjcwz.supabase.co/auth/v1/callback
     https://your-domain.com/auth/callback  (ganti dengan domain production Anda)
     ```
   - Klik "Create"
   - **SIMPAN** Client ID dan Client Secret yang muncul

### 2. Konfigurasi di Supabase Dashboard

1. **Buka Supabase Dashboard:**
   - Kunjungi: https://supabase.com/dashboard
   - Pilih project Anda: https://supabase.com/dashboard/project/bxlwowlthbyyhcvdjcwz

2. **Aktifkan Google Provider:**
   - Di sidebar, klik "Authentication" > "Providers"
   - Scroll ke "Google" dan klik
   - Toggle "Enable Sign in with Google" ke ON
   - Masukkan:
     - **Client ID**: (dari Google Cloud Console)
     - **Client Secret**: (dari Google Cloud Console)
   - Klik "Save"

### 3. Konfigurasi Email Authentication (Sudah Aktif Secara Default)

Di Supabase Dashboard:
1. Pergi ke "Authentication" > "Providers"
2. Klik "Email"
3. Pastikan "Enable Email provider" aktif
4. **Konfigurasi Email Settings:**
   - Confirm email: ON (untuk verifikasi email)
   - Secure email change: ON (untuk keamanan)
   - Save

### 4. Testing

#### Test Google OAuth:
1. Jalankan aplikasi: `npm run dev`
2. Buka: http://localhost:3000/auth
3. Klik tab "Quick Sign In"
4. Klik "Continue with Google"
5. Pilih akun Google Anda
6. Berhasil jika redirect ke homepage

#### Test Email Login:
1. Buka: http://localhost:3000/auth
2. Klik tab "Email" > "Sign Up"
3. Masukkan email dan password
4. Check email untuk verifikasi
5. Klik link verifikasi
6. Kembali ke /auth dan Sign In

#### Test Reset Password:
1. Di halaman Sign In, klik "Forgot password?"
2. Masukkan email
3. Check email untuk link reset
4. Klik link dan set password baru

## 🔐 Security Checklist

- ✅ CSRF_SECRET sudah dikonfigurasi
- ✅ Supabase keys sudah dikonfigurasi
- ⚠️ Pastikan .env.local tidak di-commit ke Git
- ⚠️ Gunakan environment variables untuk production
- ⚠️ Enable 2FA di akun Supabase Anda
- ⚠️ Batasi Test Users di Google OAuth Consent Screen untuk production

## 📝 Environment Variables

File `.env.local` Anda sudah memiliki:
```bash
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://bxlwowlthbyyhcvdjcwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE=eyJhbGci...

# CSRF Protection (Required)
CSRF_SECRET=a2bf1deb848be4d9960206bc901f5c93fb2adba4e04395175a499e9fd6aa4ed0
```

## 🎨 Fitur yang Tersedia

### Halaman Auth (`/auth`)
- Tab "Quick Sign In": Google OAuth
- Tab "Email": 
  - Sub-tab "Sign In": Login dengan email/password
  - Sub-tab "Sign Up": Registrasi dengan email/password
- Link "Forgot password?": Menuju halaman reset password

### Halaman Reset Password (`/auth/reset-password`)
- Form untuk request reset password
- Email akan dikirim dengan link reset
- Redirect ke callback setelah reset

### API Functions (di `/lib/api.ts`)
- `signInWithGoogle()`: OAuth login dengan Google
- `signInWithEmail()`: Login dengan email/password
- `signUpWithEmail()`: Registrasi dengan email/password
- `resetPassword()`: Request reset password

## 🐛 Troubleshooting

### Google OAuth tidak bekerja:
1. Check Console Browser untuk error
2. Pastikan redirect URI benar di Google Cloud Console
3. Pastikan Client ID dan Secret benar di Supabase
4. Clear browser cookies dan coba lagi

### Email tidak terkirim:
1. Check Supabase Dashboard > Authentication > Email Templates
2. Pastikan email provider aktif
3. Check spam folder
4. Untuk production, configure SMTP di Supabase

### Errors setelah login:
1. Check callback route di `/app/auth/callback/route.ts`
2. Pastikan database table `users` ada
3. Check Supabase logs di Dashboard

## 📚 Next Steps

1. **Customize Email Templates:**
   - Supabase Dashboard > Authentication > Email Templates
   - Edit templates untuk Confirmation, Reset Password, dll

2. **Add More Providers:**
   - GitHub: Sama seperti Google OAuth setup
   - Facebook, Twitter, dll: Ikuti dokumentasi Supabase

3. **Production Setup:**
   - Update redirect URIs dengan domain production
   - Configure custom SMTP untuk email
   - Enable rate limiting
   - Add reCAPTCHA untuk signup

## 🔗 Useful Links

- Supabase Dashboard: https://supabase.com/dashboard/project/bxlwowlthbyyhcvdjcwz
- Google Cloud Console: https://console.cloud.google.com/
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Next.js + Supabase: https://supabase.com/docs/guides/auth/server-side/nextjs
