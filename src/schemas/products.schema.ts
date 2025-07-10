/**
 * @file Esquemas de validación Zod para la entidad Product.
 * @description Define esquemas robustos de validación para todas las operaciones
 *              relacionadas con productos, incluyendo inventario, precios y categorías.
 */

import { z } from 'zod';

/**
 * @description Categorías válidas para productos.
 */
export const VALID_PRODUCT_CATEGORIES = [
  'Extensiones',
  'Cuidado',
  'Accesorios', 
  'Herramientas'
] as const;

/**
 * @description Esquema para validación de nombre de producto.
 */
export const productNameSchema = z
  .string()
  .min(3, 'El nombre del producto debe tener al menos 3 caracteres')
  .max(150, 'El nombre del producto no puede exceder 150 caracteres')
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s0-9.,-]+$/,
    'El nombre del producto contiene caracteres no válidos'
  )
  .transform((name) => name.trim())
  .refine(
    (name) => {
      // Validar que el nombre sea relevante para productos de trenzas
      const relevantWords = [
        'extensiones', 'kanekalon', 'aceite', 'gel', 'shampoo', 'acondicionador',
        'peine', 'cepillo', 'horquilla', 'goma', 'banda', 'clip', 'aguja',
        'spray', 'crema', 'loción', 'serum', 'mousse', 'cera', 'pomada',
        'vitamina', 'proteína', 'hidratante', 'nutritivo', 'reparador',
        'desenredante', 'fijador', 'brillantina', 'protector', 'thermal'
      ];
      
      const lowerName = name.toLowerCase();
      return relevantWords.some(word => lowerName.includes(word)) ||
             name.length > 10; // Permitir nombres descriptivos largos
    },
    {
      message: 'El nombre debe ser relevante para productos de cuidado capilar o trenzas'
    }
  );

/**
 * @description Esquema para validación de descripción del producto.
 */
export const productDescriptionSchema = z
  .string()
  .min(10, 'La descripción debe tener al menos 10 caracteres')
  .max(1000, 'La descripción no puede exceder 1000 caracteres')
  .transform((description) => description.trim());

/**
 * @description Esquema para validación de precio.
 */
export const priceSchema = z
  .number()
  .positive('El precio debe ser un número positivo')
  .max(9999.99, 'El precio no puede exceder $9999.99')
  .refine(
    (price) => Number((price * 100).toFixed(0)) / 100 === price,
    {
      message: 'El precio no puede tener más de 2 decimales'
    }
  );

/**
 * @description Esquema para validación de cantidad en stock.
 */
export const stockQuantitySchema = z
  .number()
  .int('La cantidad en stock debe ser un número entero')
  .min(0, 'La cantidad en stock no puede ser negativa')
  .max(99999, 'La cantidad en stock no puede exceder 99999');

/**
 * @description Esquema para validación de URL de imagen del producto.
 */
export const productImageUrlSchema = z
  .string()
  .url('La URL de la imagen debe ser válida')
  .max(500, 'La URL no puede exceder 500 caracteres')
  .regex(
    /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i,
    'La URL debe apuntar a una imagen válida (jpg, jpeg, png, webp, gif)'
  )
  .optional()
  .or(z.literal(''));

/**
 * @description Esquema para validación de categoría de producto.
 */
export const productCategorySchema = z
  .enum(VALID_PRODUCT_CATEGORIES, {
    errorMap: () => ({
      message: `La categoría debe ser una de: ${VALID_PRODUCT_CATEGORIES.join(', ')}`
    })
  });

/**
 * @description Esquema para validación de estado activo.
 */
export const isActiveSchema = z
  .boolean()
  .default(true);

/**
 * @description Esquema para validación de UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID debe ser un UUID válido');

/**
 * @description Esquema para código de producto (SKU).
 */
export const skuSchema = z
  .string()
  .min(3, 'El SKU debe tener al menos 3 caracteres')
  .max(50, 'El SKU no puede exceder 50 caracteres')
  .regex(
    /^[A-Z0-9-_]+$/,
    'El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos'
  )
  .optional();

