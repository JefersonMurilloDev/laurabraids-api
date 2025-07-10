import { Router } from 'express';
import { 
  getAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '../controllers/appointments.controller';

/**
 * @file Define las rutas para la gestión de citas del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de citas,
 *              incluyendo filtros por usuario, estilista, estado y fecha.
 */

const router = Router();

// Definición de las rutas para citas

/**
 * GET /api/appointments - Obtener todas las citas
 * @description Retorna lista de citas con filtros opcionales
 * @query {string} user_id - Filtrar por cliente (?user_id=uuid)
 * @query {string} stylist_id - Filtrar por estilista (?stylist_id=uuid)
 * @query {string} status - Filtrar por estado (?status=SCHEDULED)
 * @query {string} date - Filtrar por fecha (?date=2024-07-15)
 * @access Según usuario (propio o ADMIN)
 */
router.get('/', getAppointments);

/**
 * GET /api/appointments/:id - Obtener una cita por ID
 * @description Retorna datos completos de una cita específica
 * @param {string} id - UUID de la cita
 * @access Participantes de la cita o ADMIN
 */
router.get('/:id', getAppointmentById);

/**
 * POST /api/appointments - Crear una nueva cita
 * @description Reserva una nueva cita en el sistema
 * @body {user_id, stylist_id, style_id, appointment_date, notes?}
 * @access Cliente autenticado
 */
router.post('/', createAppointment);

/**
 * PUT /api/appointments/:id - Actualizar una cita existente
 * @description Actualiza datos de una cita específica
 * @param {string} id - UUID de la cita
 * @body {appointment_date?, status?, notes?}
 * @access Participantes de la cita o ADMIN
 */
router.put('/:id', updateAppointment);

/**
 * DELETE /api/appointments/:id - Eliminar una cita
 * @description Elimina permanentemente una cita del sistema
 * @param {string} id - UUID de la cita
 * @access Participantes de la cita o ADMIN
 */
router.delete('/:id', deleteAppointment);

export default router;