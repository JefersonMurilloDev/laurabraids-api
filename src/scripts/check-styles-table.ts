/**
 * @file Script para verificar si existe tabla de styles
 */

import { executeQuery } from '../config/database.config';

const checkStylesTable = async () => {
  try {
    console.log('🔍 Verificando tabla de styles...');
    
    // Verificar si existe tabla styles o similar
    const tables = await executeQuery("SHOW TABLES LIKE '%style%'");
    console.log(`✅ Tablas relacionadas con styles: ${tables.length}`);
    
    if (tables.length > 0) {
      tables.forEach((table: any) => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      
      // Verificar estructura de la primera tabla
      const tableName = Object.values(tables[0])[0] as string;
      const structure = await executeQuery(`DESCRIBE ${tableName}`);
      console.log(`\n📋 Estructura de la tabla ${tableName}:`);
      structure.forEach((field: any) => {
        console.log(`   ${field.Field}: ${field.Type} | Null: ${field.Null} | Key: ${field.Key} | Default: ${field.Default}`);
      });
    }
    
    // También verificar tabla braids (puede ser la tabla original)
    const braidsTable = await executeQuery("SHOW TABLES LIKE 'braids'");
    if (braidsTable.length > 0) {
      console.log('\n🔍 Encontrada tabla braids (posiblemente la original):');
      const structure = await executeQuery('DESCRIBE braids');
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

checkStylesTable();