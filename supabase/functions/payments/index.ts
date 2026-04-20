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
    // GET - List payments
    if (req.method === "GET") {
      const url = new URL(req.url);
      const role = url.searchParams.get("role");

      let query = supabaseClient
        .from("payments")
        .select(`
          *,
          appointment:appointment_id (
            scheduled_at,
            status
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
        const { data: prof } = await supabaseClient
          .from("professionals")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (prof) {
          query = query.eq("professional_id", prof.id);
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ payments: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create payment record
    if (req.method === "POST") {
      const body = await req.json();
      const { appointmentId, amount, professionalId, paymentMethod } = body;

      if (!amount || !professionalId) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // In a real implementation, you would:
      // 1. Integrate with a payment processor (Stripe, MercadoPago, etc.)
      // 2. Process the payment
      // 3. Store the transaction ID

      const { data, error } = await supabaseClient
        .from("payments")
        .insert({
          appointment_id: appointmentId,
          patient_id: user.id,
          professional_id: professionalId,
          amount,
          status: "pending",
          payment_method: paymentMethod,
          transaction_id: `PENDING-${Date.now()}`,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          payment: data,
          message: "Payment record created. Complete payment via external processor."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH - Update payment status (for admins/professionals)
    if (req.method === "PATCH") {
      const body = await req.json();
      const { paymentId, status, transactionId } = body;

      if (!paymentId || !status) {
        return new Response(
          JSON.stringify({ error: "Payment ID and status required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData: Record<string, unknown> = { status };
      if (transactionId) updateData.transaction_id = transactionId;

      const { data, error } = await supabaseClient
        .from("payments")
        .update(updateData)
        .eq("id", paymentId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ payment: data }),
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
