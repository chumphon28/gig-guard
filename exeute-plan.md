# PRP: GigGuard — P2P Escrow MVP

## Goal

Build a production-ready 1-day hackathon MVP of **GigGuard** — a P2P escrow trust layer for direct transactions between two users (seller ↔ buyer). NOT a marketplace. The system records payment status and locks workflow until both parties fulfill conditions. All actual money transfer happens off-system.

**Demo loop (judge must see this end-to-end):**
Seller creates deal → shares link → Buyer joins → marks deposit sent → Seller confirms → Seller ships → Buyer confirms receipt → completed → Buyer reviews Seller

---

## Tech Stack & Versions

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 14.x |
| Language | TypeScript | 5.x |
| Database | Supabase (PostgreSQL + Auth) | latest |
| Supabase client | @supabase/ssr | latest |
| Styling | Tailwind CSS | 3.x |
| Font | Manrope via Google Fonts | 400,600,700,800 |
| Icons | Material Symbols Outlined via Google Fonts | variable |
| Runtime | Node.js | 18+ |

---

## Database Connection (from requirements/db.md)

```
Project host: db.qhiipwjmozgijhwjtfxd.supabase.co
Supabase URL: https://qhiipwjmozgijhwjtfxd.supabase.co
DB user: gig-guard
DB password: EE86D4jsmwSQGEyv
Direct connection: postgresql://postgres:EE86D4jsmwSQGEyv@db.qhiipwjmozgijhwjtfxd.supabase.co:5432/postgres
```

**Get ANON KEY and SERVICE_ROLE_KEY** from: Supabase Dashboard → Project Settings → API

