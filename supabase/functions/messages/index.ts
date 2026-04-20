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
    // GET - List conversations or messages
    if (req.method === "GET") {
      const url = new URL(req.url);
      const receiverId = url.searchParams.get("receiverId");

      if (receiverId) {
        // Get messages with specific user
        const { data, error } = await supabaseClient
          .from("messages")
          .select(`
            *,
            sender:sender_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Mark messages as read
        await supabaseClient
          .from("messages")
          .update({ is_read: true })
          .eq("receiver_id", user.id)
          .eq("sender_id", receiverId)
          .eq("is_read", false);

        return new Response(
          JSON.stringify({ messages: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Get all conversations
        const { data, error } = await supabaseClient
          .from("messages")
          .select(`
            *,
            sender:sender_id (
              first_name,
              last_name,
              avatar_url
            ),
            receiver:receiver_id (
              first_name,
              last_name
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Group by conversation partner
        const conversations = new Map();
        data?.forEach((msg) => {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          if (!conversations.has(partnerId)) {
            conversations.set(partnerId, {
              partner_id: partnerId,
              partner_name: msg.sender_id === user.id
                ? `${msg.receiver?.first_name || ""} ${msg.receiver?.last_name || ""}`.trim()
                : `${msg.sender?.first_name || ""} ${msg.sender?.last_name || ""}`.trim(),
              partner_avatar: msg.sender_id === user.id ? null : msg.sender?.avatar_url,
              last_message: msg.content,
              last_message_at: msg.created_at,
              unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
            });
          } else if (msg.receiver_id === user.id && !msg.is_read) {
            const conv = conversations.get(partnerId);
            conv.unread_count += 1;
          }
        });

        return new Response(
          JSON.stringify({ conversations: Array.from(conversations.values()) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // POST - Send message
    if (req.method === "POST") {
      const body = await req.json();
      const { receiverId, content } = body;

      if (!receiverId || !content) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabaseClient
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH - Mark messages as read
    if (req.method === "PATCH") {
      const body = await req.json();
      const { senderId } = body;

      if (!senderId) {
        return new Response(
          JSON.stringify({ error: "Sender ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabaseClient
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", senderId)
        .eq("is_read", false);

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
