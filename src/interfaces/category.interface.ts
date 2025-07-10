/**
 * @file Define la interfaz para la entidad Category.
 * @description Representa una categoría de estilos de trenzas para organizar 
 *              los diferentes tipos de peinados disponibles.
 */
export interface Category {
  id: string; // UUID como identificador único
  name: string; // Nombre de la categoría (ej. "Protectoras", "Clásicas", "Modernas")
  description: string | null; // Descripción detallada de la categoría
  display_order: number; // Orden de visualización en la interfaz
  is_active: boolean; // Indica si la categoría está activa
  created_at: Date;
  updated_at: Date;
}

/**
 * @interface CategoryCreateRequest
 * @description Datos requeridos para crear una nueva categoría
 */
export interface CategoryCreateRequest {
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * @interface CategoryUpdateRequest
 * @description Datos opcionales para actualizar una categoría existente
 */
export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}