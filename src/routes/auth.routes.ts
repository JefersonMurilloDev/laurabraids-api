/**
 * @file Define las rutas para autenticación del sistema LauraBraids.
 * @description Configura todos los endpoints de autenticación incluyendo login,
 *              registro, perfil de usuario, cambio de contraseña y logout.
 */

import { Router } from 'express';
import {
  login,
  register,
  getProfile,
  changePassword,
  logout,
  refreshToken
} from '../controllers/auth.controller';
import { 
  validateBody 
} from '../middleware/validation.middleware';
import {
  requireAuth
} from '../middleware/auth.middleware';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema
} from '../schemas/auth.schema';

const router = Router();

// Definición de las rutas de autenticación

/**
 * POST /api/auth/login - Iniciar sesión
 * @description Autentica un usuario con email y contraseña
 * @body {email, password}
 * @access Público
 * @returns {token, user, expires_in}
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * POST /api/auth/register - Registrar nuevo usuario
 * @description Crea una nueva cuenta de usuario en el sistema
 * @body {name, email, password, role?}
 * @access Público
 * @returns {token, user, expires_in}
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * GET /api/auth/profile - Obtener perfil del usuario autenticado
 * @description Retorna información del perfil del usuario autenticado
 * @access Privado (requiere token JWT)
 * @returns {user}
 */
router.get('/profile', requireAuth, getProfile);

/**
 * PUT /api/auth/change-password - Cambiar contraseña
 * @description Permite al usuario cambiar su contraseña actual
 * @body {currentPassword, newPassword, confirmPassword}
 * @access Privado (requiere token JWT)
 * @returns {message}
 */
router.put('/change-password', requireAuth, validateBody(changePasswordSchema), changePassword);

/**
 * POST /api/auth/logout - Cerrar sesión
 * @description Cierra la sesión del usuario (principalmente del lado del cliente)
 * @access Privado (requiere token JWT)
 * @returns {message}
 */
router.post('/logout', requireAuth, logout);

/**
 * POST /api/auth/refresh - Refrescar token
 * @description Genera un nuevo token JWT para el usuario autenticado
 * @access Privado (requiere token JWT válido)
 * @returns {token, user, expires_in}
 */
router.post('/refresh', requireAuth, refreshToken);

export default router;