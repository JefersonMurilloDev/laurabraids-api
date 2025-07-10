/**
 * @file Define las interfaces para las entidades Order y OrderItem.
 * @description Representa pedidos de productos realizados por clientes y los items que contienen.
 */

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

/**
 * @interface Order
 * @description Representa un pedido de productos
 */
export interface Order {
  id: string; // UUID como identificador único
  customer_id: string; // UUID del cliente que realiza el pedido
  order_number: string; // Número único del pedido (ej. "ORD-2024-001")
  subtotal: number; // Subtotal sin impuestos ni envío
  tax_amount: number; // Monto de impuestos
  shipping_amount: number; // Costo de envío
  total_amount: number; // Total final del pedido
  status: OrderStatus; // Estado del pedido
  shipping_address: string | null; // Dirección de envío
  billing_address: string | null; // Dirección de facturación
  payment_method: string | null; // Método de pago utilizado
  payment_status: PaymentStatus; // Estado del pago
  created_at: Date;
  updated_at: Date;
}

/**
 * @interface OrderItem
 * @description Representa un item específico dentro de un pedido
 */
export interface OrderItem {
  id: string; // UUID como identificador único
  order_id: string; // UUID del pedido al que pertenece
  product_id: string; // UUID del producto
  quantity: number; // Cantidad del producto
  unit_price: number; // Precio unitario al momento de la compra
  total_price: number; // Precio total del item (quantity * unit_price)
  created_at: Date;
}

/**
 * @interface OrderWithItems
 * @description Pedido con sus items incluidos
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * @interface OrderCreateRequest
 * @description Datos requeridos para crear un nuevo pedido
 */
export interface OrderCreateRequest {
  customer_id: string;
  items: OrderItemCreateRequest[];
  shipping_address?: string;
  billing_address?: string;
  payment_method?: string;
}

/**
 * @interface OrderItemCreateRequest
 * @description Datos requeridos para crear un item de pedido
 */
export interface OrderItemCreateRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
}

/**
 * @interface OrderUpdateRequest
 * @description Datos opcionales para actualizar un pedido existente
 */
export interface OrderUpdateRequest {
  status?: OrderStatus;
  shipping_address?: string;
  billing_address?: string;
  payment_method?: string;
  payment_status?: PaymentStatus;
}

/**
 * @interface OrderSummary
 * @description Resumen de un pedido para listados
 */
export interface OrderSummary {
  id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: Date;
  items_count: number;
}