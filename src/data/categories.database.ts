/**
 * @file Capa de datos para categorías usando MySQL.
 * @description Operaciones de base de datos para la gestión de categorías de estilos.
 */

import { executeQuery } from '../config/database.config';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../interfaces/category.interface';
import { RowDataPacket } from 'mysql2';

/**
 * @interface CategoryRow
 * @description Interfaz para las filas de categorías desde MySQL
 */
interface CategoryRow extends RowDataPacket {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * @function getCategories
 * @description Obtiene todas las categorías activas ordenadas por display_order
 * @returns Array de categorías
 */
export const getCategories = async (): Promise<Category[]> => {
  const query = `
    SELECT id, name, description, display_order, is_active, created_at, updated_at
    FROM categories 
    WHERE is_active = true
    ORDER BY display_order ASC, name ASC
  `;
  
  const rows: CategoryRow[] = await executeQuery(query);
  return rows.map(mapRowToCategory);
};

/**
 * @function getAllCategories
 * @description Obtiene todas las categorías (incluyendo inactivas)
 * @returns Array de categorías
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const query = `
    SELECT id, name, description, display_order, is_active, created_at, updated_at
    FROM categories 
    ORDER BY display_order ASC, name ASC
  `;
  
  const rows: CategoryRow[] = await executeQuery(query);
  return rows.map(mapRowToCategory);
};

/**
 * @function getCategoryById
 * @description Obtiene una categoría por su ID
 * @param id - ID de la categoría
 * @returns Categoría encontrada o null
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const query = `
    SELECT id, name, description, display_order, is_active, created_at, updated_at
    FROM categories 
    WHERE id = ?
  `;
  
  const rows: CategoryRow[] = await executeQuery(query, [id]);
  return rows.length > 0 ? mapRowToCategory(rows[0]) : null;
};

/**
 * @function getCategoryByName
 * @description Obtiene una categoría por su nombre
 * @param name - Nombre de la categoría
 * @returns Categoría encontrada o null
 */
export const getCategoryByName = async (name: string): Promise<Category | null> => {
  const query = `
    SELECT id, name, description, display_order, is_active, created_at, updated_at
    FROM categories 
    WHERE name = ?
  `;
  
  const rows: CategoryRow[] = await executeQuery(query, [name]);
  return rows.length > 0 ? mapRowToCategory(rows[0]) : null;
};

/**
 * @function addCategory
 * @description Agrega una nueva categoría a la base de datos
 * @param categoryData - Datos de la categoría a agregar
 * @returns Categoría creada
 */
export const addCategory = async (categoryData: CategoryCreateRequest): Promise<Category> => {
  const { v4: uuidv4 } = require('uuid');
  const now = new Date();
  
  const category: Category = {
    id: uuidv4(),
    name: categoryData.name,
    description: categoryData.description || null,
    display_order: categoryData.display_order || 0,
    is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
    created_at: now,
    updated_at: now
  };
  
  const query = `
    INSERT INTO categories (id, name, description, display_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    category.id,
    category.name,
    category.description,
    category.display_order,
    category.is_active,
    category.created_at,
    category.updated_at
  ];
  
  await executeQuery(query, params);
  return category;
};

/**
 * @function updateCategory
 * @description Actualiza una categoría existente
 * @param id - ID de la categoría
 * @param updates - Campos a actualizar
 * @returns Categoría actualizada o null si no se encontró
 */
export const updateCategory = async (
  id: string, 
  updates: CategoryUpdateRequest
): Promise<Category | null> => {
  const setClause: string[] = [];
  const params: any[] = [];
  
  // Construir la cláusula SET dinámicamente
  if (updates.name !== undefined) {
    setClause.push('name = ?');
    params.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClause.push('description = ?');
    params.push(updates.description);
  }
  if (updates.display_order !== undefined) {
    setClause.push('display_order = ?');
    params.push(updates.display_order);
  }
  if (updates.is_active !== undefined) {
    setClause.push('is_active = ?');
    params.push(updates.is_active);
  }
  
  // Siempre actualizar updated_at
  setClause.push('updated_at = NOW()');
  params.push(id);
  
  if (setClause.length === 1) { // Solo updated_at
    return null;
  }
  
  const query = `
    UPDATE categories 
    SET ${setClause.join(', ')}
    WHERE id = ?
  `;
  
  await executeQuery(query, params);
  return await getCategoryById(id);
};

/**
 * @function deleteCategory
 * @description Elimina una categoría (soft delete)
 * @param id - ID de la categoría
 * @returns true si se eliminó, false si no se encontró
 */
export const deleteCategory = async (id: string): Promise<boolean> => {
  const query = `
    UPDATE categories 
    SET is_active = false, updated_at = NOW()
    WHERE id = ? AND is_active = true
  `;
  
  const result = await executeQuery(query, [id]);
  return result.affectedRows > 0;
};

/**
 * @function resetCategories
 * @description Reinicia los datos de categorías (solo para testing)
 * Elimina todas las categorías
 */
export const resetCategories = async (): Promise<void> => {
  const query = `DELETE FROM categories`;
  await executeQuery(query);
};

/**
 * @function mapRowToCategory
 * @description Convierte una fila de MySQL a objeto Category
 * @param row - Fila de la base de datos
 * @returns Objeto Category
 */
const mapRowToCategory = (row: CategoryRow): Category => {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    display_order: row.display_order,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};