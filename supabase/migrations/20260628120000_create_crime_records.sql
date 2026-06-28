CREATE TABLE IF NOT EXISTS public.crime_upload_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  uploaded_by_label text,
  record_count integer NOT NULL CHECK (record_count >= 0),
  analytics jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crime_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES public.crime_upload_batches(id) ON DELETE CASCADE,
  ppo text NOT NULL DEFAULT '',
  stn text NOT NULL DEFAULT '',
  barangay text NOT NULL DEFAULT '',
  year smallint,
  typeof_place text NOT NULL DEFAULT '',
  date_reported date,
  date_committed date,
  time_committed text NOT NULL DEFAULT '',
  crime text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crime_records_batch_id_idx ON public.crime_records (batch_id);
CREATE INDEX IF NOT EXISTS crime_records_ppo_idx ON public.crime_records (ppo);
CREATE INDEX IF NOT EXISTS crime_records_crime_idx ON public.crime_records (crime);

ALTER TABLE public.crime_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crime_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.crime_upload_batches FROM anon, authenticated;
REVOKE ALL ON public.crime_records FROM anon, authenticated;
GRANT ALL ON public.crime_upload_batches TO service_role;
GRANT ALL ON public.crime_records TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
