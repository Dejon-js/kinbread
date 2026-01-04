# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kinbread is a capacity management app for cottage bakers. Bakers create capacity windows (dates with slot counts) and share a public booking link. Customers can book available slots, and the system automatically prevents overbooking.

- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Supabase (auth + PostgreSQL), Tailwind CSS 4, shadcn/ui
- **Testing**: Vitest with React Testing Library

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Coverage report
```

## Architecture

### Route Groups (App Router)

- `(auth)/` - Login, signup, auth callback (unauthenticated users only)
- `(dashboard)/` - Protected baker dashboard (windows, submissions, settings)
- `(public)/[slug]/` - Public baker pages for customers to view availability and book
- `onboarding/` - First-time baker profile setup

### Key Directories

- `src/app/actions/` - Server actions for auth, baker, capacity-windows, submissions
- `src/lib/queries/` - Data fetching functions (server-side)
- `src/lib/validations/` - Zod schemas for all forms
- `src/lib/supabase/` - Supabase client setup (server.ts, client.ts, middleware.ts)
- `src/lib/utils/dates.ts` - Timezone-aware date formatting
- `src/components/ui/` - shadcn/ui components
- `src/types/` - TypeScript interfaces (database.ts, views.ts, forms.ts, actions.ts)

### Database Schema

Three tables with RLS policies:
- `bakers` - User profiles with business name and public slug
- `capacity_windows` - Available dates with total_slots count
- `submissions` - Customer bookings (each consumes 1 slot)

Key database functions:
- `get_available_slots(window_id)` - Returns remaining slots
- `create_submission_if_available()` - Atomic booking with capacity check

### Type Patterns

All server actions return `ActionResult<T>`:
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

### Middleware

`middleware.ts` handles route protection:
- `/dashboard/*` requires authenticated baker
- `/onboarding` requires authenticated user without baker profile
- Public routes: `/`, `/auth/*`, `/[slug]/*`

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Design Decisions

- Single slot per submission (hardcoded `slots_consumed = 1`)
- Dates stored as ISO strings (YYYY-MM-DD), timezone handled in display
- Bakers set their timezone; all dates displayed in baker's timezone
- `create_submission_if_available()` uses database locks for race condition safety
