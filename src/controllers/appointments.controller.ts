import { RequestHandler } from 'express';
import { Appointment, AppointmentStatus } from '../interfaces/appointment.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * @file Controller para la gestión de citas del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para la entidad Appointment, incluyendo
 *              reservas, cambios de estado y gestión de horarios.
 */

// Mockup de una base de datos en memoria. Será reemplazado por PostgreSQL.
export const initialAppointments: Appointment[] = [
  {
    id: uuidv4(),
    user_id: 'user-1',
    stylist_id: 'stylist-1', 
    style_id: 'style-1',
    appointment_date: new Date('2024-07-15T10:00:00'),
    status: AppointmentStatus.SCHEDULED,
    notes: 'Primera cita, cliente quiere Box Braids largas',
    created_at: new Date('2024-07-01'),
    updated_at: new Date('2024-07-01'),
  },
  {
    id: uuidv4(),
    user_id: 'user-2',
    stylist_id: 'stylist-2',
    style_id: 'style-2',
    appointment_date: new Date('2024-07-10T14:30:00'),
    status: AppointmentStatus.COMPLETED,
    notes: 'Cliente regular, satisfecha con el resultado',
    created_at: new Date('2024-06-25'),
    updated_at: new Date('2024-07-10'),
  },
  {
    id: uuidv4(),
    user_id: 'user-3',
    stylist_id: 'stylist-1',
    style_id: 'style-3',
    appointment_date: new Date('2024-07-20T11:00:00'),
    status: AppointmentStatus.CANCELLED,
    notes: 'Cliente canceló por motivos personales',
    created_at: new Date('2024-07-05'),
    updated_at: new Date('2024-07-18'),
  },
];

let appointments: Appointment[] = [...initialAppointments];

/**
 * @description Reinicia los datos de citas al estado inicial.
 * Útil para testing y desarrollo.
 */
export const resetAppointments = () => {
  appointments = [...initialAppointments];
};

/**
 * @description Obtiene todas las citas del sistema.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getAppointments: RequestHandler = (req, res) => {
  const { user_id, stylist_id, status, date } = req.query;
  let filteredAppointments = [...appointments];
  
  // Filtrar por user_id si se solicita
  if (user_id && typeof user_id === 'string') {
    filteredAppointments = filteredAppointments.filter(a => a.user_id === user_id);
  }
  
  // Filtrar por stylist_id si se solicita
  if (stylist_id && typeof stylist_id === 'string') {
    filteredAppointments = filteredAppointments.filter(a => a.stylist_id === stylist_id);
  }
  
  // Filtrar por estado si se solicita
  if (status && typeof status === 'string') {
    filteredAppointments = filteredAppointments.filter(a => a.status === status);
  }
  
  // Filtrar por fecha si se solicita (solo día, no hora)
  if (date && typeof date === 'string') {
    const filterDate = new Date(date);
    filteredAppointments = filteredAppointments.filter(a => {
      const appointmentDate = new Date(a.appointment_date);
      return appointmentDate.toDateString() === filterDate.toDateString();
    });
  }
  
  res.json(filteredAppointments);
};

/**
 * @description Obtiene una cita específica por su ID.
 * @param {Request} req - El objeto de solicitud de Express, con el ID en los parámetros.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getAppointmentById: RequestHandler = (req, res) => {
  const id = req.params.id;
  const appointment = appointments.find(a => a.id === id);
  
  if (appointment) {
    res.json(appointment);
  } else {
    res.status(404).json({ message: 'Cita no encontrada' });
  }
};

/**
 * @description Crea una nueva cita.
 * @param {Request} req - El objeto de solicitud de Express, con los datos de la cita en el cuerpo.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const createAppointment: RequestHandler = (req, res) => {
  const { user_id, stylist_id, style_id, appointment_date, notes } = req.body;

  // Validación simple de los datos de entrada
  if (!user_id || !stylist_id || !style_id || !appointment_date) {
    res.status(400).json({ 
      message: 'Faltan campos requeridos: user_id, stylist_id, style_id, appointment_date' 
    });
    return;
  }

  // Validar formato de fecha
  const appointmentDateTime = new Date(appointment_date);
  if (isNaN(appointmentDateTime.getTime())) {
    res.status(400).json({ message: 'Formato de fecha inválido' });
    return;
  }

  // Validar que la fecha sea futura
  const now = new Date();
  if (appointmentDateTime <= now) {
    res.status(400).json({ message: 'La fecha de la cita debe ser futura' });
    return;
  }

  // Verificar disponibilidad (básica) - no puede haber otra cita en la misma fecha/hora para la misma estilista
  const conflictingAppointment = appointments.find(a => 
    a.stylist_id === stylist_id && 
    a.appointment_date.getTime() === appointmentDateTime.getTime() &&
    a.status === AppointmentStatus.SCHEDULED
  );

  if (conflictingAppointment) {
    res.status(409).json({ message: 'La estilista ya tiene una cita programada en esa fecha y hora' });
    return;
  }

  // Crear la nueva cita
  const newAppointment: Appointment = {
    id: uuidv4(),
    user_id,
    stylist_id,
    style_id,
    appointment_date: appointmentDateTime,
    status: AppointmentStatus.SCHEDULED,
    notes: notes || '',
    created_at: new Date(),
    updated_at: new Date(),
  };

  appointments.push(newAppointment);

  // Devolver la nueva cita con el código de estado 201 (Created)
  res.status(201).json(newAppointment);
};

/**
 * @description Actualiza una cita existente por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const updateAppointment: RequestHandler = (req, res) => {
  const id = req.params.id;
  const appointmentIndex = appointments.findIndex(a => a.id === id);

  if (appointmentIndex === -1) {
    res.status(404).json({ message: 'Cita no encontrada' });
    return;
  }

  const { appointment_date, status, notes } = req.body;
  const currentAppointment = appointments[appointmentIndex];

  // Validar fecha si se proporciona
  let appointmentDateTime;
  if (appointment_date) {
    appointmentDateTime = new Date(appointment_date);
    if (isNaN(appointmentDateTime.getTime())) {
      res.status(400).json({ message: 'Formato de fecha inválido' });
      return;
    }

    // Validar que la fecha sea futura (solo si el estado no es COMPLETED)
    const now = new Date();
    if (appointmentDateTime <= now && status !== AppointmentStatus.COMPLETED) {
      res.status(400).json({ message: 'La fecha de la cita debe ser futura' });
      return;
    }
  }

  // Validar estado si se proporciona
  if (status && !Object.values(AppointmentStatus).includes(status)) {
    res.status(400).json({ 
      message: `Estado inválido. Debe ser uno de: ${Object.values(AppointmentStatus).join(', ')}` 
    });
    return;
  }

  // Actualizar campos proporcionados
  const updatedAppointment: Appointment = {
    ...currentAppointment,
    appointment_date: appointmentDateTime || currentAppointment.appointment_date,
    status: status || currentAppointment.status,
    notes: notes !== undefined ? notes : currentAppointment.notes,
    updated_at: new Date(),
  };

  appointments[appointmentIndex] = updatedAppointment;

  res.json(updatedAppointment);
};

/**
 * @description Elimina una cita por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const deleteAppointment: RequestHandler = (req, res) => {
  const id = req.params.id;
  const appointmentIndex = appointments.findIndex(a => a.id === id);

  if (appointmentIndex === -1) {
    res.status(404).json({ message: 'Cita no encontrada' });
    return;
  }

  appointments.splice(appointmentIndex, 1);

  // El código de estado 204 (No Content) es estándar para eliminaciones exitosas.
  res.status(204).send();
};