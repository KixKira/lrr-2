import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// Helper to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: session ? `Bearer ${session.access_token}` : "",
  };
};

// Check if user email exists
export const checkUserEmail = async (email: string) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/check-user`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    return await response.json();
  } catch (error) {
    console.error("Error conectando con la API:", error);
    return { exists: false };
  }
};

// Get availability for appointments
export const getAvailability = async (professionalId?: string, date?: string) => {
  try {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let query = supabase
      .from("professional_availability")
      .select("id, day_of_week, start_time, end_time, slot_duration_minutes")
      .eq("is_available", true);

    if (professionalId) {
      query = query.eq("professional_id", professionalId);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("professionals")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof) query = query.eq("professional_id", prof.id);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const availability = (data || []).map((slot) => ({
      id: slot.id,
      dayOfWeek: dayNames[slot.day_of_week],
      startTime: slot.start_time,
      endTime: slot.end_time,
      slotDuration: (slot as any).slot_duration_minutes ?? 60,
    }));

    let bookedSlots: string[] = [];
    if (date && professionalId) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: appointments } = await supabase
        .from("appointments")
        .select("scheduled_at")
        .eq("professional_id", professionalId)
        .gte("scheduled_at", startOfDay.toISOString())
        .lte("scheduled_at", endOfDay.toISOString())
        .neq("status", "cancelled");

      if (appointments) {
        bookedSlots = appointments.map((a) => {
          const raw = a.scheduled_at;
          const d = new Date(/(Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : raw + "Z");
          return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        });
      }
    }

    return { availability, bookedSlots };
  } catch (error) {
    console.error("Error cargando horarios:", error);
    return { availability: [], bookedSlots: [] };
  }
};

// Get appointments
export const getAppointments = async (role: "patient" | "professional") => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/appointments?role=${role}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error cargando citas");
    return await response.json();
  } catch (error) {
    console.error("Error cargando citas:", error);
    return { appointments: [] };
  }
};

// Book appointment as guest (auto-registers patient if needed)
export const bookAppointmentAsGuest = async (data: {
  name: string;
  email: string;
  phone: string;
  professionalId: string;
  scheduledAt: string;
  durationMinutes?: number;
  appointmentType?: "online" | "in_person";
  notes?: string;
  price?: number;
}) => {
  const { data: result, error } = await supabase.functions.invoke("book-appointment", {
    body: data,
  });

  if (error) throw new Error(error.message ?? "Error creando cita");
  if (result?.error) throw new Error(result.error);
  return result;
};

// Create appointment
export const createAppointment = async (data: {
  professionalId: string;
  scheduledAt: string;
  durationMinutes?: number;
  appointmentType?: "online" | "in_person";
  notes?: string;
  price?: number;
}) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/appointments`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error creando cita");
    return await response.json();
  } catch (error) {
    console.error("Error creando cita:", error);
    throw error;
  }
};

// Update appointment
export const updateAppointment = async (data: {
  appointmentId: string;
  status?: string;
  notes?: string;
}) => {
  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const { data: result, error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", data.appointmentId)
    .select()
    .single();

  if (error) throw new Error("Error actualizando cita");
  return { appointment: result };
};

// Get clinical notes (professional only)
export const getClinicalNotes = async (patientId?: string) => {
  try {
    const params = patientId ? `?patientId=${patientId}` : "";
    const response = await fetch(`${FUNCTIONS_URL}/clinical-notes${params}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error cargando notas");
    return await response.json();
  } catch (error) {
    console.error("Error cargando notas:", error);
    return { notes: [] };
  }
};

// Create clinical note (professional only)
export const createClinicalNote = async (data: {
  patientId: string;
  appointmentId?: string;
  content: string;
  isPrivate?: boolean;
}) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/clinical-notes`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error creando nota");
    return await response.json();
  } catch (error) {
    console.error("Error creando nota:", error);
    throw error;
  }
};

// Update clinical note (professional only)
export const updateClinicalNote = async (data: {
  noteId: string;
  content?: string;
  isPrivate?: boolean;
}) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/clinical-notes`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error actualizando nota");
    return await response.json();
  } catch (error) {
    console.error("Error actualizando nota:", error);
    throw error;
  }
};

// Delete clinical note (professional only)
export const deleteClinicalNote = async (noteId: string) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/clinical-notes?noteId=${noteId}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error eliminando nota");
    return await response.json();
  } catch (error) {
    console.error("Error eliminando nota:", error);
    throw error;
  }
};

// Get messages (conversations or specific chat)
export const getMessages = async (receiverId?: string) => {
  try {
    const params = receiverId ? `?receiverId=${receiverId}` : "";
    const response = await fetch(`${FUNCTIONS_URL}/messages${params}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error cargando mensajes");
    return await response.json();
  } catch (error) {
    console.error("Error cargando mensajes:", error);
    return { messages: [], conversations: [] };
  }
};

// Send message
export const sendMessage = async (receiverId: string, content: string) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/messages`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ receiverId, content }),
    });

    if (!response.ok) throw new Error("Error enviando mensaje");
    return await response.json();
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (senderId: string) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/messages`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ senderId }),
    });

    if (!response.ok) throw new Error("Error marcando mensajes");
    return await response.json();
  } catch (error) {
    console.error("Error marcando mensajes:", error);
    throw error;
  }
};

// Get payments
export const getPayments = async (role: "patient" | "professional") => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/payments?role=${role}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error cargando pagos");
    return await response.json();
  } catch (error) {
    console.error("Error cargando pagos:", error);
    return { payments: [] };
  }
};

// Create payment record
export const createPayment = async (data: {
  appointmentId?: string;
  amount: number;
  professionalId: string;
  paymentMethod?: string;
}) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/payments`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error creando pago");
    return await response.json();
  } catch (error) {
    console.error("Error creando pago:", error);
    throw error;
  }
};

// Update payment status (admin/professional only)
export const updatePayment = async (data: {
  paymentId: string;
  status: string;
  transactionId?: string;
}) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/payments`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error actualizando pago");
    return await response.json();
  } catch (error) {
    console.error("Error actualizando pago:", error);
    throw error;
  }
};

// Save professional availability
export const saveAvailability = async (slots: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  slotDurationMinutes?: number;
}[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: prof } = await supabase
    .from("professionals")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!prof) throw new Error("No se encontró un perfil profesional para este usuario");

  const slotsToInsert = slots.map((slot) => ({
    professional_id: prof.id,
    day_of_week: slot.dayOfWeek,
    start_time: slot.startTime,
    end_time: slot.endTime,
    is_available: true,
    slot_duration_minutes: slot.slotDurationMinutes ?? 60,
  }));

  const { data, error } = await supabase
    .from("professional_availability")
    .insert(slotsToInsert)
    .select();

  if (error) throw new Error("Error guardando disponibilidad: " + error.message);
  return { success: true, slots: data };
};

// Delete availability slot
export const deleteAvailabilitySlot = async (slotId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: prof } = await supabase
    .from("professionals")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!prof) throw new Error("Perfil profesional no encontrado");

  const { error } = await supabase
    .from("professional_availability")
    .delete()
    .eq("id", slotId)
    .eq("professional_id", prof.id);

  if (error) throw new Error("Error eliminando disponibilidad: " + error.message);
  return { success: true };
};
