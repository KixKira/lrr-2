import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Phone,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { checkUserEmail, getAvailability, bookAppointmentAsGuest } from "@/services/api";
import { getProfessionalId } from "@/services/professional";
import { supabase } from "@/integrations/supabase/client";
import { sendAppointmentEmails } from "@/services/email";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import majIMG from "@/assets/images/maria-jose-marquina-psicologa-clinica.webp";

interface Availability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

const professional = {
  name: "María José Marquina",
  specialty: "Psicología Clínica",
  image: majIMG,
  price: 30,
};

const Appointments = () => {
  const { user, profile, signUp, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState(() => {
    if (!profile) return "";
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  });
  const [patientEmail, setPatientEmail] = useState(() => profile?.email ?? "");
  const [patientPhone, setPatientPhone] = useState(() => profile?.phone ?? "");
  const [patientNotes, setPatientNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<"online" | "presencial">("online");
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d;
  }, []);

  const profileFullName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ")
    : "";
  const [welcomeMessage, setWelcomeMessage] = useState(
    profileFullName
      ? `¡Hola de nuevo, ${profile!.first_name}! Tus datos ya están cargados.`
      : "Completa tu información para agendar la cita",
  );
  const [isExistingUser, setIsExistingUser] = useState(!!profileFullName);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [appointmentCreated, setAppointmentCreated] = useState(false);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [wantsAccount, setWantsAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Fallback pre-fill when profile arrives after mount (e.g. hard refresh)
  useEffect(() => {
    if (!profile) return;
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
    setPatientName((prev) => prev || fullName);
    setPatientEmail((prev) => prev || (profile.email ?? ""));
    setPatientPhone((prev) => prev || (profile.phone ?? ""));
    setIsExistingUser(true);
    setWelcomeMessage(`¡Hola de nuevo, ${profile.first_name}! Tus datos ya están cargados.`);
  }, [profile]);

  // Fetch María José's professional UUID
  useEffect(() => {
    getProfessionalId().then((id) => { if (id) setProfessionalId(id); });
  }, []);

  // Load availability once we have the professional ID
  useEffect(() => {
    if (!professionalId) return;
    const fetchData = async () => {
      const data = await getAvailability(professionalId);
      setAvailabilityData(data.availability || []);
    };
    fetchData();
  }, [professionalId]);

  // Load time slots when a date is selected
  useEffect(() => {
    if (!selectedDate || !professionalId) return;

    const fetchTimeSlots = async () => {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];

      try {
        const data = await getAvailability(professionalId, dateStr);

        const dayNameEn = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
        const daySlots = (data.availability || []).filter(
          (s: Availability) => s.dayOfWeek === dayNameEn,
        );

        const booked: string[] = data.bookedSlots || [];
        const slots: string[] = [];
        daySlots.forEach((slot: Availability) => {
          const [startH, startM] = slot.startTime.split(":").map(Number);
          const [endH, endM] = slot.endTime.split(":").map(Number);
          const startTotal = startH * 60 + startM;
          const endTotal = endH * 60 + endM;
          const duration = slot.slotDuration ?? 60;
          for (let t = startTotal; t + duration <= endTotal; t += duration) {
            const hh = Math.floor(t / 60).toString().padStart(2, "0");
            const mm = (t % 60).toString().padStart(2, "0");
            const timeStr = `${hh}:${mm}`;
            if (!booked.includes(timeStr)) slots.push(timeStr);
          }
        });
        setAvailableTimeSlots(slots);
      } catch {
        toast.error("Error al cargar los horarios");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, professionalId]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      const dayNameEn = date.toLocaleDateString("en-US", { weekday: "long" });
      return !availabilityData.some((s) => s.dayOfWeek === dayNameEn);
    },
    [availabilityData],
  );

  const isDateAvailable = useCallback(
    (date: Date) => {
      const dayNameEn = date.toLocaleDateString("en-US", { weekday: "long" });
      return availabilityData.some((s) => s.dayOfWeek === dayNameEn);
    },
    [availabilityData],
  );

  const formatDateShort = (d: Date) =>
    `${d.getDate()} ${d.toLocaleDateString("es", { month: "short" })}`;

  const handleEmailCheck = async (email: string) => {
    if (!email.includes("@")) return;
    setIsLoading(true);
    const data = await checkUserEmail(email);
    if (data.exists) {
      setIsExistingUser(true);
      setPatientName(data.fullName);
      setWelcomeMessage(data.message);
    } else {
      setIsExistingUser(false);
      setWelcomeMessage("Veo que es tu primera vez aquí, ¡bienvenido!");
    }
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime || !professionalId) return;

    setIsSaving(true);
    try {
      // Use local date parts to avoid UTC-shift on date string
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);
      const scheduledAt = scheduledDate.toISOString();
      const apptType = appointmentType === "online" ? "online" : "in_person";

      let result: { appointment: unknown; isNewUser?: boolean };

      if (user) {
        // Authenticated: insert directly (RLS policy allows patient_id = auth.uid())
        const { data: appt, error } = await supabase
          .from("appointments")
          .insert({
            patient_id: user.id,
            professional_id: professionalId,
            scheduled_at: scheduledAt,
            duration_minutes: 60,
            appointment_type: apptType,
            status: "pending",
            notes: patientNotes || null,
            price: professional.price,
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          throw new Error(error.message);
        }
        result = { appointment: appt, isNewUser: false };
      } else {
        // Guest: uses book-appointment edge function (requires deployment)
        result = await bookAppointmentAsGuest({
          name: patientName,
          email: patientEmail,
          phone: patientPhone,
          professionalId,
          scheduledAt,
          durationMinutes: 60,
          appointmentType: apptType,
          notes: patientNotes,
          price: professional.price,
        });
      }

      if (result.appointment) {
        let accountCreated = false;
        if (!user && wantsAccount && password) {
          const nameParts = patientName.trim().split(" ");
          const firstName = nameParts[0] ?? "";
          const lastName = nameParts.slice(1).join(" ") || undefined;
          const { error: signUpError } = await signUp(patientEmail, password, firstName, lastName);
          if (signUpError) {
            toast.error(`Cita agendada, pero no se pudo crear la cuenta: ${signUpError.message}`);
          } else {
            accountCreated = true;
          }
        }
        setIsNewRegistration(accountCreated);
        setAppointmentCreated(true);
        toast.success("¡Cita agendada exitosamente!");

        await sendAppointmentEmails({
          patientName,
          patientEmail,
          patientPhone,
          patientNotes: patientNotes || undefined,
          professionalId: professionalId!,
          scheduledAt,
          appointmentType: apptType,
          price: professional.price,
        });
      }
    } catch (err) {
      console.error("Error al confirmar cita:", err);
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error al agendar la cita: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid =
    patientName.trim() !== "" &&
    patientEmail.trim() !== "" &&
    patientPhone.trim() !== "" &&
    (!wantsAccount || (password.length >= 6 && password === confirmPassword));

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calm"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Progress Stepper */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s <= step
                      ? "bg-calm text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 md:w-20 h-1 mx-2 rounded-full ${s < step ? "bg-calm" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1: DATOS PERSONALES */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-2">
                {isExistingUser ? "¡Qué bueno verte!" : "Tus datos"}
              </h2>
              <p className={`mb-6 ${isExistingUser ? "text-calm font-medium" : "text-muted-foreground"}`}>
                {isLoading ? "Verificando..." : welcomeMessage}
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Tu nombre y apellido"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      onBlur={(e) => handleEmailCheck(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+58 412 000 0000"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Motivo de consulta (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Cuéntanos brevemente el motivo de tu consulta..."
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Opción de registro — solo para usuarios nuevos no autenticados */}
                {!user && !isExistingUser && (
                  <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wantsAccount}
                        onChange={(e) => {
                          setWantsAccount(e.target.checked);
                          setPassword("");
                          setConfirmPassword("");
                          setPasswordError("");
                        }}
                        className="mt-1 accent-[hsl(var(--calm))]"
                      />
                      <div>
                        <p className="font-medium text-sm">Crear una cuenta</p>
                        <p className="text-xs text-muted-foreground">
                          Para ver y gestionar tus citas en cualquier momento
                        </p>
                      </div>
                    </label>

                    {wantsAccount && (
                      <div className="space-y-3 pt-1">
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 6 caracteres"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError("");
                              }}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setPasswordError(
                                e.target.value && e.target.value !== password
                                  ? "Las contraseñas no coinciden"
                                  : "",
                              );
                            }}
                          />
                          {passwordError && (
                            <p className="text-xs text-destructive">{passwordError}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: CALENDARIO */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold mb-2">Elige la fecha</h2>
              <p className="text-muted-foreground mb-6">
                Selecciona el día que prefieras
              </p>

              {/* Calendar card */}
              <div className="card-elevated p-2 mb-6 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={(date) => {
                    setSelectedDate(date ?? null);
                    setSelectedTime(null);
                  }}
                  disabled={isDateDisabled}
                  fromDate={new Date()}
                  toDate={maxDate}
                  locale={es}
                  weekStartsOn={1}
                  modifiers={{ available: isDateAvailable }}
                  modifiersClassNames={{
                    available: "!bg-calm/10 hover:!bg-calm/20 font-medium",
                  }}
                  showOutsideDays={false}
                />
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-calm" />
                    Horarios disponibles — {formatDateShort(selectedDate)}
                  </h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm" />
                    </div>
                  ) : availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-xl text-center font-medium transition-all ${
                            selectedTime === time
                              ? "bg-calm text-white shadow-md"
                              : "card-elevated hover:shadow-lg"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay horarios disponibles para este día</p>
                      <p className="text-sm">Por favor selecciona otra fecha</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: TIPO DE CITA */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold mb-2">Tipo de consulta</h2>
              <p className="text-muted-foreground mb-6">¿Cómo prefieres tu sesión?</p>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setAppointmentType("online")}
                  className={`card-elevated p-6 text-left transition-all ${appointmentType === "online" ? "ring-2 ring-calm" : "hover:shadow-lg"}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-calm-light flex items-center justify-center mb-4">
                    <Video className="h-7 w-7 text-calm" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Sesión Online</h3>
                  <p className="text-sm text-muted-foreground">
                    Videollamada desde la comodidad de tu hogar
                  </p>
                </button>
                <button
                  onClick={() => setAppointmentType("presencial")}
                  className={`card-elevated p-6 text-left transition-all ${appointmentType === "presencial" ? "ring-2 ring-calm" : "hover:shadow-lg"}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-lavender-light flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-lavender" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Presencial</h3>
                  <p className="text-sm text-muted-foreground">
                    Visita nuestro consultorio en Maracay
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RESUMEN */}
          {step === 4 && !appointmentCreated && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Resumen de tu cita</h2>
              <p className="text-muted-foreground mb-6">
                Revisa los detalles antes de confirmar
              </p>
              <div className="card-elevated p-6 text-left space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={professional.image}
                    alt={professional.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{professional.name}</h3>
                    <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="font-medium">{patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {patientEmail} · {patientPhone}
                  </p>
                  {patientNotes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{patientNotes}"
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-calm" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {selectedDate ? formatDateShort(selectedDate) : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-lavender" />
                    <div>
                      <p className="text-xs text-muted-foreground">Hora</p>
                      <p className="font-medium">{selectedTime || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge variant="secondary" className="capitalize">
                    {appointmentType === "online" ? "Online" : "Presencial"}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Precio de la sesión</p>
                    <p className="text-2xl font-bold">${professional.price}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border bg-amber-50/50 p-3 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> El pago se realizará el día de la consulta, antes de comenzar la sesión.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS SCREEN */}
          {appointmentCreated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-sage" />
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Cita agendada!</h2>
              <p className="text-muted-foreground mb-6">
                {isNewRegistration
                  ? "Hemos creado tu cuenta y enviado los detalles a tu correo. Revisa tu bandeja para acceder a tu perfil."
                  : "Hemos enviado los detalles a tu correo electrónico"}
              </p>
              <div className="card-elevated p-6 text-left space-y-4 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-calm" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {selectedDate ? formatDateShort(selectedDate) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-lavender" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hora</p>
                    <p className="font-medium">{selectedTime || "-"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Recuerda:</strong> El pago de ${professional.price} se realiza el día de la consulta.
                  </p>
                </div>
              </div>
              <div className="mt-8 space-x-4">
                <Button variant="outline" asChild>
                  <Link to="/">Volver al inicio</Link>
                </Button>
                {isNewRegistration ? (
                  <Button asChild>
                    <Link to="/auth">Acceder a mi cuenta</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/dashboard">Ver mis citas</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* NAVEGACIÓN */}
          {!appointmentCreated && (
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={isSaving}
                >
                  <ChevronLeft className="h-4 w-4" /> Atrás
                </Button>
              )}
              {step === 4 ? (
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleConfirmAppointment}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>Confirmar Cita</>
                  )}
                </Button>
              ) : (
                <Button
                  variant="calm"
                  size="lg"
                  onClick={handleContinue}
                  className="flex-1"
                  disabled={
                    (step === 1 && !isStep1Valid) ||
                    (step === 2 && (!selectedDate || !selectedTime))
                  }
                >
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Appointments;
