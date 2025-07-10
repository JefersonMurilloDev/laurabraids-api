/**
 * @file Tests para los endpoints de categorías de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de categorías,
 *              incluyendo validaciones y gestión de categorías de estilos.
 */

import request from 'supertest';
import app from '../index';
import { resetCategoriesForTesting } from '../controllers/categories.controller';

// Hook para resetear los datos antes de cada prueba
beforeEach(async () => {
  await resetCategoriesForTesting();
});

/**
 * @description Suite de tests para obtener categorías (GET /api/categories).
 */
describe('GET /api/categories', () => {
  /**
   * @description Test para obtener todas las categorías activas.
   * @test {GET /api/categories} - Debería devolver un array de categorías activas y un status 200.
   */
  it('debería devolver una lista de categorías activas', async () => {
    // Primero creamos algunas categorías de prueba
    await request(app)
      .post('/api/categories')
      .send({
        name: 'Protectoras',
        description: 'Estilos que protegen el cabello natural',
        display_order: 1,
        is_active: true
      });

    await request(app)
      .post('/api/categories')
      .send({
        name: 'Clásicas',
        description: 'Trenzas tradicionales',
        display_order: 2,
        is_active: true
      });

    const response = await request(app)
      .get('/api/categories')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta tenga la estructura correcta
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Verificamos que la primera categoría tenga las propiedades correctas
    const firstCategory = response.body.data[0];
    expect(firstCategory).toHaveProperty('id');
    expect(firstCategory).toHaveProperty('name');
    expect(firstCategory).toHaveProperty('description');
    expect(firstCategory).toHaveProperty('display_order');
    expect(firstCategory).toHaveProperty('is_active', true);
    expect(firstCategory).toHaveProperty('created_at');
    expect(firstCategory).toHaveProperty('updated_at');
  });

  /**
   * @description Test para verificar que las categorías se devuelven ordenadas por display_order.
   */
  it('debería devolver las categorías ordenadas por display_order', async () => {
    // Creamos categorías con diferentes display_order
    await request(app)
      .post('/api/categories')
      .send({
        name: 'Tercera',
        display_order: 3
      });

    await request(app)
      .post('/api/categories')
      .send({
        name: 'Primera',
        display_order: 1
      });

    await request(app)
      .post('/api/categories')
      .send({
        name: 'Segunda',
        display_order: 2
      });

    const response = await request(app)
      .get('/api/categories')
      .expect(200);

    const categories = response.body.data;
    expect(categories[0].name).toBe('Primera');
    expect(categories[1].name).toBe('Segunda');
    expect(categories[2].name).toBe('Tercera');
  });
});

/**
 * @description Suite de tests para obtener categoría por ID (GET /api/categories/:id).
 */
