ALTER TABLE public.crime_records
  ADD COLUMN IF NOT EXISTS modus text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS crime_records_modus_idx ON public.crime_records (modus);
