CREATE TABLE IF NOT EXISTS public.pro4a_alert_level_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  alert_level text NOT NULL DEFAULT 'normal'
    CHECK (alert_level IN ('normal', 'heightened', 'full_alert')),
  updated_by_label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.pro4a_alert_level_settings (id, alert_level)
VALUES (1, 'normal')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.pro4a_alert_level_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.pro4a_alert_level_settings FROM anon, authenticated;
GRANT ALL ON public.pro4a_alert_level_settings TO service_role;
