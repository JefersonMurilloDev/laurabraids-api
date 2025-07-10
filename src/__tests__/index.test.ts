
/**
 * @file Archivo de tests para los endpoints de la API.
 * @description Este archivo contiene los tests para verificar el correcto funcionamiento de las rutas de la API,
 *              utilizando Supertest para simular las peticiones HTTP.
 */

import request from 'supertest';
import app from '../index'; // Importamos la aplicación de Express
import { resetBraids } from '../controllers/braids.controller'; // Importamos la función para resetear los datos
import { resetUsersForTesting } from '../controllers/users.controller';
import { resetStylistsForTesting } from '../controllers/stylists.controller';
import { resetStyles } from '../controllers/styles.controller';
import { resetProductsForTesting } from '../controllers/products.controller';
import { resetAppointments } from '../controllers/appointments.controller';
import { resetReviews } from '../controllers/reviews.controller';

// Hook para resetear los datos antes de cada prueba
beforeEach(async () => {
  resetBraids();
  await resetUsersForTesting();
  await resetStylistsForTesting();
  resetStyles();
  await resetProductsForTesting();
  resetAppointments();
  resetReviews();
});

/**
 * @description Suite de tests para el endpoint principal de la API (`/`).
 */
describe('GET /', () => {
  /**
   * @description Test para asegurar que la ruta raíz responde correctamente.
   * @test {GET /} - Debería devolver un status 200 y un mensaje de bienvenida.
   */
  it('debería responder con el texto de bienvenida', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200);

    expect(response.text).toBe('¡El servidor de LauraBraids está funcionando!');
  });
});

/**
 * @description Suite de tests para los endpoints de trenzas (`/api/braids`).
 */
describe('GET /api/braids', () => {
  /**
   * @description Test para obtener todas las trenzas.
   * @test {GET /api/braids} - Debería devolver un array de trenzas y un status 200.
   */
  it('debería devolver una lista de trenzas', async () => {
    const response = await request(app)
      .get('/api/braids')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta sea un array y contenga al menos un objeto.
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Verificamos que el primer objeto tenga las propiedades de una trenza.
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('description');
    expect(response.body[0]).toHaveProperty('photo_url');
    expect(response.body[0]).toHaveProperty('category');
  });

  /**
   * @description Test para obtener una trenza específica por su ID.
   * @test {GET /api/braids/:id} - Debería devolver una única trenza con el ID solicitado y un status 200.
   */
  it('debería devolver una trenza específica por su id', async () => {
    const response = await request(app)
      .get('/api/braids/1')
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta sea un objeto con las propiedades correctas.
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'Box Braids');
    expect(response.body).toHaveProperty('description', 'Clásicas y versátiles, las Box Braids son un estilo protector duradero.');
    expect(response.body).toHaveProperty('category', 'Largo');
    expect(response.body).toHaveProperty('price', 150);
  });

  /**
   * @description Test para manejar el caso de una trenza no encontrada.
   * @test {GET /api/braids/:id} - Debería devolver un error 404 si la trenza no existe.
   */
  it('debería devolver un error 404 si la trenza no existe', async () => {
    // Solicitamos un ID que sabemos que no existe.
    await request(app)
      .get('/api/braids/999')
      .expect(404);
  });
});

/**
 * @description Suite de tests para la creación de trenzas (`POST /api/braids`).
 */
describe('POST /api/braids', () => {
  /**
   * @description Test para crear una nueva trenza.
   * @test {POST /api/braids} - Debería crear una nueva trenza y devolverla con un status 201.
   */
  it('debería crear una nueva trenza', async () => {
    const newBraid = {
      name: 'Fulani Braids',
      description: 'Un estilo adornado con cuentas y patrones geométricos.',
      photo_url: 'https://example.com/fulani.jpg',
      category: 'Adornado',
      price: 180,
    };

    const response = await request(app)
      .post('/api/braids')
      .send(newBraid)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toMatchObject(newBraid);
  });
});

/**
 * @description Suite de tests para la actualización de trenzas (`PUT /api/braids/:id`).
 */
describe('PUT /api/braids/:id', () => {
  it('debería actualizar una trenza existente', async () => {
    const updatedData = {
      name: 'Box Braids Updated',
      description: 'Una versión actualizada de las clásicas Box Braids.',
      photo_url: 'https://example.com/box_braids_updated.jpg',
      category: 'Largo',
      price: 160,
    };

    const response = await request(app)
      .put('/api/braids/1')
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toMatchObject(updatedData);
  });

  it('debería devolver un error 404 si la trenza a actualizar no existe', async () => {
    await request(app)
      .put('/api/braids/999')
      .send({ name: 'No existe', description: 'No importa', photo_url: '', category: '', price: 0 })
      .expect(404);
  });
});

/**
 * @description Suite de tests para la eliminación de trenzas (`DELETE /api/braids/:id`).
 */
describe('DELETE /api/braids/:id', () => {
  it('debería eliminar una trenza existente y devolver un status 204', async () => {
    await request(app)
      .delete('/api/braids/2')
      .expect(204);

    // Verificamos que la trenza ya no exista
    await request(app)
      .get('/api/braids/2')
      .expect(404);
  });

  it('debería devolver un error 404 si la trenza a eliminar no existe', async () => {
    await request(app)
      .delete('/api/braids/999')
      .expect(404);
  });
});
