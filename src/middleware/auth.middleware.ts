/**
 * @file Middleware de autenticación y autorización para LauraBraids.
 * @description Maneja la verificación de tokens JWT, autenticación de usuarios
 *              y autorización basada en roles para proteger endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../interfaces/auth.interface';
import { UserRole } from '../interfaces/user.interface';

/**
 * @description Clave secreta para firmar y verificar tokens JWT.
 * En producción debería venir de variables de entorno.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'laura_braids_secret_key_2024';

/**
 * @interface AuthenticatedRequest
 * @description Extensión de Request con información del usuario autenticado.
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * @function authenticateToken
 * @description Middleware para verificar y decodificar tokens JWT.
 * Extrae el token del header Authorization y valida su autenticidad.
 * 
 * @param req - Request object extendido con usuario
 * @param res - Response object
 * @param next - NextFunction para continuar al siguiente middleware
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verificar y decodificar el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        let message = 'Token inválido';
        let error = 'INVALID_TOKEN';

        if (err.name === 'TokenExpiredError') {
          message = 'Token expirado';
          error = 'EXPIRED_TOKEN';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Token malformado';
          error = 'MALFORMED_TOKEN';
        }

        res.status(403).json({
          success: false,
          message,
          error,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Agregar información del usuario al request
      req.user = decoded as JWTPayload;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante autenticación',
      error: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @function requireAuth
 * @description Middleware que requiere autenticación obligatoria.
 * Alias para authenticateToken para mayor claridad semántica.
 */
export const requireAuth = authenticateToken;

/**
 * @function optionalAuth
 * @description Middleware de autenticación opcional.
 * Si hay token, lo valida; si no hay token, continúa sin error.
 * 
 * @param req - Request object extendido con usuario
 * @param res - Response object
 * @param next - NextFunction para continuar al siguiente middleware
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No hay token, continuar sin autenticación
    next();
    return;
  }

  // Hay token, validarlo
  try {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        req.user = decoded as JWTPayload;
      }
      // Continuar independientemente del resultado
      next();
    });
  } catch (error) {
    // Ignorar errores y continuar
    next();
  }
};

/**
 * @function requireRole
 * @description Factory function para crear middleware de autorización por roles.
 * Requiere que el usuario tenga uno de los roles especificados.
 * 
 * @param roles - Array de roles permitidos
 * @returns Middleware function
 */
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticación requerida',
        error: 'AUTHENTICATION_REQUIRED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * @function requireAdmin
 * @description Middleware que requiere rol de administrador.
 * Primero autentica y luego verifica que sea ADMIN.
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verificar y decodificar el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        let message = 'Token inválido';
        let error = 'INVALID_TOKEN';

        if (err.name === 'TokenExpiredError') {
          message = 'Token expirado';
          error = 'EXPIRED_TOKEN';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Token malformado';
          error = 'MALFORMED_TOKEN';
        }

        res.status(403).json({
          success: false,
          message,
          error,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Agregar información del usuario al request
      req.user = decoded as JWTPayload;
      
      // Verificar que sea ADMIN
      if (req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Se requieren permisos de administrador',
          error: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante autenticación',
      error: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @function requireOwnerOrAdmin
 * @description Middleware que permite acceso al propietario del recurso o admin.
 * Verifica que el usuario sea el propietario del recurso (userId coincide)
 * o que tenga rol de administrador.
 * 
 * @param req - Request object extendido con usuario
 * @param res - Response object
 * @param next - NextFunction para continuar al siguiente middleware
 */
export const requireOwnerOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verificar y decodificar el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        let message = 'Token inválido';
        let error = 'INVALID_TOKEN';

        if (err.name === 'TokenExpiredError') {
          message = 'Token expirado';
          error = 'EXPIRED_TOKEN';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Token malformado';
          error = 'MALFORMED_TOKEN';
        }

        res.status(403).json({
          success: false,
          message,
          error,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Agregar información del usuario al request
      req.user = decoded as JWTPayload;
      
      const resourceUserId = req.params.id || req.params.userId;
      const isOwner = req.user.userId === resourceUserId;
      const isAdmin = req.user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Solo puedes acceder a tus propios recursos o ser administrador',
          error: 'RESOURCE_ACCESS_DENIED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante autenticación',
      error: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @function generateToken
 * @description Utility function para generar tokens JWT.
 * 
 * @param payload - Datos a incluir en el token
 * @param expiresIn - Tiempo de expiración (default: 24h)
 * @returns Token JWT firmado
 */
export const generateToken = (
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn: string = '24h'
): string => {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: expiresIn as any });
};

/**
 * @function verifyToken
 * @description Utility function para verificar tokens JWT.
 * 
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};