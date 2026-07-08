ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS division_scope text;

COMMENT ON COLUMN public.api_keys.division_scope IS
  'Division scope for division_uploader tokens (e.g. rlrdd, ridmd).';
