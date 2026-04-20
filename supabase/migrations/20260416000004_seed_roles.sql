-- Seed definitive roles:
--   psicomaria17@gmail.com → professional  (única profesional del sistema)
--   oemqkix@gmail.com      → admin

DO $$
DECLARE
    v_maria_uid  UUID;
    v_admin_uid  UUID;
BEGIN
    -- Resolve user IDs from the profiles table (populated on sign-up)
    SELECT user_id INTO v_maria_uid
    FROM public.profiles
    WHERE email = 'psicomaria17@gmail.com'
    LIMIT 1;

    SELECT user_id INTO v_admin_uid
    FROM public.profiles
    WHERE email = 'oemqkix@gmail.com'
    LIMIT 1;

    -- ── María José ────────────────────────────────────────────────
    IF v_maria_uid IS NOT NULL THEN
        -- Ensure professional role exists
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_maria_uid, 'professional')
        ON CONFLICT DO NOTHING;

        -- Remove patient role if present (she is a professional, not a patient)
        DELETE FROM public.user_roles
        WHERE user_id = v_maria_uid AND role = 'patient';

        -- Ensure a professionals record exists
        INSERT INTO public.professionals (user_id, specialty)
        VALUES (v_maria_uid, 'Psicología Clínica')
        ON CONFLICT (user_id) DO UPDATE
            SET specialty = EXCLUDED.specialty;
    END IF;

    -- ── Admin ──────────────────────────────────────────────────────
    IF v_admin_uid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_admin_uid, 'admin')
        ON CONFLICT DO NOTHING;
    END IF;
END
$$;
