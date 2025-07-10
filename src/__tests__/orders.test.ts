/**
 * @file Tests para los endpoints de pedidos de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de pedidos,
 *              incluyendo validaciones, creación de pedidos con items y gestión de estados.
 */

import request from 'supertest';
import app from '../index';
import { resetOrdersForTesting } from '../controllers/orders.controller';
import { resetUsersForTesting } from '../controllers/users.controller';

// Hook para resetear los datos antes de cada prueba
beforeEach(async () => {
  await resetOrdersForTesting();
  await resetUsersForTesting();
});

// Datos de prueba comunes
const mockCustomerId = '550e8400-e29b-41d4-a716-446655440001';
const mockProductId = '550e8400-e29b-41d4-a716-446655440002';

const validOrderData = {
  customer_id: mockCustomerId,
  items: [
    {
      product_id: mockProductId,
      quantity: 2,
      unit_price: 25.99
    },
    {
      product_id: '550e8400-e29b-41d4-a716-446655440003',
      quantity: 1,
      unit_price: 15.50
    }
  ],
  shipping_address: 'Calle Falsa 123, Ciudad, País',
  billing_address: 'Calle Falsa 123, Ciudad, País',
  payment_method: 'Tarjeta de Crédito'
};

/**
 * @description Suite de tests para crear pedidos (POST /api/orders).
 */
