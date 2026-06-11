-- ============================================================
-- BOT SCHEMA ADDITIONS — All Eyes On Me
-- Run this after schema.sql in the Supabase SQL editor
-- ============================================================

-- 1. Extend markets table
ALTER TABLE public.markets
  ADD COLUMN IF NOT EXISTS virality_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trending_sources TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS public_figure_id UUID,
  ADD COLUMN IF NOT EXISTS breaking_news BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS resolution_criteria TEXT;

CREATE INDEX IF NOT EXISTS idx_markets_virality ON public.markets(virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_markets_auto ON public.markets(auto_generated);
CREATE INDEX IF NOT EXISTS idx_markets_suspended ON public.markets(suspended);

-- 2. Add is_admin to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 3. Public figures master table
CREATE TABLE IF NOT EXISTS public.public_figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  full_name TEXT,
  slug TEXT UNIQUE,
  category TEXT NOT NULL,
  nationality TEXT,
  country TEXT,
  social_handles JSONB DEFAULT '{}',
  follower_estimates JSONB DEFAULT '{}',
  profile_image_url TEXT,
  wikipedia_url TEXT,
  last_trending_at TIMESTAMPTZ,
  trend_count_24h INTEGER DEFAULT 0,
  trend_count_7d INTEGER DEFAULT 0,
  virality_score INTEGER DEFAULT 0,
  virality_history JSONB DEFAULT '[]',
  blacklisted BOOLEAN DEFAULT FALSE,
  blacklist_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_figures_name ON public.public_figures(lower(name));
CREATE INDEX IF NOT EXISTS idx_public_figures_slug ON public.public_figures(slug);
CREATE INDEX IF NOT EXISTS idx_public_figures_category ON public.public_figures(category);
CREATE INDEX IF NOT EXISTS idx_public_figures_virality ON public.public_figures(virality_score DESC);

-- 4. Trending events
CREATE TABLE IF NOT EXISTS public.trending_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_id UUID REFERENCES public.public_figures(id) ON DELETE SET NULL,
  figure_name TEXT NOT NULL,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL,
  headline TEXT,
  url TEXT,
  raw_data JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  virality_contribution INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_trending_events_figure ON public.trending_events(figure_id);
CREATE INDEX IF NOT EXISTS idx_trending_events_detected ON public.trending_events(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_events_source ON public.trending_events(source);
CREATE INDEX IF NOT EXISTS idx_trending_events_name ON public.trending_events(figure_name);

-- 5. Moderation queue
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE,
  reason TEXT,
  confidence_score INTEGER,
  generated_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modqueue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_modqueue_market ON public.moderation_queue(market_id);
CREATE INDEX IF NOT EXISTS idx_modqueue_created ON public.moderation_queue(created_at DESC);

-- 6. Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (market_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_market ON public.reports(market_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id);

-- 7. Blacklist
CREATE TABLE IF NOT EXISTS public.blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'person' CHECK (type IN ('person', 'topic', 'keyword')),
  reason TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bot run log
CREATE TABLE IF NOT EXISTS public.bot_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  sources_checked INTEGER DEFAULT 0,
  figures_detected INTEGER DEFAULT 0,
  markets_generated INTEGER DEFAULT 0,
  markets_published INTEGER DEFAULT 0,
  markets_queued INTEGER DEFAULT 0,
  markets_rejected INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_bot_runs_started ON public.bot_runs(started_at DESC);

-- ============================================================
-- BOT USER
-- ============================================================

-- Insert bot user into auth.users (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'b07b0001-0000-0000-0000-000000000001') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_user_meta_data, raw_app_meta_data,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      'b07b0001-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'bot@alleyeson.internal',
      '', NOW(), NOW(), NOW(),
      '{"username":"trending"}',
      '{"provider":"email","providers":["email"]}',
      '', '', '', ''
    );
  END IF;
END $$;

-- Upsert bot profile
INSERT INTO public.profiles (id, username, credits, bio, is_verified, follower_count, created_at)
VALUES (
  'b07b0001-0000-0000-0000-000000000001',
  'trending',
  0,
  'Marchés générés automatiquement à partir des tendances mondiales.',
  TRUE,
  999999,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  username = 'trending',
  bio = 'Marchés générés automatiquement à partir des tendances mondiales.',
  is_verified = TRUE,
  follower_count = 999999;

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.public_figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_runs ENABLE ROW LEVEL SECURITY;

-- Public figures readable by all
DROP POLICY IF EXISTS "Public figures viewable by everyone" ON public.public_figures;
CREATE POLICY "Public figures viewable by everyone" ON public.public_figures
  FOR SELECT USING (true);

-- Trending events readable by all
DROP POLICY IF EXISTS "Trending events viewable by everyone" ON public.trending_events;
CREATE POLICY "Trending events viewable by everyone" ON public.trending_events
  FOR SELECT USING (true);

-- Reports: users insert own, admins view all
DROP POLICY IF EXISTS "Users can submit reports" ON public.reports;
CREATE POLICY "Users can submit reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view reports" ON public.reports;
CREATE POLICY "Admins view reports" ON public.reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Moderation queue: admins only
DROP POLICY IF EXISTS "Admins manage moderation queue" ON public.moderation_queue;
CREATE POLICY "Admins manage moderation queue" ON public.moderation_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Blacklist: admins only + public read for bot check
DROP POLICY IF EXISTS "Blacklist public read" ON public.blacklist;
CREATE POLICY "Blacklist public read" ON public.blacklist
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage blacklist" ON public.blacklist;
CREATE POLICY "Admins manage blacklist" ON public.blacklist
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Bot runs: admins only
DROP POLICY IF EXISTS "Admins view bot runs" ON public.bot_runs;
CREATE POLICY "Admins view bot runs" ON public.bot_runs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================================
-- TRIGGER: auto-suspend market at 5 reports
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_report()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.markets
  SET
    report_count = report_count + 1,
    suspended = CASE WHEN report_count + 1 >= 5 THEN TRUE ELSE suspended END
  WHERE id = NEW.market_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_report_inserted ON public.reports;
CREATE TRIGGER on_report_inserted
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION handle_new_report();

-- ============================================================
-- MARKETS: foreign key to public_figures (add after table exists)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'markets_public_figure_id_fkey'
  ) THEN
    ALTER TABLE public.markets
      ADD CONSTRAINT markets_public_figure_id_fkey
      FOREIGN KEY (public_figure_id) REFERENCES public.public_figures(id) ON DELETE SET NULL;
  END IF;
END $$;
