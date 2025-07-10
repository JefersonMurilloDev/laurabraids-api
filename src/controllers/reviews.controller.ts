import { RequestHandler } from 'express';
import { Review, ReviewableType } from '../interfaces/review.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * @file Controller para la gestión de reseñas del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para la entidad Review, incluyendo
 *              calificaciones, comentarios y relaciones polimórficas.
 */

// Mockup de una base de datos en memoria. Será reemplazado por PostgreSQL.
export const initialReviews: Review[] = [
  {
    id: uuidv4(),
    user_id: 'user-1',
    rating: 5,
    comment: 'Excelente trabajo! Las box braids quedaron perfectas y duraron mucho tiempo.',
    reviewable_id: 'stylist-1',
    reviewable_type: ReviewableType.STYLIST,
    is_verified: true,
    created_at: new Date('2024-06-15'),
    updated_at: new Date('2024-06-15'),
  },
  {
    id: uuidv4(),
    user_id: 'user-2',
    rating: 4,
    comment: 'Muy buena calidad de extensiones, aunque tardaron un poco en llegar.',
    reviewable_id: 'product-1',
    reviewable_type: ReviewableType.PRODUCT,
    is_verified: true,
    created_at: new Date('2024-06-20'),
    updated_at: new Date('2024-06-20'),
  },
  {
    id: uuidv4(),
    user_id: 'user-3',
    rating: 5,
    comment: 'Las cornrows son mi estilo favorito, siempre quedan increíbles.',
    reviewable_id: 'style-2',
    reviewable_type: ReviewableType.STYLE,
    is_verified: true,
    created_at: new Date('2024-06-25'),
    updated_at: new Date('2024-06-25'),
  },
  {
    id: uuidv4(),
    user_id: 'user-4',
    rating: 3,
    comment: 'Buen servicio pero el tiempo de espera fue más largo de lo esperado.',
    reviewable_id: 'stylist-2',
    reviewable_type: ReviewableType.STYLIST,
    is_verified: false,
    created_at: new Date('2024-07-01'),
    updated_at: new Date('2024-07-01'),
  },
];

let reviews: Review[] = [...initialReviews];

/**
 * @description Reinicia los datos de reseñas al estado inicial.
 * Útil para testing y desarrollo.
 */
export const resetReviews = () => {
  reviews = [...initialReviews];
};

