/**
 * @file Controller para la gestión de pedidos del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para las entidades Order y OrderItem.
 */

import { RequestHandler } from 'express';
import { 
  Order, 
  OrderWithItems, 
  OrderCreateRequest, 
  OrderUpdateRequest, 
  OrderSummary 
} from '../interfaces/order.interface';
import {
  getOrders as getOrdersData,
  getOrdersByCustomer as getOrdersByCustomerData,
  getOrderById as getOrderByIdData,
  getOrderWithItems as getOrderWithItemsData,
  createOrder as createOrderData,
  updateOrder as updateOrderData,
  getOrderSummaries as getOrderSummariesData,
  resetOrders as resetOrdersData
} from '../data/orders.database';

/**
 * @description Reinicia los datos de pedidos al estado inicial (para testing).
 */
export const resetOrdersForTesting = async (): Promise<void> => {
  await resetOrdersData();
};

/**
 * @description Reinicia los datos de pedidos al estado inicial. Útil para testing.
 */
export const resetOrders: RequestHandler = async (req, res) => {
  try {
    await resetOrdersData();
    res.status(200).json({ message: 'Datos de pedidos reiniciados' });
      return;
  } catch (error) {
    console.error('Error al reiniciar pedidos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene todos los pedidos del sistema (solo administradores).
 */
export const getOrders: RequestHandler = async (req, res) => {
  try {
    const orders = await getOrdersData();
    res.status(200).json({ success: true, data: orders });
      return;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene resúmenes de pedidos para listados administrativos.
 */
export const getOrderSummaries: RequestHandler = async (req, res) => {
  try {
    const summaries = await getOrderSummariesData();
    res.status(200).json({ success: true, data: summaries });
      return;
  } catch (error) {
    console.error('Error al obtener resúmenes de pedidos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene los pedidos de un cliente específico.
 */
export const getCustomerOrders: RequestHandler = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verificar que el usuario autenticado pueda ver estos pedidos
    const authUser = (req as any).user;
    if (authUser.role !== 'ADMIN' && authUser.userId !== customerId) {
      res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para ver estos pedidos' 
      });
      return;
    }

    const orders = await getOrdersByCustomerData(customerId);
    res.status(200).json({ success: true, data: orders });
      return;
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene un pedido específico por su ID.
 */
export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderByIdData(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
      return;
    }

    // Verificar permisos: solo el cliente dueño del pedido o administradores
    const authUser = (req as any).user;
    if (authUser.role !== 'ADMIN' && authUser.userId !== order.customer_id) {
      res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para ver este pedido' 
      });
      return;
    }

    res.status(200).json({ success: true, data: order });
      return;
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene un pedido con sus items incluidos.
 */
export const getOrderWithItems: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const orderWithItems = await getOrderWithItemsData(id);

    if (!orderWithItems) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
      return;
    }

    // Verificar permisos: solo el cliente dueño del pedido o administradores
    const authUser = (req as any).user;
    if (authUser.role !== 'ADMIN' && authUser.userId !== orderWithItems.customer_id) {
      res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para ver este pedido' 
      });
      return;
    }

    res.status(200).json({ success: true, data: orderWithItems });
      return;
  } catch (error) {
    console.error('Error al obtener pedido con items:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Crea un nuevo pedido.
 */
export const createOrder: RequestHandler = async (req, res) => {
  try {
    const orderData: OrderCreateRequest = req.body;
    const authUser = (req as any).user;

    // Verificar que el cliente autenticado solo puede crear pedidos para sí mismo
    // Los administradores pueden crear pedidos para cualquier cliente
    if (authUser.role !== 'ADMIN' && authUser.userId !== orderData.customer_id) {
      res.status(403).json({ 
        success: false, 
        message: 'No puedes crear pedidos para otros usuarios' 
      });
      return;
    }

    // Validar que hay items en el pedido
    if (!orderData.items || orderData.items.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'El pedido debe contener al menos un item' 
      });
      return;
    }

    // TODO: Validar que los productos existen y tienen stock suficiente
    // Esta validación se puede implementar cuando se integre con el sistema de productos

    const newOrder = await createOrderData(orderData);
    res.status(201).json({ 
      success: true, 
      data: newOrder, 
      message: 'Pedido creado exitosamente' 
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Actualiza un pedido existente.
 */
export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: OrderUpdateRequest = req.body;
    const authUser = (req as any).user;

    // Verificar que el pedido existe
    const existingOrder = await getOrderByIdData(id);
    if (!existingOrder) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }

    // Verificar permisos: solo administradores pueden actualizar pedidos
    // Los clientes solo pueden cancelar sus propios pedidos
    if (authUser.role !== 'ADMIN') {
      if (authUser.userId !== existingOrder.customer_id) {
        res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para modificar este pedido' 
        });
      }
      
      // Los clientes solo pueden cancelar pedidos pendientes
      if (updates.status && updates.status !== 'CANCELLED') {
        res.status(403).json({ 
          success: false, 
          message: 'Solo puedes cancelar tu pedido' 
        });
      }
      
      if (existingOrder.status !== 'PENDING') {
        res.status(400).json({ 
          success: false, 
          message: 'Solo se pueden cancelar pedidos pendientes' 
        });
      }
    }

    const updatedOrder = await updateOrderData(id, updates);
    
    if (updatedOrder) {
      res.status(200).json({ 
        success: true, 
        data: updatedOrder, 
        message: 'Pedido actualizado exitosamente' 
      });
    } else {
      res.status(400).json({ success: false, message: 'No se realizaron cambios' });
      return;
    }
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Cancela un pedido (actualiza el estado a CANCELLED).
 */
export const cancelOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;

    // Verificar que el pedido existe
    const existingOrder = await getOrderByIdData(id);
    if (!existingOrder) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }

    // Verificar permisos
    if (authUser.role !== 'ADMIN' && authUser.userId !== existingOrder.customer_id) {
      res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para cancelar este pedido' 
      });
    }

    // Verificar que el pedido se puede cancelar
    if (existingOrder.status === 'CANCELLED') {
      res.status(400).json({ 
        success: false, 
        message: 'El pedido ya está cancelado' 
      });
    }

    if (existingOrder.status === 'DELIVERED') {
      res.status(400).json({ 
        success: false, 
        message: 'No se puede cancelar un pedido entregado' 
      });
    }

    const updatedOrder = await updateOrderData(id, { status: 'CANCELLED' });
    
    if (updatedOrder) {
      res.status(200).json({ 
        success: true, 
        data: updatedOrder, 
        message: 'Pedido cancelado exitosamente' 
      });
    } else {
      res.status(400).json({ success: false, message: 'No se pudo cancelar el pedido' });
      return;
    }
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};