/**
 * @file Esquemas de validación Zod para las entidades Order y OrderItem.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con pedidos de productos y sus items.
 */

import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '../interfaces/order.interface';

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para validación de estados de pedido.
 */
export const orderStatusSchema = z.enum([
  'PENDING', 
  'CONFIRMED', 
  'PROCESSING', 
  'SHIPPED', 
  'DELIVERED', 
  'CANCELLED'
] as const);

/**
 * @description Esquema para validación de estados de pago.
 */
export const paymentStatusSchema = z.enum([
  'PENDING', 
  'PAID', 
  'FAILED', 
  'REFUNDED'
] as const);

/**
 * @description Esquema para validación de direcciones.
 */
export const addressSchema = z
  .string()
  .min(10, 'La dirección debe tener al menos 10 caracteres')
  .max(500, 'La dirección no puede exceder 500 caracteres')
  .transform((addr) => addr.trim());

/**
 * @description Esquema para validación de método de pago.
 */
export const paymentMethodSchema = z
  .string()
  .min(2, 'El método de pago debe tener al menos 2 caracteres')
  .max(50, 'El método de pago no puede exceder 50 caracteres')
  .transform((method) => method.trim());

/**
 * @description Esquema para validación de precio/cantidad.
 */
export const priceSchema = z
  .number()
  .positive('El precio debe ser positivo')
  .max(9999999.99, 'El precio no puede exceder $9,999,999.99')
  .multipleOf(0.01, 'El precio debe tener máximo 2 decimales');

/**
 * @description Esquema para validación de cantidad.
 */
export const quantitySchema = z
  .number()
  .int('La cantidad debe ser un número entero')
  .positive('La cantidad debe ser positiva')
  .max(999, 'La cantidad no puede exceder 999');

/**
 * @description Esquema para validación de items de pedido.
 */
export const orderItemSchema = z.object({
  product_id: uuidSchema,
  quantity: quantitySchema,
  unit_price: priceSchema
});

/**
 * @description Esquema para crear un nuevo pedido.
 * Incluye todas las validaciones necesarias para la creación.
 */
export const createOrderSchema = z.object({
  customer_id: uuidSchema,
  items: z
    .array(orderItemSchema)
    .min(1, 'El pedido debe contener al menos un item')
    .max(50, 'El pedido no puede tener más de 50 items'),
  shipping_address: addressSchema.optional(),
  billing_address: addressSchema.optional(),
  payment_method: paymentMethodSchema.optional()
}).refine(
  (data) => {
    // Validar que no hay items duplicados (mismo product_id)
    const productIds = data.items.map(item => item.product_id);
    const uniqueProductIds = new Set(productIds);
    return productIds.length === uniqueProductIds.size;
  },
  {
    message: 'No puede haber productos duplicados en el pedido',
    path: ['items']
  }
);

/**
 * @description Esquema para actualizar un pedido existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  shipping_address: addressSchema.optional(),
  billing_address: addressSchema.optional(),
  payment_method: paymentMethodSchema.optional(),
  payment_status: paymentStatusSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID de pedido).
 */
export const orderParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para validación de parámetros de ruta (ID de cliente).
 */
export const customerParamsSchema = z.object({
  customerId: uuidSchema
});

/**
 * @description Esquema para consultas de filtrado de pedidos.
 */
export const getOrdersQuerySchema = z.object({
  customer_id: uuidSchema.optional(),
  status: orderStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  date_from: z
    .string()
    .datetime('Fecha de inicio debe ser una fecha válida ISO')
    .optional(),
  date_to: z
    .string()
    .datetime('Fecha de fin debe ser una fecha válida ISO')
    .optional(),
  min_amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto mínimo debe ser un número válido')
    .transform(Number)
    .optional(),
  max_amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto máximo debe ser un número válido')
    .transform(Number)
    .optional(),
  order_by: z
    .enum(['created_at', 'total_amount', 'status', 'order_number'])
    .default('created_at')
    .optional(),
  sort: z
    .enum(['asc', 'desc'])
    .default('desc')
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val <= 100, 'El límite no puede exceder 100')
    .optional()
}).refine(
  (data) => {
    // Validar que date_from sea anterior a date_to
    if (data.date_from && data.date_to) {
      return new Date(data.date_from) <= new Date(data.date_to);
    }
    return true;
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['date_from']
  }
).refine(
  (data) => {
    // Validar que min_amount sea menor que max_amount
    if (data.min_amount && data.max_amount) {
      return data.min_amount <= data.max_amount;
    }
    return true;
  },
  {
    message: 'El monto mínimo debe ser menor o igual al monto máximo',
    path: ['min_amount']
  }
);

/**
 * @description Esquema para búsqueda de pedidos por número.
 */
export const orderSearchSchema = z.object({
  order_number: z
    .string()
    .regex(/^ORD-\d{4}-\d{6}$/, 'Formato de número de pedido inválido (ORD-YYYY-XXXXXX)')
});

/**
 * @description Esquema para validación de cancelación de pedido.
 */
export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .min(5, 'La razón de cancelación debe tener al menos 5 caracteres')
    .max(255, 'La razón de cancelación no puede exceder 255 caracteres')
    .optional()
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 * Estos tipos se pueden usar en controllers para type safety.
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderParamsInput = z.infer<typeof orderParamsSchema>;
export type CustomerParamsInput = z.infer<typeof customerParamsSchema>;
export type GetOrdersQueryInput = z.infer<typeof getOrdersQuerySchema>;
export type OrderSearchInput = z.infer<typeof orderSearchSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;