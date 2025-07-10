/**
 * @file Controller para la gestión de usuarios del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para la entidad User.
 */

import { RequestHandler } from 'express';
import { User, UserRole } from '../interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import {
  getUsers as getUsersData,
  getUserById as getUserByIdData,
  getUserByEmail,
  addUser,
  updateUser as updateUserData,
  deleteUser as deleteUserData,
  resetUsers as resetUsersData
} from '../data/users.database';

/**
 * @description Reinicia los datos de usuarios al estado inicial (para testing).
 */
export const resetUsersForTesting = async (): Promise<void> => {
  await resetUsersData();
};

/**
 * @description Reinicia los datos de usuarios al estado inicial. Útil para testing.
 */
export const resetUsers: RequestHandler = async (req, res) => {
  try {
    await resetUsersData();
    res.status(200).json({ message: 'Datos de usuarios reiniciados' });
  } catch (error) {
    console.error('Error al reiniciar usuarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Obtiene todos los usuarios del sistema.
 */
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const allUsers = await getUsersData();
    // Excluir password_hash por seguridad
    const safeUsers = allUsers.map(({ password_hash, ...user }) => user);
    res.status(200).json({ success: true, data: safeUsers });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Obtiene un usuario específico por su ID.
 */
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdData(id);

    if (user) {
      // Excluimos el password_hash por seguridad
      const { password_hash, ...safeUser } = user;
      res.status(200).json({ success: true, data: safeUser });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Crea un nuevo usuario. (Esta función es para administradores, la de registro está en auth.controller).
 */
export const createUser: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, role = UserRole.CUSTOMER } = req.body;

    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'El email ya está registrado' });
      return;
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password_hash,
      role,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await addUser(newUser);

    const { password_hash: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: safeUser });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Actualiza un usuario existente por su ID.
 */
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Verificar que el usuario exista
    const existingUser = await getUserByIdData(id);
    if (!existingUser) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    // Verificar si el nuevo email ya está en uso por otro usuario
    if (email) {
      const userWithEmail = await getUserByEmail(email);
      if (userWithEmail && userWithEmail.id !== id) {
        res.status(409).json({ success: false, message: 'El email ya está registrado por otro usuario' });
        return;
      }
    }

    const updates: Partial<User> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;

    const updatedUser = await updateUserData(id, updates);

    if (updatedUser) {
      const { password_hash, ...safeUser } = updatedUser;
      res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente', data: safeUser });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado al intentar actualizar' });
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Elimina un usuario por su ID.
 */
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteUserData(id);

    if (success) {
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
