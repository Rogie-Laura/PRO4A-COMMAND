CREATE INDEX IF NOT EXISTS crime_records_batch_committed_idx
  ON public.crime_records (batch_id, date_committed);

CREATE INDEX IF NOT EXISTS crime_records_batch_reported_idx
  ON public.crime_records (batch_id, date_reported)
  WHERE date_committed IS NULL;

CREATE INDEX IF NOT EXISTS crime_records_batch_ppo_category_idx
  ON public.crime_records (batch_id, ppo, category);
