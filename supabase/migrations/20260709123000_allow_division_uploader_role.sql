ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_role_check;

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_role_check
  CHECK (role = ANY (ARRAY['super_admin'::text, 'officer'::text, 'division_uploader'::text]));

NOTIFY pgrst, 'reload schema';
