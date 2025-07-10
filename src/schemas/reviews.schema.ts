/**
 * @file Esquemas de validación Zod para la entidad Review.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con reseñas, incluyendo calificaciones y relaciones polimórficas.
 */

import { z } from 'zod';
import { ReviewableType } from '../interfaces/review.interface';

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para validación de calificación (rating).
 */
export const ratingSchema = z
  .number()
  .int('La calificación debe ser un número entero')
  .min(1, 'La calificación mínima es 1')
  .max(5, 'La calificación máxima es 5');

/**
 * @description Esquema para validación de comentario.
 */
export const commentSchema = z
  .string()
  .min(5, 'El comentario debe tener al menos 5 caracteres')
  .max(1000, 'El comentario no puede exceder 1000 caracteres')
  .transform((comment) => comment.trim())
  .refine(
    (comment) => {
      // Verificar que no sea solo espacios o caracteres repetidos
      const trimmed = comment.trim();
      if (trimmed.length < 5) return false;
      
      // Verificar que no sea solo un carácter repetido
      const uniqueChars = new Set(trimmed.toLowerCase().replace(/\s/g, ''));
      return uniqueChars.size > 1;
    },
    {
      message: 'El comentario debe contener contenido significativo'
    }
  )
  .refine(
    (comment) => {
      // Lista simple de palabras prohibidas
      const forbiddenWords = [
        'spam', 'fake', 'bot', 'test test test', 'asdfgh', 'qwerty'
      ];
      
      const lowerComment = comment.toLowerCase();
      return !forbiddenWords.some(word => lowerComment.includes(word));
    },
    {
      message: 'El comentario contiene contenido no permitido'
    }
  );

/**
 * @description Esquema para validación de tipo de entidad reseñable.
 */
export const reviewableTypeSchema = z
  .enum([
    ReviewableType.STYLIST,
    ReviewableType.PRODUCT,
    ReviewableType.STYLE
  ], {
    errorMap: () => ({
      message: `El tipo debe ser uno de: ${Object.values(ReviewableType).join(', ')}`
    })
  });

/**
 * @description Esquema para validación de estado verificado.
 */
export const isVerifiedSchema = z
  .boolean()
  .default(false);

/**
 * @description Esquema para título de reseña (opcional).
 */
export const reviewTitleSchema = z
  .string()
  .min(3, 'El título debe tener al menos 3 caracteres')
  .max(100, 'El título no puede exceder 100 caracteres')
  .transform((title) => title.trim())
  .optional();

/**
 * @description Esquema para validación de tags/etiquetas.
 */
export const tagsSchema = z
  .array(z.string().min(2).max(20))
  .max(5, 'No se pueden agregar más de 5 etiquetas')
  .optional();

/**
 * @description Esquema para crear una nueva reseña.
 */
export const createReviewSchema = z.object({
  user_id: uuidSchema,
  rating: ratingSchema,
  comment: commentSchema,
  reviewable_id: uuidSchema,
  reviewable_type: reviewableTypeSchema,
  title: reviewTitleSchema,
  tags: tagsSchema
});

/**
 * @description Esquema para actualizar una reseña existente.
 */
export const updateReviewSchema = z.object({
  rating: ratingSchema.optional(),
  comment: commentSchema.optional(),
  title: reviewTitleSchema.optional(),
  tags: tagsSchema.optional(),
  is_verified: isVerifiedSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID).
 */
export const reviewParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para consultas de filtrado de reseñas.
 */
export const getReviewsQuerySchema = z.object({
  user_id: uuidSchema.optional(),
  reviewable_id: uuidSchema.optional(),
  reviewable_type: reviewableTypeSchema.optional(),
  verified: z
    .string()
    .regex(/^(true|false)$/, 'Verified debe ser true o false')
    .transform((val) => val === 'true')
    .optional(),
  rating: z
    .string()
    .regex(/^[1-5]$/, 'Rating debe ser un número entre 1 y 5')
    .transform(Number)
    .optional(),
  min_rating: z
    .string()
    .regex(/^[1-5]$/, 'Min_rating debe ser un número entre 1 y 5')
    .transform(Number)
    .optional(),
  max_rating: z
    .string()
    .regex(/^[1-5]$/, 'Max_rating debe ser un número entre 1 y 5')
    .transform(Number)
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'La página debe ser un número')
    .transform(Number)
    .refine((val) => val > 0, 'La página debe ser mayor a 0')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'El límite debe ser un número')
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100')
    .optional(),
  sort_by: z
    .enum(['rating', 'created_at', 'helpful_count'])
    .default('created_at')
    .optional(),
  sort_order: z
    .enum(['asc', 'desc'])
    .default('desc')
    .optional(),
  search: z
    .string()
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .optional()
}).refine(
  (data) => {
    if (data.min_rating && data.max_rating) {
      return data.min_rating <= data.max_rating;
    }
    return true;
  },
  {
    message: 'La calificación mínima no puede ser mayor a la máxima'
  }
);

/**
 * @description Esquema para estadísticas de reseñas.
 */
export const getReviewStatsQuerySchema = z.object({
  reviewable_id: uuidSchema,
  reviewable_type: reviewableTypeSchema
});

/**
 * @description Esquema para marcar reseña como útil.
 */
export const markHelpfulSchema = z.object({
  user_id: uuidSchema,
  helpful: z.boolean()
});

/**
 * @description Esquema para reportar reseña.
 */
export const reportReviewSchema = z.object({
  user_id: uuidSchema,
  reason: z.enum([
    'spam',
    'inappropriate_content',
    'fake_review',
    'offensive_language',
    'irrelevant',
    'other'
  ]),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
});

/**
 * @description Esquema para respuesta a reseña (por parte del negocio).
 */
export const respondToReviewSchema = z.object({
  response: z
    .string()
    .min(10, 'La respuesta debe tener al menos 10 caracteres')
    .max(500, 'La respuesta no puede exceder 500 caracteres')
    .transform((response) => response.trim()),
  user_id: uuidSchema // ID del usuario que responde (debe ser admin/owner)
});

/**
 * @description Esquema para verificación masiva de reseñas.
 */
export const bulkVerifyReviewsSchema = z.object({
  review_ids: z
    .array(uuidSchema)
    .min(1, 'Debe proporcionar al menos un ID de reseña')
    .max(50, 'No se pueden verificar más de 50 reseñas a la vez'),
  verified: z.boolean(),
  admin_user_id: uuidSchema
});

/**
 * @description Esquema para análisis de sentimientos de reseñas.
 */
export const analyzeSentimentSchema = z.object({
  reviewable_id: uuidSchema,
  reviewable_type: reviewableTypeSchema,
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha desde debe tener formato YYYY-MM-DD')
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha hasta debe tener formato YYYY-MM-DD')
    .optional()
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 */
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewParamsInput = z.infer<typeof reviewParamsSchema>;
export type GetReviewsQueryInput = z.infer<typeof getReviewsQuerySchema>;
export type GetReviewStatsQueryInput = z.infer<typeof getReviewStatsQuerySchema>;
export type MarkHelpfulInput = z.infer<typeof markHelpfulSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
export type RespondToReviewInput = z.infer<typeof respondToReviewSchema>;
export type BulkVerifyReviewsInput = z.infer<typeof bulkVerifyReviewsSchema>;
export type AnalyzeSentimentInput = z.infer<typeof analyzeSentimentSchema>;