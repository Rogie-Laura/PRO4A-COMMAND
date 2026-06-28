-- BMI records uploaded via Settings (Super Admin)
CREATE TABLE IF NOT EXISTS public.bmi_upload_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  uploaded_by_label text,
  record_count integer NOT NULL CHECK (record_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bmi_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES public.bmi_upload_batches(id) ON DELETE CASCADE,
  rank_fullname text NOT NULL,
  rank text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  sub_unit text NOT NULL DEFAULT '',
  assignment text NOT NULL DEFAULT '',
  bmi_class text NOT NULL DEFAULT '',
  bmi_category_id text,
  age smallint,
  height_cm numeric(6,2),
  weight_kg numeric(6,2),
  waist_cm numeric(6,2),
  hip_cm numeric(6,2),
  wrist_cm numeric(6,2),
  bmi_result numeric(6,2),
  encoded_by text NOT NULL DEFAULT '',
  date_taken date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bmi_records_batch_id_idx ON public.bmi_records (batch_id);
CREATE INDEX IF NOT EXISTS bmi_records_category_id_idx ON public.bmi_records (bmi_category_id);
CREATE INDEX IF NOT EXISTS bmi_records_sub_unit_idx ON public.bmi_records (sub_unit);

ALTER TABLE public.bmi_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bmi_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.bmi_upload_batches FROM anon, authenticated;
REVOKE ALL ON public.bmi_records FROM anon, authenticated;
GRANT ALL ON public.bmi_upload_batches TO service_role;
GRANT ALL ON public.bmi_records TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
