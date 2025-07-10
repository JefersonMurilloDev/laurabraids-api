/**
 * @file Tests para los endpoints de estilos de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de estilos,
 *              incluyendo filtros por categorías y gestión del catálogo.
 */

import request from 'supertest';
import app from '../index';
import { resetStyles } from '../controllers/styles.controller';

// Hook para resetear los datos antes de cada prueba
beforeEach(() => {
  resetStyles();
});

/**
 * @description Suite de tests para obtener estilos (GET /api/styles).
 */
describe('GET /api/styles', () => {
  /**
   * @description Test para obtener todos los estilos.
   */
  it('debería devolver una lista de estilos', async () => {
    const response = await request(app)
      .get('/api/styles')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta sea un array
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verificamos que el primer elemento tenga las propiedades correctas
    const firstStyle = response.body[0];
    expect(firstStyle).toHaveProperty('id');
    expect(firstStyle).toHaveProperty('name');
    expect(firstStyle).toHaveProperty('photo_url');
    expect(firstStyle).toHaveProperty('description');
    expect(firstStyle).toHaveProperty('category');
    expect(firstStyle).toHaveProperty('created_at');
    expect(firstStyle).toHaveProperty('updated_at');
  });

  /**
   * @description Test para filtrar estilos por categoría.
   */
  it('debería devolver solo estilos de la categoría especificada', async () => {
    const category = 'Largo';
    const response = await request(app)
      .get(`/api/styles?category=${category}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todos los estilos devueltos sean de la categoría solicitada
    response.body.forEach((style: any) => {
      expect(style.category).toBe(category);
    });
  });

  /**
   * @description Test para filtrar estilos por categoría (case insensitive).
   */
  it('debería filtrar por categoría sin importar mayúsculas/minúsculas', async () => {
    const response = await request(app)
      .get('/api/styles?category=largo')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que se devuelvan estilos (filtro case-insensitive)
    response.body.forEach((style: any) => {
      expect(style.category.toLowerCase()).toBe('largo');
    });
  });
});

/**
 * @description Suite de tests para obtener estilo por ID (GET /api/styles/:id).
 */
describe('GET /api/styles/:id', () => {
  /**
   * @description Test para obtener un estilo específico por su ID.
   */
  it('debería devolver un estilo específico por su id', async () => {
    // Primero obtenemos la lista para conseguir un ID válido
    const stylesResponse = await request(app).get('/api/styles');
    const validStyleId = stylesResponse.body[0].id;

    const response = await request(app)
      .get(`/api/styles/${validStyleId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta tenga las propiedades correctas
    expect(response.body).toHaveProperty('id', validStyleId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('photo_url');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('category');
  });

  /**
   * @description Test para manejar el caso de un estilo no encontrado.
   */
  it('debería devolver un error 404 si el estilo no existe', async () => {
    await request(app)
      .get('/api/styles/estilo-inexistente-123')
      .expect(404);
  });
});

/**
 * @description Suite de tests para crear estilos (POST /api/styles).
 */
describe('POST /api/styles', () => {
  /**
   * @description Test para crear un nuevo estilo con todos los campos.
   */
  it('debería crear un nuevo estilo correctamente', async () => {
    const newStyle = {
      name: 'Twist Braids',
      photo_url: 'https://example.com/twist-braids.jpg',
      description: 'Trenzas en espiral que crean un efecto de torsión elegante.',
      category: 'Moderno'
    };

    const response = await request(app)
      .post('/api/styles')
      .send(newStyle)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verificamos que el estilo fue creado correctamente
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', newStyle.name);
    expect(response.body).toHaveProperty('photo_url', newStyle.photo_url);
    expect(response.body).toHaveProperty('description', newStyle.description);
    expect(response.body).toHaveProperty('category', newStyle.category);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  /**
   * @description Test para crear un estilo sin photo_url (debería usar URL por defecto).
   */
  it('debería crear un estilo con photo_url por defecto si no se proporciona', async () => {
    const newStyle = {
      name: 'Dutch Braids',
      description: 'Trenzas inversas que crean un efecto 3D.',
      category: 'Clásico'
    };

    const response = await request(app)
      .post('/api/styles')
      .send(newStyle)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('photo_url', 'https://example.com/default-style.jpg');
  });

  /**
   * @description Test para validar campos requeridos.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteStyle = {
      name: 'Estilo Incompleto'
      // Faltan description y category
    };

    const response = await request(app)
      .post('/api/styles')
      .send(incompleteStyle)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Faltan campos requeridos');
  });

  /**
   * @description Test para validar categorías permitidas.
   */
  it('debería devolver error 400 si la categoría es inválida', async () => {
    const styleWithInvalidCategory = {
      name: 'Estilo Test',
      description: 'Test description',
      category: 'CategoriaInvalida'
    };

    const response = await request(app)
      .post('/api/styles')
      .send(styleWithInvalidCategory)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Categoría inválida');
  });

  /**
   * @description Test para validar que las categorías válidas funcionen.
   */
  it('debería aceptar todas las categorías válidas', async () => {
    const validCategories = ['Largo', 'Corto', 'Clásico', 'Colorido', 'Moderno'];
    
    for (const category of validCategories) {
      const newStyle = {
        name: `Estilo ${category}`,
        description: `Descripción para ${category}`,
        category: category
      };

      await request(app)
        .post('/api/styles')
        .send(newStyle)
        .expect('Content-Type', /json/)
        .expect(201);
    }
  });
});

/**
 * @description Suite de tests para actualizar estilos (PUT /api/styles/:id).
 */
describe('PUT /api/styles/:id', () => {
  /**
   * @description Test para actualizar un estilo existente.
   */
  it('debería actualizar un estilo existente', async () => {
    // Obtener un estilo existente
    const stylesResponse = await request(app).get('/api/styles');
    const existingStyle = stylesResponse.body[0];

    const updatedData = {
      name: 'Nombre Actualizado',
      description: 'Descripción actualizada',
      category: 'Moderno'
    };

    const response = await request(app)
      .put(`/api/styles/${existingStyle.id}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('name', updatedData.name);
    expect(response.body).toHaveProperty('description', updatedData.description);
    expect(response.body).toHaveProperty('category', updatedData.category);
    expect(response.body).toHaveProperty('id', existingStyle.id);
  });

  /**
   * @description Test para manejar estilo no encontrado en actualización.
   */
  it('debería devolver error 404 si el estilo a actualizar no existe', async () => {
    await request(app)
      .put('/api/styles/estilo-inexistente-123')
      .send({ name: 'No existe' })
      .expect(404);
  });

  /**
   * @description Test para validar categoría en actualización.
   */
  it('debería devolver error 400 si la categoría es inválida en actualización', async () => {
    const stylesResponse = await request(app).get('/api/styles');
    const existingStyle = stylesResponse.body[0];

    const response = await request(app)
      .put(`/api/styles/${existingStyle.id}`)
      .send({ category: 'CategoriaInvalida' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Categoría inválida');
  });

  /**
   * @description Test para actualización parcial de campos.
   */
  it('debería permitir actualización parcial de campos', async () => {
    const stylesResponse = await request(app).get('/api/styles');
    const existingStyle = stylesResponse.body[0];

    // Solo actualizar el nombre
    const partialUpdate = {
      name: 'Solo Nombre Actualizado'
    };

    const response = await request(app)
      .put(`/api/styles/${existingStyle.id}`)
      .send(partialUpdate)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('name', partialUpdate.name);
    // Los demás campos deben mantenerse
    expect(response.body).toHaveProperty('description', existingStyle.description);
    expect(response.body).toHaveProperty('category', existingStyle.category);
  });
});

/**
 * @description Suite de tests para eliminar estilos (DELETE /api/styles/:id).
 */
describe('DELETE /api/styles/:id', () => {
  /**
   * @description Test para eliminar un estilo existente.
   */
  it('debería eliminar un estilo existente y devolver status 204', async () => {
    // Obtener un estilo existente
    const stylesResponse = await request(app).get('/api/styles');
    const existingStyle = stylesResponse.body[0];

    await request(app)
      .delete(`/api/styles/${existingStyle.id}`)
      .expect(204);

    // Verificar que el estilo ya no existe
    await request(app)
      .get(`/api/styles/${existingStyle.id}`)
      .expect(404);
  });

  /**
   * @description Test para manejar estilo no encontrado en eliminación.
   */
  it('debería devolver error 404 si el estilo a eliminar no existe', async () => {
    await request(app)
      .delete('/api/styles/estilo-inexistente-123')
      .expect(404);
  });
});