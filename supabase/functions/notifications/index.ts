import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { corsHeaders } from "../_shared/cors.ts";

// Email service configuration (configure with your provider)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "notificaciones@mindcare.com";

interface NotificationPayload {
  type: "appointment_created" | "appointment_confirmed" | "appointment_cancelled" | "appointment_reminder" | "new_message" | "payment_received";
  userId: string;
  userEmail?: string;
  data?: Record<string, unknown>;
}

// Send email using Resend
const sendEmail = async (to: string, subject: string, html: string) => {
  if (!RESEND_API_KEY) {
    console.log("Email would be sent:", { to, subject, html });
    return { success: true, mock: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${await response.text()}`);
    }

    return { success: true, mock: false };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Generate email templates
const getEmailTemplate = (type: string, data?: Record<string, unknown>) => {
  const templates: Record<string, { subject: string; html: string }> = {
    appointment_created: {
      subject: "Nueva cita agendada - MindCare",
      html: `
        <h2>¡Tu cita ha sido agendada!</h2>
        <p>Hola ${data?.patientName || ""},</p>
        <p>Tu cita ha sido programada exitosamente:</p>
        <ul>
          <li><strong>Fecha:</strong> ${data?.date || ""}</li>
          <li><strong>Hora:</strong> ${data?.time || ""}</li>
          <li><strong>Profesional:</strong> ${data?.professionalName || ""}</li>
          <li><strong>Tipo:</strong> ${data?.type === "online" ? "Sesión Online" : "Consulta Presencial"}</li>
        </ul>
        <p>Te recordaremos 24 horas antes de tu cita.</p>
        <p>Saludos,<br>Equipo MindCare</p>
      `,
    },
    appointment_confirmed: {
      subject: "Cita confirmada - MindCare",
      html: `
        <h2>¡Tu cita ha sido confirmada!</h2>
        <p>Hola ${data?.patientName || ""},</p>
        <p>Tu profesional ha confirmado tu cita:</p>
        <ul>
          <li><strong>Fecha:</strong> ${data?.date || ""}</li>
          <li><strong>Hora:</strong> ${data?.time || ""}</li>
        </ul>
        <p>¡Te esperamos!</p>
        <p>Saludos,<br>Equipo MindCare</p>
      `,
    },
    appointment_cancelled: {
      subject: "Cita cancelada - MindCare",
      html: `
        <h2>Cita cancelada</h2>
        <p>Hola ${data?.patientName || ""},</p>
        <p>Tu cita del ${data?.date || ""} a las ${data?.time || ""} ha sido cancelada.</p>
        <p>Si deseas reagendar, por favor visita nuestra plataforma.</p>
        <p>Saludos,<br>Equipo MindCare</p>
      `,
    },
    appointment_reminder: {
      subject: "Recordatorio de cita - MindCare",
      html: `
        <h2>Recordatorio de tu cita</h2>
        <p>Hola ${data?.patientName || ""},</p>
        <p>Te recordamos que tienes una cita programada:</p>
        <ul>
          <li><strong>Fecha:</strong> ${data?.date || ""}</li>
          <li><strong>Hora:</strong> ${data?.time || ""}</li>
          <li><strong>Profesional:</strong> ${data?.professionalName || ""}</li>
        </ul>
        ${data?.type === "online"
          ? `<p>Enlace para la sesión online: <a href="${data?.meetingLink || "#"}">Acceder a la videollamada</a></p>`
          : "<p>Ubicación: Maracay, Venezuela</p>"}
        <p>Saludos,<br>Equipo MindCare</p>
      `,
    },
    new_message: {
      subject: "Nuevo mensaje - MindCare",
      html: `
        <h2>Tienes un nuevo mensaje</h2>
        <p>Hola,</p>
        <p>${data?.senderName || "Alguien"} te ha enviado un mensaje:</p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;">
          ${data?.messagePreview || ""}
        </blockquote>
        <p><a href="${data?.appUrl || "#"}">Ver mensaje completo</a></p>
        <p>Saludos,<br>Equipo MindCare</p>
      `,
    },
    payment_received: {
      subject: "Pago recibido - MindCare",
      html: `
        <h2>Pago confirmado</h2>
        <p>Hola ${data?.patientName || ""},</p>
        <p>Hemos recibido tu pago exitosamente:</p>
        <ul>
          <li><strong>Monto:</strong> $${data?.amount || ""}</li>
          <li><strong>Cita:</strong> ${data?.date || ""}</li>
          <li><strong>Transacción:</strong> ${data?.transactionId || ""}</li>
        </ul>
        <p>Gracias por confiar en nosotros.</p>
        <p>Saludos,<br>Equipo MindCare</p>
      `,
    },
  };

  return templates[type] || { subject: "Notificación - MindCare", html: "<p>Tienes una nueva notificación</p>" };
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Create Supabase client with service role
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // POST - Send notification
    if (req.method === "POST") {
      const payload: NotificationPayload = await req.json();
      const { type, userId, userEmail, data } = payload;

      // Get user email if not provided
      let email = userEmail;
      if (!email && userId) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("email, first_name")
          .eq("user_id", userId)
          .single();

        if (profile) {
          email = profile.email;
          if (!data?.patientName && profile.first_name) {
            data!.patientName = profile.first_name;
          }
        }
      }

      if (!email) {
        return new Response(
          JSON.stringify({ error: "User email not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get email template
      const template = getEmailTemplate(type, data);

      // Send email
      const result = await sendEmail(email, template.subject, template.html);

      // Store notification in database
      await supabaseClient
        .from("notifications")
        .insert({
          user_id: userId,
          type,
          title: template.subject,
          content: data,
          email_sent: result.success,
        });

      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Webhook endpoint for database triggers
    if (req.method === "PUT") {
      const payload = await req.json();
      const { table, record, type: eventType } = payload;

      // Handle appointment events
      if (table === "appointments") {
        const { data: appointmentData } = await supabaseClient
          .from("appointments")
          .select(`
            *,
            patient:patient_id (email, first_name),
            professional:professional_id (
              profiles:user_id (first_name)
            )
          `)
          .eq("id", record.id)
          .single();

        if (!appointmentData) return new Response("ok");

        const scheduledDate = new Date(appointmentData.scheduled_at);
        const dateStr = scheduledDate.toLocaleDateString("es-ES");
        const timeStr = scheduledDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

        if (eventType === "INSERT") {
          // Notify patient
          await sendEmail(
            appointmentData.patient.email,
            "Nueva cita agendada - MindCare",
            getEmailTemplate("appointment_created", {
              patientName: appointmentData.patient.first_name,
              date: dateStr,
              time: timeStr,
              professionalName: appointmentData.professional?.profiles?.first_name,
              type: appointmentData.appointment_type,
            }).html
          );
        } else if (eventType === "UPDATE" && record.status === "confirmed") {
          // Notify patient of confirmation
          await sendEmail(
            appointmentData.patient.email,
            "Cita confirmada - MindCare",
            getEmailTemplate("appointment_confirmed", {
              patientName: appointmentData.patient.first_name,
              date: dateStr,
              time: timeStr,
            }).html
          );
        } else if (eventType === "UPDATE" && record.status === "cancelled") {
          // Notify patient of cancellation
          await sendEmail(
            appointmentData.patient.email,
            "Cita cancelada - MindCare",
            getEmailTemplate("appointment_cancelled", {
              patientName: appointmentData.patient.first_name,
              date: dateStr,
              time: timeStr,
            }).html
          );
        }
      }

      return new Response("ok");
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
