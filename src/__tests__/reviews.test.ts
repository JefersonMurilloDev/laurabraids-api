/**
 * @file Tests para los endpoints de reseñas de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de reseñas,
 *              incluyendo filtros avanzados, validaciones y estadísticas.
 */

import request from 'supertest';
import app from '../index';
import { resetReviews } from '../controllers/reviews.controller';
import { ReviewableType } from '../interfaces/review.interface';

// Hook para resetear los datos antes de cada prueba
beforeEach(() => {
  resetReviews();
});

/**
 * @description Suite de tests para obtener reseñas (GET /api/reviews).
 */
describe('GET /api/reviews', () => {
  /**
   * @description Test para obtener todas las reseñas.
   */
  it('debería devolver una lista de reseñas', async () => {
    const response = await request(app)
      .get('/api/reviews')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta sea un array
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verificamos que el primer elemento tenga las propiedades correctas
    const firstReview = response.body[0];
    expect(firstReview).toHaveProperty('id');
    expect(firstReview).toHaveProperty('user_id');
    expect(firstReview).toHaveProperty('rating');
    expect(firstReview).toHaveProperty('comment');
    expect(firstReview).toHaveProperty('reviewable_id');
    expect(firstReview).toHaveProperty('reviewable_type');
    expect(firstReview).toHaveProperty('is_verified');
    expect(firstReview).toHaveProperty('created_at');
    expect(firstReview).toHaveProperty('updated_at');
  });

  /**
   * @description Test para filtrar reseñas por usuario.
   */
  it('debería devolver solo reseñas del usuario especificado', async () => {
    const user_id = 'user-1';
    const response = await request(app)
      .get(`/api/reviews?user_id=${user_id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las reseñas devueltas sean del usuario solicitado
    response.body.forEach((review: any) => {
      expect(review.user_id).toBe(user_id);
    });
  });

  /**
   * @description Test para filtrar reseñas por entidad reseñada.
   */
  it('debería devolver solo reseñas de la entidad especificada', async () => {
    const reviewable_id = 'stylist-1';
    const response = await request(app)
      .get(`/api/reviews?reviewable_id=${reviewable_id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las reseñas devueltas sean de la entidad solicitada
    response.body.forEach((review: any) => {
      expect(review.reviewable_id).toBe(reviewable_id);
    });
  });

  /**
   * @description Test para filtrar reseñas por tipo de entidad.
   */
  it('debería devolver solo reseñas del tipo especificado', async () => {
    const reviewable_type = ReviewableType.STYLIST;
    const response = await request(app)
      .get(`/api/reviews?reviewable_type=${reviewable_type}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las reseñas devueltas sean del tipo solicitado
    response.body.forEach((review: any) => {
      expect(review.reviewable_type).toBe(reviewable_type);
    });
  });

  /**
   * @description Test para filtrar reseñas verificadas.
   */
  it('debería devolver solo reseñas verificadas cuando se filtra por verified=true', async () => {
    const response = await request(app)
      .get('/api/reviews?verified=true')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las reseñas devueltas estén verificadas
    response.body.forEach((review: any) => {
      expect(review.is_verified).toBe(true);
    });
  });

  /**
   * @description Test para filtrar reseñas por calificación.
   */
  it('debería devolver solo reseñas con la calificación especificada', async () => {
    const rating = 5;
    const response = await request(app)
      .get(`/api/reviews?rating=${rating}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todas las reseñas devueltas tengan la calificación solicitada
    response.body.forEach((review: any) => {
      expect(review.rating).toBe(rating);
    });
  });
});

/**
 * @description Suite de tests para obtener estadísticas de reseñas (GET /api/reviews/stats).
 */
describe('GET /api/reviews/stats', () => {
  /**
   * @description Test para obtener estadísticas de una entidad específica.
   */
  it('debería devolver estadísticas correctas para una entidad específica', async () => {
    const reviewable_id = 'stylist-1';
    const reviewable_type = ReviewableType.STYLIST;
    
    const response = await request(app)
      .get(`/api/reviews/stats?reviewable_id=${reviewable_id}&reviewable_type=${reviewable_type}`)
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta tenga la estructura correcta
    expect(response.body).toHaveProperty('total_reviews');
    expect(response.body).toHaveProperty('average_rating');
    expect(response.body).toHaveProperty('rating_distribution');
    
    // Verificamos tipos de datos
    expect(typeof response.body.total_reviews).toBe('number');
    expect(typeof response.body.average_rating).toBe('number');
    expect(typeof response.body.rating_distribution).toBe('object');
  });

  /**
   * @description Test para manejar entidad sin reseñas.
   */
  it('debería devolver estadísticas vacías para entidad sin reseñas', async () => {
    const reviewable_id = 'entidad-sin-reseñas';
    const reviewable_type = ReviewableType.PRODUCT;
    
    const response = await request(app)
      .get(`/api/reviews/stats?reviewable_id=${reviewable_id}&reviewable_type=${reviewable_type}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
  });

  /**
   * @description Test para validar parámetros requeridos en estadísticas.
   */
  it('debería devolver error 400 si faltan parámetros requeridos', async () => {
    const response = await request(app)
      .get('/api/reviews/stats')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Se requieren reviewable_id y reviewable_type');
  });
});

/**
 * @description Suite de tests para obtener reseña por ID (GET /api/reviews/:id).
 */
describe('GET /api/reviews/:id', () => {
  /**
   * @description Test para obtener una reseña específica por su ID.
   */
  it('debería devolver una reseña específica por su id', async () => {
    // Primero obtenemos la lista para conseguir un ID válido
    const reviewsResponse = await request(app).get('/api/reviews');
    const validReviewId = reviewsResponse.body[0].id;

    const response = await request(app)
      .get(`/api/reviews/${validReviewId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta tenga las propiedades correctas
    expect(response.body).toHaveProperty('id', validReviewId);
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('rating');
    expect(response.body).toHaveProperty('comment');
    expect(response.body).toHaveProperty('reviewable_id');
    expect(response.body).toHaveProperty('reviewable_type');
  });

  /**
   * @description Test para manejar el caso de una reseña no encontrada.
   */
  it('debería devolver un error 404 si la reseña no existe', async () => {
    await request(app)
      .get('/api/reviews/reseña-inexistente-123')
      .expect(404);
  });
});

/**
 * @description Suite de tests para crear reseñas (POST /api/reviews).
 */
describe('POST /api/reviews', () => {
  /**
   * @description Test para crear una nueva reseña con todos los campos.
   */
  it('debería crear una nueva reseña correctamente', async () => {
    const newReview = {
      user_id: 'user-new-review',
      rating: 4,
      comment: 'Excelente servicio, muy profesional y puntual.',
      reviewable_id: 'stylist-new-review',
      reviewable_type: ReviewableType.STYLIST
    };

    const response = await request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verificamos que la reseña fue creada correctamente
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id', newReview.user_id);
    expect(response.body).toHaveProperty('rating', newReview.rating);
    expect(response.body).toHaveProperty('comment', newReview.comment);
    expect(response.body).toHaveProperty('reviewable_id', newReview.reviewable_id);
    expect(response.body).toHaveProperty('reviewable_type', newReview.reviewable_type);
    expect(response.body).toHaveProperty('is_verified', false); // Debe iniciarse como false
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  /**
   * @description Test para validar campos requeridos.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteReview = {
      user_id: 'user-incomplete',
      rating: 5
      // Faltan comment, reviewable_id, reviewable_type
    };

    const response = await request(app)
      .post('/api/reviews')
      .send(incompleteReview)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Faltan campos requeridos');
  });

  /**
   * @description Test para validar rating válido.
   */
  it('debería devolver error 400 si el rating no está entre 1 y 5', async () => {
    const reviewWithInvalidRating = {
      user_id: 'user-invalid-rating',
      rating: 6, // Rating inválido
      comment: 'Test comment',
      reviewable_id: 'test-entity',
      reviewable_type: ReviewableType.PRODUCT
    };

    const response = await request(app)
      .post('/api/reviews')
      .send(reviewWithInvalidRating)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('El rating debe ser un número entero entre 1 y 5');
  });

  /**
   * @description Test para validar reviewable_type válido.
   */
  it('debería devolver error 400 si el reviewable_type es inválido', async () => {
    const reviewWithInvalidType = {
      user_id: 'user-invalid-type',
      rating: 4,
      comment: 'Test comment',
      reviewable_id: 'test-entity',
      reviewable_type: 'INVALID_TYPE'
    };

    const response = await request(app)
      .post('/api/reviews')
      .send(reviewWithInvalidType)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Tipo de reseña inválido');
  });

  /**
   * @description Test para validar que un usuario no pueda reseñar la misma entidad dos veces.
   */
  it('debería devolver error 409 si el usuario ya reseñó la entidad', async () => {
    const review = {
      user_id: 'user-duplicate',
      rating: 5,
      comment: 'Primera reseña',
      reviewable_id: 'entity-duplicate',
      reviewable_type: ReviewableType.STYLE
    };

    // Crear la primera reseña
    await request(app)
      .post('/api/reviews')
      .send(review)
      .expect(201);

    // Intentar crear segunda reseña para la misma entidad
    const duplicateReview = {
      ...review,
      comment: 'Segunda reseña' // Cambiar solo el comentario
    };

    const response = await request(app)
      .post('/api/reviews')
      .send(duplicateReview)
      .expect('Content-Type', /json/)
      .expect(409);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('El usuario ya ha reseñado esta entidad');
  });

  /**
   * @description Test para validar todos los tipos válidos de reviewable_type.
   */
  it('debería aceptar todos los tipos válidos de reviewable_type', async () => {
    const validTypes = Object.values(ReviewableType);
    
    for (let i = 0; i < validTypes.length; i++) {
      const reviewableType = validTypes[i];
      const newReview = {
        user_id: `user-valid-type-${i}`,
        rating: 4,
        comment: `Test comment for ${reviewableType}`,
        reviewable_id: `entity-${i}`,
        reviewable_type: reviewableType
      };

      await request(app)
        .post('/api/reviews')
        .send(newReview)
        .expect('Content-Type', /json/)
        .expect(201);
    }
  });
});

/**
 * @description Suite de tests para actualizar reseñas (PUT /api/reviews/:id).
 */
describe('PUT /api/reviews/:id', () => {
  /**
   * @description Test para actualizar una reseña existente.
   */
  it('debería actualizar una reseña existente', async () => {
    // Obtener una reseña existente
    const reviewsResponse = await request(app).get('/api/reviews');
    const existingReview = reviewsResponse.body[0];

    const updatedData = {
      rating: 3,
      comment: 'Comentario actualizado',
      is_verified: true
    };

    const response = await request(app)
      .put(`/api/reviews/${existingReview.id}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('rating', updatedData.rating);
    expect(response.body).toHaveProperty('comment', updatedData.comment);
    expect(response.body).toHaveProperty('is_verified', updatedData.is_verified);
    expect(response.body).toHaveProperty('id', existingReview.id);
  });

  /**
   * @description Test para manejar reseña no encontrada en actualización.
   */
  it('debería devolver error 404 si la reseña a actualizar no existe', async () => {
    await request(app)
      .put('/api/reviews/reseña-inexistente-123')
      .send({ comment: 'No existe' })
      .expect(404);
  });

  /**
   * @description Test para validar rating en actualización.
   */
  it('debería devolver error 400 si el rating es inválido en actualización', async () => {
    const reviewsResponse = await request(app).get('/api/reviews');
    const existingReview = reviewsResponse.body[0];

    const response = await request(app)
      .put(`/api/reviews/${existingReview.id}`)
      .send({ rating: 0 }) // Rating inválido
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('El rating debe ser un número entero entre 1 y 5');
  });
});

/**
 * @description Suite de tests para eliminar reseñas (DELETE /api/reviews/:id).
 */
describe('DELETE /api/reviews/:id', () => {
  /**
   * @description Test para eliminar una reseña existente.
   */
  it('debería eliminar una reseña existente y devolver status 204', async () => {
    // Obtener una reseña existente
    const reviewsResponse = await request(app).get('/api/reviews');
    const existingReview = reviewsResponse.body[0];

    await request(app)
      .delete(`/api/reviews/${existingReview.id}`)
      .expect(204);

    // Verificar que la reseña ya no existe
    await request(app)
      .get(`/api/reviews/${existingReview.id}`)
      .expect(404);
  });

  /**
   * @description Test para manejar reseña no encontrada en eliminación.
   */
  it('debería devolver error 404 si la reseña a eliminar no existe', async () => {
    await request(app)
      .delete('/api/reviews/reseña-inexistente-123')
      .expect(404);
  });
});