# 🀄 Lucky Cat Mahjong — Your Mahjong Companion

Phase 1 (foundation): Next.js 14 + TypeScript + Tailwind, Supabase auth (email + Google), full database schema with RLS, branded Home dashboard, bottom navigation.

## Run locally
1. `npm install`
2. Create a Supabase project. In **SQL Editor**, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key (Project Settings → API).
4. Auth → URL Configuration: add `http://localhost:3000/auth/callback` to Redirect URLs.
5. For Google login: Auth → Providers → Google, add your Google OAuth client ID and secret.
6. `npm run dev` → http://localhost:3000

## Deploy to Vercel
Push to GitHub, import the repo in Vercel, add the two env vars, deploy. Then add `https://YOUR-APP.vercel.app/auth/callback` to Supabase Redirect URLs.

## Structure
`app/` routes · `components/` UI · `lib/supabase/` clients · `lib/scoring/` (Phase 4) · `lib/game-engine/` (Phase 2) · `supabase/schema.sql`

Brand colors live in `tailwind.config.ts` (base, card, line, cream, muted).
