import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/products.controller';

/**
 * @file Define las rutas para la gestión de productos del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de productos,
 *              incluyendo filtros avanzados y gestión de inventario.
 */

const router = Router();

// Definición de las rutas para productos

/**
 * GET /api/products - Obtener todos los productos
 * @description Retorna catálogo de productos con filtros opcionales
 * @query {string} category - Filtrar por categoría (?category=Extensiones)
 * @query {boolean} active - Filtrar solo productos activos (?active=true)
 * @query {boolean} in_stock - Filtrar solo productos en stock (?in_stock=true)
 * @access Público
 */
router.get('/', getProducts);

/**
 * GET /api/products/:id - Obtener un producto por ID
 * @description Retorna datos completos de un producto específico
 * @param {string} id - UUID del producto
 * @access Público
 */
router.get('/:id', getProductById);

/**
 * POST /api/products - Crear un nuevo producto
 * @description Registra un nuevo producto en el inventario
 * @body {name, description, price, stock_quantity, image_url?, category, is_active?}
 * @access Solo ADMIN
 */
router.post('/', createProduct);

/**
 * PUT /api/products/:id - Actualizar un producto existente
 * @description Actualiza datos de un producto específico
 * @param {string} id - UUID del producto
 * @body {name?, description?, price?, stock_quantity?, image_url?, category?, is_active?}
 * @access Solo ADMIN
 */
router.put('/:id', updateProduct);

/**
 * DELETE /api/products/:id - Eliminar un producto
 * @description Elimina permanentemente un producto del inventario
 * @param {string} id - UUID del producto
 * @access Solo ADMIN
 */
router.delete('/:id', deleteProduct);

export default router;