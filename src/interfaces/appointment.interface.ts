/**
 * @file Define la interfaz para la entidad Appointment.
 * @description Representa una cita entre un cliente y una estilista para realizar
 *              un estilo específico de trenza.
 */
export interface Appointment {
  id: string; // UUID como identificador único
  user_id: string; // FK a User - El cliente que reserva la cita
  stylist_id: string; // FK a Stylist - La estilista asignada
  style_id: string; // FK a Style - El estilo solicitado
  appointment_date: Date; // Fecha y hora de la cita
  status: AppointmentStatus; // Estado actual de la cita
  notes?: string; // Notas adicionales o especificaciones
  created_at: Date;
  updated_at: Date;
}

/**
 * @description Enum para los estados de una cita.
 * SCHEDULED: Cita programada y confirmada
 * COMPLETED: Cita completada exitosamente
 * CANCELLED: Cita cancelada por el cliente o estilista
 * NO_SHOW: Cliente no se presentó a la cita
 */
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}