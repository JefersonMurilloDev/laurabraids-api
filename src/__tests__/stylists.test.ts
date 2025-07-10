/**
 * @file Tests para los endpoints de estilistas de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de estilistas,
 *              incluyendo filtros por destacadas y gestión de perfiles.
 */

import request from 'supertest';
import app from '../index';
import { resetStylistsForTesting } from '../controllers/stylists.controller';

// Hook para resetear los datos antes de cada prueba
beforeEach(async () => {
  await resetStylistsForTesting();
});

/**
 * @description Suite de tests para obtener estilistas (GET /api/stylists).
 */
describe('GET /api/stylists', () => {
  /**
   * @description Test para obtener todas las estilistas.
   */
  it('debería devolver una lista de estilistas', async () => {
    const response = await request(app)
      .get('/api/stylists')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta sea un array
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verificamos que el primer elemento tenga las propiedades correctas
    const firstStylist = response.body[0];
    expect(firstStylist).toHaveProperty('id');
    expect(firstStylist).toHaveProperty('name');
    expect(firstStylist).toHaveProperty('specialty');
    expect(firstStylist).toHaveProperty('photo_url');
    expect(firstStylist).toHaveProperty('description');
    expect(firstStylist).toHaveProperty('is_featured');
    expect(firstStylist).toHaveProperty('created_at');
    expect(firstStylist).toHaveProperty('updated_at');
  });

  /**
   * @description Test para filtrar estilistas destacadas.
   */
  it('debería devolver solo estilistas destacadas cuando se filtra por featured=true', async () => {
    const response = await request(app)
      .get('/api/stylists?featured=true')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las estilistas devueltas sean destacadas
    response.body.forEach((stylist: any) => {
      expect(stylist.is_featured).toBe(true);
    });
  });
});

/**
 * @description Suite de tests para obtener estilista por ID (GET /api/stylists/:id).
 */