**.env.local required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://qhiipwjmozgijhwjtfxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from dashboard>
```

---

## External Documentation

- **Supabase + Next.js 14 (App Router) official guide**: https://supabase.com/docs/guides/auth/server-side/nextjs
- **@supabase/ssr package docs**: https://supabase.com/docs/guides/auth/server-side-rendering
- **Next.js 14 App Router**: https://nextjs.org/docs/app
- **Next.js Route Handlers**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Supabase RLS**: https://supabase.com/docs/guides/database/postgres/row-level-security
- **Tailwind CSS v3**: https://tailwindcss.com/docs/configuration

---

## Critical Gotchas

1. **MUST use `@supabase/ssr`** — NOT `@supabase/auth-helpers-nextjs` (deprecated). The new package uses `createServerClient` / `createBrowserClient`.
2. **Cookie handling in Next.js 14**: `cookies()` from `next/headers` is async in Next.js 15 but sync in 14. Use `const cookieStore = cookies()` directly.
3. **Middleware MUST return supabaseResponse** — not `NextResponse.next()` — so cookies are properly forwarded.
4. **Server Components cannot set cookies** — call `supabase.auth.getUser()` not `getSession()` in Server Components (getUser validates with server).
5. **RLS `UPDATE` needs separate policies for seller and buyer** — a single policy `using (seller_id = uid() OR buyer_id = uid())` does NOT work reliably. Create two `UPDATE` policies.
6. **`buyer_id` is NULL until buyer joins** — initial INSERT has `buyer_id = null`. RLS `buyer_id = auth.uid()` will not match null correctly in some Postgres versions — use `buyer_id IS NOT NULL AND buyer_id = auth.uid()`.
7. **Tailwind custom spacing/fontSize** — use `extend` inside `theme`, NOT replace `theme`. The template HTML uses classes like `px-gutter`, `py-stack-lg`, `font-headline-md`, `text-headline-md` — all must be in config.
8. **Material Symbols Outlined** — requires `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24` CSS or icons won't render. Add global CSS.
9. **Enum types in Supabase** — if re-running migrations, drop enum types first with `DROP TYPE IF EXISTS deal_status CASCADE`.
10. **`deals` public read for shareable link** — the `/deals/:id/join` page must be accessible without auth. Set RLS to allow `SELECT` for all (including anon).

---

## File Structure

```
gig-guard/
├── .env.local
├── middleware.ts                        # Supabase session refresh
├── tailwind.config.ts                   # Custom design tokens
├── next.config.ts
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout: fonts, body class
│   │   ├── page.tsx                     # Redirect → /dashboard
│   │   ├── globals.css                  # Material Symbols CSS + glass-panel
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # My Deals (seller + buyer)
│   │   ├── deals/
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Create Deal form
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # Deal Detail (public-readable)
│   │   │       └── join/
│   │   │           └── page.tsx         # Buyer join page
│   │   ├── profile/
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Seller profile + reviews
│   │   ├── admin/
│   │   │   └── disputes/
│   │   │       └── page.tsx             # Admin dispute center
│   │   └── api/
│   │       ├── auth/
│   │       │   └── callback/
│   │       │       └── route.ts         # Supabase OAuth callback
│   │       └── deals/
│   │           ├── route.ts             # GET list, POST create
│   │           └── [id]/
│   │               ├── route.ts         # GET single deal
│   │               ├── join/route.ts    # POST buyer joins
│   │               ├── transition/      
│   │               │   └── route.ts     # POST status transitions
│   │               ├── dispute/
│   │               │   └── route.ts     # POST open dispute
│   │               ├── review/
│   │               │   └── route.ts     # POST submit review
│   │               └── verdict/
│   │                   └── route.ts     # POST admin verdict
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── DealCard.tsx
│   │   ├── StatusPill.tsx
│   │   ├── EscrowStepper.tsx
│   │   ├── VerifiedBadge.tsx
│   │   └── ReviewStars.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                # createServerClient
│   │   │   └── client.ts                # createBrowserClient
│   │   ├── deal-utils.ts                # amount computation, status logic
│   │   └── types.ts                     # TypeScript types
│   └── hooks/
│       └── useUser.ts                   # client-side auth hook
```

---

## Database Schema (Run in Supabase SQL Editor)

```sql
-- ============================================================
-- STEP 1: Custom Types
-- ============================================================
DO $$ BEGIN
  CREATE TYPE deal_status AS ENUM (
    'created',
    'awaiting_deposit',
    'pending_confirmation',
    'confirmed',
    'shipped',
    'completed',
    'disputed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'unpaid',
    'deposit_paid',
    'fully_paid'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- STEP 2: Tables
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  completed_deals_as_seller integer NOT NULL DEFAULT 0,
  avg_rating_as_seller numeric(3,2) NOT NULL DEFAULT 0.00,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id),
  buyer_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  total_amount numeric(12,2) NOT NULL,
  deposit_percent integer NOT NULL DEFAULT 30,
  deposit_amount numeric(12,2) NOT NULL,
  remaining_amount numeric(12,2) NOT NULL,
  fee_amount numeric(12,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  status deal_status NOT NULL DEFAULT 'created',
  seller_bank_name text NOT NULL,
  seller_account_number text NOT NULL,
  seller_account_name text NOT NULL,
  tracking_info text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL UNIQUE REFERENCES deals(id),
  reason text NOT NULL,
  evidence_url text,
  verdict text CHECK (verdict IN ('refund_buyer', 'release_seller')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL UNIQUE REFERENCES deals(id),
  reviewer_id uuid NOT NULL REFERENCES profiles(id),
  reviewee_id uuid NOT NULL REFERENCES profiles(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STEP 3: Functions & Triggers
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS deals_updated_at ON deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update seller completed count when deal completes
CREATE OR REPLACE FUNCTION update_seller_stats()
RETURNS trigger AS $$
BEGIN
  IF new.status = 'completed' AND old.status != 'completed' THEN
    UPDATE profiles
    SET completed_deals_as_seller = completed_deals_as_seller + 1
    WHERE id = new.seller_id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_deal_completed ON deals;
CREATE TRIGGER on_deal_completed
  AFTER UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_seller_stats();

-- Update seller avg rating when review added
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET avg_rating_as_seller = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE reviewee_id = new.reviewee_id
  )
  WHERE id = new.reviewee_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_seller_rating();

-- ============================================================
-- STEP 4: Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: self update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles: self insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- Anyone (including anon) can read deals — needed for /deals/:id/join shareable link
CREATE POLICY "deals: public read" ON deals FOR SELECT USING (true);
CREATE POLICY "deals: seller insert" ON deals FOR INSERT WITH CHECK (auth.uid() = seller_id);
-- Two separate UPDATE policies (combined OR doesn't work reliably)
CREATE POLICY "deals: seller update" ON deals FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "deals: buyer update" ON deals FOR UPDATE
  USING (buyer_id IS NOT NULL AND auth.uid() = buyer_id);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disputes: party read" ON disputes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_id
    AND (d.seller_id = auth.uid() OR (d.buyer_id IS NOT NULL AND d.buyer_id = auth.uid()))
  )
);
CREATE POLICY "disputes: buyer insert" ON disputes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_id
    AND d.buyer_id IS NOT NULL
    AND d.buyer_id = auth.uid()
    AND d.status = 'shipped'
  )
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews: public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews: buyer insert" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_id
    AND d.buyer_id IS NOT NULL
    AND d.buyer_id = auth.uid()
    AND d.status = 'completed'
  )
);
```

---

## Tailwind Config (tailwind.config.ts — complete, copy verbatim)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        "surface": "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#45464d",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        "outline": "#76777d",
        "outline-variant": "#c6c6cd",
        "surface-tint": "#565e74",
        "primary": "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#131b2e",
        "on-primary-container": "#7c839b",
        "inverse-primary": "#bec6e0",
        "secondary": "#006c49",
        "on-secondary": "#ffffff",
        "secondary-container": "#6cf8bb",
        "on-secondary-container": "#00714d",
        "tertiary": "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#001a42",
        "on-tertiary-container": "#3980f4",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "background": "#f8f9ff",
        "on-background": "#0b1c30",
        "surface-variant": "#d3e4fe",
        "primary-fixed": "#dae2fd",
        "primary-fixed-dim": "#bec6e0",
        "on-primary-fixed": "#131b2e",
        "on-primary-fixed-variant": "#3f465c",
        "secondary-fixed": "#6ffbbe",
        "secondary-fixed-dim": "#4edea3",
        "on-secondary-fixed": "#002113",
        "on-secondary-fixed-variant": "#005236",
        "tertiary-fixed": "#d8e2ff",
        "tertiary-fixed-dim": "#adc6ff",
        "on-tertiary-fixed": "#001a42",
        "on-tertiary-fixed-variant": "#004395",
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px",
      },
      spacing: {
        "base": "8px",
        "stack-sm": "12px",
        "stack-md": "24px",
        "stack-lg": "48px",
        "gutter": "24px",
        "margin": "32px",
        "container-max": "1280px",
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'headline-sm': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-md': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
export default config
```

