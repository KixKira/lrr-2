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

  // Get professional_id
  const { data: professional } = await supabaseClient
    .from("professionals")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!professional) {
    return new Response(
      JSON.stringify({ error: "Not a professional" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // GET - List notes for a patient
    if (req.method === "GET") {
      const url = new URL(req.url);
      const patientId = url.searchParams.get("patientId");

      let query = supabaseClient
        .from("clinical_notes")
        .select(`
          *,
          appointment:appointment_id (
            scheduled_at,
            status
          )
        `)
        .eq("professional_id", professional.id);

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ notes: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create note
    if (req.method === "POST") {
      const body = await req.json();
      const { patientId, appointmentId, content, isPrivate = true } = body;

      if (!patientId || !content) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabaseClient
        .from("clinical_notes")
        .insert({
          professional_id: professional.id,
          patient_id: patientId,
          appointment_id: appointmentId,
          content,
          is_private: isPrivate,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ note: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH - Update note
    if (req.method === "PATCH") {
      const body = await req.json();
      const { noteId, content, isPrivate } = body;

      if (!noteId) {
        return new Response(
          JSON.stringify({ error: "Note ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData: Record<string, unknown> = {};
      if (content) updateData.content = content;
      if (isPrivate !== undefined) updateData.is_private = isPrivate;

      const { data, error } = await supabaseClient
        .from("clinical_notes")
        .update(updateData)
        .eq("id", noteId)
        .eq("professional_id", professional.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ note: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete note
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const noteId = url.searchParams.get("noteId");

      if (!noteId) {
        return new Response(
          JSON.stringify({ error: "Note ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabaseClient
        .from("clinical_notes")
        .delete()
        .eq("id", noteId)
        .eq("professional_id", professional.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
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
