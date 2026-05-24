-- Fix: drop the incorrect FK that references public.users instead of auth.users
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_patient_id_users_id_fk;

-- Drop any existing FK on patient_id to start fresh
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Add the correct FK pointing to auth.users
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_patient_id_auth_users_fkey
  FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also fix clinical_notes if it has the same issue
ALTER TABLE public.clinical_notes
  DROP CONSTRAINT IF EXISTS clinical_notes_patient_id_users_id_fk;

ALTER TABLE public.clinical_notes
  DROP CONSTRAINT IF EXISTS clinical_notes_patient_id_fkey;

ALTER TABLE public.clinical_notes
  ADD CONSTRAINT clinical_notes_patient_id_auth_users_fkey
  FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