---

## globals.css (add to src/app/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Material Symbols Outlined default variation */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Glassmorphism panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

---

## Root Layout (src/app/layout.tsx)

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GigGuard DAO',
  description: 'The Trust Layer for Peer-to-Peer Transactions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-sans text-on-background min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

---

## Supabase Client Setup

### src/lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// For admin operations (bypasses RLS)
export function createAdminClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### src/lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### middleware.ts (project root)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/deals/new', '/profile', '/admin']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## TypeScript Types (src/lib/types.ts)

```typescript
export type DealStatus =
  | 'created'
  | 'awaiting_deposit'
  | 'pending_confirmation'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'disputed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'fully_paid'

export interface Profile {
  id: string
  name: string
  completed_deals_as_seller: number
  avg_rating_as_seller: number
  is_admin: boolean
  created_at: string
}

export interface Deal {
  id: string
  seller_id: string
  buyer_id: string | null
  title: string
  description: string | null
  total_amount: number
  deposit_percent: number
  deposit_amount: number
  remaining_amount: number
  fee_amount: number
  payment_status: PaymentStatus
  status: DealStatus
  seller_bank_name: string
  seller_account_number: string
  seller_account_name: string
  tracking_info: string | null
  created_at: string
  updated_at: string
  // joined
  seller?: Profile
  buyer?: Profile
  dispute?: Dispute
  review?: Review
}

export interface Dispute {
  id: string
  deal_id: string
  reason: string
  evidence_url: string | null
  verdict: 'refund_buyer' | 'release_seller' | null
  created_at: string
  resolved_at: string | null
}

export interface Review {
  id: string
  deal_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: Profile
}
```

---

## Business Logic (src/lib/deal-utils.ts)