/**
 * @description Esquema para peso del producto (en gramos).
 */
export const weightSchema = z
  .number()
  .positive('El peso debe ser un número positivo')
  .max(10000, 'El peso no puede exceder 10kg (10000g)')
  .optional();

/**
 * @description Esquema para dimensiones del producto.
 */
export const dimensionsSchema = z.object({
  length: z.number().positive().max(200, 'La longitud no puede exceder 200cm'),
  width: z.number().positive().max(200, 'El ancho no puede exceder 200cm'),
  height: z.number().positive().max(200, 'La altura no puede exceder 200cm')
}).optional();

/**
 * @description Esquema para crear un nuevo producto.
 */
export const createProductSchema = z.object({
  name: productNameSchema,
  description: productDescriptionSchema,
  price: priceSchema,
  stock_quantity: stockQuantitySchema,
  image_url: productImageUrlSchema,
  category: productCategorySchema,
  is_active: isActiveSchema.optional(),
  sku: skuSchema,
  weight: weightSchema,
  dimensions: dimensionsSchema
});

/**
 * @description Esquema para actualizar un producto existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export const updateProductSchema = z.object({
  name: productNameSchema.optional(),
  description: productDescriptionSchema.optional(),
  price: priceSchema.optional(),
  stock_quantity: stockQuantitySchema.optional(),
  image_url: productImageUrlSchema.optional(),
  category: productCategorySchema.optional(),
  is_active: isActiveSchema.optional(),
  sku: skuSchema.optional(),
  weight: weightSchema.optional(),
  dimensions: dimensionsSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * @description Esquema para validación de parámetros de ruta (ID).
 */
export const productParamsSchema = z.object({
  id: uuidSchema
});

/**
 * @description Esquema para consultas de filtrado de productos.
 */
export const getProductsQuerySchema = z.object({
  category: productCategorySchema.optional(),
  active: z
    .string()
    .regex(/^(true|false)$/, 'Active debe ser true o false')
    .transform((val) => val === 'true')
    .optional(),
  in_stock: z
    .string()
    .regex(/^(true|false)$/, 'In_stock debe ser true o false')
    .transform((val) => val === 'true')
    .optional(),
  min_price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'El precio mínimo debe ser un número válido')
    .transform(Number)
    .optional(),
  max_price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'El precio máximo debe ser un número válido')
    .transform(Number)
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'La página debe ser un número')
    .transform(Number)
    .refine((val) => val > 0, 'La página debe ser mayor a 0')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'El límite debe ser un número')
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100')
    .optional(),
  search: z
    .string()
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .optional(),
  sort_by: z
    .enum(['name', 'price', 'stock_quantity', 'created_at'])
    .optional(),
  sort_order: z
    .enum(['asc', 'desc'])
    .default('asc')
    .optional()
}).refine(
  (data) => {
    if (data.min_price && data.max_price) {
      return data.min_price <= data.max_price;
    }
    return true;
  },
  {
    message: 'El precio mínimo no puede ser mayor al precio máximo'
  }
);

/**
 * @description Esquema para actualización de inventario.
 */
export const updateInventorySchema = z.object({
  stock_quantity: stockQuantitySchema,
  operation: z.enum(['set', 'add', 'subtract']).default('set')
});

/**
 * @description Esquema para búsqueda avanzada de productos.
 */
export const searchProductsSchema = z.object({
  query: z
    .string()
    .min(2, 'La búsqueda debe tener al menos 2 caracteres')
    .max(100, 'La búsqueda no puede exceder 100 caracteres'),
  categories: z
    .array(productCategorySchema)
    .max(VALID_PRODUCT_CATEGORIES.length, 'Demasiadas categorías seleccionadas')
    .optional(),
  price_range: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  in_stock_only: z.boolean().default(false),
  active_only: z.boolean().default(true)
});

/**
 * @description Tipos TypeScript inferidos de los esquemas.
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductParamsInput = z.infer<typeof productParamsSchema>;
export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type SearchProductsInput = z.infer<typeof searchProductsSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;