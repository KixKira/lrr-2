import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { corsHeaders } from "../_shared/cors.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getUserIdFromSession(req: Request, adminClient: SupabaseClient): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await userClient.auth.getUser();
  return user?.id ?? null;
}

async function createPatientAccount(
  adminClient: SupabaseClient,
  email: string,
  name: string,
  phone: string | undefined,
): Promise<{ userId: string; error?: string }> {
  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (createError || !newUser?.user) {
    return { userId: "", error: createError?.message ?? "Error creando usuario" };
  }

  const userId = newUser.user.id;

  if (phone) {
    await adminClient.from("profiles").update({ phone }).eq("user_id", userId);
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "https://larutaresiliente.com";
  await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl}/auth?mode=set-password` },
  });

  return { userId };
}

async function resolvePatient(
  req: Request,
  adminClient: SupabaseClient,
  email: string,
  name: string,
  phone: string | undefined,
): Promise<{ patientUserId: string; isNewUser: boolean; error?: string }> {
  const sessionUserId = await getUserIdFromSession(req, adminClient);
  if (sessionUserId) return { patientUserId: sessionUserId, isNewUser: false };

  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) return { patientUserId: existingProfile.user_id, isNewUser: false };

  const { userId, error } = await createPatientAccount(adminClient, email, name, phone);
  if (error) return { patientUserId: "", isNewUser: false, error };
  return { patientUserId: userId, isNewUser: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    const { name, email, phone, professionalId, scheduledAt, durationMinutes = 60, appointmentType = "online", notes, price } = await req.json();

    if (!email || !name || !professionalId || !scheduledAt) {
      return jsonResponse({ error: "Faltan campos requeridos" }, 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: "Email inválido" }, 400);
    }

    const { data: professional } = await adminClient
      .from("professionals").select("id").eq("id", professionalId).maybeSingle();
    if (!professional) return jsonResponse({ error: "El profesional no existe" }, 404);

    const { count: slotCount } = await adminClient
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", professionalId)
      .eq("scheduled_at", scheduledAt)
      .in("status", ["pending", "confirmed"]);
    if ((slotCount ?? 0) > 0) return jsonResponse({ error: "Este horario ya no está disponible" }, 409);

    const { patientUserId, isNewUser, error: patientError } = await resolvePatient(req, adminClient, email, name, phone);
    if (patientError) return jsonResponse({ error: patientError }, 400);

    const { data: appointment, error: appointmentError } = await adminClient
      .from("appointments")
      .insert({ patient_id: patientUserId, professional_id: professionalId, scheduled_at: scheduledAt, duration_minutes: durationMinutes, appointment_type: appointmentType, status: "pending", notes, price })
      .select()
      .single();

    if (appointmentError) return jsonResponse({ error: appointmentError.message }, 500);

    return jsonResponse({ appointment, isNewUser });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
