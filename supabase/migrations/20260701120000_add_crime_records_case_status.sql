ALTER TABLE public.crime_records
  ADD COLUMN IF NOT EXISTS case_status text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS crime_records_case_status_idx ON public.crime_records (case_status);
