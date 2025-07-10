import { Router } from 'express';
import { 
  getReviews, 
  getReviewById, 
  createReview, 
  updateReview, 
  deleteReview,
  getReviewStats
} from '../controllers/reviews.controller';

/**
 * @file Define las rutas para la gestión de reseñas del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de reseñas,
 *              incluyendo filtros avanzados y estadísticas de calificaciones.
 */

const router = Router();

// Definición de las rutas para reseñas

/**
 * GET /api/reviews - Obtener todas las reseñas
 * @description Retorna lista de reseñas con filtros opcionales
 * @query {string} user_id - Filtrar por usuario (?user_id=uuid)
 * @query {string} reviewable_id - Filtrar por entidad reseñada (?reviewable_id=uuid)
 * @query {string} reviewable_type - Filtrar por tipo (?reviewable_type=STYLIST)
 * @query {boolean} verified - Filtrar solo reseñas verificadas (?verified=true)
 * @query {number} rating - Filtrar por calificación (?rating=5)
 * @access Público
 */
router.get('/', getReviews);

/**
 * GET /api/reviews/stats - Obtener estadísticas de reseñas
 * @description Retorna estadísticas de una entidad específica
 * @query {string} reviewable_id - ID de la entidad (requerido)
 * @query {string} reviewable_type - Tipo de entidad (requerido)
 * @access Público
 */
router.get('/stats', getReviewStats);

/**
 * GET /api/reviews/:id - Obtener una reseña por ID
 * @description Retorna datos completos de una reseña específica
 * @param {string} id - UUID de la reseña
 * @access Público
 */
router.get('/:id', getReviewById);

/**
 * POST /api/reviews - Crear una nueva reseña
 * @description Registra una nueva reseña en el sistema
 * @body {user_id, rating, comment, reviewable_id, reviewable_type}
 * @access Usuario autenticado
 */
router.post('/', createReview);

/**
 * PUT /api/reviews/:id - Actualizar una reseña existente
 * @description Actualiza datos de una reseña específica
 * @param {string} id - UUID de la reseña
 * @body {rating?, comment?, is_verified?}
 * @access Autor de la reseña o ADMIN (is_verified solo ADMIN)
 */
router.put('/:id', updateReview);

/**
 * DELETE /api/reviews/:id - Eliminar una reseña
 * @description Elimina permanentemente una reseña del sistema
 * @param {string} id - UUID de la reseña
 * @access Autor de la reseña o ADMIN
 */
router.delete('/:id', deleteReview);

export default router;