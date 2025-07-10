/**
 * @file Define la interfaz para la entidad Braid/Style.
 * @description Representa un estilo de trenza que puede ser ofrecido en la aplicación,
 *              alineado con la entidad 'Style' del documento de diseño.
 */
export interface Braid {
  id: number | string; // El diseño final propone UUID, usamos number para el mockup.
  name: string;
  description: string;
  photo_url: string;
  category: string;
  price: number; // El precio está aquí por ahora, pero podría moverse a otra entidad después.
}
