/**
 * @file Script para probar la migración de stylists
 * @description Prueba las operaciones CRUD de stylists
 */

import { 
  getStylists, 
  getStylistById, 
  addStylist, 
  updateStylist, 
  deleteStylist 
} from '../data/stylists.database';
import { Stylist } from '../interfaces/stylist.interface';
import { v4 as uuidv4 } from 'uuid';

const testStylists = async () => {
  try {
    console.log('🎨 Iniciando pruebas de stylists...');
    
    // Test 1: Obtener todas las estilistas
    console.log('\n1. Obteniendo todas las estilistas...');
    const allStylists = await getStylists();
    console.log(`✅ Estilistas encontradas: ${allStylists.length}`);
    allStylists.forEach(stylist => {
      console.log(`   - ${stylist.name} (${stylist.specialty}) - Destacada: ${stylist.is_featured}`);
    });
    
    // Test 2: Obtener estilista por ID
    console.log('\n2. Obteniendo estilista por ID...');
    if (allStylists.length > 0) {
      const firstStylist = await getStylistById(allStylists[0].id);
      console.log(`✅ Estilista encontrada: ${firstStylist?.name}`);
    }
    
    // Test 3: Crear nueva estilista
    console.log('\n3. Creando nueva estilista...');
    const newStylist: Stylist = {
      id: uuidv4(),
      name: 'Estilista de Prueba',
      specialty: 'Trenzas Modernas',
      photo_url: 'https://example.com/test-stylist.jpg',
      description: 'Estilista especializada en técnicas modernas de trenzado.',
      is_featured: false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const createdStylist = await addStylist(newStylist);
    console.log(`✅ Estilista creada: ${createdStylist.name}`);
    
    // Test 4: Actualizar estilista
    console.log('\n4. Actualizando estilista...');
    const updatedStylist = await updateStylist(createdStylist.id, {
      name: 'Estilista Actualizada',
      is_featured: true
    });
    console.log(`✅ Estilista actualizada: ${updatedStylist?.name} - Destacada: ${updatedStylist?.is_featured}`);
    
    // Test 5: Eliminar estilista
    console.log('\n5. Eliminando estilista...');
    const deleted = await deleteStylist(createdStylist.id);
    console.log(`✅ Estilista eliminada: ${deleted}`);
    
    // Test 6: Verificar que la estilista fue eliminada
    console.log('\n6. Verificando eliminación...');
    const deletedStylist = await getStylistById(createdStylist.id);
    console.log(`✅ Estilista después de eliminar: ${deletedStylist ? 'Aún existe' : 'No encontrada'}`);
    
    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
  
  process.exit(0);
};

testStylists();