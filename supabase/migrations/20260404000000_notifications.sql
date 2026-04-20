-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to send notification via HTTP request to edge function
CREATE OR REPLACE FUNCTION public.send_notification(
    _user_id UUID,
    _type TEXT,
    _data JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email TEXT;
    user_first_name TEXT;
BEGIN
    -- Get user info
    SELECT email, first_name INTO user_email, user_first_name
    FROM profiles
    WHERE user_id = _user_id;

    -- Insert notification record
    INSERT INTO notifications (user_id, type, title, content)
    VALUES (
        _user_id,
        _type,
        CASE _type
            WHEN 'appointment_created' THEN 'Nueva cita agendada'
            WHEN 'appointment_confirmed' THEN 'Cita confirmada'
            WHEN 'appointment_cancelled' THEN 'Cita cancelada'
            WHEN 'appointment_reminder' THEN 'Recordatorio de cita'
            WHEN 'new_message' THEN 'Nuevo mensaje'
            WHEN 'payment_received' THEN 'Pago recibido'
            ELSE 'Notificación'
        END,
        jsonb_build_object(
            'email', user_email,
            'patientName', user_first_name
        ) || _data
    );
END;
$$;

-- Trigger to send notification on appointment creation
CREATE OR REPLACE FUNCTION public.handle_appointment_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Send notification to patient
        PERFORM public.send_notification(
            NEW.patient_id,
            'appointment_created',
            jsonb_build_object(
                'appointmentId', NEW.id,
                'date', NEW.scheduled_at,
                'type', NEW.appointment_type
            )
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
            PERFORM public.send_notification(
                NEW.patient_id,
                'appointment_confirmed',
                jsonb_build_object(
                    'appointmentId', NEW.id,
                    'date', NEW.scheduled_at
                )
            );
        ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
            PERFORM public.send_notification(
                NEW.patient_id,
                'appointment_cancelled',
                jsonb_build_object(
                    'appointmentId', NEW.id,
                    'date', NEW.scheduled_at
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for appointment notifications
DROP TRIGGER IF EXISTS appointment_notification_trigger ON public.appointments;
CREATE TRIGGER appointment_notification_trigger
    AFTER INSERT OR UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_appointment_notification();

-- Trigger for new messages
CREATE OR REPLACE FUNCTION public.handle_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification to receiver
    PERFORM public.send_notification(
        NEW.receiver_id,
        'new_message',
        jsonb_build_object(
            'senderId', NEW.sender_id,
            'messagePreview', substring(NEW.content from 1 for 100)
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
CREATE TRIGGER message_notification_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_message_notification();

-- Trigger for payment confirmations
CREATE OR REPLACE FUNCTION public.handle_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        PERFORM public.send_notification(
            NEW.patient_id,
            'payment_received',
            jsonb_build_object(
                'paymentId', NEW.id,
                'amount', NEW.amount,
                'transactionId', NEW.transaction_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS payment_notification_trigger ON public.payments;
CREATE TRIGGER payment_notification_trigger
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_payment_notification();

-- Add trigger to update timestamps on notifications
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
