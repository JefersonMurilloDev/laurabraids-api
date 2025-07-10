/**
 * @file Tests para los endpoints de citas de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de citas,
 *              incluyendo filtros y validaciones de fechas y disponibilidad.
 */

import request from 'supertest';
import app from '../index';
import { resetAppointments } from '../controllers/appointments.controller';
import { AppointmentStatus } from '../interfaces/appointment.interface';

// Hook para resetear los datos antes de cada prueba
beforeEach(() => {
  resetAppointments();
});

/**
 * @description Suite de tests para obtener citas (GET /api/appointments).
 */
describe('GET /api/appointments', () => {
  /**
   * @description Test para obtener todas las citas.
   */
  it('debería devolver una lista de citas', async () => {
    const response = await request(app)
      .get('/api/appointments')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta sea un array
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verificamos que el primer elemento tenga las propiedades correctas
    const firstAppointment = response.body[0];
    expect(firstAppointment).toHaveProperty('id');
    expect(firstAppointment).toHaveProperty('user_id');
    expect(firstAppointment).toHaveProperty('stylist_id');
    expect(firstAppointment).toHaveProperty('style_id');
    expect(firstAppointment).toHaveProperty('appointment_date');
    expect(firstAppointment).toHaveProperty('status');
    expect(firstAppointment).toHaveProperty('notes');
    expect(firstAppointment).toHaveProperty('created_at');
    expect(firstAppointment).toHaveProperty('updated_at');
  });

  /**
   * @description Test para filtrar citas por usuario.
   */
  it('debería devolver solo citas del usuario especificado', async () => {
    const user_id = 'user-1';
    const response = await request(app)
      .get(`/api/appointments?user_id=${user_id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las citas devueltas sean del usuario solicitado
    response.body.forEach((appointment: any) => {
      expect(appointment.user_id).toBe(user_id);
    });
  });

  /**
   * @description Test para filtrar citas por estilista.
   */
  it('debería devolver solo citas de la estilista especificada', async () => {
    const stylist_id = 'stylist-1';
    const response = await request(app)
      .get(`/api/appointments?stylist_id=${stylist_id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las citas devueltas sean de la estilista solicitada
    response.body.forEach((appointment: any) => {
      expect(appointment.stylist_id).toBe(stylist_id);
    });
  });

  /**
   * @description Test para filtrar citas por estado.
   */
  it('debería devolver solo citas con el estado especificado', async () => {
    const status = AppointmentStatus.SCHEDULED;
    const response = await request(app)
      .get(`/api/appointments?status=${status}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las citas devueltas tengan el estado solicitado
    response.body.forEach((appointment: any) => {
      expect(appointment.status).toBe(status);
    });
  });

  /**
   * @description Test para filtrar citas por fecha.
   */
  it('debería devolver solo citas de la fecha especificada', async () => {
    const date = '2024-07-15';
    const response = await request(app)
      .get(`/api/appointments?date=${date}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las citas devueltas sean de la fecha solicitada
    response.body.forEach((appointment: any) => {
      const appointmentDate = new Date(appointment.appointment_date);
      const filterDate = new Date(date);
      expect(appointmentDate.toDateString()).toBe(filterDate.toDateString());
    });
  });
});

/**
 * @description Suite de tests para obtener cita por ID (GET /api/appointments/:id).
 */
describe('GET /api/appointments/:id', () => {
  /**
   * @description Test para obtener una cita específica por su ID.
   */
  it('debería devolver una cita específica por su id', async () => {
    // Primero obtenemos la lista para conseguir un ID válido
    const appointmentsResponse = await request(app).get('/api/appointments');
    const validAppointmentId = appointmentsResponse.body[0].id;

    const response = await request(app)
      .get(`/api/appointments/${validAppointmentId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta tenga las propiedades correctas
    expect(response.body).toHaveProperty('id', validAppointmentId);
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('stylist_id');
    expect(response.body).toHaveProperty('style_id');
    expect(response.body).toHaveProperty('appointment_date');
    expect(response.body).toHaveProperty('status');
  });

  /**
   * @description Test para manejar el caso de una cita no encontrada.
   */
  it('debería devolver un error 404 si la cita no existe', async () => {
    await request(app)
      .get('/api/appointments/cita-inexistente-123')
      .expect(404);
  });
});

/**
 * @description Suite de tests para crear citas (POST /api/appointments).
 */
describe('POST /api/appointments', () => {
  /**
   * @description Test para crear una nueva cita con todos los campos.
   */
  it('debería crear una nueva cita correctamente', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 días en el futuro

    const newAppointment = {
      user_id: 'user-test-123',
      stylist_id: 'stylist-test-123',
      style_id: 'style-test-123',
      appointment_date: futureDate.toISOString(),
      notes: 'Cita de prueba para testing'
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(newAppointment)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verificamos que la cita fue creada correctamente
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id', newAppointment.user_id);
    expect(response.body).toHaveProperty('stylist_id', newAppointment.stylist_id);
    expect(response.body).toHaveProperty('style_id', newAppointment.style_id);
    expect(response.body).toHaveProperty('status', AppointmentStatus.SCHEDULED);
    expect(response.body).toHaveProperty('notes', newAppointment.notes);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  /**
   * @description Test para crear una cita sin notas (campo opcional).
   */
  it('debería crear una cita sin notas', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const newAppointment = {
      user_id: 'user-test-456',
      stylist_id: 'stylist-test-456',
      style_id: 'style-test-456',
      appointment_date: futureDate.toISOString()
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(newAppointment)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('notes', '');
  });

  /**
   * @description Test para validar campos requeridos.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteAppointment = {
      user_id: 'user-test-789'
      // Faltan stylist_id, style_id, appointment_date
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(incompleteAppointment)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Faltan campos requeridos');
  });

  /**
   * @description Test para validar formato de fecha.
   */
  it('debería devolver error 400 si el formato de fecha es inválido', async () => {
    const appointmentWithInvalidDate = {
      user_id: 'user-test-invalid',
      stylist_id: 'stylist-test-invalid',
      style_id: 'style-test-invalid',
      appointment_date: 'fecha-invalida'
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentWithInvalidDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Formato de fecha inválido');
  });

  /**
   * @description Test para validar que la fecha sea futura.
   */
  it('debería devolver error 400 si la fecha no es futura', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Ayer

    const appointmentWithPastDate = {
      user_id: 'user-test-past',
      stylist_id: 'stylist-test-past',
      style_id: 'style-test-past',
      appointment_date: pastDate.toISOString()
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentWithPastDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('La fecha de la cita debe ser futura');
  });

  /**
   * @description Test para validar disponibilidad de estilista.
   */
  it('debería devolver error 409 si la estilista ya tiene una cita en esa fecha/hora', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const firstAppointment = {
      user_id: 'user-1',
      stylist_id: 'stylist-conflict',
      style_id: 'style-1',
      appointment_date: futureDate.toISOString()
    };

    // Crear la primera cita
    await request(app)
      .post('/api/appointments')
      .send(firstAppointment)
      .expect(201);

    // Intentar crear segunda cita con la misma estilista en la misma fecha/hora
    const conflictingAppointment = {
      user_id: 'user-2',
      stylist_id: 'stylist-conflict', // Misma estilista
      style_id: 'style-2',
      appointment_date: futureDate.toISOString() // Misma fecha/hora
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(conflictingAppointment)
      .expect('Content-Type', /json/)
      .expect(409);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('La estilista ya tiene una cita programada');
  });
});

/**
 * @description Suite de tests para actualizar citas (PUT /api/appointments/:id).
 */
describe('PUT /api/appointments/:id', () => {
  /**
   * @description Test para actualizar una cita existente.
   */
  it('debería actualizar una cita existente', async () => {
    // Obtener una cita existente
    const appointmentsResponse = await request(app).get('/api/appointments');
    const existingAppointment = appointmentsResponse.body[0];

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    const updatedData = {
      appointment_date: futureDate.toISOString(),
      status: AppointmentStatus.COMPLETED,
      notes: 'Notas actualizadas'
    };

    const response = await request(app)
      .put(`/api/appointments/${existingAppointment.id}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status', updatedData.status);
    expect(response.body).toHaveProperty('notes', updatedData.notes);
    expect(response.body).toHaveProperty('id', existingAppointment.id);
  });

  /**
   * @description Test para manejar cita no encontrada en actualización.
   */
  it('debería devolver error 404 si la cita a actualizar no existe', async () => {
    await request(app)
      .put('/api/appointments/cita-inexistente-123')
      .send({ notes: 'No existe' })
      .expect(404);
  });

  /**
   * @description Test para validar estado en actualización.
   */
  it('debería devolver error 400 si el estado es inválido', async () => {
    const appointmentsResponse = await request(app).get('/api/appointments');
    const existingAppointment = appointmentsResponse.body[0];

    const response = await request(app)
      .put(`/api/appointments/${existingAppointment.id}`)
      .send({ status: 'ESTADO_INVALIDO' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Estado inválido');
  });

  /**
   * @description Test para validar que se acepten todos los estados válidos.
   */
  it('debería aceptar todos los estados válidos', async () => {
    const appointmentsResponse = await request(app).get('/api/appointments');
    const existingAppointment = appointmentsResponse.body[0];

    const validStatuses = Object.values(AppointmentStatus);
    
    for (const status of validStatuses) {
      await request(app)
        .put(`/api/appointments/${existingAppointment.id}`)
        .send({ status: status })
        .expect('Content-Type', /json/)
        .expect(200);
    }
  });
});

/**
 * @description Suite de tests para eliminar citas (DELETE /api/appointments/:id).
 */
describe('DELETE /api/appointments/:id', () => {
  /**
   * @description Test para eliminar una cita existente.
   */
  it('debería eliminar una cita existente y devolver status 204', async () => {
    // Obtener una cita existente
    const appointmentsResponse = await request(app).get('/api/appointments');
    const existingAppointment = appointmentsResponse.body[0];

    await request(app)
      .delete(`/api/appointments/${existingAppointment.id}`)
      .expect(204);

    // Verificar que la cita ya no existe
    await request(app)
      .get(`/api/appointments/${existingAppointment.id}`)
      .expect(404);
  });

  /**
   * @description Test para manejar cita no encontrada en eliminación.
   */
  it('debería devolver error 404 si la cita a eliminar no existe', async () => {
    await request(app)
      .delete('/api/appointments/cita-inexistente-123')
      .expect(404);
  });
});