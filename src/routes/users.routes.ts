import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/users.controller';
import { 
  validateBody, 
  validateParams, 
  validateQuery 
} from '../middleware/validation.middleware';
import {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin
} from '../middleware/auth.middleware';
import {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
  getUsersQuerySchema
} from '../schemas/users.schema';

/**
 * @file Define las rutas para la gestión de usuarios del sistema LauraBraids.
 * @description Configura todos los endpoints REST para operaciones CRUD de usuarios,
 *              incluyendo registro, obtención de perfiles y gestión administrativa.
 */

const router = Router();

// Definición de las rutas para usuarios
// IMPORTANTE: Las rutas específicas DEBEN ir ANTES que las rutas con parámetros

/**
 * GET /api/users/testing123 - Ruta de prueba
 */
router.get('/testing123', (req: any, res: any) => {
  res.json({ message: 'Test route works!' });
});

/**
 * GET /api/users/all - Obtener todos los usuarios
 * @description Retorna lista completa de usuarios (sin passwords)
 * @access Solo ADMIN
 */
router.get('/all', requireAdmin, getUsers);

/**
 * POST /api/users - Crear un nuevo usuario (registro)
 * @description Registra un nuevo usuario en el sistema
 * @body {name, email, password, role?}
 * @access Público
 */
router.post('/', validateBody(createUserSchema), createUser);

// Rutas con parámetros VAN AL FINAL para evitar conflictos

/**
 * GET /api/users/:id - Obtener un usuario por ID
 * @description Retorna datos de un usuario específico (sin password)
 * @param {string} id - UUID del usuario
 * @access Propio usuario o ADMIN
 */
router.get('/:id', requireOwnerOrAdmin, validateParams(userParamsSchema), getUserById);

/**
 * PUT /api/users/:id - Actualizar un usuario existente
 * @description Actualiza datos de un usuario específico
 * @param {string} id - UUID del usuario
 * @body {name?, email?, role?}
 * @access Propio usuario o ADMIN
 */
router.put('/:id', requireOwnerOrAdmin, validateParams(userParamsSchema), validateBody(updateUserSchema), updateUser);

/**
 * DELETE /api/users/:id - Eliminar un usuario
 * @description Elimina permanentemente un usuario del sistema
 * @param {string} id - UUID del usuario
 * @access Solo ADMIN
 */
router.delete('/:id', requireAdmin, validateParams(userParamsSchema), deleteUser);

export default router;