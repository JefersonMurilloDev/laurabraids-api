import { Router } from 'express';
import { 
  getStyles, 
  getStyleById, 
  createStyle, 
  updateStyle, 
  deleteStyle 
} from '../controllers/styles.controller';

/**
 * @file Define las rutas para la gestión de estilos del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de estilos,
 *              incluyendo filtros por categorías y gestión del catálogo.
 */

const router = Router();

// Definición de las rutas para estilos

/**
 * GET /api/styles - Obtener todos los estilos
 * @description Retorna catálogo de estilos con filtros opcionales
 * @query {string} category - Filtrar por categoría (?category=Largo)
 * @access Público
 */
router.get('/', getStyles);

/**
 * GET /api/styles/:id - Obtener un estilo por ID
 * @description Retorna datos completos de un estilo específico
 * @param {string} id - UUID del estilo
 * @access Público
 */
router.get('/:id', getStyleById);

/**
 * POST /api/styles - Crear un nuevo estilo
 * @description Registra un nuevo estilo en el catálogo
 * @body {name, photo_url?, description, category}
 * @access Solo ADMIN
 */
router.post('/', createStyle);

/**
 * PUT /api/styles/:id - Actualizar un estilo existente
 * @description Actualiza datos de un estilo específico
 * @param {string} id - UUID del estilo
 * @body {name?, photo_url?, description?, category?}
 * @access Solo ADMIN
 */
router.put('/:id', updateStyle);

/**
 * DELETE /api/styles/:id - Eliminar un estilo
 * @description Elimina permanentemente un estilo del catálogo
 * @param {string} id - UUID del estilo
 * @access Solo ADMIN
 */
router.delete('/:id', deleteStyle);

export default router;