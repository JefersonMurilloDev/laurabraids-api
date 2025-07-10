/**
 * @file Interfaces para el sistema de autenticación de LauraBraids.
 * @description Define los tipos TypeScript para login, registro, tokens JWT
 *              y payload de autenticación del sistema.
 */

import { UserRole } from './user.interface';

/**
 * @interface LoginRequest
 * @description Datos requeridos para el login de usuarios.
 */
export interface LoginRequest {
  /** Email del usuario para autenticación */
  email: string;
  /** Contraseña del usuario */
  password: string;
}

/**
 * @interface RegisterRequest
 * @description Datos requeridos para el registro de nuevos usuarios.
 */
export interface RegisterRequest {
  /** Nombre completo del usuario */
  name: string;
  /** Email único del usuario */
  email: string;
  /** Contraseña segura del usuario */
  password: string;
  /** Rol del usuario (opcional, por defecto CUSTOMER) */
  role?: UserRole;
}

/**
 * @interface AuthResponse
 * @description Respuesta del sistema tras autenticación exitosa.
 */
export interface AuthResponse {
  /** Token JWT para autenticación */
  token: string;
  /** Datos del usuario autenticado (sin password) */
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
  };
  /** Tiempo de expiración del token en milisegundos */
  expires_in: number;
}

/**
 * @interface JWTPayload
 * @description Payload contenido en el token JWT.
 */
export interface JWTPayload {
  /** ID único del usuario */
  userId: string;
  /** Email del usuario */
  email: string;
  /** Rol del usuario para autorización */
  role: UserRole;
  /** Timestamp de emisión del token */
  iat?: number;
  /** Timestamp de expiración del token */
  exp?: number;
}

/**
 * @interface AuthenticatedRequest
 * @description Extensión de Request con información del usuario autenticado.
 */
export interface AuthenticatedRequest extends Request {
  /** Usuario autenticado obtenido del token JWT */
  user?: JWTPayload;
}