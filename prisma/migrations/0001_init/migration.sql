-- ============================================================
-- GigGuard DAO — Prisma Migration 0001_init
-- ============================================================

-- STEP 1: Custom Enum Types
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

CREATE TABLE IF NOT EXISTS "profiles" (
  "id"                        UUID NOT NULL,
  "name"                      TEXT NOT NULL DEFAULT '',
  "completed_deals_as_seller" INTEGER NOT NULL DEFAULT 0,
  "avg_rating_as_seller"      DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  "is_admin"                  BOOLEAN NOT NULL DEFAULT false,
  "created_at"                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- FK to auth.users (Supabase managed — Prisma cannot reference auth schema directly)
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_fkey"
  FOREIGN KEY ("id") REFERENCES auth.users("id") ON DELETE CASCADE
  NOT VALID;

ALTER TABLE "profiles" VALIDATE CONSTRAINT "profiles_id_fkey";

CREATE TABLE IF NOT EXISTS "deals" (
  "id"                    UUID NOT NULL DEFAULT gen_random_uuid(),
  "seller_id"             UUID NOT NULL,
  "buyer_id"              UUID,
  "title"                 TEXT NOT NULL,
  "description"           TEXT,
  "total_amount"          DECIMAL(12,2) NOT NULL,
  "deposit_percent"       INTEGER NOT NULL DEFAULT 30,
  "deposit_amount"        DECIMAL(12,2) NOT NULL,
  "remaining_amount"      DECIMAL(12,2) NOT NULL,
  "fee_amount"            DECIMAL(12,2) NOT NULL,
  "payment_status"        payment_status NOT NULL DEFAULT 'unpaid',
  "status"                deal_status NOT NULL DEFAULT 'created',
  "seller_bank_name"      TEXT NOT NULL,
  "seller_account_number" TEXT NOT NULL,
  "seller_account_name"   TEXT NOT NULL,
  "tracking_info"         TEXT,
  "created_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "deals"
  ADD CONSTRAINT "deals_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES "profiles"("id");

ALTER TABLE "deals"
  ADD CONSTRAINT "deals_buyer_id_fkey"
  FOREIGN KEY ("buyer_id") REFERENCES "profiles"("id");

CREATE TABLE IF NOT EXISTS "disputes" (
  "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
  "deal_id"      UUID NOT NULL,
  "reason"       TEXT NOT NULL,
  "evidence_url" TEXT,
  "verdict"      TEXT CHECK ("verdict" IN ('refund_buyer', 'release_seller')),
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "resolved_at"  TIMESTAMPTZ,
  CONSTRAINT "disputes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "disputes_deal_id_key" UNIQUE ("deal_id")
);

ALTER TABLE "disputes"
  ADD CONSTRAINT "disputes_deal_id_fkey"
  FOREIGN KEY ("deal_id") REFERENCES "deals"("id");

CREATE TABLE IF NOT EXISTS "reviews" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "deal_id"     UUID NOT NULL,
  "reviewer_id" UUID NOT NULL,
  "reviewee_id" UUID NOT NULL,
  "rating"      INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "comment"     TEXT,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reviews_deal_id_key" UNIQUE ("deal_id")
);

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_deal_id_fkey"
  FOREIGN KEY ("deal_id") REFERENCES "deals"("id");

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_reviewer_id_fkey"
  FOREIGN KEY ("reviewer_id") REFERENCES "profiles"("id");

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_reviewee_id_fkey"
  FOREIGN KEY ("reviewee_id") REFERENCES "profiles"("id");

-- ============================================================
-- STEP 3: Functions & Triggers
-- ============================================================

-- Auto-create profile row when user signs up via Supabase Auth
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

-- Auto-update updated_at on every deals UPDATE
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

-- Increment seller completed_deals_as_seller when deal → completed
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

-- Recalculate avg_rating_as_seller after each new review
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

CREATE POLICY "profiles: public read"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles: self insert"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: self update"
  ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Public read — required for /deals/:id/join shareable link (no auth)
CREATE POLICY "deals: public read"
  ON deals FOR SELECT USING (true);

CREATE POLICY "deals: seller insert"
  ON deals FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Two separate UPDATE policies (combined OR is unreliable in Postgres RLS)
CREATE POLICY "deals: seller update"
  ON deals FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "deals: buyer update"
  ON deals FOR UPDATE USING (buyer_id IS NOT NULL AND auth.uid() = buyer_id);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disputes: party read"
  ON disputes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id
        AND (d.seller_id = auth.uid()
          OR (d.buyer_id IS NOT NULL AND d.buyer_id = auth.uid()))
    )
  );

CREATE POLICY "disputes: buyer insert"
  ON disputes FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id
        AND d.buyer_id IS NOT NULL
        AND d.buyer_id = auth.uid()
        AND d.status = 'shipped'
    )
  );

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews: public read"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "reviews: buyer insert"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id
        AND d.buyer_id IS NOT NULL
        AND d.buyer_id = auth.uid()
        AND d.status = 'completed'
    )
  );
