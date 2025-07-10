/**
 * @file Capa de datos para usuarios usando MySQL.
 * @description Migración de datos en memoria a base de datos MySQL.
 */

import { executeQuery } from '../config/database.config';
import { User, UserRole } from '../interfaces/user.interface';
import { RowDataPacket } from 'mysql2';

/**
 * @interface UserRow
 * @description Interfaz para las filas de usuarios desde MySQL
 */
interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  email_verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * @function getUsers
 * @description Obtiene todos los usuarios de la base de datos
 * @returns Array de usuarios
 */
export const getUsers = async (): Promise<User[]> => {
  const query = `
    SELECT id, name, email, password_hash, role, phone, is_active, 
           email_verified_at, created_at, updated_at
    FROM users 
    WHERE is_active = true
    ORDER BY created_at DESC
  `;
  
  const rows: UserRow[] = await executeQuery(query);
  return rows.map(mapRowToUser);
};

/**
 * @function getUserById
 * @description Obtiene un usuario por su ID
 * @param id - ID del usuario
 * @returns Usuario encontrado o null
 */
export const getUserById = async (id: string): Promise<User | null> => {
  const query = `
    SELECT id, name, email, password_hash, role, phone, is_active, 
           email_verified_at, created_at, updated_at
    FROM users 
    WHERE id = ? AND is_active = true
  `;
  
  const rows: UserRow[] = await executeQuery(query, [id]);
  return rows.length > 0 ? mapRowToUser(rows[0]) : null;
};

/**
 * @function getUserByEmail
 * @description Obtiene un usuario por su email
 * @param email - Email del usuario
 * @returns Usuario encontrado o null
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const query = `
    SELECT id, name, email, password_hash, role, phone, is_active, 
           email_verified_at, created_at, updated_at
    FROM users 
    WHERE email = ? AND is_active = true
  `;
  
  const rows: UserRow[] = await executeQuery(query, [email]);
  return rows.length > 0 ? mapRowToUser(rows[0]) : null;
};

/**
 * @function addUser
 * @description Agrega un nuevo usuario a la base de datos
 * @param user - Datos del usuario a agregar
 * @returns Usuario creado
 */
export const addUser = async (user: User): Promise<User> => {
  const query = `
    INSERT INTO users (id, name, email, password_hash, role, phone, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    user.id,
    user.name,
    user.email,
    user.password_hash,
    user.role,
    user.phone || null,
    true,
    user.created_at,
    user.updated_at
  ];
  
  await executeQuery(query, params);
  return user;
};

/**
 * @function updateUser
 * @description Actualiza un usuario existente
 * @param id - ID del usuario
 * @param updates - Campos a actualizar
 * @returns Usuario actualizado o null si no se encontró
 */
export const updateUser = async (
  id: string, 
  updates: Partial<Omit<User, 'id' | 'created_at'>>
): Promise<User | null> => {
  const setClause: string[] = [];
  const params: any[] = [];
  
  // Construir la cláusula SET dinámicamente
  if (updates.name !== undefined) {
    setClause.push('name = ?');
    params.push(updates.name);
  }
  if (updates.email !== undefined) {
    setClause.push('email = ?');
    params.push(updates.email);
  }
  if (updates.password_hash !== undefined) {
    setClause.push('password_hash = ?');
    params.push(updates.password_hash);
  }
  if (updates.role !== undefined) {
    setClause.push('role = ?');
    params.push(updates.role);
  }
  if (updates.phone !== undefined) {
    setClause.push('phone = ?');
    params.push(updates.phone);
  }
  
  // Siempre actualizar updated_at
  setClause.push('updated_at = NOW()');
  params.push(id);
  
  if (setClause.length === 1) { // Solo updated_at
    return null;
  }
  
  const query = `
    UPDATE users 
    SET ${setClause.join(', ')}
    WHERE id = ? AND is_active = true
  `;
  
  await executeQuery(query, params);
  return await getUserById(id);
};

/**
 * @function deleteUser
 * @description Elimina un usuario (soft delete)
 * @param id - ID del usuario
 * @returns true si se eliminó, false si no se encontró
 */
export const deleteUser = async (id: string): Promise<boolean> => {
  const query = `
    UPDATE users 
    SET is_active = false, updated_at = NOW()
    WHERE id = ? AND is_active = true
  `;
  
  const result = await executeQuery(query, [id]);
  return result.affectedRows > 0;
};

/**
 * @function resetUsers
 * @description Reinicia los datos de usuarios (solo para testing)
 * Elimina todos los usuarios excepto el admin
 */
export const resetUsers = async (): Promise<void> => {
  const query = `
    DELETE FROM users 
    WHERE role != 'ADMIN'
  `;
  
  await executeQuery(query);
};

/**
 * @function mapRowToUser
 * @description Convierte una fila de MySQL a objeto User
 * @param row - Fila de la base de datos
 * @returns Objeto User
 */
const mapRowToUser = (row: UserRow): User => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role,
    phone: row.phone,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};