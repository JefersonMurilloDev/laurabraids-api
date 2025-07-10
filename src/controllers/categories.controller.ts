/**
 * @file Controller para la gestión de categorías de estilos del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para la entidad Category.
 */

import { RequestHandler } from 'express';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../interfaces/category.interface';
import {
  getCategories as getCategoriesData,
  getAllCategories as getAllCategoriesData,
  getCategoryById as getCategoryByIdData,
  getCategoryByName,
  addCategory,
  updateCategory as updateCategoryData,
  deleteCategory as deleteCategoryData,
  resetCategories as resetCategoriesData
} from '../data/categories.database';

/**
 * @description Reinicia los datos de categorías al estado inicial (para testing).
 */
export const resetCategoriesForTesting = async (): Promise<void> => {
  await resetCategoriesData();
};

/**
 * @description Reinicia los datos de categorías al estado inicial. Útil para testing.
 */
export const resetCategories: RequestHandler = async (req, res) => {
  try {
    await resetCategoriesData();
    res.status(200).json({ message: 'Datos de categorías reiniciados' });
      return;
  } catch (error) {
    console.error('Error al reiniciar categorías:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene todas las categorías activas del sistema.
 */
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await getCategoriesData();
    res.status(200).json({ success: true, data: categories });
      return;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene todas las categorías (incluyendo inactivas). Solo para administradores.
 */
export const getAllCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await getAllCategoriesData();
    res.status(200).json({ success: true, data: categories });
      return;
  } catch (error) {
    console.error('Error al obtener todas las categorías:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Obtiene una categoría específica por su ID.
 */
export const getCategoryById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryByIdData(id);

    if (category) {
      res.status(200).json({ success: true, data: category });
      return;
    } else {
      res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      return;
    }
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Crea una nueva categoría.
 */
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const categoryData: CategoryCreateRequest = req.body;

    // Verificar que no existe una categoría con el mismo nombre
    const existingCategory = await getCategoryByName(categoryData.name);
    if (existingCategory) {
      res.status(400).json({ 
        success: false, 
        message: 'Ya existe una categoría con ese nombre' 
      });
      return;
    }

    const newCategory = await addCategory(categoryData);
    res.status(201).json({ 
      success: true, 
      data: newCategory, 
      message: 'Categoría creada exitosamente' 
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Actualiza una categoría existente.
 */
export const updateCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: CategoryUpdateRequest = req.body;

    // Verificar que la categoría existe
    const existingCategory = await getCategoryByIdData(id);
    if (!existingCategory) {
      res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      return;
      return;
    }

    // Si se está actualizando el nombre, verificar que no exista otra categoría con ese nombre
    if (updates.name && updates.name !== existingCategory.name) {
      const categoryWithSameName = await getCategoryByName(updates.name);
      if (categoryWithSameName) {
        res.status(400).json({ 
          success: false, 
          message: 'Ya existe una categoría con ese nombre' 
        });
        return;
      }
    }

    const updatedCategory = await updateCategoryData(id, updates);
    
    if (updatedCategory) {
      res.status(200).json({ 
        success: true, 
        data: updatedCategory, 
        message: 'Categoría actualizada exitosamente' 
      });
    } else {
      res.status(400).json({ success: false, message: 'No se realizaron cambios' });
      return;
    }
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};

/**
 * @description Elimina una categoría (soft delete).
 */
export const deleteCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const existingCategory = await getCategoryByIdData(id);
    if (!existingCategory) {
      res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      return;
      return;
    }

    // TODO: Verificar que no hay estilos asociados a esta categoría antes de eliminar
    // Esta verificación se puede implementar cuando se cree el controlador de estilos

    const deleted = await deleteCategoryData(id);
    
    if (deleted) {
      res.status(200).json({ 
        success: true, 
        message: 'Categoría eliminada exitosamente' 
      });
    } else {
      res.status(400).json({ success: false, message: 'No se pudo eliminar la categoría' });
      return;
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
      return;
  }
};