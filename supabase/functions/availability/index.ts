import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { corsHeaders } from "../_shared/cors.ts";

interface AvailabilitySlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: "online" | "presencial";
  slotDuration: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Create Supabase client with auth
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
    // GET - List availability
    if (req.method === "GET") {
      const url = new URL(req.url);
      const professionalId = url.searchParams.get("professionalId");
      const date = url.searchParams.get("date");

      // Get availability settings
      let query = supabaseClient
        .from("professional_availability")
        .select("*, professionals(id, user_id, available_online, available_in_person)")
        .eq("is_available", true);

      if (professionalId) {
        query = query.eq("professional_id", professionalId);
      } else {
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

      const { data: availabilityData, error } = await query;

      if (error) {
        throw error;
      }

      // Get existing appointments for the date if provided
      let bookedSlots: string[] = [];
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: appointments, error: apptError } = await supabaseClient
          .from("appointments")
          .select("scheduled_at")
          .gte("scheduled_at", startOfDay.toISOString())
          .lte("scheduled_at", endOfDay.toISOString())
          .not("status", "eq", "cancelled");

        if (!apptError && appointments) {
          bookedSlots = appointments.map((a) => {
            const d = new Date(a.scheduled_at);
            return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
          });
        }
      }

      // Transform data for frontend
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const availability: AvailabilitySlot[] = (availabilityData || []).map((slot) => ({
        id: slot.id,
        dayOfWeek: dayNames[slot.day_of_week],
        startTime: slot.start_time,
        endTime: slot.end_time,
        type: slot.professionals?.available_online ? "online" : "presencial",
        slotDuration: 60, // Default 60 minutes
      }));

      return new Response(
        JSON.stringify({
          availability,
          bookedSlots,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Save availability slots
    if (req.method === "POST") {
      const body = await req.json();
      const { slots } = body;

      if (!slots || !Array.isArray(slots) || slots.length === 0) {
        return new Response(
          JSON.stringify({ error: "Slots array is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get professional_id from user_id, auto-create if not found
      let { data: prof } = await supabaseClient
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!prof) {
        const { data: newProf, error: createError } = await supabaseClient
          .from("professionals")
          .insert({ user_id: user.id, specialty: "Sin especificar" })
          .select("id")
          .single();

        if (createError || !newProf) {
          return new Response(
            JSON.stringify({ error: "No se pudo crear el perfil profesional: " + (createError?.message ?? "Error desconocido") }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        prof = newProf;
      }

      // Insert slots
      const slotsToInsert = slots.map((slot: { dayOfWeek: number; startTime: string; endTime: string }) => ({
        professional_id: prof.id,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
        is_available: true,
      }));

      const { data, error } = await supabaseClient
        .from("professional_availability")
        .insert(slotsToInsert)
        .select();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, slots: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete availability slot
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const slotId = url.searchParams.get("slotId");

      if (!slotId) {
        return new Response(
          JSON.stringify({ error: "slotId is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the slot belongs to the current professional
      const { data: prof } = await supabaseClient
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!prof) {
        return new Response(
          JSON.stringify({ error: "Professional not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete the slot
      const { error } = await supabaseClient
        .from("professional_availability")
        .delete()
        .eq("id", slotId)
        .eq("professional_id", prof.id);

      if (error) {
        throw error;
      }

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
