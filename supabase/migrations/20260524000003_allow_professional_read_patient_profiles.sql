-- Allow professionals to read the profile of any patient
-- who has an appointment with them (fixes "Paciente" fallback name in dashboard)
CREATE POLICY "Professionals can view their patients profiles"
ON public.profiles
FOR SELECT
USING (
  user_id IN (
    SELECT patient_id
    FROM public.appointments
    WHERE professional_id = public.get_professional_id(auth.uid())
  )
);

NOTIFY pgrst, 'reload schema';
