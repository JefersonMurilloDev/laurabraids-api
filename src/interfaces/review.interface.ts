/**
 * @file Define la interfaz para la entidad Review.
 * @description Representa una reseña que puede ser escrita por un usuario
 *              sobre una estilista, producto o estilo (relación polimórfica).
 */
export interface Review {
  id: string; // UUID como identificador único
  user_id: string; // FK a User - Quien escribe la reseña
  rating: number; // Calificación de 1 a 5 estrellas
  comment: string; // Comentario de la reseña
  reviewable_id: string; // ID de la entidad reseñada (polimórfico)
  reviewable_type: ReviewableType; // Tipo de entidad reseñada
  is_verified: boolean; // Indica si la reseña ha sido verificada
  created_at: Date;
  updated_at: Date;
}

/**
 * @description Enum para los tipos de entidades que pueden ser reseñadas.
 * STYLIST: Reseña sobre una estilista
 * PRODUCT: Reseña sobre un producto
 * STYLE: Reseña sobre un estilo de trenza
 */
export enum ReviewableType {
  STYLIST = 'STYLIST',
  PRODUCT = 'PRODUCT',
  STYLE = 'STYLE'
}