-- Extend labor_indicators to accept raw ILOSTAT columns
ALTER TABLE public.labor_indicators
  ADD COLUMN IF NOT EXISTS ref_area      text,
  ADD COLUMN IF NOT EXISTS source_code   text,
  ADD COLUMN IF NOT EXISTS classif1      text,
  ADD COLUMN IF NOT EXISTS classif2      text,
  ADD COLUMN IF NOT EXISTS obs_status    text,
  ADD COLUMN IF NOT EXISTS note_classif  text,
  ADD COLUMN IF NOT EXISTS note_indicator text,
  ADD COLUMN IF NOT EXISTS note_source   text;

-- Allow value to be null (already nullable, no-op safeguard)
-- Helpful index for ILOSTAT-style lookups
CREATE INDEX IF NOT EXISTS idx_labor_indicators_lookup
  ON public.labor_indicators (dataset_id, indicator_code, year);
