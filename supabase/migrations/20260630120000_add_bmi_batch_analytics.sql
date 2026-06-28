-- Pre-computed dashboard summary (category counts) for fast Health & BMI page loads.
ALTER TABLE public.bmi_upload_batches
ADD COLUMN IF NOT EXISTS analytics jsonb;