describe('GET /api/stylists/:id', () => {
  /**
   * @description Test para obtener una estilista específica por su ID.
   */
  it('debería devolver una estilista específica por su id', async () => {
    // Primero obtenemos la lista para conseguir un ID válido
    const stylistsResponse = await request(app).get('/api/stylists');
    const validStylistId = stylistsResponse.body[0].id;

    const response = await request(app)
      .get(`/api/stylists/${validStylistId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta tenga las propiedades correctas
    expect(response.body).toHaveProperty('id', validStylistId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('specialty');
    expect(response.body).toHaveProperty('photo_url');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('is_featured');
  });

  /**
   * @description Test para manejar el caso de una estilista no encontrada.
   */
  it('debería devolver un error 400 si el ID no es válido', async () => {
    await request(app)
      .get('/api/stylists/estilista-inexistente-123')
      .expect(400);
  });
});

/**
 * @description Suite de tests para crear estilistas (POST /api/stylists).
 */
describe('POST /api/stylists', () => {
  /**
   * @description Test para crear una nueva estilista con todos los campos.
   */
  it('debería crear una nueva estilista correctamente', async () => {
    const newStylist = {
      name: 'María González',
      specialty: 'Trenzas Modernas',
      photo_url: 'https://example.com/maria.jpg',
      description: 'Especialista en estilos modernos y creativos.',
      is_featured: true
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(newStylist)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verificamos que la estilista fue creada correctamente
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', newStylist.name);
    expect(response.body).toHaveProperty('specialty', newStylist.specialty);
    expect(response.body).toHaveProperty('photo_url', newStylist.photo_url);
    expect(response.body).toHaveProperty('description', newStylist.description);
    expect(response.body).toHaveProperty('is_featured', newStylist.is_featured);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  /**
   * @description Test para crear una estilista sin photo_url (debería usar URL por defecto).
   */
  it('debería crear una estilista con photo_url por defecto si no se proporciona', async () => {
    const newStylist = {
      name: 'Sofía López',
      specialty: 'Trenzas Clásicas',
      description: 'Experta en estilos tradicionales.',
      is_featured: false
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(newStylist)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('photo_url', 'https://example.com/default-stylist.jpg');
  });

  /**
   * @description Test para crear una estilista sin is_featured (debería ser false por defecto).
   */
  it('debería crear una estilista con is_featured=false por defecto', async () => {
    const newStylist = {
      name: 'Lucia Martínez',
      specialty: 'Extensiones',
      description: 'Especialista en extensiones de cabello.'
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(newStylist)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('is_featured', false);
  });

  /**
   * @description Test para validar campos requeridos.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteStylist = {
      name: 'Estilista Incompleta'
      // Faltan specialty y description
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(incompleteStylist)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Errores de validación');
  });

  /**
   * @description Test para validar tipo de is_featured.
   */
  it('debería devolver error 400 si is_featured no es booleano', async () => {
    const stylistWithInvalidFeatured = {
      name: 'Estilista Test',
      specialty: 'Trenzas Africanas',
      description: 'Test description con suficiente longitud para pasar validación',
      is_featured: 'not-a-boolean'
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(stylistWithInvalidFeatured)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });

  /**
   * @description Test para validar especialidad válida.
   */
  it('debería devolver error 400 si la especialidad no es válida', async () => {
    const stylistWithInvalidSpecialty = {
      name: 'Estilista Test',
      specialty: 'Especialidad Inválida',
      description: 'Test description con suficiente longitud para pasar validación'
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(stylistWithInvalidSpecialty)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.errors[0].message).toContain('especialidad de trenzas válida');
  });

  /**
   * @description Test para validar longitud mínima de descripción.
   */
  it('debería devolver error 400 si la descripción es muy corta', async () => {
    const stylistWithShortDescription = {
      name: 'Estilista Test',
      specialty: 'Box Braids',
      description: 'Corto'
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(stylistWithShortDescription)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.errors[0].message).toContain('al menos 10 caracteres');
  });

  /**
   * @description Test para validar caracteres en el nombre.
   */
  it('debería devolver error 400 si el nombre contiene números', async () => {
    const stylistWithInvalidName = {
      name: 'Estilista123',
      specialty: 'Trenzas Modernas',
      description: 'Descripción válida con suficiente longitud'
    };

    const response = await request(app)
      .post('/api/stylists')
      .send(stylistWithInvalidName)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });
});

/**
 * @description Suite de tests para actualizar estilistas (PUT /api/stylists/:id).
 */
describe('PUT /api/stylists/:id', () => {
  /**
   * @description Test para actualizar una estilista existente.
   */
  it('debería actualizar una estilista existente', async () => {
    // Obtener una estilista existente
    const stylistsResponse = await request(app).get('/api/stylists');
    const existingStylist = stylistsResponse.body[0];

    const updatedData = {
      name: 'Nombre Actualizado',
      specialty: 'Trenzas Modernas',
      description: 'Descripción actualizada con suficiente longitud',
      is_featured: !existingStylist.is_featured
    };

    const response = await request(app)
      .put(`/api/stylists/${existingStylist.id}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('name', updatedData.name);
    expect(response.body).toHaveProperty('specialty', updatedData.specialty);
    expect(response.body).toHaveProperty('description', updatedData.description);
    expect(response.body).toHaveProperty('is_featured', updatedData.is_featured);
    expect(response.body).toHaveProperty('id', existingStylist.id);
  });

  /**
   * @description Test para manejar estilista no encontrada en actualización.
   */
  it('debería devolver error 400 si el ID no es válido', async () => {
    await request(app)
      .put('/api/stylists/estilista-inexistente-123')
      .send({ name: 'No existe' })
      .expect(400);
  });

  /**
   * @description Test para validar tipo de is_featured en actualización.
   */
  it('debería devolver error 400 si is_featured no es booleano en actualización', async () => {
    const stylistsResponse = await request(app).get('/api/stylists');
    const existingStylist = stylistsResponse.body[0];

    const response = await request(app)
      .put(`/api/stylists/${existingStylist.id}`)
      .send({ is_featured: 'not-a-boolean' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Errores de validación');
  });
});

/**
 * @description Suite de tests para eliminar estilistas (DELETE /api/stylists/:id).
 */
describe('DELETE /api/stylists/:id', () => {
  /**
   * @description Test para eliminar una estilista existente.
   */
  it('debería eliminar una estilista existente y devolver status 204', async () => {
    // Obtener una estilista existente
    const stylistsResponse = await request(app).get('/api/stylists');
    const existingStylist = stylistsResponse.body[0];

    await request(app)
      .delete(`/api/stylists/${existingStylist.id}`)
      .expect(204);

    // Verificar que la estilista ya no existe
    await request(app)
      .get(`/api/stylists/${existingStylist.id}`)
      .expect(404);
  });

  /**
   * @description Test para manejar estilista no encontrada en eliminación.
   */
  it('debería devolver error 400 si el ID no es válido', async () => {
    await request(app)
      .delete('/api/stylists/estilista-inexistente-123')
      .expect(400);
  });
});