/**
 * @file Script simple para probar la conexión a MySQL
 */

import { executeQuery } from '../config/database.config';

const simpleTest = async () => {
  try {
    console.log('🧪 Probando conexión simple a MySQL...');
    
    // Test 1: Verificar si existe la tabla
    console.log('\n1. Verificando si existe la tabla products...');
    const tableExists = await executeQuery('SHOW TABLES LIKE "products"');
    console.log(`✅ Tabla products existe: ${tableExists.length > 0}`);
    
    // Test 2: Contar productos
    console.log('\n2. Contando productos...');
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Productos en la tabla: ${countResult[0].count}`);
    
    // Test 3: Obtener todos los productos sin filtros
    console.log('\n3. Obteniendo todos los productos...');
    const allProducts = await executeQuery('SELECT id, name, sku, is_active FROM products');
    console.log(`✅ Productos encontrados: ${allProducts.length}`);
    allProducts.forEach((product: any) => {
      console.log(`   - ${product.name} (${product.sku}) - Activo: ${product.is_active}`);
    });
    
    console.log('\n🎉 Prueba completada!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
  
  process.exit(0);
};

simpleTest();