/**
 * @file Esquemas de validación Zod para la entidad Style.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con estilos de trenzas, incluyendo categorías y características.
 */

import { z } from 'zod';

/**
 * @description Categorías válidas para estilos de trenzas.
 */
export const VALID_STYLE_CATEGORIES = [
  'Largo',
  'Corto', 
  'Clásico',
  'Colorido',
  'Moderno'
] as const;

/**
 * @description Esquema para validación de nombre de estilo.
 */
export const styleNameSchema = z
  .string()
  .min(2, 'El nombre del estilo debe tener al menos 2 caracteres')
  .max(100, 'El nombre del estilo no puede exceder 100 caracteres')
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s0-9.-]+$/,
    'El nombre del estilo contiene caracteres no válidos'
  )
  .transform((name) => name.trim())
  .refine(
    (name) => {
      // Lista de estilos conocidos para validación adicional
      const knownStyles = [
        'box braids', 'cornrows', 'fulani braids', 'goddess braids',
        'knotless braids', 'dutch braids', 'french braids', 'twist braids',
        'micro braids', 'jumbo braids', 'ghana braids', 'tree braids',
        'invisible braids', 'senegalese twists', 'marley twists',
        'havana twists', 'passion twists', 'spring twists'
      ];
      
      // Permitir estilos conocidos o nuevos estilos que contengan palabras clave
      const keywords = ['braid', 'twist', 'loc', 'dread', 'cornrow', 'plait'];
      const lowerName = name.toLowerCase();
      
      return knownStyles.some(style => lowerName.includes(style)) ||
             keywords.some(keyword => lowerName.includes(keyword)) ||
             name.length > 5; // Permitir nombres creativos largos
    },
    {
      message: 'El nombre debe ser un estilo de trenza válido o contener palabras relacionadas con trenzas'
    }
  );

/**
 * @description Esquema para validación de URL de foto del estilo.
 */
export const stylePhotoUrlSchema = z
  .string()
  .url('La URL de la foto debe ser válida')
  .max(500, 'La URL no puede exceder 500 caracteres')
  .regex(
    /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i,
    'La URL debe apuntar a una imagen válida (jpg, jpeg, png, webp, gif)'
  )
  .optional()
  .or(z.literal(''));

/**
 * @description Esquema para validación de descripción del estilo.
 */
export const styleDescriptionSchema = z
  .string()
  .min(10, 'La descripción debe tener al menos 10 caracteres')
  .max(500, 'La descripción no puede exceder 500 caracteres')
  .transform((description) => description.trim())
  .refine(
    (description) => {
      // Validar que la descripción sea relevante para trenzas
      const relevantWords = [
        'trenza', 'cabello', 'estilo', 'protector', 'elegante',
        'duradero', 'versátil', 'natural', 'textura', 'volumen',
        'braid', 'hair', 'protective', 'style'
      ];
      
      const lowerDesc = description.toLowerCase();
      return relevantWords.some(word => lowerDesc.includes(word));
    },
    {
      message: 'La descripción debe ser relevante para estilos de trenzas'
    }
  );

/**
 * @description Esquema para validación de categoría.
 */
export const styleCategorySchema = z
  .enum(VALID_STYLE_CATEGORIES, {
    errorMap: () => ({
      message: `La categoría debe ser una de: ${VALID_STYLE_CATEGORIES.join(', ')}`
    })
  });

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para nivel de dificultad del estilo.
 */
export const difficultyLevelSchema = z
  .enum(['Fácil', 'Intermedio', 'Avanzado', 'Experto'])
  .optional();

/**
 * @description Esquema para tiempo estimado (en minutos).
 */
export const estimatedTimeSchema = z
  .number()
  .int('El tiempo estimado debe ser un número entero')
  .min(15, 'El tiempo mínimo es 15 minutos')
  .max(480, 'El tiempo máximo es 8 horas (480 minutos)')
  .optional();

/**
 * @description Esquema para crear un nuevo estilo.
 */
export const createStyleSchema = z.object({
  name: styleNameSchema,
  photo_url: stylePhotoUrlSchema,
  description: styleDescriptionSchema,
  category: styleCategorySchema,
  difficulty_level: difficultyLevelSchema,
  estimated_time: estimatedTimeSchema
});

/**
 * @description Esquema para actualizar un estilo existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export const updateStyleSchema = z.object({
  name: styleNameSchema.optional(),
  photo_url: stylePhotoUrlSchema.optional(),
  description: styleDescriptionSchema.optional(),
  category: styleCategorySchema.optional(),
  difficulty_level: difficultyLevelSchema.optional(),
  estimated_time: estimatedTimeSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID).
 */
export const styleParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para consultas de filtrado de estilos.
 */
export const getStylesQuerySchema = z.object({
  category: styleCategorySchema.optional(),
  difficulty_level: difficultyLevelSchema.optional(),
  max_time: z
    .string()
    .regex(/^\d+$/, 'El tiempo máximo debe ser un número')
    .transform(Number)
    .refine((val) => val > 0 && val <= 480, 'El tiempo debe estar entre 1 y 480 minutos')
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
  search: z
    .string()
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .optional()
});

/**
 * @description Esquema para búsqueda avanzada de estilos.
 */
export const searchStylesSchema = z.object({
  query: z
    .string()
    .min(2, 'La búsqueda debe tener al menos 2 caracteres')
    .max(100, 'La búsqueda no puede exceder 100 caracteres'),
  categories: z
    .array(styleCategorySchema)
    .max(VALID_STYLE_CATEGORIES.length, 'Demasiadas categorías seleccionadas')
    .optional(),
  difficulty_levels: z
    .array(difficultyLevelSchema.unwrap())
    .max(4, 'Demasiados niveles de dificultad seleccionados')
    .optional(),
  time_range: z.object({
    min: z.number().int().min(15).optional(),
    max: z.number().int().max(480).optional()
  }).optional()
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 */
export type CreateStyleInput = z.infer<typeof createStyleSchema>;
export type UpdateStyleInput = z.infer<typeof updateStyleSchema>;
export type StyleParamsInput = z.infer<typeof styleParamsSchema>;
export type GetStylesQueryInput = z.infer<typeof getStylesQuerySchema>;
export type SearchStylesInput = z.infer<typeof searchStylesSchema>;
export type StyleCategory = z.infer<typeof styleCategorySchema>;