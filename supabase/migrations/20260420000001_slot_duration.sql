-- Agrega duración de sesión por bloque de disponibilidad
ALTER TABLE professional_availability
  ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER NOT NULL DEFAULT 60;
