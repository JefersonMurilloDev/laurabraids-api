/**
 * @file Define la interfaz para la entidad Product.
 * @description Representa un producto que puede ser vendido en la aplicación,
 *              como extensiones, productos de cuidado capilar, accesorios, etc.
 */
export interface Product {
  id: string; // UUID como identificador único
  name: string; // Nombre del producto
  description: string; // Descripción detallada del producto
  price: number; // Precio del producto en decimal
  stock_quantity: number; // Cantidad disponible en inventario
  image_url: string; // URL a la imagen del producto
  category: string; // Categoría del producto (ej. "Extensiones", "Cuidado", "Accesorios")
  is_active: boolean; // Indica si el producto está activo para venta
  created_at: Date;
  updated_at: Date;
}