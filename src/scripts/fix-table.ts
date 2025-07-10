/**
 * @file Script para corregir la estructura de la tabla products
 */

import { executeQuery } from '../config/database.config';

const fixTable = async () => {
  try {
    console.log('🔧 Corrigiendo estructura de la tabla products...');
    
    // Eliminar la restricción única del campo sku
    await executeQuery('ALTER TABLE products DROP INDEX sku');
    console.log('✅ Restricción única del campo sku eliminada');
    
    // Verificar que se eliminó
    const indexes = await executeQuery('SHOW INDEX FROM products WHERE Key_name = "sku"');
    console.log(`✅ Índices sku restantes: ${indexes.length}`);
    
    console.log('\n🎉 Corrección completada!');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
  
  process.exit(0);
};

fixTable();