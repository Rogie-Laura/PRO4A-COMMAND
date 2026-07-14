CREATE TABLE IF NOT EXISTS public.rprmd_workbook_upload_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  uploaded_by_label text,
  analytics jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rprmd_workbook_upload_batches_created_at_idx
  ON public.rprmd_workbook_upload_batches (created_at DESC);

ALTER TABLE public.rprmd_workbook_upload_batches ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.rprmd_workbook_upload_batches FROM anon, authenticated;
GRANT ALL ON public.rprmd_workbook_upload_batches TO service_role;
