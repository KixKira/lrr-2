import { supabase } from "@/integrations/supabase/client";

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

// Template HTML para el email de confirmación
const confirmationEmailTemplate = (confirmationUrl: string, firstName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta - La Ruta Resiliente</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; }
    .logo { font-size: 24px; font-weight: bold; color: #7CB9A8; }
    .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
    .button { display: inline-block; padding: 14px 28px; background: #7CB9A8; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿 La Ruta Resiliente</div>
    </div>
    <div class="content">
      <h1>¡Bienvenido${firstName ? `, ${firstName}` : ''}!</h1>
      <p>Gracias por registrarte en La Ruta Resiliente. Estamos emocionados de acompañarte en tu viaje hacia el bienestar mental.</p>
      <p>Para completar tu registro, por favor confirma tu cuenta haciendo clic en el siguiente botón:</p>
      <center>
        <a href="${confirmationUrl}" class="button">Confirmar mi cuenta</a>
      </center>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; font-size: 12px; color: #6b7280;">${confirmationUrl}</p>
      <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
    </div>
    <div class="footer">
      <p>© 2026 La Ruta Resiliente. Todos los derechos reservados.</p>
      <p>Este email fue enviado automáticamente, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
`;

// Template para notificación al profesional
const professionalNotificationTemplate = (
  patientName: string,
  moodEmoji: string,
  moodLabel: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo estado de ánimo - La Ruta Resiliente</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; }
    .logo { font-size: 24px; font-weight: bold; color: #7CB9A8; }
    .content { background: #f9fafb; padding: 30px; border-radius: 12px; text-align: center; }
    .mood-emoji { font-size: 64px; margin: 20px 0; }
    .mood-label { font-size: 20px; font-weight: 600; color: #7CB9A8; }
    .patient-name { font-size: 18px; font-weight: 500; margin-bottom: 10px; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿 La Ruta Resiliente</div>
    </div>
    <div class="content">
      <h2>Nuevo registro de estado de ánimo</h2>
      <p class="patient-name">${patientName}</p>
      <div class="mood-emoji">${moodEmoji}</div>
      <p class="mood-label">Se siente ${moodLabel.toLowerCase()}</p>
      <p style="margin-top: 20px; color: #6b7280;">Ingresa al panel profesional para ver más detalles.</p>
    </div>
    <div class="footer">
      <p>© 2026 La Ruta Resiliente. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

// SIMULACIÓN: En desarrollo, solo mostramos en consola
// En producción, esto debe ir en un Supabase Edge Function
export async function sendConfirmationEmail(
  to: string,
  confirmationUrl: string,
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  // SIMULACIÓN - Desarrollo
  console.log("%c📧 EMAIL SIMULADO (Desarrollo)", "color: #7CB9A8; font-size: 14px; font-weight: bold;");
  console.log("Para:", to);
  console.log("Asunto: Confirma tu cuenta - La Ruta Resiliente");
  console.log("Link:", confirmationUrl);
  console.log("HTML generado:", confirmationEmailTemplate(confirmationUrl, firstName));

  // Para producción con Supabase Edge Functions, usa:
  // const { data, error } = await supabase.functions.invoke('send-email', {
  //   body: { to, subject, html }
  // })

  return { success: true };
}

// SIMULACIÓN: Notificación al profesional
export async function sendMoodNotificationToProfessional(
  to: string,
  patientName: string,
  moodEmoji: string,
  moodScore: number
): Promise<{ success: boolean; error?: string }> {
  const moodLabels = ["Muy mal", "Mal", "Regular", "Bien", "Muy bien"];
  const moodLabel = moodLabels[moodScore - 1] || "Regular";

  console.log("%c📧 NOTIFICACIÓN AL PROFESIONAL (Simulada)", "color: #7CB9A8; font-size: 14px; font-weight: bold;");
  console.log("Para:", to);
  console.log("Paciente:", patientName);
  console.log("Estado:", moodEmoji, moodLabel);

  return { success: true };
}

// Template HTML para email de confirmación de cita al paciente
const appointmentConfirmationTemplate = (
  patientName: string,
  professionalName: string,
  date: string,
  time: string,
  appointmentType: string,
  price: number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Confirmada - La Ruta Resiliente</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; }
    .logo { font-size: 24px; font-weight: bold; color: #7CB9A8; }
    .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
    .appointment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7CB9A8; }
    .detail-row { display: flex; margin: 10px 0; }
    .detail-label { font-weight: 600; width: 100px; color: #6b7280; }
    .detail-value { flex: 1; }
    .button { display: inline-block; padding: 14px 28px; background: #7CB9A8; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #6b7280; }
    .reminder { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿 La Ruta Resiliente</div>
    </div>
    <div class="content">
      <h1>¡Tu cita está confirmada!</h1>
      <p>Hola ${patientName},</p>
      <p>Tu cita ha sido agendada exitosamente. Aquí están los detalles:</p>

      <div class="appointment-box">
        <div class="detail-row">
          <span class="detail-label">Profesional:</span>
          <span class="detail-value">${professionalName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hora:</span>
          <span class="detail-value">${time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Modalidad:</span>
          <span class="detail-value">${appointmentType === "online" ? "Sesión Online (Videollamada)" : "Sesión Presencial"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Precio:</span>
          <span class="detail-value">$${price} (pago el día de la consulta)</span>
        </div>
      </div>

      <div class="reminder">
        <strong>💡 Recordatorio:</strong>
        <p style="margin: 5px 0 0 0;">El pago de $${price} se realizará el día de la consulta, antes de comenzar la sesión.</p>
      </div>

      <p>Si necesitas cancelar o reprogramar tu cita, por favor hazlo con al menos 24 horas de anticipación.</p>

      <center>
        <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard" class="button">Ver mis citas</a>
      </center>
    </div>
    <div class="footer">
      <p>© 2026 La Ruta Resiliente. Todos los derechos reservados.</p>
      <p>Este email fue enviado automáticamente, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
`;

// Template HTML para notificación al profesional de nueva cita
const newAppointmentNotificationTemplate = (
  professionalName: string,
  patientName: string,
  patientEmail: string,
  patientPhone: string,
  date: string,
  time: string,
  appointmentType: string,
  notes?: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Cita Agendada - La Ruta Resiliente</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; }
    .logo { font-size: 24px; font-weight: bold; color: #7CB9A8; }
    .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
    .appointment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7CB9A8; }
    .detail-row { display: flex; margin: 10px 0; }
    .detail-label { font-weight: 600; width: 120px; color: #6b7280; }
    .detail-value { flex: 1; }
    .notes { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 15px; font-style: italic; }
    .button { display: inline-block; padding: 14px 28px; background: #7CB9A8; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿 La Ruta Resiliente</div>
    </div>
    <div class="content">
      <h1>¡Nueva cita agendada!</h1>
      <p>Hola ${professionalName},</p>
      <p>Un paciente ha agendado una nueva cita contigo:</p>

      <div class="appointment-box">
        <h3 style="margin-top: 0;">Datos del paciente</h3>
        <div class="detail-row">
          <span class="detail-label">Nombre:</span>
          <span class="detail-value">${patientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${patientEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Teléfono:</span>
          <span class="detail-value">${patientPhone}</span>
        </div>

        <h3 style="margin-top: 20px;">Detalles de la cita</h3>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hora:</span>
          <span class="detail-value">${time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Modalidad:</span>
          <span class="detail-value">${appointmentType === "online" ? "Sesión Online" : "Sesión Presencial"}</span>
        </div>
        ${notes ? `
        <div class="notes">
          <strong>Notas del paciente:</strong><br>
          ${notes}
        </div>
        ` : ''}
      </div>

      <center>
        <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/professional-dashboard" class="button">Ver panel de citas</a>
      </center>
    </div>
    <div class="footer">
      <p>© 2026 La Ruta Resiliente. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

// SIMULACIÓN: Email de confirmación de cita al paciente
export async function sendAppointmentConfirmationEmail(
  to: string,
  patientName: string,
  professionalName: string,
  date: string,
  time: string,
  appointmentType: string,
  price: number
): Promise<{ success: boolean; error?: string }> {
  const html = appointmentConfirmationTemplate(
    patientName,
    professionalName,
    date,
    time,
    appointmentType,
    price
  );

  console.log("%c📧 CONFIRMACIÓN DE CITA AL PACIENTE (Simulada)", "color: #7CB9A8; font-size: 14px; font-weight: bold;");
  console.log("Para:", to);
  console.log("Paciente:", patientName);
  console.log("Fecha:", date, "Hora:", time);
  console.log("HTML:", html);

  return { success: true };
}

// ── Real email sending via Supabase Edge Function ─────────────────────────────

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNotes?: string;
  professionalId: string;
  scheduledAt: string;
  appointmentType: "online" | "in_person";
  price: number;
}

export async function sendAppointmentEmails(
  data: AppointmentEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.functions.invoke(
      "send-appointment-emails",
      { body: data }
    );
    if (error) {
      console.error("[sendAppointmentEmails] Edge function error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[sendAppointmentEmails] Error:", msg);
    return { success: false, error: msg };
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// SIMULACIÓN: Email de notificación al profesional
export async function sendNewAppointmentNotificationToProfessional(
  to: string,
  professionalName: string,
  patientName: string,
  patientEmail: string,
  patientPhone: string,
  date: string,
  time: string,
  appointmentType: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const html = newAppointmentNotificationTemplate(
    professionalName,
    patientName,
    patientEmail,
    patientPhone,
    date,
    time,
    appointmentType,
    notes
  );

  console.log("%c📧 NOTIFICACIÓN DE NUEVA CITA AL PROFESIONAL (Simulada)", "color: #7CB9A8; font-size: 14px; font-weight: bold;");
  console.log("Para profesional:", to);
  console.log("Paciente:", patientName);
  console.log("Fecha:", date, "Hora:", time);
  console.log("HTML:", html);

  return { success: true };
}

/*
═══════════════════════════════════════════════════════════════
PARA PRODUCCIÓN - SUPABASE EDGE FUNCTION
═══════════════════════════════════════════════════════════════

1. Crea un Edge Function:
   npx supabase functions new send-email

2. En supabase/functions/send-email/index.ts:

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  const { to, subject, html } = await req.json()

  const { data, error } = await resend.emails.send({
    from: 'La Ruta Resiliente <onboarding@resend.dev>',
    to: [to],
    subject,
    html,
  })

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 400 })
  }

  return new Response(JSON.stringify({ data }), { status: 200 })
})

3. Despliega:
   npx supabase functions deploy send-email

4. Agrega RESEND_API_KEY a los secrets:
   npx supabase secrets set RESEND_API_KEY=re_xxxxxxxx

5. En el frontend, reemplaza las funciones por:

   const { data, error } = await supabase.functions.invoke('send-email', {
     body: { to, subject, html }
   })

═══════════════════════════════════════════════════════════════
*/
