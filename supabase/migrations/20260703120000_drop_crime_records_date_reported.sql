DROP INDEX IF EXISTS public.crime_records_batch_reported_idx;

ALTER TABLE public.crime_records
  DROP COLUMN IF EXISTS date_reported;
