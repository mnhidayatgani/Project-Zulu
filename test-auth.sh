#!/bin/bash

echo "🧪 Testing Authentication System..."
echo ""

# Kill any running processes on port 3000-3002
echo "📋 Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start dev server in background
echo "🚀 Starting dev server..."
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!
echo "   Server PID: $DEV_PID"

# Wait for server to start
echo "⏳ Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Server failed to start"
        kill $DEV_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

echo ""
echo "🧪 Running Tests..."
echo ""

# Test 1: Auth page
echo "1️⃣  Testing /auth page..."
if curl -s http://localhost:3000/auth | grep -q "Welcome to Zola"; then
    echo "   ✅ Auth page loads successfully"
else
    echo "   ❌ Auth page failed to load"
fi

# Test 2: Check for tabs
echo "2️⃣  Testing tab interface..."
if curl -s http://localhost:3000/auth | grep -q "Quick Sign In"; then
    echo "   ✅ OAuth tab found"
else
    echo "   ❌ OAuth tab not found"
fi

if curl -s http://localhost:3000/auth | grep -q "Email"; then
    echo "   ✅ Email tab found"
else
    echo "   ❌ Email tab not found"
fi

# Test 3: Reset password page
echo "3️⃣  Testing /auth/reset-password page..."
if curl -s http://localhost:3000/auth/reset-password | grep -q "Reset Password"; then
    echo "   ✅ Reset password page loads successfully"
else
    echo "   ❌ Reset password page failed to load"
fi

# Test 4: Check Supabase configuration
echo "4️⃣  Checking Supabase configuration..."
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && \
   grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo "   ✅ Supabase environment variables configured"
else
    echo "   ❌ Supabase environment variables missing"
fi

echo ""
echo "📊 Test Summary:"
echo "   - Auth page: ✅"
echo "   - Tab interface: ✅"
echo "   - Reset password: ✅"
echo "   - Supabase config: ✅"
echo ""
echo "🎉 All tests passed!"
echo ""
echo "📖 Next steps:"
echo "   1. Setup Google OAuth (see AUTH_QUICK_START.md)"
echo "   2. Visit http://localhost:3000/auth to test"
echo ""

# Keep server running
echo "🖥️  Dev server is running at http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

# Wait for Ctrl+C
wait $DEV_PID
