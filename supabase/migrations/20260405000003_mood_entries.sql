-- Create mood entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
    mood_emoji TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Policies for mood_entries
DROP POLICY IF EXISTS "Patients can view their own mood entries" ON public.mood_entries;
CREATE POLICY "Patients can view their own mood entries" ON public.mood_entries
    FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Patients can insert their own mood entries" ON public.mood_entries;
CREATE POLICY "Patients can insert their own mood entries" ON public.mood_entries
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Professionals can view mood entries of their patients" ON public.mood_entries;
CREATE POLICY "Professionals can view mood entries of their patients" ON public.mood_entries
    FOR SELECT USING (
        professional_id = public.get_professional_id(auth.uid())
    );

-- Function to send notification to professional when patient registers mood
CREATE OR REPLACE FUNCTION public.handle_mood_notification()
RETURNS TRIGGER AS $$
DECLARE
    prof_id UUID;
    patient_name TEXT;
    prof_user_id UUID;
BEGIN
    -- Get professional_id from patient's most recent appointment
    SELECT a.professional_id, p.first_name
    INTO prof_id, patient_name
    FROM public.appointments a
    JOIN public.profiles p ON p.user_id = a.patient_id
    WHERE a.patient_id = NEW.patient_id
      AND a.status = 'confirmed'
    ORDER BY a.scheduled_at DESC
    LIMIT 1;

    -- If no appointment found, try to get from NEW.professional_id if set
    IF prof_id IS NULL AND NEW.professional_id IS NOT NULL THEN
        prof_id := NEW.professional_id;
        SELECT first_name INTO patient_name
        FROM public.profiles
        WHERE user_id = NEW.patient_id;
    END IF;

    -- Only send notification if we found a professional
    IF prof_id IS NOT NULL THEN
        -- Get the user_id of the professional
        SELECT user_id INTO prof_user_id
        FROM public.professionals
        WHERE id = prof_id;

        -- Insert notification for professional
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            content
        ) VALUES (
            prof_user_id,
            'mood_update',
            'Nuevo estado de ánimo registrado',
            jsonb_build_object(
                'patientId', NEW.patient_id,
                'patientName', COALESCE(patient_name, 'Un paciente'),
                'moodScore', NEW.mood_score,
                'moodEmoji', NEW.mood_emoji,
                'entryId', NEW.id,
                'createdAt', NEW.created_at
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for mood notifications
DROP TRIGGER IF EXISTS mood_notification_trigger ON public.mood_entries;
CREATE TRIGGER mood_notification_trigger
    AFTER INSERT ON public.mood_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_mood_notification();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_mood_entries_patient_id ON public.mood_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_professional_id ON public.mood_entries(professional_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON public.mood_entries(created_at);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
