-- Add missing columns to appointments table (safe, idempotent)
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add CHECK constraints only if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointments_appointment_type_check'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_appointment_type_check
      CHECK (appointment_type IN ('online', 'in_person'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointments_status_check'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_status_check
      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
  END IF;
END $$;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
