-- ============================================================
-- DeepLBO — Supabase Migration v1
-- ============================================================

-- ─── 1. WORKSPACES (primero, porque profiles la referencia) ──
CREATE TABLE IF NOT EXISTS public.workspaces (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  invite_code  TEXT NOT NULL UNIQUE,
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT '',
  email        TEXT NOT NULL DEFAULT '',
  company      TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT 'member',
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. WORKSPACE_MEMBERS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member',
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- ─── 4. LBO_ANALYSES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lbo_analyses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Nuevo análisis',
  inputs      JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. DCF_ANALYSES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dcf_analyses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Nuevo DCF',
  inputs      JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. MERGER_ANALYSES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.merger_analyses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Nueva fusión',
  inputs      JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 7. HUB_LISTINGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hub_listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  type             TEXT NOT NULL,
  sector           TEXT NOT NULL,
  country          TEXT NOT NULL DEFAULT 'España',
  city             TEXT,
  revenue_m        NUMERIC(12,2) NOT NULL DEFAULT 0,
  ebitda_m         NUMERIC(12,2) NOT NULL DEFAULT 0,
  asking_multiple  NUMERIC(6,2),
  asking_price_m   NUMERIC(12,2),
  net_debt_m       NUMERIC(12,2),
  description      TEXT NOT NULL DEFAULT '',
  highlights       TEXT[] NOT NULL DEFAULT '{}',
  use_of_funds     TEXT,
  deal_rationale   TEXT,
  anonymous        BOOLEAN NOT NULL DEFAULT false,
  owner_name       TEXT,
  owner_firm       TEXT,
  owner_email      TEXT NOT NULL DEFAULT '',
  tags             TEXT[] NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'active',
  views            INTEGER NOT NULL DEFAULT 0,
  is_demo          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at        TIMESTAMPTZ
);

-- ─── 8. HUB_INTERESTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hub_interests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES public.hub_listings(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  firm         TEXT,
  message      TEXT NOT NULL DEFAULT '',
  nda          BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 9. DD_CHECKLISTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dd_checklists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id   UUID NOT NULL REFERENCES public.lbo_analyses(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_name TEXT NOT NULL DEFAULT '',
  items         JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (analysis_id)
);

-- ─── 10. DEAL_SCORES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deal_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id     UUID NOT NULL REFERENCES public.lbo_analyses(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criteria        JSONB NOT NULL DEFAULT '[]',
  recommendation  TEXT NOT NULL DEFAULT 'neutral',
  summary_notes   TEXT NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (analysis_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lbo_user    ON public.lbo_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_dcf_user    ON public.dcf_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_merger_user ON public.merger_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_owner   ON public.hub_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_hub_status  ON public.hub_listings(status);
CREATE INDEX IF NOT EXISTS idx_hi_listing  ON public.hub_interests(listing_id);
CREATE INDEX IF NOT EXISTS idx_wm_ws       ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_wm_user     ON public.workspace_members(user_id);

-- ─── AUTO-CREATE PROFILE ON REGISTER ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lbo_analyses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcf_analyses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merger_analyses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_interests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_checklists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_scores       ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- workspaces
CREATE POLICY "workspaces_select" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );
CREATE POLICY "workspaces_insert" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- workspace_members
CREATE POLICY "wm_select" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );
CREATE POLICY "wm_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );
CREATE POLICY "wm_delete" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- analyses
CREATE POLICY "lbo_own"    ON public.lbo_analyses    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "dcf_own"    ON public.dcf_analyses    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "merger_own" ON public.merger_analyses FOR ALL USING (user_id = auth.uid());

-- hub_listings: todos los auth leen activos; owner gestiona
CREATE POLICY "hub_select" ON public.hub_listings
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (status IN ('active', 'under_loi') OR owner_id = auth.uid())
  );
CREATE POLICY "hub_insert" ON public.hub_listings
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "hub_update" ON public.hub_listings
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "hub_delete" ON public.hub_listings
  FOR DELETE USING (owner_id = auth.uid());

-- hub_interests: dueño del listing los ve; cualquier auth puede insertar
CREATE POLICY "hi_select" ON public.hub_interests
  FOR SELECT USING (
    listing_id IN (SELECT id FROM public.hub_listings WHERE owner_id = auth.uid())
  );
CREATE POLICY "hi_insert" ON public.hub_interests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- dd y scoring
CREATE POLICY "dd_own" ON public.dd_checklists FOR ALL USING (user_id = auth.uid());
CREATE POLICY "ds_own" ON public.deal_scores    FOR ALL USING (user_id = auth.uid());
