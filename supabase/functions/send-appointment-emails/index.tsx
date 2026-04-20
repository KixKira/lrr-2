/** @jsxImportSource npm:react@18.3.1 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { Resend } from "npm:resend@4.0.0";
import { render } from "npm:@react-email/render@1.0.5";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "npm:@react-email/components@0.0.28";
import { corsHeaders } from "../_shared/cors.ts";

// ── Shared styles ─────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#F3F4F6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  margin: "0",
  padding: "20px 0",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#7CB9A8",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logo = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#FFFFFF",
  margin: "0",
  letterSpacing: "0.3px",
};

const hero = {
  padding: "32px 32px 24px",
  textAlign: "center" as const,
  backgroundColor: "#EDF7F4",
  borderBottom: "1px solid #D1E9E3",
};

const heroIcon = {
  fontSize: "40px",
  margin: "0 0 12px",
  lineHeight: "1",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1F2937",
  margin: "0 0 6px",
  lineHeight: "1.3",
};

const heroSubtitle = {
  fontSize: "15px",
  color: "#6B7280",
  margin: "0",
};

const card = {
  padding: "24px 32px",
  borderBottom: "1px solid #F3F4F6",
};

const paymentCard = {
  padding: "24px 32px",
  backgroundColor: "#FFFBEB",
  borderBottom: "1px solid #FDE68A",
};

const notesCard = {
  padding: "24px 32px",
  backgroundColor: "#F0FDF4",
  borderBottom: "1px solid #BBF7D0",
};

const h2 = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#7CB9A8",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 12px",
};

const divider = {
  borderTop: "1px solid #E5E7EB",
  margin: "0 0 16px",
};

const detailRow = {
  marginBottom: "10px",
};

const detailLabel = {
  fontSize: "12px",
  color: "#9CA3AF",
  fontWeight: "600",
  paddingRight: "16px",
  width: "38%",
  verticalAlign: "top" as const,
};

const detailValue = {
  fontSize: "14px",
  color: "#1F2937",
  fontWeight: "500",
  verticalAlign: "top" as const,
};

const priceText = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#1F2937",
  textAlign: "center" as const,
  margin: "0 0 10px",
};

const bcvNote = {
  fontSize: "12px",
  color: "#92400E",
  backgroundColor: "#FEF3C7",
  padding: "10px 14px",
  borderRadius: "8px",
  margin: "0 0 20px",
  fontStyle: "italic" as const,
  lineHeight: "1.6",
};

const bankSectionTitle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 12px",
  borderTop: "1px dashed #D1FAE5",
  paddingTop: "16px",
};

const notesText = {
  fontSize: "14px",
  color: "#374151",
  fontStyle: "italic" as const,
  lineHeight: "1.7",
  margin: "0",
};

const ctaButton = {
  display: "inline-block" as const,
  backgroundColor: "#7CB9A8",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 32px",
  borderRadius: "8px",
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "24px 32px 8px",
};

const footer = {
  backgroundColor: "#F9FAFB",
  padding: "20px 32px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "11px",
  color: "#9CA3AF",
  margin: "3px 0",
  lineHeight: "1.5",
};

// ── Patient Confirmation Email ─────────────────────────────────────────────────

interface BankInfo {
  holder: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  ciRif: string;
}

interface PatientEmailProps {
  patientName: string;
  professionalName: string;
  professionalPhone: string;
  dateStr: string;
  timeStr: string;
  appointmentType: string;
  price: number;
  bankInfo: BankInfo;
  siteUrl: string;
}

function PatientConfirmationEmail({
  patientName,
  professionalName,
  professionalPhone,
  dateStr,
  timeStr,
  appointmentType,
  price,
  bankInfo,
  siteUrl,
}: PatientEmailProps) {
  const typeLabel =
    appointmentType === "online"
      ? "Sesión Online (Videollamada)"
      : "Sesión Presencial";

  const hasBankInfo =
    bankInfo.holder || bankInfo.bank || bankInfo.accountNumber;

  return (
    <Html lang="es">
      <Head />
      <Preview>
        Tu cita con {professionalName} está confirmada — {dateStr} a las{" "}
        {timeStr}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* ── Header ── */}
          <Section style={header}>
            <Text style={logo}>🌿 La Ruta Resiliente</Text>
          </Section>

          {/* ── Hero ── */}
          <Section style={hero}>
            <Text style={heroIcon}>✅</Text>
            <Heading as="h1" style={h1}>
              ¡Tu cita está confirmada!
            </Heading>
            <Text style={heroSubtitle}>
              Hola <strong>{patientName}</strong>, te esperamos
            </Text>
          </Section>

          {/* ── Tu psicóloga ── */}
          <Section style={card}>
            <Heading as="h2" style={h2}>
              Tu psicóloga
            </Heading>
            <Hr style={divider} />
            <Row style={detailRow}>
              <Column style={detailLabel}>Nombre</Column>
              <Column style={detailValue}>{professionalName}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>WhatsApp</Column>
              <Column style={detailValue}>{professionalPhone}</Column>
            </Row>
          </Section>

          {/* ── Detalles de la cita ── */}
          <Section style={card}>
            <Heading as="h2" style={h2}>
              Detalles de tu cita
            </Heading>
            <Hr style={divider} />
            <Row style={detailRow}>
              <Column style={detailLabel}>📅 Fecha</Column>
              <Column style={detailValue}>{dateStr}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>🕐 Hora</Column>
              <Column style={detailValue}>{timeStr}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>💻 Modalidad</Column>
              <Column style={detailValue}>{typeLabel}</Column>
            </Row>
          </Section>

          {/* ── Información de pago ── */}
          <Section style={paymentCard}>
            <Heading as="h2" style={h2}>
              Información de pago
            </Heading>
            <Hr style={divider} />
            <Text style={priceText}>${price} USD</Text>
            <Text style={bcvNote}>
              * El monto en bolívares equivale a la Tasa Dólar BCV vigente el
              día del pago.
            </Text>

            {hasBankInfo && (
              <>
                <Text style={bankSectionTitle}>
                  Datos bancarios para transferencia:
                </Text>
                {bankInfo.holder && (
                  <Row style={detailRow}>
                    <Column style={detailLabel}>Titular</Column>
                    <Column style={detailValue}>{bankInfo.holder}</Column>
                  </Row>
                )}
                {bankInfo.bank && (
                  <Row style={detailRow}>
                    <Column style={detailLabel}>Banco</Column>
                    <Column style={detailValue}>{bankInfo.bank}</Column>
                  </Row>
                )}
                {bankInfo.accountType && (
                  <Row style={detailRow}>
                    <Column style={detailLabel}>Tipo de cuenta</Column>
                    <Column style={detailValue}>{bankInfo.accountType}</Column>
                  </Row>
                )}
                {bankInfo.accountNumber && (
                  <Row style={detailRow}>
                    <Column style={detailLabel}>N° de cuenta</Column>
                    <Column style={detailValue}>{bankInfo.accountNumber}</Column>
                  </Row>
                )}
                {bankInfo.ciRif && (
                  <Row style={detailRow}>
                    <Column style={detailLabel}>CI / RIF</Column>
                    <Column style={detailValue}>{bankInfo.ciRif}</Column>
                  </Row>
                )}
              </>
            )}
          </Section>

          {/* ── CTA ── */}
          <Section style={ctaSection}>
            <a href={`${siteUrl}/dashboard`} style={ctaButton}>
              Ver mis citas
            </a>
          </Section>

          {/* ── Footer ── */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 La Ruta Resiliente. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              Este email fue enviado automáticamente, no respondas a este
              mensaje.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Professional Notification Email ───────────────────────────────────────────

interface ProfessionalEmailProps {
  professionalName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dateStr: string;
  timeStr: string;
  appointmentType: string;
  notes?: string;
  dashboardUrl: string;
}

function ProfessionalNotificationEmail({
  professionalName,
  patientName,
  patientEmail,
  patientPhone,
  dateStr,
  timeStr,
  appointmentType,
  notes,
  dashboardUrl,
}: ProfessionalEmailProps) {
  const typeLabel =
    appointmentType === "online" ? "Sesión Online" : "Sesión Presencial";

  return (
    <Html lang="es">
      <Head />
      <Preview>
        Nueva cita: {patientName} — {dateStr} a las {timeStr}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* ── Header ── */}
          <Section style={header}>
            <Text style={logo}>🌿 La Ruta Resiliente</Text>
          </Section>

          {/* ── Hero ── */}
          <Section style={hero}>
            <Text style={heroIcon}>📅</Text>
            <Heading as="h1" style={h1}>
              ¡Nueva cita agendada!
            </Heading>
            <Text style={heroSubtitle}>
              Hola <strong>{professionalName}</strong>
            </Text>
          </Section>

          {/* ── Datos del paciente ── */}
          <Section style={card}>
            <Heading as="h2" style={h2}>
              Datos del paciente
            </Heading>
            <Hr style={divider} />
            <Row style={detailRow}>
              <Column style={detailLabel}>Nombre completo</Column>
              <Column style={detailValue}>{patientName}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Correo</Column>
              <Column style={detailValue}>{patientEmail}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Teléfono / WhatsApp</Column>
              <Column style={detailValue}>{patientPhone}</Column>
            </Row>
          </Section>

          {/* ── Detalles de la cita ── */}
          <Section style={card}>
            <Heading as="h2" style={h2}>
              Detalles de la cita
            </Heading>
            <Hr style={divider} />
            <Row style={detailRow}>
              <Column style={detailLabel}>📅 Fecha</Column>
              <Column style={detailValue}>{dateStr}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>🕐 Hora</Column>
              <Column style={detailValue}>{timeStr}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>💻 Modalidad</Column>
              <Column style={detailValue}>{typeLabel}</Column>
            </Row>
          </Section>

          {/* ── Motivo (condicional) ── */}
          {notes && (
            <Section style={notesCard}>
              <Heading as="h2" style={h2}>
                Motivo de consulta
              </Heading>
              <Hr style={divider} />
              <Text style={notesText}>"{notes}"</Text>
            </Section>
          )}

          {/* ── CTA ── */}
          <Section style={ctaSection}>
            <a href={dashboardUrl} style={ctaButton}>
              Ver panel de citas
            </a>
          </Section>

          {/* ── Footer ── */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 La Ruta Resiliente. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(isoString: string): {
  dateStr: string;
  timeStr: string;
} {
  const date = new Date(isoString);
  const dateRaw = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  const timeStr = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  const dateStr = dateRaw.charAt(0).toUpperCase() + dateRaw.slice(1);
  return { dateStr, timeStr };
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.warn("[send-appointment-emails] RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ warning: "Email service not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const resend = new Resend(resendKey);

  try {
    const body = await req.json();
    const {
      patientName,
      patientEmail,
      patientPhone,
      patientNotes,
      professionalId,
      scheduledAt,
      appointmentType,
      price,
    } = body;

    if (!patientEmail || !patientName || !professionalId || !scheduledAt) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Fetch professional profile from DB ──
    let professionalName = "María José Marquina";
    let professionalPhone = Deno.env.get("PROFESSIONAL_PHONE") ?? "";
    let professionalEmail =
      Deno.env.get("PROFESSIONAL_EMAIL") ?? "psicomaria17@gmail.com";

    const { data: prof } = await adminClient
      .from("professionals")
      .select("user_id")
      .eq("id", professionalId)
      .single();

    if (prof?.user_id) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("first_name, last_name, phone, email")
        .eq("user_id", prof.user_id)
        .single();

      if (profile) {
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");
        if (fullName) professionalName = fullName;
        if (profile.phone) professionalPhone = profile.phone;
        if (profile.email) professionalEmail = profile.email;
      }
    }

    // ── Format date/time in Venezuela timezone ──
    const { dateStr, timeStr } = formatDateTime(scheduledAt);

    // ── Bank details from Supabase secrets ──
    const bankInfo: BankInfo = {
      holder: Deno.env.get("BANK_HOLDER_NAME") ?? "",
      bank: Deno.env.get("BANK_NAME") ?? "",
      accountType: Deno.env.get("BANK_ACCOUNT_TYPE") ?? "",
      accountNumber: Deno.env.get("BANK_ACCOUNT_NUMBER") ?? "",
      ciRif: Deno.env.get("BANK_CI_RIF") ?? "",
    };

    const siteUrl =
      Deno.env.get("SITE_URL") ?? "https://larutaresiliente.com";
    const fromEmail =
      Deno.env.get("FROM_EMAIL") ??
      "La Ruta Resiliente <noreply@larutaresiliente.com>";

    // ── Render email HTML using React Email ──
    const [patientHtml, professionalHtml] = await Promise.all([
      render(
        <PatientConfirmationEmail
          patientName={patientName}
          professionalName={professionalName}
          professionalPhone={professionalPhone || "Disponible vía WhatsApp"}
          dateStr={dateStr}
          timeStr={timeStr}
          appointmentType={appointmentType}
          price={price}
          bankInfo={bankInfo}
          siteUrl={siteUrl}
        />
      ),
      render(
        <ProfessionalNotificationEmail
          professionalName={professionalName}
          patientName={patientName}
          patientEmail={patientEmail}
          patientPhone={patientPhone || "No proporcionado"}
          dateStr={dateStr}
          timeStr={timeStr}
          appointmentType={appointmentType}
          notes={patientNotes || undefined}
          dashboardUrl={`${siteUrl}/professional-dashboard`}
        />
      ),
    ]);

    // ── Send both emails via Resend ──
    const [patientResult, professionalResult] = await Promise.allSettled([
      resend.emails.send({
        from: fromEmail,
        to: [patientEmail],
        subject: `Tu cita está confirmada — ${dateStr}`,
        html: patientHtml,
      }),
      resend.emails.send({
        from: fromEmail,
        to: [professionalEmail],
        subject: `Nueva cita: ${patientName} — ${dateStr} a las ${timeStr}`,
        html: professionalHtml,
      }),
    ]);

    const results = {
      patient:
        patientResult.status === "fulfilled"
          ? { success: true, id: patientResult.value.data?.id }
          : { success: false, error: String(patientResult.reason) },
      professional:
        professionalResult.status === "fulfilled"
          ? { success: true, id: professionalResult.value.data?.id }
          : { success: false, error: String(professionalResult.reason) },
    };

    console.log("[send-appointment-emails] Results:", JSON.stringify(results));

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-appointment-emails] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
