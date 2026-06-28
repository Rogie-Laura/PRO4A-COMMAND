ALTER TABLE public.crime_records ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS crime_records_category_idx ON public.crime_records (category);
