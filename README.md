# BabyBook

A beautiful digital baby book — a single-page book reader with chronological content, page-flip animations, and family sharing.

## Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations in order:
   - `apps/web/supabase/migrations/001_initial_schema.sql`
   - `apps/web/supabase/migrations/002_rls_policies.sql`
   - `apps/web/supabase/migrations/003_storage.sql`
3. Enable **Email Auth** in Authentication → Providers

### 2. Environment Variables

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Fill in your Supabase project values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → sign up → onboarding → your book.

## Deploy to Vercel

1. Import the repo in Vercel
2. Set **Root Directory** to `apps/web`
3. Add all env vars from `.env.local`
4. Deploy

## Architecture

```
/book/[pageId]     ← main book reader (server component)
/book/manage       ← drag-to-reorder all pages (owner only)
/onboarding        ← first-run setup
/settings          ← themes + invite family members
```

## Page Types

| Type | Description |
|---|---|
| Cover | Book cover with photo or gradient |
| Birth Story | Stats + story of arrival |
| Milestone | Achievement with ribbon + confetti |
| Photo Spread | Single / grid / polaroid layouts |
| Journal | Ruled paper + Tiptap rich text + mood |
| Letter | Parchment + wax seal time lock |
| Monthly Summary | Growth stats + monthly highlights |

## Themes

Cotton Candy · Jungle · Ocean · Autumn Leaves · Night Sky

All theme colors are CSS custom properties — switching is instant with no flash.
