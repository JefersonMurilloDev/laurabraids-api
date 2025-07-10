/**
 * @file Configuración de la base de datos MySQL para LauraBraids.
 * @description Maneja la conexión a MySQL usando mysql2 con soporte de promesas.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * @interface DatabaseConfig
 * @description Configuración de la base de datos
 */
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  charset: string;
  timezone: string;
}

/**
 * @constant dbConfig
 * @description Configuración de la base de datos desde variables de entorno
 */
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'laurabraids_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

/**
 * @variable pool
 * @description Pool de conexiones a la base de datos
 */
let pool: mysql.Pool;

/**
 * @function createPool
 * @description Crea un pool de conexiones a la base de datos
 * @returns Pool de conexiones MySQL
 */
export const createPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

/**
 * @function getConnection
 * @description Obtiene una conexión del pool
 * @returns Conexión a la base de datos
 */
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  const pool = createPool();
  return await pool.getConnection();
};

/**
 * @function executeQuery
 * @description Ejecuta una query SQL con parámetros
 * @param query - Query SQL a ejecutar
 * @param params - Parámetros para la query
 * @returns Resultado de la query
 */
export const executeQuery = async (
  query: string,
  params: any[] = []
): Promise<any> => {
  const pool = createPool();
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

/**
 * @function testConnection
 * @description Prueba la conexión a la base de datos
 * @returns Promise que resuelve si la conexión es exitosa
 */
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    throw error;
  }
};

/**
 * @function closePool
 * @description Cierra el pool de conexiones
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado');
  }
};

export default createPool;