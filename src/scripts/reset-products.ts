/**
 * @file Script para reinicializar datos de productos
 */

import { executeQuery } from '../config/database.config';

const resetProducts = async () => {
  try {
    console.log('🔄 Reinicializando datos de productos...');
    
    // Limpiar tabla
    await executeQuery('DELETE FROM products');
    console.log('✅ Tabla products limpiada');
    
    // Insertar datos iniciales
    const insertQuery = `
      INSERT INTO products (id, name, description, price, stock_quantity, sku, image_url, is_active, created_at, updated_at) VALUES
      ('prod-001', 'Extensiones Kanekalon Premium', 'Extensiones de alta calidad para trenzas Box Braids y Knotless. Fibra suave y duradera.', 25.99, 50, 'Extensiones', 'https://example.com/kanekalon-extensions.jpg', TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      ('prod-002', 'Aceite Protector para Trenzas', 'Aceite nutritivo especial para mantener las trenzas hidratadas y brillantes. Libre de sulfatos.', 15.50, 30, 'Cuidado', 'https://example.com/protective-oil.jpg', TRUE, '2024-01-05 00:00:00', '2024-01-05 00:00:00'),
      ('prod-003', 'Peine de Cola para Trenzas', 'Peine profesional de cola fina para crear particiones perfectas en las trenzas.', 8.99, 20, 'Accesorios', 'https://example.com/tail-comb.jpg', TRUE, '2024-01-10 00:00:00', '2024-01-10 00:00:00'),
      ('prod-004', 'Gel Fijador Sin Alcohol', 'Gel fijador especial para trenzas que no reseca el cabello. Proporciona hold duradero.', 12.75, 25, 'Cuidado', 'https://example.com/holding-gel.jpg', TRUE, '2024-01-15 00:00:00', '2024-01-15 00:00:00'),
      ('prod-005', 'Cuentas Decorativas Doradas', 'Set de cuentas decorativas doradas para personalizar trenzas Fulani y otros estilos.', 18.25, 0, 'Accesorios', 'https://example.com/golden-beads.jpg', FALSE, '2024-01-20 00:00:00', '2024-01-25 00:00:00')
    `;
    
    await executeQuery(insertQuery);
    console.log('✅ Datos iniciales insertados');
    
    // Verificar inserción
    const count = await executeQuery('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Productos en la tabla: ${count[0].count}`);
    
    console.log('🎉 Reinicialización completada!');
    
  } catch (error) {
    console.error('❌ Error durante la reinicialización:', error);
  }
  
  process.exit(0);
};

resetProducts();