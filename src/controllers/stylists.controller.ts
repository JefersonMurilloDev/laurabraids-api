import { RequestHandler } from 'express';
import { Stylist } from '../interfaces/stylist.interface';
import { v4 as uuidv4 } from 'uuid';
import {
  getStylists as getStylistsData,
  getStylistById as getStylistByIdData,
  addStylist,
  updateStylist as updateStylistData,
  deleteStylist as deleteStylistData,
  resetStylists as resetStylistsData
} from '../data/stylists.database';

/**
 * @file Controller para la gestión de estilistas del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para la entidad Stylist, incluyendo
 *              gestión de perfiles, especialidades y estatus de destacado.
 */

// Datos iniciales migrados a MySQL - mantenemos para referencia
// Los datos ahora se manejan completamente en la base de datos

/**
 * @description Reinicia los datos de estilistas al estado inicial (para testing).
 */
export const resetStylistsForTesting = async (): Promise<void> => {
  await resetStylistsData();
};

/**
 * @description Reinicia los datos de estilistas al estado inicial.
 * Útil para testing y desarrollo.
 */
export const resetStylists: RequestHandler = async (req, res) => {
  try {
    await resetStylistsData();
    res.status(200).json({ message: 'Datos de estilistas reiniciados' });
  } catch (error) {
    console.error('Error al reiniciar estilistas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Obtiene todas las estilistas del sistema.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getStylists: RequestHandler = async (req, res) => {
  try {
    const { featured } = req.query;
    let filteredStylists = await getStylistsData();
    
    // Filtrar por estilistas destacadas si se solicita
    if (featured === 'true') {
      filteredStylists = filteredStylists.filter(s => s.is_featured);
    }
    
    res.json(filteredStylists);
  } catch (error) {
    console.error('Error al obtener estilistas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Obtiene una estilista específica por su ID.
 * @param {Request} req - El objeto de solicitud de Express, con el ID en los parámetros.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getStylistById: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const stylist = await getStylistByIdData(id);
    
    if (stylist) {
      res.json(stylist);
    } else {
      res.status(404).json({ message: 'Estilista no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener estilista por ID:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Crea una nueva estilista.
 * @param {Request} req - El objeto de solicitud de Express, con los datos de la estilista en el cuerpo.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const createStylist: RequestHandler = async (req, res) => {
  try {
    const { name, specialty, photo_url, description, is_featured = false } = req.body;

    // Validación simple de los datos de entrada
    if (!name || !specialty || !description) {
      res.status(400).json({ message: 'Faltan campos requeridos: name, specialty, description' });
      return;
    }

    // Validar que is_featured sea booleano
    if (typeof is_featured !== 'boolean') {
      res.status(400).json({ message: 'El campo is_featured debe ser un valor booleano' });
      return;
    }

    // Crear la nueva estilista
    const newStylist: Stylist = {
      id: uuidv4(),
      name,
      specialty,
      photo_url: photo_url || 'https://example.com/default-stylist.jpg',
      description,
      is_featured,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const createdStylist = await addStylist(newStylist);

    // Devolver la nueva estilista con el código de estado 201 (Created)
    res.status(201).json(createdStylist);
  } catch (error) {
    console.error('Error al crear estilista:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Actualiza una estilista existente por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const updateStylist: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, specialty, photo_url, description, is_featured } = req.body;

    // Validar is_featured si se proporciona
    if (is_featured !== undefined && typeof is_featured !== 'boolean') {
      res.status(400).json({ message: 'El campo is_featured debe ser un valor booleano' });
      return;
    }

    // Actualizar la estilista
    const updatedStylist = await updateStylistData(id, {
      name,
      specialty,
      photo_url,
      description,
      is_featured,
      updated_at: new Date()
    });

    if (updatedStylist) {
      res.json(updatedStylist);
    } else {
      res.status(404).json({ message: 'Estilista no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar estilista:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * @description Elimina una estilista por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const deleteStylist: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await deleteStylistData(id);

    if (deleted) {
      // El código de estado 204 (No Content) es estándar para eliminaciones exitosas.
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Estilista no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar estilista:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};