```typescript
import type { DealStatus } from './types'

// State machine — key = current status, value = allowed transitions by role
export const ALLOWED_TRANSITIONS: Record<
  DealStatus,
  { to: DealStatus; role: 'buyer' | 'seller' | 'admin'; paymentStatus?: string }[]
> = {
  created: [{ to: 'awaiting_deposit', role: 'buyer' }],
  awaiting_deposit: [{ to: 'pending_confirmation', role: 'buyer', paymentStatus: 'deposit_paid' }],
  pending_confirmation: [
    { to: 'confirmed', role: 'seller' },
    { to: 'cancelled', role: 'seller' },
  ],
  confirmed: [{ to: 'shipped', role: 'seller' }],
  shipped: [
    { to: 'completed', role: 'buyer', paymentStatus: 'fully_paid' },
    { to: 'disputed', role: 'buyer' },
  ],
  disputed: [
    { to: 'completed', role: 'admin', paymentStatus: 'fully_paid' },
    { to: 'cancelled', role: 'admin' },
  ],
  completed: [],
  cancelled: [],
}

export function getUserRole(
  deal: { seller_id: string; buyer_id: string | null },
  userId: string,
  isAdmin: boolean
): 'seller' | 'buyer' | 'admin' | 'guest' {
  if (isAdmin) return 'admin'
  if (deal.seller_id === userId) return 'seller'
  if (deal.buyer_id === userId) return 'buyer'
  return 'guest'
}

export function canTransition(
  currentStatus: DealStatus,
  targetStatus: DealStatus,
  role: 'buyer' | 'seller' | 'admin' | 'guest'
): boolean {
  if (role === 'guest') return false
  return ALLOWED_TRANSITIONS[currentStatus].some(
    t => t.to === targetStatus && t.role === role
  )
}

export function computeAmounts(totalAmount: number, depositPercent: number = 30) {
  const depositAmount = Math.round(totalAmount * depositPercent) / 100
  const remainingAmount = Math.round((totalAmount - depositAmount) * 100) / 100
  const feeAmount = Math.round(totalAmount * 1) / 100
  return { depositAmount, remainingAmount, feeAmount }
}

export function isVerified(profile: { completed_deals_as_seller: number; avg_rating_as_seller: number }) {
  return profile.completed_deals_as_seller >= 10 && profile.avg_rating_as_seller >= 4.0
}

export const STATUS_LABELS: Record<DealStatus, string> = {
  created: 'รอ Buyer',
  awaiting_deposit: 'รอมัดจำ',
  pending_confirmation: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  shipped: 'จัดส่งแล้ว',
  completed: 'เสร็จสิ้น',
  disputed: 'มีข้อพิพาท',
  cancelled: 'ยกเลิก',
}

export const STATUS_STYLES: Record<DealStatus, string> = {
  created: 'bg-surface-container-high text-on-surface-variant',
  awaiting_deposit: 'bg-surface-container-high text-on-surface-variant',
  pending_confirmation: 'bg-error-container text-on-error-container',
  confirmed: 'bg-secondary-container text-on-secondary-container',
  shipped: 'bg-on-tertiary-container text-white',
  completed: 'bg-secondary text-on-secondary',
  disputed: 'bg-error-container text-error',
  cancelled: 'bg-surface-container-high text-on-surface-variant',
}
```

---

## Key Reusable Components

### StatusPill (src/components/StatusPill.tsx)
```tsx
import { STATUS_LABELS, STATUS_STYLES } from '@/lib/deal-utils'
import type { DealStatus } from '@/lib/types'

export default function StatusPill({ status }: { status: DealStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
```

### Header (src/components/Header.tsx)
```tsx
// Based on: design-template/my_orders_stays/code.html (header section)
'use client'
import Link from 'next/link'

export default function Header({ userName }: { userName?: string }) {
  return (
    <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
          </div>
          <Link href="/dashboard" className="text-lg font-extrabold tracking-tight text-on-surface">
            GigGuard DAO
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {userName && <span className="text-label-md text-on-surface-variant hidden md:block">{userName}</span>}
          <Link href="/deals/new">
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden md:inline">สร้าง Deal</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}
```

