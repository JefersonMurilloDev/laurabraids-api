/**
 * @file Esquemas de validación Zod para la entidad Stylist.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con estilistas, incluyendo perfil, especialidades y estado.
 */

import { z } from 'zod';

/**
 * @description Esquema para validación de nombre de estilista.
 */
export const stylistNameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
    'El nombre solo puede contener letras y espacios'
  )
  .transform((name) => name.trim());

/**
 * @description Esquema para validación de especialidad.
 * Define especialidades permitidas y valida formato.
 */
export const specialtySchema = z
  .string()
  .min(3, 'La especialidad debe tener al menos 3 caracteres')
  .max(150, 'La especialidad no puede exceder 150 caracteres')
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.-]+$/,
    'La especialidad contiene caracteres no válidos'
  )
  .transform((specialty) => specialty.trim())
  .refine(
    (specialty) => {
      const validSpecialties = [
        'trenzas africanas',
        'box braids',
        'cornrows',
        'extensiones',
        'trenzas largas',
        'trenzas infantiles',
        'trenzas modernas',
        'trenzas clásicas',
        'fulani braids',
        'goddess braids',
        'knotless braids',
        'dutch braids',
        'french braids',
        'twist braids'
      ];
      
      return validSpecialties.some(valid => 
        specialty.toLowerCase().includes(valid)
      );
    },
    {
      message: 'La especialidad debe ser una especialidad de trenzas válida'
    }
  );

/**
 * @description Esquema para validación de URL de foto.
 */
export const photoUrlSchema = z
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
 * @description Esquema para validación de descripción.
 */
export const descriptionSchema = z
  .string()
  .min(10, 'La descripción debe tener al menos 10 caracteres')
  .max(1000, 'La descripción no puede exceder 1000 caracteres')
  .transform((description) => description.trim());

/**
 * @description Esquema para validación de estado destacado.
 */
export const isFeaturedSchema = z
  .boolean()
  .default(false);

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para crear una nueva estilista.
 */
export const createStylistSchema = z.object({
  name: stylistNameSchema,
  specialty: specialtySchema,
  photo_url: photoUrlSchema,
  description: descriptionSchema,
  is_featured: isFeaturedSchema.optional()
});

/**
 * @description Esquema para actualizar una estilista existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export const updateStylistSchema = z.object({
  name: stylistNameSchema.optional(),
  specialty: specialtySchema.optional(),
  photo_url: photoUrlSchema.optional(),
  description: descriptionSchema.optional(),
  is_featured: isFeaturedSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID).
 */
export const stylistParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para consultas de filtrado de estilistas.
 */
export const getStylistsQuerySchema = z.object({
  featured: z
    .string()
    .regex(/^(true|false)$/, 'Featured debe ser true o false')
    .transform((val) => val === 'true')
    .optional(),
  specialty: z
    .string()
    .max(150, 'La especialidad de búsqueda no puede exceder 150 caracteres')
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
 * @description Esquema para búsqueda de estilistas por disponibilidad.
 */
export const stylistAvailabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today;
    }, 'La fecha debe ser hoy o en el futuro'),
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'La hora debe tener formato HH:MM')
    .optional()
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 */
export type CreateStylistInput = z.infer<typeof createStylistSchema>;
export type UpdateStylistInput = z.infer<typeof updateStylistSchema>;
export type StylistParamsInput = z.infer<typeof stylistParamsSchema>;
export type GetStylistsQueryInput = z.infer<typeof getStylistsQuerySchema>;
export type StylistAvailabilityQueryInput = z.infer<typeof stylistAvailabilityQuerySchema>;