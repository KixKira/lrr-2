import { supabase } from "@/integrations/supabase/client";
import { sendMoodNotificationToProfessional } from "./email";
import { getProfessionalId } from "./professional";

export interface MoodEntry {
  id: string;
  patient_id: string;
  professional_id: string | null;
  mood_score: number;
  mood_emoji: string;
  notes: string | null;
  created_at: string;
}

export interface CreateMoodEntryInput {
  mood_score: number;
  mood_emoji: string;
  notes?: string;
}

const moodEmojis = ["😢", "😕", "😐", "🙂", "😊"];

export async function createMoodEntry(input: CreateMoodEntryInput): Promise<MoodEntry> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Debes iniciar sesión para registrar tu estado de ánimo");
  }

  // Get patient profile
  const { data: patientProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .single();

  const patientName = patientProfile
    ? `${patientProfile.first_name || ""} ${patientProfile.last_name || ""}`.trim()
    : "Un paciente";

  // Always link to María José (the only professional in the system)
  const professionalId = await getProfessionalId();

  // Get her email for the email notification
  let professionalEmail: string | null = null;
  if (professionalId) {
    const { data: proProfile } = await supabase
      .from("professionals")
      .select("profiles(email)")
      .eq("id", professionalId)
      .maybeSingle();
    professionalEmail = proProfile?.profiles?.email ?? null;
  }

  const { data, error } = await supabase
    .from("mood_entries")
    .insert({
      patient_id: user.id,
      professional_id: professionalId,
      mood_score: input.mood_score,
      mood_emoji: input.mood_emoji,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating mood entry:", error);
    throw new Error(error.message);
  }

  // Send email notification to professional (non-blocking)
  if (professionalEmail) {
    sendMoodNotificationToProfessional(
      professionalEmail,
      patientName,
      input.mood_emoji,
      input.mood_score
    ).catch(console.error);
  }

  return data as MoodEntry;
}

export async function getMyMoodEntries(daysBack = 30): Promise<MoodEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  cutoff.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("patient_id", user.id)
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching mood entries:", error);
    throw new Error(error.message);
  }

  return (data as MoodEntry[]) || [];
}

export async function getPatientMoodEntries(patientId: string): Promise<MoodEntry[]> {
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching patient mood entries:", error);
    throw new Error(error.message);
  }

  return (data as MoodEntry[]) || [];
}

export function getMoodEmoji(score: number): string {
  return moodEmojis[score - 1] || "😐";
}

export function getMoodLabel(score: number): string {
  const labels = [
    "Muy mal",
    "Mal",
    "Regular",
    "Bien",
    "Muy bien",
  ];
  return labels[score - 1] || "Regular";
}
