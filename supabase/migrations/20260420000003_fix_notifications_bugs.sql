-- ── Fix 1: Add missing updated_at column ────────────────────────────────────
-- The existing trigger update_notifications_updated_at calls update_updated_at_column()
-- which does NEW.updated_at = now(). Without this column the UPDATE fails silently,
-- so "mark as read" appeared to do nothing.
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ── Fix 2: Mood notification – send to the actual professional, not admin ────
-- Root cause: fallback #3 used ORDER BY created_at ASC which could pick an admin
-- who also has a row in the professionals table. Fix: require role = 'professional'.
-- Also fixes full name (first_name || last_name) throughout.
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
    -- 1. Find professional from patient's most recent non-cancelled appointment
    SELECT a.professional_id,
           TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, ''))
    INTO prof_id, patient_name
    FROM public.appointments a
    JOIN public.profiles p ON p.user_id = a.patient_id
    WHERE a.patient_id = NEW.patient_id
      AND a.status != 'cancelled'
    ORDER BY a.scheduled_at DESC
    LIMIT 1;

    -- 2. Fallback: professional_id stored directly on the mood entry
    IF prof_id IS NULL AND NEW.professional_id IS NOT NULL THEN
        prof_id := NEW.professional_id;
        SELECT TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
        INTO patient_name
        FROM public.profiles
        WHERE user_id = NEW.patient_id;
    END IF;

    -- 3. Final fallback: first user with role = 'professional' in the system.
    --    Joining user_roles ensures we never accidentally target an admin account.
    IF prof_id IS NULL THEN
        SELECT pr.id INTO prof_id
        FROM public.professionals pr
        JOIN public.user_roles ur ON ur.user_id = pr.user_id AND ur.role = 'professional'
        ORDER BY pr.created_at ASC
        LIMIT 1;

        SELECT TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
        INTO patient_name
        FROM public.profiles
        WHERE user_id = NEW.patient_id;
    END IF;

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

    -- Previous mood entry for this patient
    SELECT mood_emoji, mood_score
    INTO prev_emoji, prev_score
    FROM public.mood_entries
    WHERE patient_id = NEW.patient_id
      AND id != NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Build title with full name
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

-- ── Fix 3: send_notification helper – include last_name in patientName ───────
CREATE OR REPLACE FUNCTION public.send_notification(
    _user_id UUID,
    _type TEXT,
    _data JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email     TEXT;
    user_full_name TEXT;
BEGIN
    SELECT email,
           TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
    INTO user_email, user_full_name
    FROM profiles
    WHERE user_id = _user_id;

    INSERT INTO notifications (user_id, type, title, content)
    VALUES (
        _user_id,
        _type,
        CASE _type
            WHEN 'appointment_created'   THEN 'Nueva cita agendada'
            WHEN 'appointment_confirmed' THEN 'Cita confirmada'
            WHEN 'appointment_cancelled' THEN 'Cita cancelada'
            WHEN 'appointment_reminder'  THEN 'Recordatorio de cita'
            WHEN 'new_message'           THEN 'Nuevo mensaje'
            WHEN 'payment_received'      THEN 'Pago recibido'
            ELSE 'Notificación'
        END,
        jsonb_build_object(
            'email',       user_email,
            'patientName', COALESCE(NULLIF(user_full_name, ''), 'Paciente')
        ) || _data
    );
END;
$$;
