-- Allow professionals to insert their own record
CREATE POLICY "Professionals can insert their own info" ON public.professionals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow professionals to insert their own availability
-- (The existing "Professionals can manage their availability" policy uses get_professional_id
--  which returns NULL when there is no professionals row yet, blocking the first insert.
--  This policy allows insert when the professional_id matches any professionals row owned by the user.)
DROP POLICY IF EXISTS "Professionals can manage their availability" ON public.professional_availability;

CREATE POLICY "Professionals can manage their availability" ON public.professional_availability
    FOR ALL USING (
        professional_id IN (
            SELECT id FROM public.professionals WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        professional_id IN (
            SELECT id FROM public.professionals WHERE user_id = auth.uid()
        )
    );
