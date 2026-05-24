-- Add missing updated_at column to appointments (trigger references it but column was absent)
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Backfill existing rows
UPDATE public.appointments SET updated_at = now() WHERE updated_at IS NULL;

-- Same fix for clinical_notes if missing
ALTER TABLE public.clinical_notes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.clinical_notes SET updated_at = now() WHERE updated_at IS NULL;

NOTIFY pgrst, 'reload schema';
