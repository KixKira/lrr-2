-- Rewrite all notification triggers to send ONLY to the professional.
-- For a single-professional app, the recipient is always the user with
-- role = 'professional' in user_roles — no complex lookup chains needed.

-- ── Helper: resolve the professional's auth user_id ─────────────────────────
CREATE OR REPLACE FUNCTION public.get_professional_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT pr.user_id
    FROM public.professionals pr
    JOIN public.user_roles ur
      ON ur.user_id = pr.user_id
     AND ur.role = 'professional'
    ORDER BY pr.created_at ASC
    LIMIT 1;
$$;

-- ── Appointment notifications → professional only ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
    prof_user_id UUID;
    patient_name TEXT;
BEGIN
    prof_user_id := public.get_professional_user_id();
    IF prof_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
    INTO patient_name
    FROM public.profiles
    WHERE user_id = NEW.patient_id;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.notifications (user_id, type, title, content)
        VALUES (
            prof_user_id,
            'appointment_created',
            'Nueva cita agendada',
            jsonb_build_object(
                'appointmentId', NEW.id,
                'date',          NEW.scheduled_at,
                'type',          NEW.appointment_type,
                'patientName',   COALESCE(NULLIF(patient_name, ''), 'Un paciente')
            )
        );

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
            INSERT INTO public.notifications (user_id, type, title, content)
            VALUES (
                prof_user_id,
                'appointment_confirmed',
                'Cita confirmada',
                jsonb_build_object(
                    'appointmentId', NEW.id,
                    'date',          NEW.scheduled_at,
                    'patientName',   COALESCE(NULLIF(patient_name, ''), 'Un paciente')
                )
            );
        ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
            INSERT INTO public.notifications (user_id, type, title, content)
            VALUES (
                prof_user_id,
                'appointment_cancelled',
                'Cita cancelada',
                jsonb_build_object(
                    'appointmentId', NEW.id,
                    'date',          NEW.scheduled_at,
                    'patientName',   COALESCE(NULLIF(patient_name, ''), 'Un paciente')
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Mood notifications → professional only ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_mood_notification()
RETURNS TRIGGER AS $$
DECLARE
    prof_user_id UUID;
    patient_name TEXT;
    prev_emoji   TEXT;
    prev_score   INTEGER;
    notif_title  TEXT;
BEGIN
    prof_user_id := public.get_professional_user_id();
    IF prof_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
    INTO patient_name
    FROM public.profiles
    WHERE user_id = NEW.patient_id;

    SELECT mood_emoji, mood_score
    INTO prev_emoji, prev_score
    FROM public.mood_entries
    WHERE patient_id = NEW.patient_id
      AND id != NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    IF prev_emoji IS NOT NULL THEN
        notif_title := COALESCE(NULLIF(TRIM(patient_name), ''), 'Un paciente')
            || ' cambió su estado de ánimo de '
            || prev_emoji || ' a ' || NEW.mood_emoji;
    ELSE
        notif_title := COALESCE(NULLIF(TRIM(patient_name), ''), 'Un paciente')
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
            'patientName',   COALESCE(NULLIF(TRIM(patient_name), ''), 'Un paciente'),
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

-- ── updated_at column (fixes mark-as-read silently failing) ─────────────────
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
