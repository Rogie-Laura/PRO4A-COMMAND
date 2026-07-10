CREATE TABLE IF NOT EXISTS public.establishment_upload_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  uploaded_by_label text,
  record_count integer NOT NULL CHECK (record_count >= 0),
  analytics jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.establishments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES public.establishment_upload_batches(id) ON DELETE CASCADE,
  province text NOT NULL,
  ppo text NOT NULL,
  station text NOT NULL,
  latitude numeric(10, 7) NOT NULL,
  longitude numeric(10, 7) NOT NULL,
  sector_no text NOT NULL DEFAULT '',
  establishment_type text NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  contact_person text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS establishment_upload_batches_created_at_idx
  ON public.establishment_upload_batches (created_at DESC);

CREATE INDEX IF NOT EXISTS establishments_batch_id_idx
  ON public.establishments (batch_id);

CREATE INDEX IF NOT EXISTS establishments_type_idx
  ON public.establishments (establishment_type);

CREATE INDEX IF NOT EXISTS establishments_ppo_idx
  ON public.establishments (ppo);

CREATE INDEX IF NOT EXISTS establishments_province_idx
  ON public.establishments (province);

CREATE INDEX IF NOT EXISTS establishments_coords_idx
  ON public.establishments (latitude, longitude);

ALTER TABLE public.establishment_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.establishment_upload_batches FROM anon, authenticated;
REVOKE ALL ON public.establishments FROM anon, authenticated;
GRANT ALL ON public.establishment_upload_batches TO service_role;
GRANT ALL ON public.establishments TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
