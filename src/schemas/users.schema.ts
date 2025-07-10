/**
 * @file Esquemas de validación Zod para la entidad User.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con usuarios, incluyendo registro, actualización y autenticación.
 */

import { z } from 'zod';
import { UserRole } from '../interfaces/user.interface';

/**
 * @description Esquema base para validación de email.
 * Valida formato, dominio y longitud.
 */
export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Formato de email inválido')
  .max(255, 'El email no puede exceder 255 caracteres')
  .toLowerCase()
  .transform((email) => email.trim());

/**
 * @description Esquema para validación de contraseña.
 * Requiere al menos 8 caracteres, una mayúscula, una minúscula y un número.
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
  );

/**
 * @description Esquema para validación de nombre.
 * Valida caracteres permitidos y longitud.
 */
export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
    'El nombre solo puede contener letras y espacios'
  )
  .transform((name) => name.trim());

/**
 * @description Esquema para validación de rol de usuario.
 */
export const userRoleSchema = z
  .enum([UserRole.CUSTOMER, UserRole.ADMIN])
  .default(UserRole.CUSTOMER);

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para crear un nuevo usuario (registro).
 * Incluye todas las validaciones necesarias para el registro.
 */
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional()
});

/**
 * @description Esquema para actualizar un usuario existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: userRoleSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID).
 */
export const userParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para login de usuario.
 */
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida')
});

/**
 * @description Esquema para cambio de contraseña.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  }
);

/**
 * @description Esquema para consultas de filtrado de usuarios.
 */
export const getUsersQuerySchema = z.object({
  role: z.enum([UserRole.CUSTOMER, UserRole.ADMIN]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100).optional()
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 * Estos tipos se pueden usar en controllers para type safety.
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserParamsInput = z.infer<typeof userParamsSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;