/**
 * @file Capa de datos para productos usando MySQL.
 * @description Migración de datos en memoria a base de datos MySQL.
 */

import { executeQuery } from '../config/database.config';
import { Product } from '../interfaces/product.interface';
import { RowDataPacket } from 'mysql2';

/**
 * @interface ProductRow
 * @description Interfaz para las filas de productos desde MySQL
 */
interface ProductRow extends RowDataPacket {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  sku?: string;
  brand?: string;
  weight_grams?: number;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * @function getProducts
 * @description Obtiene todos los productos de la base de datos
 * @returns Array de productos
 */
export const getProducts = async (): Promise<Product[]> => {
  const query = `
    SELECT id, name, description, price, stock_quantity, sku as category, 
           image_url, is_active, created_at, updated_at
    FROM products 
    ORDER BY created_at DESC
  `;
  
  const rows: ProductRow[] = await executeQuery(query);
  return rows.map(mapRowToProduct);
};

/**
 * @function getProductById
 * @description Obtiene un producto por su ID
 * @param id - ID del producto
 * @returns Producto encontrado o null
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const query = `
    SELECT id, name, description, price, stock_quantity, sku as category,
           image_url, is_active, created_at, updated_at
    FROM products 
    WHERE id = ? AND is_active = true
  `;
  
  const rows: ProductRow[] = await executeQuery(query);
  return rows.length > 0 ? mapRowToProduct(rows[0]) : null;
};

/**
 * @function addProduct
 * @description Agrega un nuevo producto a la base de datos
 * @param product - Datos del producto a agregar
 * @returns Producto creado
 */
export const addProduct = async (product: Product): Promise<Product> => {
  const query = `
    INSERT INTO products (id, name, description, price, stock_quantity, sku, image_url, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    product.id,
    product.name,
    product.description,
    product.price,
    product.stock_quantity,
    product.category, // Usamos category como sku temporalmente
    product.image_url,
    product.is_active,
    product.created_at,
    product.updated_at
  ];
  
  await executeQuery(query, params);
  return product;
};

/**
 * @function updateProduct
 * @description Actualiza un producto existente
 * @param id - ID del producto
 * @param updates - Campos a actualizar
 * @returns Producto actualizado o null si no se encontró
 */
export const updateProduct = async (
  id: string, 
  updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product | null> => {
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
  if (updates.price !== undefined) {
    setClause.push('price = ?');
    params.push(updates.price);
  }
  if (updates.stock_quantity !== undefined) {
    setClause.push('stock_quantity = ?');
    params.push(updates.stock_quantity);
  }
  if (updates.category !== undefined) {
    setClause.push('sku = ?');
    params.push(updates.category);
  }
  if (updates.image_url !== undefined) {
    setClause.push('image_url = ?');
    params.push(updates.image_url);
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
    UPDATE products 
    SET ${setClause.join(', ')}
    WHERE id = ? AND is_active = true
  `;
  
  await executeQuery(query, params);
  return await getProductById(id);
};

/**
 * @function deleteProduct
 * @description Elimina un producto (soft delete)
 * @param id - ID del producto
 * @returns true si se eliminó, false si no se encontró
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  const query = `
    UPDATE products 
    SET is_active = false, updated_at = NOW()
    WHERE id = ? AND is_active = true
  `;
  
  const result = await executeQuery(query, [id]);
  return result.affectedRows > 0;
};

/**
 * @function resetProducts
 * @description Reinicia los datos de productos (solo para testing)
 */
export const resetProducts = async (): Promise<void> => {
  const query = `DELETE FROM products`;
  await executeQuery(query);
};

/**
 * @function mapRowToProduct
 * @description Convierte una fila de MySQL a objeto Product
 * @param row - Fila de la base de datos
 * @returns Objeto Product
 */
const mapRowToProduct = (row: ProductRow): Product => {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock_quantity: row.stock_quantity,
    image_url: row.image_url,
    category: row.sku || 'General', // Mapeo temporal
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};