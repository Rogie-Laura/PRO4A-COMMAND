CREATE TABLE IF NOT EXISTS public.rprmd_workbook_upload_parts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES public.rprmd_workbook_upload_batches(id) ON DELETE CASCADE,
  part_type text NOT NULL,
  part_index integer NOT NULL DEFAULT 0,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rprmd_workbook_upload_parts_batch_idx
  ON public.rprmd_workbook_upload_parts (batch_id, part_type, part_index);

ALTER TABLE public.rprmd_workbook_upload_parts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.rprmd_workbook_upload_parts FROM anon, authenticated;
GRANT ALL ON public.rprmd_workbook_upload_parts TO service_role;
