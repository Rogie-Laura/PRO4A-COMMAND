CREATE TABLE IF NOT EXISTS public.drug_clearing_upload_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  uploaded_by_label text,
  analytics jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS drug_clearing_upload_batches_created_at_idx
  ON public.drug_clearing_upload_batches (created_at DESC);

ALTER TABLE public.drug_clearing_upload_batches ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.drug_clearing_upload_batches FROM anon, authenticated;
GRANT ALL ON public.drug_clearing_upload_batches TO service_role;
