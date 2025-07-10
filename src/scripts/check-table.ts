/**
 * @file Script para verificar la estructura de la tabla products
 */

import { executeQuery } from '../config/database.config';

const checkTable = async () => {
  try {
    console.log('🔍 Verificando estructura de la tabla products...');
    
    // Mostrar estructura de la tabla
    const structure = await executeQuery('DESCRIBE products');
    console.log('\n📋 Estructura de la tabla:');
    structure.forEach((field: any) => {
      console.log(`   ${field.Field}: ${field.Type} | Null: ${field.Null} | Key: ${field.Key} | Default: ${field.Default}`);
    });
    
    // Mostrar índices
    const indexes = await executeQuery('SHOW INDEX FROM products');
    console.log('\n🔑 Índices de la tabla:');
    indexes.forEach((index: any) => {
      console.log(`   ${index.Key_name}: ${index.Column_name} | Unique: ${index.Non_unique === 0}`);
    });
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
  
  process.exit(0);
};

checkTable();