### EscrowStepper (src/components/EscrowStepper.tsx)
```tsx
// Based on: design-template/dispute_center/code.html (escrow lifecycle section)
import type { DealStatus } from '@/lib/types'

const STEPS: { status: DealStatus[]; label: string; icon: string }[] = [
  { status: ['created', 'awaiting_deposit', 'pending_confirmation', 'confirmed', 'shipped', 'completed', 'disputed', 'cancelled'], label: 'สร้าง Deal', icon: 'description' },
  { status: ['awaiting_deposit', 'pending_confirmation', 'confirmed', 'shipped', 'completed', 'disputed'], label: 'Buyer เข้าร่วม', icon: 'person_add' },
  { status: ['pending_confirmation', 'confirmed', 'shipped', 'completed', 'disputed'], label: 'ส่งมัดจำ', icon: 'payments' },
  { status: ['confirmed', 'shipped', 'completed', 'disputed'], label: 'ยืนยันมัดจำ', icon: 'check_circle' },
  { status: ['shipped', 'completed', 'disputed'], label: 'จัดส่ง', icon: 'local_shipping' },
  { status: ['completed'], label: 'เสร็จสิ้น', icon: 'lock_open' },
]

function getStepState(stepStatuses: DealStatus[], currentStatus: DealStatus): 'done' | 'current' | 'future' {
  const doneStatuses = stepStatuses
  if (doneStatuses.includes(currentStatus)) return 'done'
  // simplified: check if we've passed this step
  return 'future'
}

export default function EscrowStepper({ status }: { status: DealStatus }) {
  const stepIndex = STEPS.findIndex(s => !s.status.includes(status))
  const currentStep = stepIndex === -1 ? STEPS.length - 1 : stepIndex - 1

  return (
    <div className="bg-white rounded-2xl border border-outline-variant p-gutter">
      <div className="flex justify-between items-center relative overflow-x-auto">
        {/* Background line */}
        <div className="absolute h-[2px] bg-slate-100 left-0 right-0 top-4 -translate-y-1/2 z-0" />
        {/* Progress line */}
        <div
          className="absolute h-[2px] bg-secondary top-4 -translate-y-1/2 z-0 transition-all"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, i) => {
          const isDone = i <= currentStep
          const isCurrent = i === currentStep + 1
          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${isDone ? 'bg-secondary text-white' : isCurrent ? 'border-4 border-secondary bg-white text-secondary shadow-sm' : 'border-2 border-slate-300 bg-white text-slate-400'}`}>
                {isDone
                  ? <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  : <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                }
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap
                ${isDone ? 'text-on-surface' : isCurrent ? 'text-secondary' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### VerifiedBadge (src/components/VerifiedBadge.tsx)
```tsx
// Based on: design-template/item_details/code.html (Porm-Verified badge section)
export default function VerifiedBadge() {
  return (
    <span
      className="flex items-center gap-1 px-3 py-1 bg-secondary/20 text-secondary rounded-full font-label-sm cursor-help"
      title="ร้านค้านี้มียอดสำเร็จ ≥ 10 ดีล และ rating ≥ 4.0"
    >
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        verified_user
      </span>
      GigGuard Verified
    </span>
  )
}
```

### DealCard (src/components/DealCard.tsx)
```tsx
// Based on: design-template/my_orders_stays/code.html (transaction list items)
import Link from 'next/link'
import StatusPill from './StatusPill'
import type { Deal } from '@/lib/types'

export default function DealCard({ deal, role }: { deal: Deal; role: 'seller' | 'buyer' }) {
  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/deals/${deal.id}`}>
        <div className="p-gutter flex flex-col md:flex-row md:items-center justify-between gap-gutter">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface">handshake</span>
            </div>
            <div>
              <h4 className="font-label-md text-on-surface">{deal.title}</h4>
              <p className="text-label-sm text-outline">
                Deal #{deal.id.slice(0, 8).toUpperCase()} • {role === 'seller' ? 'คุณเป็น Seller' : 'คุณเป็น Buyer'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <div className="text-right">
              <p className="font-headline-sm">฿{Number(deal.total_amount).toLocaleString('th-TH')}</p>
              <StatusPill status={deal.status} />
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
```

### BottomNav (src/components/BottomNav.tsx)
```tsx
// Based on: design-template/my_orders_stays/code.html + secure_checkout/code.html (bottom nav)
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'receipt_long', label: 'Deals' },
  { href: '/deals/new', icon: 'add_circle', label: 'New Deal' },
  { href: '/admin/disputes', icon: 'gavel', label: 'Disputes' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_0_rgba(15,23,42,0.05)] z-50 rounded-t-xl">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl ${
            pathname.startsWith(item.href) ? 'text-on-surface bg-surface-container' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
```

---

## Page Implementation Blueprints

### /deals/new — Create Deal (Seller)
```
Visual reference: design-template/secure_checkout/code.html
Layout: 12-col grid, Left=7 (form), Right=5 (summary sticky)

