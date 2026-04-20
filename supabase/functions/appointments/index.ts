import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Create Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization") || "" },
      },
    }
  );

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // GET - List appointments
    if (req.method === "GET") {
      const url = new URL(req.url);
      const role = url.searchParams.get("role");

      let query = supabaseClient
        .from("appointments")
        .select(`
          *,
          professional:professional_id (
            id,
            specialty,
            price_per_session,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url
            )
          ),
          patient:patient_id (
            first_name,
            last_name,
            email
          )
        `);

      if (role === "patient") {
        query = query.eq("patient_id", user.id);
      } else if (role === "professional") {
        // Get professional_id from user_id
        const { data: prof } = await supabaseClient
          .from("professionals")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (prof) {
          query = query.eq("professional_id", prof.id);
        }
      }

      const { data, error } = await query.order("scheduled_at", { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ appointments: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create appointment
    if (req.method === "POST") {
      const body = await req.json();
      const {
        professionalId,
        scheduledAt,
        durationMinutes = 60,
        appointmentType = "online",
        notes,
        price,
      } = body;

      if (!professionalId || !scheduledAt) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabaseClient
        .from("appointments")
        .insert({
          patient_id: user.id,
          professional_id: professionalId,
          scheduled_at: scheduledAt,
          duration_minutes: durationMinutes,
          appointment_type: appointmentType,
          status: "pending",
          notes,
          price,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ appointment: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH - Update appointment
    if (req.method === "PATCH") {
      const body = await req.json();
      const { appointmentId, status, notes } = body;

      if (!appointmentId) {
        return new Response(
          JSON.stringify({ error: "Appointment ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData: Record<string, unknown> = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabaseClient
        .from("appointments")
        .update(updateData)
        .eq("id", appointmentId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ appointment: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
