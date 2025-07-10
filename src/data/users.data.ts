/**
 * @file Datos compartidos de usuarios para toda la aplicación.
 * @description Contiene la fuente única de verdad para los datos de usuarios.
 *              Usado tanto por auth.controller como users.controller.
 */

import { User, UserRole } from '../interfaces/user.interface';

/**
 * @description Array inicial de usuarios del sistema.
 * Esta es la fuente única de verdad para todos los usuarios.
 */
export const initialUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'María García',
    email: 'maria@example.com',
    password_hash: '$2b$10$u2HBnM7nLD6UwXEErJITW.pwHySwuMxsUj8NLJX2cLMozpbSSR/Ea', // password123
    role: UserRole.ADMIN,
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Ana López',
    email: 'ana@example.com',
    password_hash: '$2b$10$u2HBnM7nLD6UwXEErJITW.pwHySwuMxsUj8NLJX2cLMozpbSSR/Ea', // password123
    role: UserRole.CUSTOMER,
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Laura Martínez',
    email: 'laura@example.com',
    password_hash: '$2b$10$u2HBnM7nLD6UwXEErJITW.pwHySwuMxsUj8NLJX2cLMozpbSSR/Ea', // password123
    role: UserRole.CUSTOMER,
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z')
  }
];

/**
 * @description Array mutable de usuarios que se modifica durante la ejecución.
 * Todas las operaciones CRUD operan sobre este array.
 */
let users: User[] = [...initialUsers];

/**
 * @description Obtiene todos los usuarios.
 * @returns Array de usuarios actual
 */
export const getUsers = (): User[] => {
  return users;
};

/**
 * @description Obtiene un usuario por ID.
 * @param id - ID del usuario a buscar
 * @returns Usuario encontrado o undefined
 */
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

/**
 * @description Obtiene un usuario por email.
 * @param email - Email del usuario a buscar
 * @returns Usuario encontrado o undefined
 */
export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

/**
 * @description Agrega un nuevo usuario.
 * @param user - Usuario a agregar
 * @returns Usuario agregado
 */
export const addUser = (user: User): User => {
  users.push(user);
  return user;
};

/**
 * @description Actualiza un usuario existente.
 * @param id - ID del usuario a actualizar
 * @param updates - Campos a actualizar
 * @returns Usuario actualizado o undefined si no se encuentra
 */
export const updateUser = (id: string, updates: Partial<User>): User | undefined => {
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return undefined;
  
  users[index] = { ...users[index], ...updates, updated_at: new Date() };
  return users[index];
};

/**
 * @description Elimina un usuario por ID.
 * @param id - ID del usuario a eliminar
 * @returns true si se eliminó, false si no se encontró
 */
export const deleteUser = (id: string): boolean => {
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return false;
  
  users.splice(index, 1);
  return true;
};

/**
 * @description Reinicia los usuarios al estado inicial.
 * Útil para testing y desarrollo.
 */
export const resetUsers = (): void => {
  users = [...initialUsers];
};