-- Tabla de materiales descargables
CREATE TABLE IF NOT EXISTS downloadable_materials (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT        NOT NULL,
  description  TEXT,
  file_url     TEXT        NOT NULL,
  file_name    TEXT        NOT NULL,
  file_type    TEXT        NOT NULL DEFAULT 'PDF',
  file_size    TEXT,
  created_by   UUID,                          -- auth.uid() del profesional/admin que lo subió
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de asignaciones de material a pacientes
CREATE TABLE IF NOT EXISTS patient_materials (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID        NOT NULL REFERENCES downloadable_materials(id) ON DELETE CASCADE,
  patient_id  UUID        NOT NULL,           -- auth.uid() del paciente
  assigned_by UUID,                           -- auth.uid() de quien asignó
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(material_id, patient_id)
);

-- Habilitar RLS
ALTER TABLE downloadable_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_materials ENABLE ROW LEVEL SECURITY;

-- Políticas para downloadable_materials
CREATE POLICY "professionals_admins_full_access_materials"
  ON downloadable_materials FOR ALL
  USING  (has_role(auth.uid(), 'professional'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'professional'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "patients_view_assigned_materials"
  ON downloadable_materials FOR SELECT
  USING (
    has_role(auth.uid(), 'patient'::app_role) AND
    EXISTS (
      SELECT 1 FROM patient_materials pm
      WHERE pm.material_id = downloadable_materials.id
        AND pm.patient_id  = auth.uid()
    )
  );

-- Políticas para patient_materials
CREATE POLICY "professionals_admins_manage_assignments"
  ON patient_materials FOR ALL
  USING  (has_role(auth.uid(), 'professional'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'professional'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "patients_view_own_assignments"
  ON patient_materials FOR SELECT
  USING (patient_id = auth.uid());

-- Bucket de almacenamiento para materiales (público para descarga directa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para el bucket materials
DO $$ BEGIN
  CREATE POLICY "professionals_admins_upload_materials"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'materials' AND
      (has_role(auth.uid(), 'professional'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "professionals_admins_update_materials"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
      bucket_id = 'materials' AND
      (has_role(auth.uid(), 'professional'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "professionals_admins_delete_materials"
    ON storage.objects FOR DELETE TO authenticated
    USING (
      bucket_id = 'materials' AND
      (has_role(auth.uid(), 'professional'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "public_read_materials"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'materials');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
