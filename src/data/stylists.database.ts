/**
 * @file Capa de datos para estilistas usando MySQL.
 * @description Migración de datos en memoria a base de datos MySQL.
 */

import { executeQuery } from '../config/database.config';
import { Stylist } from '../interfaces/stylist.interface';
import { RowDataPacket } from 'mysql2';

/**
 * @interface StylistRow
 * @description Interfaz para las filas de estilistas desde MySQL
 */
interface StylistRow extends RowDataPacket {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  bio: string;
  photo_url: string;
  years_experience: number;
  rating: number;
  total_reviews: number;
  is_featured: boolean;
  is_available: boolean;
  hourly_rate: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * @function getStylists
 * @description Obtiene todas las estilistas de la base de datos
 * @returns Array de estilistas
 */
export const getStylists = async (): Promise<Stylist[]> => {
  const query = `
    SELECT id, user_id, name, specialty, bio, photo_url, years_experience, rating, total_reviews, 
           is_featured, is_available, hourly_rate, created_at, updated_at
    FROM stylists 
    ORDER BY created_at DESC
  `;
  
  const rows: StylistRow[] = await executeQuery(query);
  return rows.map(mapRowToStylist);
};

/**
 * @function getStylistById
 * @description Obtiene una estilista por su ID
 * @param id - ID de la estilista
 * @returns Estilista encontrada o null
 */
export const getStylistById = async (id: string): Promise<Stylist | null> => {
  const query = `
    SELECT id, user_id, name, specialty, bio, photo_url, years_experience, rating, total_reviews,
           is_featured, is_available, hourly_rate, created_at, updated_at
    FROM stylists 
    WHERE id = ?
  `;
  
  const rows: StylistRow[] = await executeQuery(query, [id]);
  return rows.length > 0 ? mapRowToStylist(rows[0]) : null;
};

/**
 * @function addStylist
 * @description Agrega una nueva estilista a la base de datos
 * @param stylist - Datos de la estilista a agregar
 * @returns Estilista creada
 */
export const addStylist = async (stylist: Stylist): Promise<Stylist> => {
  const query = `
    INSERT INTO stylists (id, user_id, name, specialty, bio, photo_url, years_experience, rating, 
                         total_reviews, is_featured, is_available, hourly_rate, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    stylist.id,
    stylist.id, // user_id temporal - mismo que id
    stylist.name,
    stylist.specialty,
    stylist.description, // bio <- description
    stylist.photo_url,
    0, // years_experience - valor por defecto
    0.00, // rating - valor por defecto
    0, // total_reviews - valor por defecto
    stylist.is_featured,
    true, // is_available - valor por defecto
    null, // hourly_rate - valor por defecto
    stylist.created_at,
    stylist.updated_at
  ];
  
  await executeQuery(query, params);
  return stylist;
};

/**
 * @function updateStylist
 * @description Actualiza una estilista existente
 * @param id - ID de la estilista
 * @param updates - Campos a actualizar
 * @returns Estilista actualizada o null si no se encontró
 */
export const updateStylist = async (
  id: string, 
  updates: Partial<Omit<Stylist, 'id' | 'created_at'>>
): Promise<Stylist | null> => {
  const setClause: string[] = [];
  const params: any[] = [];
  
  // Construir la cláusula SET dinámicamente
  if (updates.name !== undefined) {
    setClause.push('name = ?');
    params.push(updates.name);
  }
  if (updates.specialty !== undefined) {
    setClause.push('specialty = ?');
    params.push(updates.specialty);
  }
  if (updates.photo_url !== undefined) {
    setClause.push('photo_url = ?');
    params.push(updates.photo_url);
  }
  if (updates.description !== undefined) {
    setClause.push('bio = ?');
    params.push(updates.description);
  }
  if (updates.is_featured !== undefined) {
    setClause.push('is_featured = ?');
    params.push(updates.is_featured);
  }
  
  // Siempre actualizar updated_at
  setClause.push('updated_at = NOW()');
  params.push(id);
  
  if (setClause.length === 1) { // Solo updated_at
    return null;
  }
  
  const query = `
    UPDATE stylists 
    SET ${setClause.join(', ')}
    WHERE id = ?
  `;
  
  await executeQuery(query, params);
  return await getStylistById(id);
};

/**
 * @function deleteStylist
 * @description Elimina una estilista (eliminación física)
 * @param id - ID de la estilista
 * @returns true si se eliminó, false si no se encontró
 */
export const deleteStylist = async (id: string): Promise<boolean> => {
  const query = `
    DELETE FROM stylists 
    WHERE id = ?
  `;
  
  const result = await executeQuery(query, [id]);
  return result.affectedRows > 0;
};

/**
 * @function resetStylists
 * @description Reinicia los datos de estilistas (solo para testing)
 */
export const resetStylists = async (): Promise<void> => {
  const query = `DELETE FROM stylists`;
  await executeQuery(query);
};

/**
 * @function mapRowToStylist
 * @description Convierte una fila de MySQL a objeto Stylist
 * @param row - Fila de la base de datos
 * @returns Objeto Stylist
 */
const mapRowToStylist = (row: StylistRow): Stylist => {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty || 'General',
    photo_url: row.photo_url || 'https://example.com/default-stylist.jpg',
    description: row.bio || 'Sin descripción',
    is_featured: row.is_featured,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};