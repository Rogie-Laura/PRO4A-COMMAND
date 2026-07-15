-- Retain one BMI upload batch per calendar month so month-over-month tracking
-- (weight gain/loss + BMI category movement) can compare snapshots.
ALTER TABLE public.bmi_upload_batches
  ADD COLUMN IF NOT EXISTS period_month text;

CREATE INDEX IF NOT EXISTS bmi_upload_batches_period_month_idx
  ON public.bmi_upload_batches (period_month);

-- Backfill existing batches from the dominant month of their records' Date Taken.
WITH monthly AS (
  SELECT
    batch_id,
    to_char(date_taken, 'YYYY-MM') AS ym,
    count(*) AS c
  FROM public.bmi_records
  WHERE date_taken IS NOT NULL
  GROUP BY batch_id, to_char(date_taken, 'YYYY-MM')
),
ranked AS (
  SELECT
    batch_id,
    ym,
    row_number() OVER (PARTITION BY batch_id ORDER BY c DESC) AS rn
  FROM monthly
)
UPDATE public.bmi_upload_batches b
SET period_month = r.ym
FROM ranked r
WHERE r.batch_id = b.id
  AND r.rn = 1
  AND b.period_month IS NULL;