Left column:
  - Page title "สร้าง Escrow Deal"
  - Form sections:
    1. ชื่อและรายละเอียดรายการ (title textarea, description textarea)
    2. ราคา (total_amount number input, deposit_percent slider/number 10-50%)
    3. ข้อมูลบัญชีรับโอน (bank_name, account_number, account_name)
  - Submit button: bg-primary "สร้าง Deal และรับ Link"

Right column (sticky):
  - Live summary card showing:
    - ยอดรวม: total_amount
    - มัดจำ (X%): deposit_amount
    - ยอดที่เหลือ: remaining_amount
    - Fee (1%): fee_amount (displayed only)
  - After submit: show shareable link with copy button

API: POST /api/deals → { title, description, total_amount, deposit_percent, seller_bank_name, seller_account_number, seller_account_name }
Response: { id: uuid } → redirect to /deals/:id
```

### /deals/[id] — Deal Detail
```
Visual reference: design-template/item_details/code.html (adapt right sidebar as action panel)

Show:
  1. EscrowStepper at top (always visible)
  2. Deal info card (title, description, amounts, bank info if buyer)
  3. Seller profile section (avatar, name, VerifiedBadge if earned)
  4. Action panel (right sticky on desktop, bottom on mobile) — content differs by role+status:

  GUEST (not logged in, not joined):
    → Button: "เข้าร่วม Deal / Login เพื่อเข้าร่วม" → /login?redirect=/deals/:id/join

  BUYER awaiting_deposit:
    → Show bank transfer details prominently
    → Button (secondary/green): "ฉันโอนมัดจำแล้ว"
    → Calls PATCH /api/deals/:id/transition {to: 'pending_confirmation'}

  SELLER pending_confirmation:
    → Show "Buyer แจ้งว่าโอนมัดจำแล้ว"
    → Button (secondary): "ยืนยันรับมัดจำ" → {to: 'confirmed'}
    → Button (ghost/error): "ยกเลิก Deal" → {to: 'cancelled'}

  SELLER confirmed:
    → Tracking input + Button: "ส่งแล้ว" → {to: 'shipped', tracking_info: '...'}

  BUYER shipped:
    → Show tracking info
    → Button (secondary): "ยืนยันรับของและชำระครบแล้ว" → {to: 'completed'}
    → Button (ghost/error): "มีปัญหา / เปิด Dispute" → shows dispute form modal

  BUYER/SELLER completed + no review yet (BUYER only):
    → Review form (stars 1-5 + comment textarea)
    → POST /api/deals/:id/review

  DISPUTED (admin sees in /admin/disputes):
    → Show dispute reason + evidence
```

### /deals/[id]/join — Buyer Join
```
Visual reference: design-template/secure_checkout/code.html (left column summary)

Show deal summary (title, seller name, amounts) publicly (no auth needed to VIEW)
If not logged in: "Login เพื่อเข้าร่วม Deal" → /login?redirect=/deals/:id/join
If logged in and not already buyer/seller:
  → Show "เข้าร่วม Deal นี้" button
  → POST /api/deals/:id/join → redirect to /deals/:id
If already seller of this deal: show error "คุณเป็นผู้สร้าง Deal นี้"
If already buyer: redirect to /deals/:id
```

### /dashboard — My Deals
```
Visual reference: design-template/my_orders_stays/code.html

Hero bento (2-col):
  - Left: Active deals count, total value
  - Right: Completed count, success rate

Two tabs: "ฉันเป็น Seller" | "ฉันเป็น Buyer"
DealCard list for each tab
Floating "+ New Deal" button (mobile)
```

### /admin/disputes — Admin Dispute Center
```
Visual reference: design-template/dispute_center/code.html

Guard: check profiles.is_admin = true (use service role key)
List all deals with status='disputed' + their dispute records
For each: show deal title, reason, evidence_url, parties
Two action buttons:
  - "คืนเงิน Buyer" → POST /api/deals/:id/verdict {verdict: 'refund_buyer'} → status: 'cancelled'
  - "ปลดให้ Seller" → POST /api/deals/:id/verdict {verdict: 'release_seller'} → status: 'completed'
