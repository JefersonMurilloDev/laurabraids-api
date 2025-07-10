/**
 * @file Define la interfaz para la entidad Stylist.
 * @description Representa una estilista del sistema que puede realizar diferentes estilos
 *              de trenzas y tener citas con clientes.
 */
export interface Stylist {
  id: string; // UUID como identificador único
  name: string;
  specialty: string; // Especialidad principal (ej. "Trenzas Africanas", "Extensiones")
  photo_url: string; // URL a una imagen de perfil
  description: string; // Biografía o descripción detallada
  is_featured: boolean; // Indica si aparece en la sección de estilistas destacadas
  created_at: Date;
  updated_at: Date;
}