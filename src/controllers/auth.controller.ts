/**
 * @file Controladores de autenticación para la API LauraBraids.
 * @description Maneja todas las operaciones de autenticación incluyendo login,
 *              registro, cambio de contraseña y gestión de tokens JWT.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../interfaces/user.interface';
import { AuthResponse, JWTPayload } from '../interfaces/auth.interface';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import { 
  getUsers, 
  getUserByEmail, 
  getUserById, 
  addUser, 
  updateUser, 
  resetUsers as resetUsersData 
} from '../data/users.database';

/**
 * @function resetUsers
 * @description Reinicia el array de usuarios a su estado inicial.
 * Utilizada principalmente para testing.
 */
export const resetUsers = async (): Promise<void> => {
  await resetUsersData();
};

/**
 * @function createAuthResponse
 * @description Crea una respuesta de autenticación estandarizada.
 * 
 * @param user - Usuario autenticado
 * @returns Respuesta de autenticación con token y datos del usuario
 */
const createAuthResponse = (user: User): AuthResponse => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const token = generateToken(payload);
  const expiresIn = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    },
    expires_in: expiresIn
  };
};

/**
 * @function login
 * @description Autentica un usuario con email y contraseña.
 * 
 * @param req - Request con email y password en el body
 * @param res - Response con token JWT y datos del usuario
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Generar respuesta de autenticación
    const authResponse = createAuthResponse(user);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: authResponse
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * @function register
 * @description Registra un nuevo usuario en el sistema.
 * 
 * @param req - Request con datos del nuevo usuario
 * @param res - Response con token JWT y datos del usuario creado
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = UserRole.CUSTOMER } = req.body;

    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
        error: 'EMAIL_ALREADY_EXISTS'
      });
      return;
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password_hash,
      role,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Agregar usuario usando la función compartida
    await addUser(newUser);

    // Generar respuesta de autenticación
    const authResponse = createAuthResponse(newUser);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: authResponse
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * @function getProfile
 * @description Obtiene el perfil del usuario autenticado.
 * 
 * @param req - Request autenticado con información del usuario
 * @param res - Response con datos del perfil del usuario
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED'
      });
      return;
    }

    // Buscar usuario por ID
    const user = await getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Devolver perfil sin password_hash
    const { password_hash, ...userProfile } = user;

    res.status(200).json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: userProfile
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * @function changePassword
 * @description Cambia la contraseña del usuario autenticado.
 * 
 * @param req - Request con contraseña actual y nueva contraseña
 * @param res - Response confirmando el cambio de contraseña
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar usuario
    const user = await getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Verificar contraseña actual
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidCurrentPassword) {
      res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
        error: 'INVALID_CURRENT_PASSWORD'
      });
      return;
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar usuario usando la función compartida
    await updateUser(req.user!.userId, {
      password_hash: newPasswordHash
    });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * @function logout
 * @description Cierra la sesión del usuario (logout del lado del cliente).
 * En un sistema real, esto podría invalidar tokens o manejar blacklists.
 * 
 * @param req - Request autenticado
 * @param res - Response confirmando el logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // En este sistema simple, el logout es principalmente del lado del cliente
    // que debe eliminar el token JWT almacenado
    res.status(200).json({
      success: true,
      message: 'Logout exitoso. Token debe ser eliminado del cliente.'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * @function refreshToken
 * @description Refresca un token JWT válido generando uno nuevo.
 * 
 * @param req - Request autenticado con token válido
 * @param res - Response con nuevo token JWT
 */
export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED'
      });
      return;
    }

    // Buscar usuario para obtener datos actualizados
    const user = await getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Generar nuevo token
    const authResponse = createAuthResponse(user);

    res.status(200).json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: authResponse
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};