```

---

## API Route Blueprints

### POST /api/deals (Create Deal)
```typescript
// Validate: user authenticated, required fields present
// Compute amounts with computeAmounts()
// Insert into deals with seller_id = user.id, status = 'created'
// Return { id }
```

### POST /api/deals/[id]/join (Buyer Joins)
```typescript
// Validate: user authenticated, deal exists, deal.buyer_id IS NULL
// Validate: user.id !== deal.seller_id (cannot join own deal)
// Validate: deal.status === 'created'
// Update: buyer_id = user.id, status = 'awaiting_deposit'
// Return { success: true }
```

### POST /api/deals/[id]/transition (Status Change)
```typescript
// Body: { to: DealStatus, tracking_info?: string }
// Get user + deal
// Determine role: getUserRole(deal, user.id, profile.is_admin)
// Validate: canTransition(deal.status, body.to, role) === true
// Build update object: { status: body.to }
// If to='pending_confirmation': add payment_status='deposit_paid'
// If to='completed': add payment_status='fully_paid'
// If to='shipped': require tracking_info in body
// Update deal, return { success: true, status: newStatus }
```

### POST /api/deals/[id]/dispute
```typescript
// Validate: user is buyer of this deal, deal.status === 'shipped'
// Insert dispute { deal_id, reason, evidence_url }
// Update deal status → 'disputed'
```

### POST /api/deals/[id]/review
```typescript
// Validate: user is buyer, deal.status === 'completed', no existing review
// Insert review { deal_id, reviewer_id=buyer, reviewee_id=seller, rating, comment }
// Trigger updates seller avg_rating automatically
```

### POST /api/deals/[id]/verdict (Admin only)
```typescript
// Use createAdminClient (service role) — bypasses RLS
// Validate: admin check via profiles.is_admin
// body.verdict: 'refund_buyer' | 'release_seller'
// Update dispute.verdict, dispute.resolved_at = now()
// Update deal.status: refund → 'cancelled', release → 'completed'
```

---

## Implementation Task List (Ordered)

Complete in this exact order:

- [ ] **T01** `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint`
- [ ] **T02** Install deps: `npm install @supabase/ssr @supabase/supabase-js`
- [ ] **T03** Create `.env.local` with Supabase URL + ANON_KEY + SERVICE_ROLE_KEY
- [ ] **T04** Write `tailwind.config.ts` (copy full config from this PRP)
- [ ] **T05** Write `src/app/globals.css` (Material Symbols + glass-panel)
- [ ] **T06** Write `src/app/layout.tsx` (Google Fonts in `<head>`)
- [ ] **T07** Write `middleware.ts` (session refresh + route protection)
- [ ] **T08** Write `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts`
- [ ] **T09** Write `src/lib/types.ts` and `src/lib/deal-utils.ts`
- [ ] **T10** Run SQL schema in Supabase SQL Editor (all of STEP 1-4 from this PRP)
- [ ] **T11** Build auth pages: `(auth)/login/page.tsx` + `(auth)/register/page.tsx`
- [ ] **T12** Build `api/auth/callback/route.ts` (Supabase email confirm callback)
- [ ] **T13** Build shared components: `Header`, `StatusPill`, `EscrowStepper`, `DealCard`, `VerifiedBadge`, `BottomNav`
- [ ] **T14** Build `deals/new/page.tsx` (Create Deal form)
- [ ] **T15** Build `api/deals/route.ts` (POST create)
- [ ] **T16** Build `deals/[id]/page.tsx` (Deal Detail — all role views)
- [ ] **T17** Build `deals/[id]/join/page.tsx` (Buyer join page)
- [ ] **T18** Build `api/deals/[id]/route.ts` (GET single deal with joins)
- [ ] **T19** Build `api/deals/[id]/join/route.ts` (POST join)
- [ ] **T20** Build `api/deals/[id]/transition/route.ts` (POST state change)
- [ ] **T21** Build `dashboard/page.tsx` (My Deals — seller tab + buyer tab)
- [ ] **T22** Build `api/deals/[id]/dispute/route.ts` + dispute form in deal detail
- [ ] **T23** Build `admin/disputes/page.tsx` + `api/deals/[id]/verdict/route.ts`
- [ ] **T24** Build review form in deal detail + `api/deals/[id]/review/route.ts`
- [ ] **T25** Build `profile/[id]/page.tsx` (Seller stats + VerifiedBadge + reviews)
- [ ] **T26** Add `src/app/page.tsx` → redirect to `/dashboard`
- [ ] **T27** Polish: loading states (`loading.tsx`), error states (`error.tsx`), mobile bottom nav
- [ ] **T28** Test full demo loop end-to-end

---

## Validation Gates

```bash
# 1. TypeScript — no type errors
npx tsc --noEmit

