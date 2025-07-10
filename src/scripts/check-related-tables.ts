/**
 * @file Script para verificar tablas relacionadas con styles
 */

import { executeQuery } from '../config/database.config';

const checkRelatedTables = async () => {
  try {
    console.log('🔍 Verificando tablas relacionadas...');
    
    // Verificar tabla stylist_styles
    console.log('\n📋 Estructura de la tabla stylist_styles:');
    const stylistStylesStructure = await executeQuery('DESCRIBE stylist_styles');
    stylistStylesStructure.forEach((field: any) => {
      console.log(`   ${field.Field}: ${field.Type} | Null: ${field.Null} | Key: ${field.Key} | Default: ${field.Default}`);
    });
    
    // Verificar si existe tabla de categorías
    const categoryTables = await executeQuery("SHOW TABLES LIKE '%categor%'");
    console.log(`\n✅ Tablas de categorías encontradas: ${categoryTables.length}`);
    
    if (categoryTables.length > 0) {
      categoryTables.forEach((table: any) => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      
      // Verificar estructura de la primera tabla de categorías
      const tableName = Object.values(categoryTables[0])[0] as string;
      const structure = await executeQuery(`DESCRIBE ${tableName}`);
      console.log(`\n📋 Estructura de la tabla ${tableName}:`);
      structure.forEach((field: any) => {
        console.log(`   ${field.Field}: ${field.Type} | Null: ${field.Null} | Key: ${field.Key} | Default: ${field.Default}`);
      });
    }
    
    // Contar registros en la tabla styles
    const stylesCount = await executeQuery('SELECT COUNT(*) as count FROM styles');
    console.log(`\n📊 Estilos en la tabla: ${stylesCount[0].count}`);
    
    if (stylesCount[0].count > 0) {
      const samplesStyles = await executeQuery('SELECT id, name, description, base_price, difficulty_level, is_active FROM styles LIMIT 3');
      console.log('\n📋 Muestra de estilos:');
      samplesStyles.forEach((style: any) => {
        console.log(`   - ${style.name} (${style.difficulty_level}) - $${style.base_price} - Activo: ${style.is_active}`);
      });
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
  
  process.exit(0);
};

checkRelatedTables();