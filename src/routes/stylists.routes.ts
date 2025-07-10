import { Router } from 'express';
import { 
  getStylists, 
  getStylistById, 
  createStylist, 
  updateStylist, 
  deleteStylist 
} from '../controllers/stylists.controller';
import { 
  validateBody, 
  validateParams 
} from '../middleware/validation.middleware';
import {
  createStylistSchema,
  updateStylistSchema,
  stylistParamsSchema
} from '../schemas/stylists.schema';

/**
 * @file Define las rutas para la gestión de estilistas del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de estilistas,
 *              incluyendo filtros por destacadas y gestión de perfiles.
 */

const router = Router();

// Definición de las rutas para estilistas

/**
 * GET /api/stylists - Obtener todas las estilistas
 * @description Retorna lista de estilistas con filtros opcionales
 * @query {boolean} featured - Filtrar solo estilistas destacadas (?featured=true)
 * @access Público
 */
router.get('/', getStylists);

/**
 * GET /api/stylists/:id - Obtener una estilista por ID
 * @description Retorna datos completos de una estilista específica
 * @param {string} id - UUID de la estilista
 * @access Público
 */
router.get('/:id', validateParams(stylistParamsSchema), getStylistById);

/**
 * POST /api/stylists - Crear una nueva estilista
 * @description Registra una nueva estilista en el sistema
 * @body {name, specialty, photo_url?, description, is_featured?}
 * @access Solo ADMIN
 */
router.post('/', validateBody(createStylistSchema), createStylist);

/**
 * PUT /api/stylists/:id - Actualizar una estilista existente
 * @description Actualiza datos de una estilista específica
 * @param {string} id - UUID de la estilista
 * @body {name?, specialty?, photo_url?, description?, is_featured?}
 * @access Solo ADMIN o la propia estilista
 */
router.put('/:id', validateParams(stylistParamsSchema), validateBody(updateStylistSchema), updateStylist);

/**
 * DELETE /api/stylists/:id - Eliminar una estilista
 * @description Elimina permanentemente una estilista del sistema
 * @param {string} id - UUID de la estilista
 * @access Solo ADMIN
 */
router.delete('/:id', validateParams(stylistParamsSchema), deleteStylist);

export default router;