/**
 * @file Script para verificar la estructura de la tabla stylists
 */

import { executeQuery } from '../config/database.config';

const checkStylistsTable = async () => {
  try {
    console.log('🔍 Verificando estructura de la tabla stylists...');
    
    // Verificar si existe la tabla
    const tableExists = await executeQuery('SHOW TABLES LIKE "stylists"');
    console.log(`✅ Tabla stylists existe: ${tableExists.length > 0}`);
    
    if (tableExists.length > 0) {
      // Mostrar estructura de la tabla
      const structure = await executeQuery('DESCRIBE stylists');
      console.log('\n📋 Estructura de la tabla:');
      structure.forEach((field: any) => {
        console.log(`   ${field.Field}: ${field.Type} | Null: ${field.Null} | Key: ${field.Key} | Default: ${field.Default}`);
      });
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
  
  process.exit(0);
};

checkStylistsTable();