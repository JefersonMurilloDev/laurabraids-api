/**
 * @file Tests específicos para el middleware de validación.
 * @description Tests enfocados en probar la funcionalidad del middleware
 *              de validación Zod de manera aislada.
 */

import request from 'supertest';
import express from 'express';
import { z } from 'zod';
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  validateMultiple
} from '../middleware/validation.middleware';

// Crear una aplicación Express de prueba
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  return app;
};

/**
 * @description Suite de tests para validación de body.
 */
describe('Middleware de Validación - Body', () => {
  const testSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18)
  });

  /**
   * @description Test para validación exitosa de body.
   */
  it('debería validar correctamente datos válidos en el body', async () => {
    const app = createTestApp();
    
    app.post('/test', validateBody(testSchema), (req, res) => {
      res.json({ success: true, data: req.body });
    });

    const validData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      age: 25
    };

    const response = await request(app)
      .post('/test')
      .send(validData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(validData);
  });

  /**
   * @description Test para validación fallida de body.
   */
  it('debería devolver error 400 con datos inválidos en el body', async () => {
    const app = createTestApp();
    
    app.post('/test', validateBody(testSchema), (req, res) => {
      res.json({ success: true });
    });

    const invalidData = {
      name: 'A', // Muy corto
      email: 'email-invalido',
      age: 15 // Menor a 18
    };

    const response = await request(app)
      .post('/test')
      .send(invalidData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

/**
 * @description Suite de tests para validación de parámetros.
 */
describe('Middleware de Validación - Params', () => {
  const paramsSchema = z.object({
    id: z.string().uuid()
  });

  /**
   * @description Test para validación exitosa de parámetros.
   */
  it('debería validar correctamente parámetros UUID válidos', async () => {
    const app = createTestApp();
    
    app.get('/test/:id', validateParams(paramsSchema), (req, res) => {
      res.json({ success: true, id: req.params.id });
    });

    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    const response = await request(app)
      .get(`/test/${validUuid}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.id).toBe(validUuid);
  });

  /**
   * @description Test para validación fallida de parámetros.
   */
  it('debería devolver error 400 con UUID inválido', async () => {
    const app = createTestApp();
    
    app.get('/test/:id', validateParams(paramsSchema), (req, res) => {
      res.json({ success: true });
    });

    const invalidUuid = 'not-a-uuid';

    const response = await request(app)
      .get(`/test/${invalidUuid}`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors[0].message).toContain('Invalid uuid');
  });
});

/**
 * @description Suite de tests para validación múltiple.
 */
describe('Middleware de Validación - Múltiple', () => {
  const schemas = {
    body: z.object({
      name: z.string().min(2)
    }),
    params: z.object({
      id: z.string().uuid()
    }),
    query: z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional()
    })
  };

  /**
   * @description Test para validación múltiple exitosa.
   */
  it('debería validar correctamente múltiples partes del request', async () => {
    const app = createTestApp();
    
    app.put('/test/:id', validateMultiple(schemas), (req, res) => {
      res.json({ 
        success: true, 
        body: req.body,
        params: req.params,
        query: req.query
      });
    });

    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const validBody = { name: 'Test Name' };

    const response = await request(app)
      .put(`/test/${validUuid}?page=2`)
      .send(validBody)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.body).toEqual(validBody);
    expect(response.body.params.id).toBe(validUuid);
  });

  /**
   * @description Test para múltiples errores de validación.
   */
  it('debería acumular errores de múltiples partes del request', async () => {
    const app = createTestApp();
    
    app.put('/test/:id', validateMultiple(schemas), (req, res) => {
      res.json({ success: true });
    });

    const invalidUuid = 'not-a-uuid';
    const invalidBody = { name: 'A' }; // Muy corto

    const response = await request(app)
      .put(`/test/${invalidUuid}`)
      .send(invalidBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThanOrEqual(2);
  });
});

/**
 * @description Suite de tests para transformaciones de datos.
 */
describe('Middleware de Validación - Transformaciones', () => {
  const transformSchema = z.object({
    email: z.string().email().transform(s => s.trim().toLowerCase()),
    age: z.string().regex(/^\d+$/).transform(Number),
    name: z.string().transform(s => s.trim())
  });

  /**
   * @description Test para transformaciones automáticas.
   */
  it('debería aplicar transformaciones automáticamente', async () => {
    const app = createTestApp();
    
    app.post('/test', validateBody(transformSchema), (req, res) => {
      res.json({ success: true, data: req.body });
    });

    const inputData = {
      email: 'JUAN@EXAMPLE.COM',
      age: '25',
      name: '  Juan Pérez  '
    };

    const response = await request(app)
      .post('/test')
      .send(inputData)
      .expect(200);

    expect(response.body.data.email).toBe('juan@example.com');
    expect(response.body.data.age).toBe(25);
    expect(response.body.data.name).toBe('Juan Pérez');
  });
});

/**
 * @description Suite de tests para manejo de errores.
 */
describe('Middleware de Validación - Manejo de Errores', () => {
  /**
   * @description Test para formato consistente de errores.
   */
  it('debería devolver errores en formato consistente', async () => {
    const app = createTestApp();
    
    const schema = z.object({
      requiredField: z.string(),
      emailField: z.string().email(),
      numberField: z.number()
    });
    
    app.post('/test', validateBody(schema), (req, res) => {
      res.json({ success: true });
    });

    const response = await request(app)
      .post('/test')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.errors).toBeInstanceOf(Array);
    
    // Verificar estructura de cada error
    response.body.errors.forEach((error: any) => {
      expect(error).toHaveProperty('field');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('code');
    });
  });
});