describe('POST /api/orders', () => {
  /**
   * @description Test para crear un nuevo pedido correctamente.
   */
  it('debería crear un nuevo pedido con datos válidos', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send(validOrderData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('message', 'Pedido creado exitosamente');
    
    const createdOrder = response.body.data;
    expect(createdOrder).toHaveProperty('id');
    expect(createdOrder).toHaveProperty('customer_id', validOrderData.customer_id);
    expect(createdOrder).toHaveProperty('order_number');
    expect(createdOrder).toHaveProperty('status', 'PENDING');
    expect(createdOrder).toHaveProperty('payment_status', 'PENDING');
    expect(createdOrder).toHaveProperty('subtotal');
    expect(createdOrder).toHaveProperty('tax_amount');
    expect(createdOrder).toHaveProperty('shipping_amount');
    expect(createdOrder).toHaveProperty('total_amount');
    expect(createdOrder).toHaveProperty('items');
    
    // Verificar cálculos
    const expectedSubtotal = (2 * 25.99) + (1 * 15.50); // 67.48
    expect(createdOrder.subtotal).toBe(expectedSubtotal);
    expect(createdOrder.items).toHaveLength(2);
  });

  /**
   * @description Test para validar que el pedido debe tener items.
   */
  it('debería fallar al crear un pedido sin items', async () => {
    const invalidOrderData = {
      customer_id: mockCustomerId,
      items: []
    };

    const response = await request(app)
      .post('/api/orders')
      .send(invalidOrderData)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * @description Test para validar customer_id requerido.
   */
  it('debería fallar al crear un pedido sin customer_id', async () => {
    const invalidOrderData = {
      items: validOrderData.items
    };

    const response = await request(app)
      .post('/api/orders')
      .send(invalidOrderData)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * @description Test para validar que no se pueden duplicar productos.
   */
  it('debería fallar al crear un pedido con productos duplicados', async () => {
    const invalidOrderData = {
      customer_id: mockCustomerId,
      items: [
        {
          product_id: mockProductId,
          quantity: 2,
          unit_price: 25.99
        },
        {
          product_id: mockProductId, // Duplicado
          quantity: 1,
          unit_price: 25.99
        }
      ]
    };

    const response = await request(app)
      .post('/api/orders')
      .send(invalidOrderData)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * @description Test para validar precios y cantidades positivas.
   */
  it('debería fallar con precios o cantidades inválidas', async () => {
    const invalidOrderData = {
      customer_id: mockCustomerId,
      items: [
        {
          product_id: mockProductId,
          quantity: -1, // Cantidad negativa
          unit_price: 25.99
        }
      ]
    };

    const response = await request(app)
      .post('/api/orders')
      .send(invalidOrderData)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });
});

/**
 * @description Suite de tests para obtener pedidos por cliente (GET /api/orders/customer/:customerId).
 */
describe('GET /api/orders/customer/:customerId', () => {
  /**
   * @description Test para obtener pedidos de un cliente específico.
   */
  it('debería devolver los pedidos de un cliente específico', async () => {
    // Crear un pedido
    const createResponse = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const response = await request(app)
      .get(`/api/orders/customer/${mockCustomerId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    const order = response.body.data[0];
    expect(order).toHaveProperty('customer_id', mockCustomerId);
  });

  /**
   * @description Test para cliente sin pedidos.
   */
  it('debería devolver array vacío para cliente sin pedidos', async () => {
    const emptyCustomerId = '550e8400-e29b-41d4-a716-446655440999';
    
    const response = await request(app)
      .get(`/api/orders/customer/${emptyCustomerId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });
});

/**
 * @description Suite de tests para obtener pedido por ID (GET /api/orders/:id).
 */
describe('GET /api/orders/:id', () => {
  /**
   * @description Test para obtener un pedido específico por su ID.
   */
  it('debería devolver un pedido específico por su id', async () => {
    // Crear un pedido
    const createResponse = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const orderId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/orders/${orderId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id', orderId);
    expect(response.body.data).toHaveProperty('customer_id', mockCustomerId);
  });

  /**
   * @description Test para manejar el caso de un pedido no encontrado.
   */
  it('debería devolver un error 404 si el pedido no existe', async () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';
    
    const response = await request(app)
      .get(`/api/orders/${fakeId}`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Pedido no encontrado');
  });
});

/**
 * @description Suite de tests para obtener pedido con items (GET /api/orders/:id/items).
 */
describe('GET /api/orders/:id/items', () => {
  /**
   * @description Test para obtener un pedido con sus items incluidos.
   */
  it('debería devolver un pedido con sus items incluidos', async () => {
    // Crear un pedido
    const createResponse = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const orderId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/orders/${orderId}/items`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    
    const orderWithItems = response.body.data;
    expect(orderWithItems).toHaveProperty('id', orderId);
    expect(orderWithItems).toHaveProperty('items');
    expect(Array.isArray(orderWithItems.items)).toBe(true);
    expect(orderWithItems.items.length).toBe(2);
    
    // Verificar estructura de los items
    const firstItem = orderWithItems.items[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('order_id', orderId);
    expect(firstItem).toHaveProperty('product_id');
    expect(firstItem).toHaveProperty('quantity');
    expect(firstItem).toHaveProperty('unit_price');
    expect(firstItem).toHaveProperty('total_price');
  });
});

/**
 * @description Suite de tests para actualizar pedidos (PUT /api/orders/:id).
 */
describe('PUT /api/orders/:id', () => {
  /**
   * @description Test para actualizar el estado de un pedido.
   */
  it('debería actualizar el estado de un pedido existente', async () => {
    // Crear un pedido
    const createResponse = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const orderId = createResponse.body.data.id;

    // Actualizar el estado
    const updateData = {
      status: 'CONFIRMED',
      payment_status: 'PAID'
    };

    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Pedido actualizado exitosamente');
    
    const updatedOrder = response.body.data;
    expect(updatedOrder).toHaveProperty('status', 'CONFIRMED');
    expect(updatedOrder).toHaveProperty('payment_status', 'PAID');
  });

  /**
   * @description Test para fallar al actualizar un pedido inexistente.
   */
  it('debería fallar al actualizar un pedido que no existe', async () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';
    
    const response = await request(app)
      .put(`/api/orders/${fakeId}`)
      .send({
        status: 'CONFIRMED'
      })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Pedido no encontrado');
  });

  /**
   * @description Test para validar estados válidos.
   */
  it('debería fallar con estado inválido', async () => {
    // Crear un pedido
    const createResponse = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const orderId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .send({
        status: 'ESTADO_INVALIDO'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });
});

/**
 * @description Suite de tests para cancelar pedidos (POST /api/orders/:id/cancel).
 */
describe('POST /api/orders/:id/cancel', () => {
  /**
   * @description Test para cancelar un pedido correctamente.
   */
  it('debería cancelar un pedido pendiente', async () => {
    // Crear un pedido
    const createResponse = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const orderId = createResponse.body.data.id;

    const response = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Pedido cancelado exitosamente');
    
    const cancelledOrder = response.body.data;
    expect(cancelledOrder).toHaveProperty('status', 'CANCELLED');
  });

  /**
   * @description Test para fallar al cancelar un pedido ya cancelado.
   */
  it('debería fallar al cancelar un pedido ya cancelado', async () => {
    // Crear un pedido
    const createResponse = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const orderId = createResponse.body.data.id;

    // Cancelar el pedido por primera vez
    await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .expect(200);

    // Intentar cancelar de nuevo
    const response = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'El pedido ya está cancelado');
  });

  /**
   * @description Test para fallar al cancelar un pedido inexistente.
   */
  it('debería fallar al cancelar un pedido que no existe', async () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';
    
    const response = await request(app)
      .post(`/api/orders/${fakeId}/cancel`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Pedido no encontrado');
  });
});

/**
 * @description Suite de tests para cálculos automáticos.
 */
describe('Cálculos automáticos de pedidos', () => {
  /**
   * @description Test para verificar cálculo correcto de totales.
   */
  it('debería calcular correctamente subtotal, impuestos, envío y total', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send(validOrderData);

    const order = response.body.data;
    
    // Cálculos esperados
    const expectedSubtotal = (2 * 25.99) + (1 * 15.50); // 67.48
    const expectedTax = expectedSubtotal * 0.1; // 10% = 6.748
    const expectedShipping = expectedSubtotal > 50 ? 0 : 10; // Gratis si > $50
    const expectedTotal = expectedSubtotal + expectedTax + expectedShipping;

    expect(order.subtotal).toBe(expectedSubtotal);
    expect(order.tax_amount).toBeCloseTo(expectedTax, 2);
    expect(order.shipping_amount).toBe(expectedShipping);
    expect(order.total_amount).toBeCloseTo(expectedTotal, 2);
  });

  /**
   * @description Test para envío gratis con pedidos grandes.
   */
  it('debería aplicar envío gratis para pedidos mayores a $50', async () => {
    const largeOrderData = {
      customer_id: mockCustomerId,
      items: [
        {
          product_id: mockProductId,
          quantity: 3,
          unit_price: 25.99 // Total: 77.97
        }
      ]
    };

    const response = await request(app)
      .post('/api/orders')
      .send(largeOrderData);

    const order = response.body.data;
    expect(order.shipping_amount).toBe(0);
  });

  /**
   * @description Test para cobrar envío en pedidos pequeños.
   */
  it('debería cobrar $10 de envío para pedidos menores a $50', async () => {
    const smallOrderData = {
      customer_id: mockCustomerId,
      items: [
        {
          product_id: mockProductId,
          quantity: 1,
          unit_price: 15.50 // Total: 15.50
        }
      ]
    };

    const response = await request(app)
      .post('/api/orders')
      .send(smallOrderData);

    const order = response.body.data;
    expect(order.shipping_amount).toBe(10);
  });
});