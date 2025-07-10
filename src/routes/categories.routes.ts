import { Router } from 'express';
import { 
  getCategories, 
  getAllCategories,
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categories.controller';
import { 
  validateBody, 
  validateParams 
} from '../middleware/validation.middleware';
import {
  requireAuth,
  requireAdmin
} from '../middleware/auth.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryParamsSchema
} from '../schemas/categories.schema';

/**
 * @file Define las rutas para la gestión de categorías de estilos del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de categorías,
 *              incluyendo gestión de categorías de estilos de trenzas.
 */

const router = Router();

// Definición de las rutas para categorías
// IMPORTANTE: Las rutas específicas DEBEN ir ANTES que las rutas con parámetros

/**
 * GET /api/categories - Obtener todas las categorías activas
 * @description Retorna lista de categorías activas ordenadas por display_order
 * @access Público
 */
router.get('/', getCategories);

/**
 * GET /api/categories/all - Obtener todas las categorías (incluyendo inactivas)
 * @description Retorna lista completa de categorías para administración
 * @access Solo ADMIN
 */
router.get('/all', requireAdmin, getAllCategories);

/**
 * POST /api/categories - Crear una nueva categoría
 * @description Crea una nueva categoría de estilos
 * @body {name, description?, display_order?, is_active?}
 * @access Solo ADMIN
 */
router.post('/', requireAdmin, validateBody(createCategorySchema), createCategory);

// Rutas con parámetros VAN AL FINAL para evitar conflictos

/**
 * GET /api/categories/:id - Obtener una categoría por ID
 * @description Retorna datos de una categoría específica
 * @param {string} id - UUID de la categoría
 * @access Público
 */
router.get('/:id', validateParams(categoryParamsSchema), getCategoryById);

/**
 * PUT /api/categories/:id - Actualizar una categoría existente
 * @description Actualiza datos de una categoría específica
 * @param {string} id - UUID de la categoría
 * @body {name?, description?, display_order?, is_active?}
 * @access Solo ADMIN
 */
router.put('/:id', requireAdmin, validateParams(categoryParamsSchema), validateBody(updateCategorySchema), updateCategory);

/**
 * DELETE /api/categories/:id - Eliminar una categoría (soft delete)
 * @description Desactiva una categoría del sistema
 * @param {string} id - UUID de la categoría
 * @access Solo ADMIN
 */
router.delete('/:id', requireAdmin, validateParams(categoryParamsSchema), deleteCategory);

export default router;