describe('GET /api/categories/:id', () => {
  /**
   * @description Test para obtener una categoría específica por su ID.
   */
  it('debería devolver una categoría específica por su id', async () => {
    // Creamos una categoría
    const createResponse = await request(app)
      .post('/api/categories')
      .send({
        name: 'Categoría de Prueba',
        description: 'Una descripción de prueba'
      });

    const categoryId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/categories/${categoryId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta tenga las propiedades correctas
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id', categoryId);
    expect(response.body.data).toHaveProperty('name', 'Categoría de Prueba');
    expect(response.body.data).toHaveProperty('description', 'Una descripción de prueba');
  });

  /**
   * @description Test para manejar el caso de una categoría no encontrada.
   */
  it('debería devolver un error 404 si la categoría no existe', async () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';
    
    const response = await request(app)
      .get(`/api/categories/${fakeId}`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Categoría no encontrada');
  });

  /**
   * @description Test para manejar ID inválido.
   */
  it('debería devolver un error 400 si el ID no es un UUID válido', async () => {
    await request(app)
      .get('/api/categories/id-invalido')
      .expect('Content-Type', /json/)
      .expect(400);
  });
});

/**
 * @description Suite de tests para crear categorías (POST /api/categories).
 */
describe('POST /api/categories', () => {
  /**
   * @description Test para crear una nueva categoría correctamente.
   */
  it('debería crear una nueva categoría con datos válidos', async () => {
    const categoryData = {
      name: 'Nueva Categoría',
      description: 'Descripción de la nueva categoría',
      display_order: 5,
      is_active: true
    };

    const response = await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('message', 'Categoría creada exitosamente');
    
    const createdCategory = response.body.data;
    expect(createdCategory).toHaveProperty('id');
    expect(createdCategory).toHaveProperty('name', categoryData.name);
    expect(createdCategory).toHaveProperty('description', categoryData.description);
    expect(createdCategory).toHaveProperty('display_order', categoryData.display_order);
    expect(createdCategory).toHaveProperty('is_active', categoryData.is_active);
  });

  /**
   * @description Test para validar datos requeridos.
   */
  it('debería fallar al crear una categoría sin nombre', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({
        description: 'Descripción sin nombre'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * @description Test para validar nombres duplicados.
   */
  it('debería fallar al crear una categoría con nombre duplicado', async () => {
    const categoryData = {
      name: 'Categoría Duplicada',
      description: 'Primera categoría'
    };

    // Crear la primera categoría
    await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    // Intentar crear una segunda con el mismo nombre
    const response = await request(app)
      .post('/api/categories')
      .send({
        name: 'Categoría Duplicada',
        description: 'Segunda categoría'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Ya existe una categoría con ese nombre');
  });

  /**
   * @description Test para validar longitud del nombre.
   */
  it('debería fallar con nombre demasiado corto', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({
        name: 'A', // Muy corto
        description: 'Descripción válida'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });
});

/**
 * @description Suite de tests para actualizar categorías (PUT /api/categories/:id).
 */
describe('PUT /api/categories/:id', () => {
  /**
   * @description Test para actualizar una categoría correctamente.
   */
  it('debería actualizar una categoría existente', async () => {
    // Crear una categoría
    const createResponse = await request(app)
      .post('/api/categories')
      .send({
        name: 'Categoría Original',
        description: 'Descripción original'
      });

    const categoryId = createResponse.body.data.id;

    // Actualizar la categoría
    const updateData = {
      name: 'Categoría Actualizada',
      description: 'Descripción actualizada',
      display_order: 10
    };

    const response = await request(app)
      .put(`/api/categories/${categoryId}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Categoría actualizada exitosamente');
    
    const updatedCategory = response.body.data;
    expect(updatedCategory).toHaveProperty('name', updateData.name);
    expect(updatedCategory).toHaveProperty('description', updateData.description);
    expect(updatedCategory).toHaveProperty('display_order', updateData.display_order);
  });

  /**
   * @description Test para fallar al actualizar una categoría inexistente.
   */
  it('debería fallar al actualizar una categoría que no existe', async () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';
    
    const response = await request(app)
      .put(`/api/categories/${fakeId}`)
      .send({
        name: 'Nombre Actualizado'
      })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Categoría no encontrada');
  });
});

/**
 * @description Suite de tests para eliminar categorías (DELETE /api/categories/:id).
 */
describe('DELETE /api/categories/:id', () => {
  /**
   * @description Test para eliminar una categoría correctamente (soft delete).
   */
  it('debería eliminar una categoría existente', async () => {
    // Crear una categoría
    const createResponse = await request(app)
      .post('/api/categories')
      .send({
        name: 'Categoría a Eliminar',
        description: 'Esta categoría será eliminada'
      });

    const categoryId = createResponse.body.data.id;

    // Eliminar la categoría
    const response = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Categoría eliminada exitosamente');

    // Verificar que la categoría ya no aparece en la lista activa
    const listResponse = await request(app)
      .get('/api/categories')
      .expect(200);

    const activeCategories = listResponse.body.data;
    const deletedCategory = activeCategories.find((cat: any) => cat.id === categoryId);
    expect(deletedCategory).toBeUndefined();
  });

  /**
   * @description Test para fallar al eliminar una categoría inexistente.
   */
  it('debería fallar al eliminar una categoría que no existe', async () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';
    
    const response = await request(app)
      .delete(`/api/categories/${fakeId}`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Categoría no encontrada');
  });
});