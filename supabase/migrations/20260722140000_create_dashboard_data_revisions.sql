CREATE TABLE IF NOT EXISTS public.dashboard_data_revisions (
  id text PRIMARY KEY,
  revision timestamptz NOT NULL DEFAULT now(),
  source text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.dashboard_data_revisions (id, revision, source)
VALUES ('global', now(), 'bootstrap')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.dashboard_data_revisions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.dashboard_data_revisions FROM anon, authenticated;
GRANT ALL ON public.dashboard_data_revisions TO service_role;
