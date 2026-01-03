-- Capacity Gate MVP - Initial Schema
-- This migration creates all tables, indexes, RLS policies, functions, and triggers

-- ============================================================================
-- TABLES
-- ============================================================================

-- Bakers table (authenticated users with business profiles)
CREATE TABLE bakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  business_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  context_message text,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Slug format validation: lowercase alphanumeric and hyphens
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' OR slug ~ '^[a-z0-9]$')
);

-- Capacity windows table (dates with slot counts)
CREATE TABLE capacity_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id uuid NOT NULL REFERENCES bakers(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_slots integer NOT NULL CHECK (total_slots >= 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- One window per date per baker
  CONSTRAINT unique_baker_date UNIQUE (baker_id, date)
);

-- Submissions table (customer booking requests)
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id uuid NOT NULL REFERENCES bakers(id) ON DELETE CASCADE,
  capacity_window_id uuid NOT NULL REFERENCES capacity_windows(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  description text NOT NULL CHECK (char_length(description) <= 1000),
  quantity integer CHECK (quantity IS NULL OR quantity > 0),
  budget_range text,
  slots_consumed integer NOT NULL DEFAULT 1 CHECK (slots_consumed = 1),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX bakers_user_id_idx ON bakers(user_id);
CREATE INDEX capacity_windows_baker_id_idx ON capacity_windows(baker_id);
CREATE INDEX capacity_windows_date_idx ON capacity_windows(date);
CREATE INDEX submissions_baker_id_idx ON submissions(baker_id);
CREATE INDEX submissions_capacity_window_id_idx ON submissions(capacity_window_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Bakers policies
CREATE POLICY "bakers_select_own" ON bakers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bakers_insert_own" ON bakers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bakers_update_own" ON bakers
  FOR UPDATE USING (auth.uid() = user_id);

-- Public can read baker by slug (for public availability page)
CREATE POLICY "bakers_select_public_by_slug" ON bakers
  FOR SELECT USING (true);

-- Capacity windows policies
CREATE POLICY "windows_select_own" ON capacity_windows
  FOR SELECT USING (baker_id IN (SELECT id FROM bakers WHERE user_id = auth.uid()));

CREATE POLICY "windows_insert_own" ON capacity_windows
  FOR INSERT WITH CHECK (baker_id IN (SELECT id FROM bakers WHERE user_id = auth.uid()));

CREATE POLICY "windows_update_own" ON capacity_windows
  FOR UPDATE USING (baker_id IN (SELECT id FROM bakers WHERE user_id = auth.uid()));

CREATE POLICY "windows_delete_own" ON capacity_windows
  FOR DELETE USING (baker_id IN (SELECT id FROM bakers WHERE user_id = auth.uid()));

-- Public can read windows (for availability display)
CREATE POLICY "windows_select_public" ON capacity_windows
  FOR SELECT USING (true);

-- Submissions policies
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT USING (baker_id IN (SELECT id FROM bakers WHERE user_id = auth.uid()));

CREATE POLICY "submissions_delete_own" ON submissions
  FOR DELETE USING (baker_id IN (SELECT id FROM bakers WHERE user_id = auth.uid()));

-- Public can insert submissions (customer booking)
CREATE POLICY "submissions_insert_public" ON submissions
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get available slots for a window
CREATE OR REPLACE FUNCTION get_available_slots(window_id uuid)
RETURNS integer AS $$
  SELECT GREATEST(0, cw.total_slots - COALESCE(SUM(s.slots_consumed), 0)::integer)
  FROM capacity_windows cw
  LEFT JOIN submissions s ON s.capacity_window_id = cw.id
  WHERE cw.id = window_id
  GROUP BY cw.id, cw.total_slots;
$$ LANGUAGE sql STABLE;

-- Atomic submission creation with capacity check and row-level lock
CREATE OR REPLACE FUNCTION create_submission_if_available(
  p_capacity_window_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_description text,
  p_quantity integer,
  p_budget_range text
)
RETURNS TABLE (
  success boolean,
  submission_id uuid,
  error_code text
) AS $$
DECLARE
  v_baker_id uuid;
  v_total_slots integer;
  v_used_slots integer;
  v_window_date date;
  v_submission_id uuid;
BEGIN
  -- Lock the capacity window row to prevent race conditions
  SELECT cw.baker_id, cw.total_slots, cw.date
  INTO v_baker_id, v_total_slots, v_window_date
  FROM capacity_windows cw
  WHERE cw.id = p_capacity_window_id
  FOR UPDATE;

  -- Window not found
  IF v_baker_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, 'WINDOW_NOT_FOUND';
    RETURN;
  END IF;

  -- Check if date is in the past
  IF v_window_date < CURRENT_DATE THEN
    RETURN QUERY SELECT false, NULL::uuid, 'DATE_IN_PAST';
    RETURN;
  END IF;

  -- Calculate used slots
  SELECT COALESCE(SUM(slots_consumed), 0)
  INTO v_used_slots
  FROM submissions
  WHERE capacity_window_id = p_capacity_window_id;

  -- Check availability
  IF v_used_slots >= v_total_slots THEN
    RETURN QUERY SELECT false, NULL::uuid, 'NO_AVAILABILITY';
    RETURN;
  END IF;

  -- Insert submission
  INSERT INTO submissions (
    baker_id,
    capacity_window_id,
    customer_name,
    customer_email,
    customer_phone,
    description,
    quantity,
    budget_range,
    slots_consumed
  ) VALUES (
    v_baker_id,
    p_capacity_window_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_description,
    p_quantity,
    p_budget_range,
    1
  )
  RETURNING id INTO v_submission_id;

  RETURN QUERY SELECT true, v_submission_id, NULL::text;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a window has submissions (for delete prevention)
CREATE OR REPLACE FUNCTION window_has_submissions(window_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM submissions WHERE capacity_window_id = window_id
  );
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bakers_updated_at
  BEFORE UPDATE ON bakers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER capacity_windows_updated_at
  BEFORE UPDATE ON capacity_windows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
