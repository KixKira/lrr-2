import { supabase } from "@/integrations/supabase/client";

export interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Patient {
  id: string;       // profile row id
  user_id: string;  // auth.uid()
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

// Sube un archivo al bucket y crea el registro en la tabla
export async function uploadMaterial(
  file: File,
  title: string,
  description?: string,
): Promise<Material> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("materials")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage.from("materials").getPublicUrl(path);

  const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
  const fileType = ext.toUpperCase();

  const { data, error } = await (supabase as any)
    .from("downloadable_materials")
    .insert({
      title,
      description: description || null,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: fileType,
      file_size: sizeMB,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Material;
}

// Obtiene todos los materiales (para profesionales/admins)
export async function getAllMaterials(): Promise<Material[]> {
  const { data, error } = await (supabase as any)
    .from("downloadable_materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Material[]) ?? [];
}

// Obtiene los materiales asignados al usuario actual (para pacientes)
export async function getMyAssignedMaterials(): Promise<Material[]> {
  const { data, error } = await (supabase as any)
    .from("patient_materials")
    .select("downloadable_materials(*)")
    .order("assigned_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as any[]) ?? [])
    .map((row: any) => row.downloadable_materials)
    .filter(Boolean) as Material[];
}

// Asigna un material a un paciente (upsert para no duplicar)
export async function assignMaterialToPatient(
  materialId: string,
  patientUserId: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await (supabase as any)
    .from("patient_materials")
    .upsert(
      { material_id: materialId, patient_id: patientUserId, assigned_by: user?.id },
      { onConflict: "material_id,patient_id" },
    );

  if (error) throw new Error(error.message);
}

// Quita la asignación de un material a un paciente
export async function unassignMaterial(
  materialId: string,
  patientUserId: string,
): Promise<void> {
  const { error } = await (supabase as any)
    .from("patient_materials")
    .delete()
    .eq("material_id", materialId)
    .eq("patient_id", patientUserId);

  if (error) throw new Error(error.message);
}

// Elimina material (registro + archivo en storage)
export async function deleteMaterial(material: Material): Promise<void> {
  try {
    const url = new URL(material.file_url);
    const parts = url.pathname.split("/materials/");
    if (parts.length > 1) {
      await supabase.storage.from("materials").remove([parts[1]]);
    }
  } catch {
    // ignorar error de storage; igual eliminamos el registro
  }

  const { error } = await (supabase as any)
    .from("downloadable_materials")
    .delete()
    .eq("id", material.id);

  if (error) throw new Error(error.message);
}

// Obtiene los pacientes visibles para el usuario actual (vía citas)
export async function getMyPatients(): Promise<Patient[]> {
  const { data: aptsData, error: aptsError } = await supabase
    .from("appointments")
    .select("patient_id");

  if (aptsError) throw new Error(aptsError.message);

  const uniqueIds = [...new Set((aptsData ?? []).map((a) => a.patient_id))].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, user_id, first_name, last_name, email")
    .in("user_id", uniqueIds);

  if (profilesError) throw new Error(profilesError.message);
  return (profilesData as Patient[]) ?? [];
}

// Devuelve los IDs de pacientes que ya tienen asignado un material
export async function getMaterialPatientIds(materialId: string): Promise<string[]> {
  const { data, error } = await (supabase as any)
    .from("patient_materials")
    .select("patient_id")
    .eq("material_id", materialId);

  if (error) throw new Error(error.message);
  return ((data as any[]) ?? []).map((row: any) => row.patient_id as string);
}

// Descarga un archivo como blob para forzar el diálogo del navegador
export async function downloadMaterialFile(
  fileUrl: string,
  fileName: string,
): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Error al descargar");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.open(fileUrl, "_blank");
  }
}
