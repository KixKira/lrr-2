import { supabase } from "@/integrations/supabase/client";

const PROFESSIONAL_EMAIL = "psicomaria17@gmail.com";

let cachedId: string | null = null;

/** Returns María José's professionals.id (cached after first call). */
export async function getProfessionalId(): Promise<string | null> {
  if (cachedId) return cachedId;

  // Step 1: get user_id from profiles by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", PROFESSIONAL_EMAIL)
    .maybeSingle();

  if (profile?.user_id) {
    const { data: prof } = await supabase
      .from("professionals")
      .select("id")
      .eq("user_id", profile.user_id)
      .maybeSingle();
    cachedId = prof?.id ?? null;
  }

  // Fallback: take the only professional in the table
  if (!cachedId) {
    const { data: fallback } = await supabase
      .from("professionals")
      .select("id")
      .limit(1)
      .maybeSingle();
    cachedId = fallback?.id ?? null;
  }

  return cachedId;
}
