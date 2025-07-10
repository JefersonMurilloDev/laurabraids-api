/**
 * @file Esquemas de validación Zod para la entidad Category.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con categorías de estilos de trenzas.
 */

import { z } from 'zod';

/**
 * @description Esquema para validación de nombre de categoría.
 * Valida caracteres permitidos y longitud.
 */
export const categoryNameSchema = z
  .string()
  .min(2, 'El nombre de la categoría debe tener al menos 2 caracteres')
  .max(50, 'El nombre de la categoría no puede exceder 50 caracteres')
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
    'El nombre solo puede contener letras y espacios'
  )
  .transform((name) => name.trim());

/**
 * @description Esquema para validación de descripción de categoría.
 */
export const categoryDescriptionSchema = z
  .string()
  .max(500, 'La descripción no puede exceder 500 caracteres')
  .transform((desc) => desc.trim())
  .optional();

/**
 * @description Esquema para validación de orden de visualización.
 */
export const displayOrderSchema = z
  .number()
  .int('El orden debe ser un número entero')
  .min(0, 'El orden debe ser mayor o igual a 0')
  .max(999, 'El orden no puede exceder 999')
  .default(0);

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para crear una nueva categoría.
 * Incluye todas las validaciones necesarias para la creación.
 */
export const createCategorySchema = z.object({
  name: categoryNameSchema,
  description: categoryDescriptionSchema,
  display_order: displayOrderSchema.optional(),
  is_active: z.boolean().default(true).optional()
});

/**
 * @description Esquema para actualizar una categoría existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export const updateCategorySchema = z.object({
  name: categoryNameSchema.optional(),
  description: categoryDescriptionSchema,
  display_order: displayOrderSchema.optional(),
  is_active: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID).
 */
export const categoryParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para consultas de filtrado de categorías.
 */
export const getCategoriesQuerySchema = z.object({
  is_active: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  order_by: z
    .enum(['name', 'display_order', 'created_at'])
    .default('display_order')
    .optional(),
  sort: z
    .enum(['asc', 'desc'])
    .default('asc')
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val <= 100, 'El límite no puede exceder 100')
    .optional(),
  search: z
    .string()
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
    .optional()
});

/**
 * @description Esquema para búsqueda por nombre de categoría.
 */
export const categorySearchSchema = z.object({
  name: categoryNameSchema
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 * Estos tipos se pueden usar en controllers para type safety.
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryParamsInput = z.infer<typeof categoryParamsSchema>;
export type GetCategoriesQueryInput = z.infer<typeof getCategoriesQuerySchema>;
export type CategorySearchInput = z.infer<typeof categorySearchSchema>;