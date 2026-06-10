# FATE Setup Guide

## 1. Create a Supabase project

1. Go to supabase.com and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API

## 2. Add environment variables

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Run the database schema

In your Supabase dashboard, go to **SQL Editor** and run the contents of `supabase/schema.sql`.

This creates:
- `profiles` — user accounts with 1,000 starting credits
- `markets` — prediction markets
- `bets` — individual bets on markets
- `place_bet()` — atomic RPC to deduct credits and record bets
- Row-level security policies
- Auto-create profile trigger on signup

## 4. Configure Auth

In Supabase dashboard → Authentication → Settings:
- Set **Site URL** to `http://localhost:3000`
- Add `http://localhost:3000/auth/callback` to **Redirect URLs**

## 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000
