-- Fix: drop incorrect FK on professional_id that references public.users
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_professional_id_users_id_fk;

ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_professional_id_fkey;

-- Add correct FK pointing to public.professionals
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_professional_id_professionals_fkey
  FOREIGN KEY (professional_id) REFERENCES public.professionals(id) ON DELETE CASCADE;

-- Fix clinical_notes professional_id if broken too
ALTER TABLE public.clinical_notes
  DROP CONSTRAINT IF EXISTS clinical_notes_professional_id_users_id_fk;

ALTER TABLE public.clinical_notes
  DROP CONSTRAINT IF EXISTS clinical_notes_professional_id_fkey;

ALTER TABLE public.clinical_notes
  ADD CONSTRAINT clinical_notes_professional_id_professionals_fkey
  FOREIGN KEY (professional_id) REFERENCES public.professionals(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
