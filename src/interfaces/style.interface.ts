/**
 * @file Define la interfaz para la entidad Style.
 * @description Representa un estilo de trenza específico que puede ser realizado
 *              por las estilistas. Esta será la evolución de la entidad Braid actual.
 */
export interface Style {
  id: string; // UUID como identificador único
  name: string; // Nombre del estilo (ej. "Box Braids", "Cornrows")
  photo_url: string; // URL a una imagen de ejemplo del estilo
  description: string; // Descripción detallada del estilo
  category: string; // Categoría (ej. "Corto", "Largo", "Colorido", "Clásico")
  created_at: Date;
  updated_at: Date;
}