# 2. Build — must succeed with zero errors
npm run build

# 3. Dev server — starts without crash
npm run dev
```

### Manual Demo Checklist (must pass all)
```
[ ] Register User A (seller)
[ ] Create Deal: fill title, amount=1000, deposit=30%, bank info → get shareable link
[ ] Register User B (buyer) in incognito
[ ] Open shareable link /deals/:id/join → see deal summary
[ ] Click "เข้าร่วม Deal" → deal status = awaiting_deposit
[ ] Click "ฉันโอนมัดจำแล้ว" → status = pending_confirmation
[ ] Switch to User A → see "Buyer แจ้งว่าโอนมัดจำแล้ว"
[ ] Click "ยืนยันรับมัดจำ" → status = confirmed
[ ] Fill tracking, click "ส่งแล้ว" → status = shipped
[ ] Switch to User B → see tracking info
[ ] Click "ยืนยันรับของและชำระครบแล้ว" → status = completed
[ ] Leave review (1-5 stars + comment)
[ ] View seller profile → completed_deals count +1, avg_rating updated
[ ] DISPUTE TEST: create separate deal, reach shipped → open dispute → admin resolves
[ ] Admin page /admin/disputes → visible (set is_admin=true in DB for test user)
[ ] GigGuard Verified badge shows when completed_deals ≥ 10 AND avg_rating ≥ 4.0
[ ] Mobile: bottom navigation works, all pages responsive
```

---

## Design Template Quick Reference

All visual implementation must reference these files (they contain real HTML with exact Tailwind classes):

| Page | Template File |
|------|--------------|
| Dashboard | `design-template/my_orders_stays/code.html` |
| Create Deal / Join Deal | `design-template/secure_checkout/code.html` |
| Deal Detail | `design-template/item_details/code.html` |
| Admin Disputes | `design-template/dispute_center/code.html` |

**Key class patterns from templates:**
```
Header:       bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-slate-200 shadow-sm
Card:         bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter shadow-sm
Deal hero:    bg-on-primary-fixed text-on-primary-fixed p-margin rounded-xl (dark hero card)
Button PRI:   bg-primary text-on-primary py-4 rounded-xl font-label-md hover:opacity-90
Button SUC:   bg-secondary text-on-secondary rounded-lg font-label-md hover:opacity-90
Button GHOST: border border-outline text-on-surface bg-transparent rounded-lg
Input:        border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-tertiary
Pill LOCK:    bg-tertiary-container text-tertiary-fixed rounded-full text-[12px] font-bold uppercase tracking-wider
Pill SECURED: bg-secondary-container text-on-secondary-container rounded-full text-[12px] font-bold uppercase
Pill DISPUTE: bg-error-container text-error rounded-full text-[12px] font-bold uppercase
Pill DONE:    bg-secondary text-on-secondary rounded-full text-[12px] font-bold uppercase
Verified:     bg-secondary/20 text-secondary rounded-full font-label-sm (with shield icon FILL=1)
Stepper line: absolute h-[2px] bg-secondary top-1/2 -translate-y-1/2 z-0
Stepper done: w-8 h-8 rounded-full bg-secondary text-white (check icon FILL=1)
Stepper curr: w-8 h-8 rounded-full border-4 border-secondary bg-white text-secondary shadow-sm
Stepper next: w-8 h-8 rounded-full border-2 border-slate-300 bg-white text-slate-400
```

---

## Score: 9/10

**Confidence**: High. The PRP provides:
- Complete DB schema with triggers, RLS policies, and all edge cases
- Exact Supabase + Next.js 14 `@supabase/ssr` patterns (the only correct approach)
- Full state machine with role-based validation
- Copy-paste ready Tailwind config from actual design templates
- Real HTML class patterns extracted directly from template files
- Ordered task list matching 1-day build timeline
- Executable validation gates + manual demo checklist

**Deducted 1 point because:**
- Supabase ANON_KEY / SERVICE_ROLE_KEY must be fetched manually from dashboard (cannot be pre-filled)
- Admin detection relies on manually setting `is_admin=true` in DB (no UI for this)
