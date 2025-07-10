/**
 * @file Schemas de validación Zod para autenticación de LauraBraids.
 * @description Define las validaciones para login, registro y operaciones
 *              de autenticación con reglas de seguridad específicas.
 */

import { z } from 'zod';
import { UserRole } from '../interfaces/user.interface';

/**
 * @description Schema de validación para login de usuarios.
 * Valida email y contraseña con reglas de seguridad.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido')
    .transform(email => email.toLowerCase().trim()),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
});

/**
 * @description Schema de validación para registro de nuevos usuarios.
 * Incluye validaciones estrictas de contraseña y datos personales.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    )
    .transform(name => name.trim()),
  
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido')
    .transform(email => email.toLowerCase().trim()),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Rol de usuario inválido' })
    })
    .optional()
    .default(UserRole.CUSTOMER)
});

/**
 * @description Schema de validación para cambio de contraseña.
 * Requiere contraseña actual y nueva contraseña segura.
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
  
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(128, 'La nueva contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  
  confirmPassword: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida')
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  }
);

/**
 * @description Schema de validación para recuperación de contraseña.
 * Solo requiere email válido.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido')
    .transform(email => email.toLowerCase().trim())
});

/**
 * @description Schema de validación para reset de contraseña.
 * Requiere token y nueva contraseña segura.
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'El token de recuperación es requerido'),
  
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(128, 'La nueva contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  
  confirmPassword: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida')
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  }
);

/**
 * @description Schema de validación para refresh token.
 * Valida el token de refresco.
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'El token de refresco es requerido')
});

// Exportar tipos inferidos de los schemas
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>;