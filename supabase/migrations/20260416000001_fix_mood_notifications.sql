-- Fix 1: Update mood notification trigger to find professional from ANY
-- non-cancelled appointment, not just confirmed ones.
-- Previously it only searched confirmed appointments, which caused notifications
-- to be silently skipped during early testing when appointments are still pending.

CREATE OR REPLACE FUNCTION public.handle_mood_notification()
RETURNS TRIGGER AS $$
DECLARE
    prof_id UUID;
    patient_name TEXT;
    prof_user_id UUID;
BEGIN
    -- Look for the most recent non-cancelled appointment to find the professional
    SELECT a.professional_id, p.first_name
    INTO prof_id, patient_name
    FROM public.appointments a
    JOIN public.profiles p ON p.user_id = a.patient_id
    WHERE a.patient_id = NEW.patient_id
      AND a.status != 'cancelled'
    ORDER BY a.scheduled_at DESC
    LIMIT 1;

    -- Fallback: use professional_id stored directly on the mood entry
    IF prof_id IS NULL AND NEW.professional_id IS NOT NULL THEN
        prof_id := NEW.professional_id;
        SELECT first_name INTO patient_name
        FROM public.profiles
        WHERE user_id = NEW.patient_id;
    END IF;

    IF prof_id IS NOT NULL THEN
        SELECT user_id INTO prof_user_id
        FROM public.professionals
        WHERE id = prof_id;

        IF prof_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, type, title, content)
            VALUES (
                prof_user_id,
                'mood_update',
                'Nuevo estado de ánimo registrado',
                jsonb_build_object(
                    'patientId',   NEW.patient_id,
                    'patientName', COALESCE(patient_name, 'Un paciente'),
                    'moodScore',   NEW.mood_score,
                    'moodEmoji',   NEW.mood_emoji,
                    'entryId',     NEW.id,
                    'createdAt',   NEW.created_at
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 2: Enable REPLICA IDENTITY FULL so Supabase Realtime can send
-- filtered postgres_changes events (filter: user_id=eq.<id>) to clients.
-- Without this, filtered subscriptions silently receive no events.
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Fix 3: Add notifications table to the realtime publication if not already present.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END
$$;
