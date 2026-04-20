-- Update mood notification trigger to produce a descriptive title:
-- "María cambió su estado de ánimo de 😕 a 😊"  (when previous entry exists)
-- "María registró su estado de ánimo: 😊"        (first ever entry)

CREATE OR REPLACE FUNCTION public.handle_mood_notification()
RETURNS TRIGGER AS $$
DECLARE
    prof_id      UUID;
    patient_name TEXT;
    prof_user_id UUID;
    prev_emoji   TEXT;
    prev_score   INTEGER;
    notif_title  TEXT;
BEGIN
    -- Find professional from most recent non-cancelled appointment
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

    -- Nothing to notify if we still can't find a professional
    IF prof_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Resolve professional's auth user_id
    SELECT user_id INTO prof_user_id
    FROM public.professionals
    WHERE id = prof_id;

    IF prof_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Look up the patient's previous mood entry (most recent before this one)
    SELECT mood_emoji, mood_score
    INTO prev_emoji, prev_score
    FROM public.mood_entries
    WHERE patient_id = NEW.patient_id
      AND id != NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Build a human-readable title
    IF prev_emoji IS NOT NULL THEN
        notif_title := COALESCE(patient_name, 'Un paciente')
            || ' cambió su estado de ánimo de '
            || prev_emoji
            || ' a '
            || NEW.mood_emoji;
    ELSE
        notif_title := COALESCE(patient_name, 'Un paciente')
            || ' registró su estado de ánimo: '
            || NEW.mood_emoji;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, content)
    VALUES (
        prof_user_id,
        'mood_update',
        notif_title,
        jsonb_build_object(
            'patientId',     NEW.patient_id,
            'patientName',   COALESCE(patient_name, 'Un paciente'),
            'moodScore',     NEW.mood_score,
            'moodEmoji',     NEW.mood_emoji,
            'prevMoodScore', prev_score,
            'prevMoodEmoji', prev_emoji,
            'entryId',       NEW.id,
            'createdAt',     NEW.created_at
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
