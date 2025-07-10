/**
 * @file Capa de datos para pedidos usando MySQL.
 * @description Operaciones de base de datos para la gestión de pedidos y sus items.
 */

import { executeQuery } from '../config/database.config';
import { 
  Order, 
  OrderItem, 
  OrderWithItems, 
  OrderCreateRequest, 
  OrderUpdateRequest, 
  OrderSummary,
  OrderStatus,
  PaymentStatus
} from '../interfaces/order.interface';
import { RowDataPacket } from 'mysql2';

/**
 * @interface OrderRow
 * @description Interfaz para las filas de pedidos desde MySQL
 */
interface OrderRow extends RowDataPacket {
  id: string;
  customer_id: string;
  order_number: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  status: OrderStatus;
  shipping_address: string | null;
  billing_address: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

/**
 * @interface OrderItemRow
 * @description Interfaz para las filas de items de pedido desde MySQL
 */
interface OrderItemRow extends RowDataPacket {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

/**
 * @function generateOrderNumber
 * @description Genera un número único de pedido
 * @returns Número de pedido único
 */
const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const timestamp = now.getTime().toString().slice(-6);
  return `ORD-${year}-${timestamp}`;
};

/**
 * @function getOrders
 * @description Obtiene todos los pedidos
 * @returns Array de pedidos
 */
export const getOrders = async (): Promise<Order[]> => {
  const query = `
    SELECT id, customer_id, order_number, subtotal, tax_amount, shipping_amount, 
           total_amount, status, shipping_address, billing_address, payment_method, 
           payment_status, created_at, updated_at
    FROM orders 
    ORDER BY created_at DESC
  `;
  
  const rows: OrderRow[] = await executeQuery(query);
  return rows.map(mapRowToOrder);
};

/**
 * @function getOrdersByCustomer
 * @description Obtiene pedidos de un cliente específico
 * @param customerId - ID del cliente
 * @returns Array de pedidos
 */
export const getOrdersByCustomer = async (customerId: string): Promise<Order[]> => {
  const query = `
    SELECT id, customer_id, order_number, subtotal, tax_amount, shipping_amount, 
           total_amount, status, shipping_address, billing_address, payment_method, 
           payment_status, created_at, updated_at
    FROM orders 
    WHERE customer_id = ?
    ORDER BY created_at DESC
  `;
  
  const rows: OrderRow[] = await executeQuery(query, [customerId]);
  return rows.map(mapRowToOrder);
};

/**
 * @function getOrderById
 * @description Obtiene un pedido por su ID
 * @param id - ID del pedido
 * @returns Pedido encontrado o null
 */
export const getOrderById = async (id: string): Promise<Order | null> => {
  const query = `
    SELECT id, customer_id, order_number, subtotal, tax_amount, shipping_amount, 
           total_amount, status, shipping_address, billing_address, payment_method, 
           payment_status, created_at, updated_at
    FROM orders 
    WHERE id = ?
  `;
  
  const rows: OrderRow[] = await executeQuery(query, [id]);
  return rows.length > 0 ? mapRowToOrder(rows[0]) : null;
};

/**
 * @function getOrderWithItems
 * @description Obtiene un pedido con sus items incluidos
 * @param id - ID del pedido
 * @returns Pedido con items o null
 */
export const getOrderWithItems = async (id: string): Promise<OrderWithItems | null> => {
  const order = await getOrderById(id);
  if (!order) return null;
  
  const items = await getOrderItems(id);
  return { ...order, items };
};

/**
 * @function getOrderItems
 * @description Obtiene los items de un pedido
 * @param orderId - ID del pedido
 * @returns Array de items del pedido
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const query = `
    SELECT id, order_id, product_id, quantity, unit_price, total_price, created_at
    FROM order_items 
    WHERE order_id = ?
    ORDER BY created_at ASC
  `;
  
  const rows: OrderItemRow[] = await executeQuery(query, [orderId]);
  return rows.map(mapRowToOrderItem);
};

/**
 * @function createOrder
 * @description Crea un nuevo pedido con sus items
 * @param orderData - Datos del pedido a crear
 * @returns Pedido creado con sus items
 */
export const createOrder = async (orderData: OrderCreateRequest): Promise<OrderWithItems> => {
  const { v4: uuidv4 } = require('uuid');
  const now = new Date();
  
  // Calcular totales
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = subtotal * 0.1; // 10% de impuesto (configurable)
  const shippingAmount = subtotal > 50 ? 0 : 10; // Envío gratis sobre $50
  const totalAmount = subtotal + taxAmount + shippingAmount;
  
  const order: Order = {
    id: uuidv4(),
    customer_id: orderData.customer_id,
    order_number: generateOrderNumber(),
    subtotal,
    tax_amount: taxAmount,
    shipping_amount: shippingAmount,
    total_amount: totalAmount,
    status: 'PENDING',
    shipping_address: orderData.shipping_address || null,
    billing_address: orderData.billing_address || null,
    payment_method: orderData.payment_method || null,
    payment_status: 'PENDING',
    created_at: now,
    updated_at: now
  };
  
  // Insertar pedido
  const orderQuery = `
    INSERT INTO orders (id, customer_id, order_number, subtotal, tax_amount, shipping_amount, 
                        total_amount, status, shipping_address, billing_address, payment_method, 
                        payment_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const orderParams = [
    order.id, order.customer_id, order.order_number, order.subtotal, order.tax_amount,
    order.shipping_amount, order.total_amount, order.status, order.shipping_address,
    order.billing_address, order.payment_method, order.payment_status, order.created_at, order.updated_at
  ];
  
  await executeQuery(orderQuery, orderParams);
  
  // Insertar items
  const items: OrderItem[] = [];
  for (const itemData of orderData.items) {
    const item: OrderItem = {
      id: uuidv4(),
      order_id: order.id,
      product_id: itemData.product_id,
      quantity: itemData.quantity,
      unit_price: itemData.unit_price,
      total_price: itemData.quantity * itemData.unit_price,
      created_at: now
    };
    
    const itemQuery = `
      INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const itemParams = [
      item.id, item.order_id, item.product_id, item.quantity, item.unit_price, item.total_price, item.created_at
    ];
    
    await executeQuery(itemQuery, itemParams);
    items.push(item);
  }
  