/**
 * @description Obtiene todas las reseñas del sistema.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getReviews: RequestHandler = (req, res) => {
  const { user_id, reviewable_id, reviewable_type, verified, rating } = req.query;
  let filteredReviews = [...reviews];
  
  // Filtrar por user_id si se solicita
  if (user_id && typeof user_id === 'string') {
    filteredReviews = filteredReviews.filter(r => r.user_id === user_id);
  }
  
  // Filtrar por reviewable_id si se solicita
  if (reviewable_id && typeof reviewable_id === 'string') {
    filteredReviews = filteredReviews.filter(r => r.reviewable_id === reviewable_id);
  }
  
  // Filtrar por reviewable_type si se solicita
  if (reviewable_type && typeof reviewable_type === 'string') {
    filteredReviews = filteredReviews.filter(r => r.reviewable_type === reviewable_type);
  }
  
  // Filtrar por reseñas verificadas si se solicita
  if (verified === 'true') {
    filteredReviews = filteredReviews.filter(r => r.is_verified);
  }
  
  // Filtrar por rating si se solicita
  if (rating && typeof rating === 'string') {
    const ratingNumber = parseInt(rating);
    if (!isNaN(ratingNumber)) {
      filteredReviews = filteredReviews.filter(r => r.rating === ratingNumber);
    }
  }
  
  res.json(filteredReviews);
};

/**
 * @description Obtiene una reseña específica por su ID.
 * @param {Request} req - El objeto de solicitud de Express, con el ID en los parámetros.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getReviewById: RequestHandler = (req, res) => {
  const id = req.params.id;
  const review = reviews.find(r => r.id === id);
  
  if (review) {
    res.json(review);
  } else {
    res.status(404).json({ message: 'Reseña no encontrada' });
  }
};

/**
 * @description Crea una nueva reseña.
 * @param {Request} req - El objeto de solicitud de Express, con los datos de la reseña en el cuerpo.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const createReview: RequestHandler = (req, res) => {
  const { user_id, rating, comment, reviewable_id, reviewable_type } = req.body;

  // Validación simple de los datos de entrada
  if (!user_id || !rating || !comment || !reviewable_id || !reviewable_type) {
    res.status(400).json({ 
      message: 'Faltan campos requeridos: user_id, rating, comment, reviewable_id, reviewable_type' 
    });
    return;
  }

  // Validar rating
  if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    res.status(400).json({ message: 'El rating debe ser un número entero entre 1 y 5' });
    return;
  }

  // Validar reviewable_type
  if (!Object.values(ReviewableType).includes(reviewable_type)) {
    res.status(400).json({ 
      message: `Tipo de reseña inválido. Debe ser uno de: ${Object.values(ReviewableType).join(', ')}` 
    });
    return;
  }

  // Verificar que el usuario no haya reseñado ya la misma entidad
  const existingReview = reviews.find(r => 
    r.user_id === user_id && 
    r.reviewable_id === reviewable_id && 
    r.reviewable_type === reviewable_type
  );

  if (existingReview) {
    res.status(409).json({ message: 'El usuario ya ha reseñado esta entidad' });
    return;
  }

  // Crear la nueva reseña
  const newReview: Review = {
    id: uuidv4(),
    user_id,
    rating,
    comment,
    reviewable_id,
    reviewable_type,
    is_verified: false, // Las reseñas inician sin verificar
    created_at: new Date(),
    updated_at: new Date(),
  };

  reviews.push(newReview);

  // Devolver la nueva reseña con el código de estado 201 (Created)
  res.status(201).json(newReview);
};

/**
 * @description Actualiza una reseña existente por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const updateReview: RequestHandler = (req, res) => {
  const id = req.params.id;
  const reviewIndex = reviews.findIndex(r => r.id === id);

  if (reviewIndex === -1) {
    res.status(404).json({ message: 'Reseña no encontrada' });
    return;
  }

  const { rating, comment, is_verified } = req.body;
  const currentReview = reviews[reviewIndex];

  // Validar rating si se proporciona
  if (rating !== undefined && 
      (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    res.status(400).json({ message: 'El rating debe ser un número entero entre 1 y 5' });
    return;
  }

  // Validar is_verified si se proporciona
  if (is_verified !== undefined && typeof is_verified !== 'boolean') {
    res.status(400).json({ message: 'El campo is_verified debe ser un valor booleano' });
    return;
  }

  // Actualizar campos proporcionados
  const updatedReview: Review = {
    ...currentReview,
    rating: rating !== undefined ? rating : currentReview.rating,
    comment: comment || currentReview.comment,
    is_verified: is_verified !== undefined ? is_verified : currentReview.is_verified,
    updated_at: new Date(),
  };

  reviews[reviewIndex] = updatedReview;

  res.json(updatedReview);
};

/**
 * @description Elimina una reseña por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const deleteReview: RequestHandler = (req, res) => {
  const id = req.params.id;
  const reviewIndex = reviews.findIndex(r => r.id === id);

  if (reviewIndex === -1) {
    res.status(404).json({ message: 'Reseña no encontrada' });
    return;
  }

  reviews.splice(reviewIndex, 1);

  // El código de estado 204 (No Content) es estándar para eliminaciones exitosas.
  res.status(204).send();
};

/**
 * @description Obtiene estadísticas de reseñas para una entidad específica.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getReviewStats: RequestHandler = (req, res) => {
  const { reviewable_id, reviewable_type } = req.query;

  if (!reviewable_id || !reviewable_type) {
    res.status(400).json({ message: 'Se requieren reviewable_id y reviewable_type' });
    return;
  }

  const entityReviews = reviews.filter(r => 
    r.reviewable_id === reviewable_id && 
    r.reviewable_type === reviewable_type &&
    r.is_verified === true
  );

  if (entityReviews.length === 0) {
    res.json({
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    return;
  }

  const totalReviews = entityReviews.length;
  const averageRating = entityReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = entityReviews.reduce((dist, review) => {
    dist[review.rating] = (dist[review.rating] || 0) + 1;
    return dist;
  }, {} as Record<number, number>);

  res.json({
    total_reviews: totalReviews,
    average_rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
    rating_distribution: ratingDistribution
  });
};