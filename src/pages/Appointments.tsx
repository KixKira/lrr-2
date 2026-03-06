import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const professional = {
  name: "María José Marquina",
  specialty: "Psicología Clínica",
  image:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  price: 30,
};

const generateDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.getDate(),
      day: date.toLocaleDateString("es", { weekday: "short" }),
      month: date.toLocaleDateString("es", { month: "short" }),
      full: date,
      available: Math.random() > 0.3,
    });
  }
  return days;
};

const Appointments = () => {
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<
    "online" | "presencial"
  >("online");
  const [days] = useState(generateDays);

  const handleContinue = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStep1Valid =
    patientName.trim() !== "" &&
    patientEmail.trim() !== "" &&
    patientPhone.trim() !== "";

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
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
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-2">Tus datos</h2>
              <p className="text-muted-foreground mb-6">
                Completa tu información para agendar la cita
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
                      className="pl-10"
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
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-2">Elige la fecha</h2>
              <p className="text-muted-foreground mb-6">
                Selecciona el día que prefieras
              </p>

              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day.available && setSelectedDate(index)}
                    disabled={!day.available}
                    className={`flex-shrink-0 w-16 p-3 rounded-2xl flex flex-col items-center transition-all ${
                      selectedDate === index
                        ? "bg-calm text-primary-foreground"
                        : day.available
                          ? "card-elevated hover:shadow-lg"
                          : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-xs uppercase opacity-70">
                      {day.day}
                    </span>
                    <span className="text-xl font-bold">{day.date}</span>
                    <span className="text-xs opacity-70">{day.month}</span>
                  </button>
                ))}
              </div>

              {selectedDate !== null && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Horarios disponibles</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => {
                      const isAvailable = Math.random() > 0.3;
                      return (
                        <button
                          key={time}
                          onClick={() => isAvailable && setSelectedTime(time)}
                          disabled={!isAvailable}
                          className={`p-3 rounded-xl text-center font-medium transition-all ${
                            selectedTime === time
                              ? "bg-calm text-primary-foreground"
                              : isAvailable
                                ? "card-elevated hover:shadow-lg"
                                : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-2">Tipo de consulta</h2>
              <p className="text-muted-foreground mb-6">
                ¿Cómo prefieres tu sesión?
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setAppointmentType("online")}
                  className={`card-elevated p-6 text-left transition-all ${
                    appointmentType === "online"
                      ? "ring-2 ring-calm"
                      : "hover:shadow-lg"
                  }`}
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
                  className={`card-elevated p-6 text-left transition-all ${
                    appointmentType === "presencial"
                      ? "ring-2 ring-calm"
                      : "hover:shadow-lg"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-lavender-light flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-lavender" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Presencial</h3>
                  <p className="text-sm text-muted-foreground">
                    Visita nuestro consultorio en la Torre Calicanto, Maracay
                  </p>
                </button>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-sage" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Resumen de tu cita</h2>
              <p className="text-muted-foreground mb-8">
                Confirma los detalles de tu reserva
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
                    <p className="text-sm text-muted-foreground">
                      {professional.specialty}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-1">
                  <p className="text-xs text-muted-foreground">Paciente</p>
                  <p className="font-medium">{patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {patientEmail} · {patientPhone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-calm-light flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-calm" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {selectedDate !== null
                          ? `${days[selectedDate].date} ${days[selectedDate].month}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lavender-light flex items-center justify-center">
                      <Clock className="h-5 w-5 text-lavender" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hora</p>
                      <p className="font-medium">{selectedTime || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {appointmentType === "online" ? (
                        <>
                          <Video className="h-3 w-3 mr-1" />
                          Online
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 mr-1" />
                          Calle López Aveledo, entre 3ra y 2da transversal,
                          Calicanto, Maracay
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${professional.price}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                📱 Recibirás un recordatorio por WhatsApp 24 horas antes de tu
                cita
              </p>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Atrás
              </Button>
            )}
            <Button
              variant={step === 4 ? "hero" : "calm"}
              size="lg"
              onClick={handleContinue}
              className="flex-1"
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && (!selectedDate || !selectedTime))
              }
            >
              {step === 4 ? "Confirmar y Pagar" : "Continuar"}
              {step < 4 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Appointments;
