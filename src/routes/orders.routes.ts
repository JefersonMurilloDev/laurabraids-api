import { Router } from 'express';
import { 
  getOrders,
  getOrderSummaries,
  getCustomerOrders,
  getOrderById, 
  getOrderWithItems,
  createOrder, 
  updateOrder,
  cancelOrder 
} from '../controllers/orders.controller';
import { 
  validateBody, 
  validateParams 
} from '../middleware/validation.middleware';
import {
  requireAuth,
  requireAdmin
} from '../middleware/auth.middleware';
import {
  createOrderSchema,
  updateOrderSchema,
  orderParamsSchema,
  customerParamsSchema
} from '../schemas/orders.schema';

/**
 * @file Define las rutas para la gestión de pedidos del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de pedidos,
 *              incluyendo gestión de pedidos de productos y items.
 */

const router = Router();

// Definición de las rutas para pedidos
// IMPORTANTE: Las rutas específicas DEBEN ir ANTES que las rutas con parámetros

/**
 * GET /api/orders - Obtener todos los pedidos
 * @description Retorna lista completa de pedidos (solo administradores)
 * @access Solo ADMIN
 */
router.get('/', requireAdmin, getOrders);

/**
 * GET /api/orders/summaries - Obtener resúmenes de pedidos
 * @description Retorna lista de resúmenes de pedidos para dashboard administrativo
 * @access Solo ADMIN
 */
router.get('/summaries', requireAdmin, getOrderSummaries);

/**
 * GET /api/orders/customer/:customerId - Obtener pedidos de un cliente
 * @description Retorna lista de pedidos de un cliente específico
 * @param {string} customerId - UUID del cliente
 * @access Propio cliente o ADMIN
 */
router.get('/customer/:customerId', requireAuth, validateParams(customerParamsSchema), getCustomerOrders);

/**
 * POST /api/orders - Crear un nuevo pedido
 * @description Crea un nuevo pedido con sus items
 * @body {customer_id, items[], shipping_address?, billing_address?, payment_method?}
 * @access Usuario autenticado
 */
router.post('/', requireAuth, validateBody(createOrderSchema), createOrder);

// Rutas con parámetros VAN AL FINAL para evitar conflictos

/**
 * GET /api/orders/:id - Obtener un pedido por ID
 * @description Retorna datos básicos de un pedido específico
 * @param {string} id - UUID del pedido
 * @access Propietario del pedido o ADMIN
 */
router.get('/:id', requireAuth, validateParams(orderParamsSchema), getOrderById);

/**
 * GET /api/orders/:id/items - Obtener un pedido con sus items
 * @description Retorna un pedido completo con todos sus items
 * @param {string} id - UUID del pedido
 * @access Propietario del pedido o ADMIN
 */
router.get('/:id/items', requireAuth, validateParams(orderParamsSchema), getOrderWithItems);

/**
 * PUT /api/orders/:id - Actualizar un pedido existente
 * @description Actualiza datos de un pedido específico
 * @param {string} id - UUID del pedido
 * @body {status?, shipping_address?, billing_address?, payment_method?, payment_status?}
 * @access Solo ADMIN (clientes solo pueden cancelar)
 */
router.put('/:id', requireAuth, validateParams(orderParamsSchema), validateBody(updateOrderSchema), updateOrder);

/**
 * POST /api/orders/:id/cancel - Cancelar un pedido
 * @description Cancela un pedido específico (cambia estado a CANCELLED)
 * @param {string} id - UUID del pedido
 * @access Propietario del pedido o ADMIN
 */
router.post('/:id/cancel', requireAuth, validateParams(orderParamsSchema), cancelOrder);

export default router;