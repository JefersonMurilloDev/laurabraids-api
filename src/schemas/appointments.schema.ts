/**
 * @file Esquemas de validación Zod para la entidad Appointment.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con citas, incluyendo fechas, horarios y estados.
 */

import { z } from 'zod';
import { AppointmentStatus } from '../interfaces/appointment.interface';

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para validación de fecha y hora de cita.
 */
export const appointmentDateSchema = z
  .string()
  .datetime('La fecha debe tener formato ISO 8601 válido')
  .refine(
    (dateString) => {
      const appointmentDate = new Date(dateString);
      const now = new Date();
      
      // La cita debe ser al menos 1 hora en el futuro
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      return appointmentDate >= oneHourFromNow;
    },
    {
      message: 'La cita debe ser programada al menos 1 hora en el futuro'
    }
  )
  .refine(
    (dateString) => {
      const appointmentDate = new Date(dateString);
      const now = new Date();
      
      // La cita no puede ser más de 6 meses en el futuro
      const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
      return appointmentDate <= sixMonthsFromNow;
    },
    {
      message: 'La cita no puede programarse más de 6 meses en el futuro'
    }
  )
  .refine(
    (dateString) => {
      const appointmentDate = new Date(dateString);
      const dayOfWeek = appointmentDate.getDay();
      
      // Solo lunes a sábado (0 = domingo, 6 = sábado)
      return dayOfWeek >= 1 && dayOfWeek <= 6;
    },
    {
      message: 'Las citas solo pueden programarse de lunes a sábado'
    }
  )
  .refine(
    (dateString) => {
      const appointmentDate = new Date(dateString);
      const hour = appointmentDate.getHours();
      
      // Horario de atención: 8:00 AM a 6:00 PM
      return hour >= 8 && hour < 18;
    },
    {
      message: 'Las citas solo pueden programarse entre 8:00 AM y 6:00 PM'
    }
  )
  .transform((dateString) => new Date(dateString));

/**
 * @description Esquema para validación de estado de cita.
 */
export const appointmentStatusSchema = z
  .enum([
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ], {
    errorMap: () => ({
      message: `El estado debe ser uno de: ${Object.values(AppointmentStatus).join(', ')}`
    })
  });

/**
 * @description Esquema para validación de notas.
 */
export const notesSchema = z
  .string()
  .max(500, 'Las notas no pueden exceder 500 caracteres')
  .transform((notes) => notes.trim())
  .optional()
  .or(z.literal(''));

/**
 * @description Esquema para validación de duración de cita (en minutos).
 */
export const durationSchema = z
  .number()
  .int('La duración debe ser un número entero')
  .min(30, 'La duración mínima es 30 minutos')
  .max(480, 'La duración máxima es 8 horas (480 minutos)')
  .optional();

/**
 * @description Esquema para validación de precio de la cita.
 */
export const appointmentPriceSchema = z
  .number()
  .positive('El precio debe ser un número positivo')
  .max(9999.99, 'El precio no puede exceder $9999.99')
  .refine(
    (price) => Number((price * 100).toFixed(0)) / 100 === price,
    {
      message: 'El precio no puede tener más de 2 decimales'
    }
  )
  .optional();

/**
 * @description Esquema para crear una nueva cita.
 */
export const createAppointmentSchema = z.object({
  user_id: uuidSchema,
  stylist_id: uuidSchema,
  style_id: uuidSchema,
  appointment_date: appointmentDateSchema,
  notes: notesSchema,
  duration: durationSchema,
  price: appointmentPriceSchema
});

/**
 * @description Esquema para actualizar una cita existente.
 */
export const updateAppointmentSchema = z.object({
  appointment_date: appointmentDateSchema.optional(),
  status: appointmentStatusSchema.optional(),
  notes: notesSchema.optional(),
  duration: durationSchema.optional(),
  price: appointmentPriceSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
).refine(
  (data) => {
    // Si se cambia a COMPLETED, no se puede cambiar la fecha
    if (data.status === AppointmentStatus.COMPLETED && data.appointment_date) {
      return false;
    }
    return true;
  },
  {
    message: 'No se puede cambiar la fecha de una cita completada'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID).
 */
export const appointmentParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para consultas de filtrado de citas.
 */
export const getAppointmentsQuerySchema = z.object({
  user_id: uuidSchema.optional(),
  stylist_id: uuidSchema.optional(),
  status: appointmentStatusSchema.optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .optional(),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha desde debe tener formato YYYY-MM-DD')
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha hasta debe tener formato YYYY-MM-DD')
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'La página debe ser un número')
    .transform(Number)
    .refine((val) => val > 0, 'La página debe ser mayor a 0')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'El límite debe ser un número')
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100')
    .optional(),
  sort_by: z
    .enum(['appointment_date', 'created_at', 'status'])
    .default('appointment_date')
    .optional(),
  sort_order: z
    .enum(['asc', 'desc'])
    .default('asc')
    .optional()
}).refine(
  (data) => {
    if (data.date_from && data.date_to) {
      return new Date(data.date_from) <= new Date(data.date_to);
    }
    return true;
  },
  {
    message: 'La fecha desde no puede ser posterior a la fecha hasta'
  }
);

/**
 * @description Esquema para verificar disponibilidad de estilista.
 */
export const checkAvailabilitySchema = z.object({
  stylist_id: uuidSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .refine(
      (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      'La fecha debe ser hoy o en el futuro'
    ),
  duration: durationSchema.default(60)
});

/**
 * @description Esquema para cambio de estado de cita.
 */
export const changeAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
  reason: z
    .string()
    .max(200, 'La razón no puede exceder 200 caracteres')
    .optional()
}).refine(
  (data) => {
    // Si se cancela, debe proporcionar una razón
    if (data.status === AppointmentStatus.CANCELLED && !data.reason) {
      return false;
    }
    return true;
  },
  {
    message: 'Debe proporcionar una razón para cancelar la cita'
  }
);

/**
 * @description Esquema para reprogramar cita.
 */
export const rescheduleAppointmentSchema = z.object({
  new_appointment_date: appointmentDateSchema,
  reason: z
    .string()
    .min(5, 'Debe proporcionar una razón para reprogramar')
    .max(200, 'La razón no puede exceder 200 caracteres')
});

/**
 * @description Esquema para horarios disponibles.
 */
export const availableTimeSlotsSchema = z.object({
  stylist_id: uuidSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
  duration: durationSchema.default(60)
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 */
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentParamsInput = z.infer<typeof appointmentParamsSchema>;
export type GetAppointmentsQueryInput = z.infer<typeof getAppointmentsQuerySchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
export type ChangeAppointmentStatusInput = z.infer<typeof changeAppointmentStatusSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
export type AvailableTimeSlotsInput = z.infer<typeof availableTimeSlotsSchema>;