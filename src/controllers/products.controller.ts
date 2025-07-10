import { RequestHandler } from 'express';
import { Product } from '../interfaces/product.interface';
import { v4 as uuidv4 } from 'uuid';
import {
  getProducts as getProductsData,
  getProductById as getProductByIdData,
  addProduct,
  updateProduct as updateProductData,
  deleteProduct as deleteProductData,
  resetProducts as resetProductsData
} from '../data/products.database';

/**
 * @file Controller para la gestión de productos del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para la entidad Product, incluyendo
 *              inventario, categorías, precios y estado de activación.
 */

// Datos iniciales migrados a MySQL - mantenemos para referencia
// Los datos ahora se manejan completamente en la base de datos

/**
 * @description Reinicia los datos de productos al estado inicial (para testing).
 */
export const resetProductsForTesting = async (): Promise<void> => {
  await resetProductsData();
};

/**
 * @description Reinicia los datos de productos al estado inicial.
 * Útil para testing y desarrollo.
 */
export const resetProducts: RequestHandler = async (req, res) => {
  try {
    await resetProductsData();
    res.status(200).json({ message: 'Datos de productos reiniciados' });
  } catch (error) {
    console.error('Error al reiniciar productos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Obtiene todos los productos del sistema.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const { category, active, in_stock } = req.query;
    let filteredProducts = await getProductsData();
    
    // Filtrar por categoría si se solicita
    if (category && typeof category === 'string') {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filtrar por productos activos si se solicita
    if (active === 'true') {
      filteredProducts = filteredProducts.filter(p => p.is_active);
    }
    
    // Filtrar por productos en stock si se solicita
    if (in_stock === 'true') {
      filteredProducts = filteredProducts.filter(p => p.stock_quantity > 0);
    }
    
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Obtiene un producto específico por su ID.
 * @param {Request} req - El objeto de solicitud de Express, con el ID en los parámetros.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getProductById: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await getProductByIdData(id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Crea un nuevo producto.
 * @param {Request} req - El objeto de solicitud de Express, con los datos del producto en el cuerpo.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const createProduct: RequestHandler = async (req, res) => {
  try {
    const { name, description, price, stock_quantity, image_url, category, is_active = true } = req.body;

    // Validación simple de los datos de entrada
    if (!name || !description || price === undefined || stock_quantity === undefined || !category) {
      res.status(400).json({ 
        message: 'Faltan campos requeridos: name, description, price, stock_quantity, category' 
      });
      return;
    }

    // Validar tipos de datos
    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ message: 'El precio debe ser un número positivo' });
      return;
    }

    if (typeof stock_quantity !== 'number' || stock_quantity < 0 || !Number.isInteger(stock_quantity)) {
      res.status(400).json({ message: 'La cantidad en stock debe ser un número entero positivo' });
      return;
    }

    if (typeof is_active !== 'boolean') {
      res.status(400).json({ message: 'El campo is_active debe ser un valor booleano' });
      return;
    }

    // Validar categorías permitidas
    const validCategories = ['Extensiones', 'Cuidado', 'Accesorios', 'Herramientas'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ 
        message: `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}` 
      });
      return;
    }

    // Crear el nuevo producto
    const newProduct: Product = {
      id: uuidv4(),
      name,
      description,
      price,
      stock_quantity,
      image_url: image_url || 'https://example.com/default-product.jpg',
      category,
      is_active,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const createdProduct = await addProduct(newProduct);

    // Devolver el nuevo producto con el código de estado 201 (Created)
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Actualiza un producto existente por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, stock_quantity, image_url, category, is_active } = req.body;

    // Validar tipos de datos si se proporcionan
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      res.status(400).json({ message: 'El precio debe ser un número positivo' });
      return;
    }

    if (stock_quantity !== undefined && 
        (typeof stock_quantity !== 'number' || stock_quantity < 0 || !Number.isInteger(stock_quantity))) {
      res.status(400).json({ message: 'La cantidad en stock debe ser un número entero positivo' });
      return;
    }

    if (is_active !== undefined && typeof is_active !== 'boolean') {
      res.status(400).json({ message: 'El campo is_active debe ser un valor booleano' });
      return;
    }

    // Validar categoría si se proporciona
    if (category) {
      const validCategories = ['Extensiones', 'Cuidado', 'Accesorios', 'Herramientas'];
      if (!validCategories.includes(category)) {
        res.status(400).json({ 
          message: `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}` 
        });
        return;
      }
    }

    // Actualizar el producto
    const updatedProduct = await updateProductData(id, {
      name,
      description,
      price,
      stock_quantity,
      image_url,
      category,
      is_active,
      updated_at: new Date()
    });

    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Elimina un producto por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await deleteProductData(id);

    if (deleted) {
      // El código de estado 204 (No Content) es estándar para eliminaciones exitosas.
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};