  return { ...order, items };
};

/**
 * @function updateOrder
 * @description Actualiza un pedido existente
 * @param id - ID del pedido
 * @param updates - Campos a actualizar
 * @returns Pedido actualizado o null si no se encontró
 */
export const updateOrder = async (
  id: string, 
  updates: OrderUpdateRequest
): Promise<Order | null> => {
  const setClause: string[] = [];
  const params: any[] = [];
  
  // Construir la cláusula SET dinámicamente
  if (updates.status !== undefined) {
    setClause.push('status = ?');
    params.push(updates.status);
  }
  if (updates.shipping_address !== undefined) {
    setClause.push('shipping_address = ?');
    params.push(updates.shipping_address);
  }
  if (updates.billing_address !== undefined) {
    setClause.push('billing_address = ?');
    params.push(updates.billing_address);
  }
  if (updates.payment_method !== undefined) {
    setClause.push('payment_method = ?');
    params.push(updates.payment_method);
  }
  if (updates.payment_status !== undefined) {
    setClause.push('payment_status = ?');
    params.push(updates.payment_status);
  }
  
  // Siempre actualizar updated_at
  setClause.push('updated_at = NOW()');
  params.push(id);
  
  if (setClause.length === 1) { // Solo updated_at
    return null;
  }
  
  const query = `
    UPDATE orders 
    SET ${setClause.join(', ')}
    WHERE id = ?
  `;
  
  await executeQuery(query, params);
  return await getOrderById(id);
};

/**
 * @function getOrderSummaries
 * @description Obtiene resúmenes de pedidos para listados
 * @returns Array de resúmenes de pedidos
 */
export const getOrderSummaries = async (): Promise<OrderSummary[]> => {
  const query = `
    SELECT 
      o.id, o.order_number, o.customer_id, o.total_amount, o.status, o.payment_status, o.created_at,
      COUNT(oi.id) as items_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  
  const rows: any[] = await executeQuery(query);
  return rows.map(row => ({
    id: row.id,
    order_number: row.order_number,
    customer_id: row.customer_id,
    total_amount: row.total_amount,
    status: row.status,
    payment_status: row.payment_status,
    created_at: row.created_at,
    items_count: row.items_count
  }));
};

/**
 * @function resetOrders
 * @description Reinicia los datos de pedidos (solo para testing)
 */
export const resetOrders = async (): Promise<void> => {
  await executeQuery('DELETE FROM order_items');
  await executeQuery('DELETE FROM orders');
};

/**
 * @function mapRowToOrder
 * @description Convierte una fila de MySQL a objeto Order
 * @param row - Fila de la base de datos
 * @returns Objeto Order
 */
const mapRowToOrder = (row: OrderRow): Order => {
  return {
    id: row.id,
    customer_id: row.customer_id,
    order_number: row.order_number,
    subtotal: row.subtotal,
    tax_amount: row.tax_amount,
    shipping_amount: row.shipping_amount,
    total_amount: row.total_amount,
    status: row.status,
    shipping_address: row.shipping_address,
    billing_address: row.billing_address,
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

/**
 * @function mapRowToOrderItem
 * @description Convierte una fila de MySQL a objeto OrderItem
 * @param row - Fila de la base de datos
 * @returns Objeto OrderItem
 */
const mapRowToOrderItem = (row: OrderItemRow): OrderItem => {
  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    quantity: row.quantity,
    unit_price: row.unit_price,
    total_price: row.total_price,
    created_at: row.created_at
  };
};