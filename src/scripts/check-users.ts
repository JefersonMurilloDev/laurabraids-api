/**
 * @file Script para verificar usuarios existentes
 */

import { executeQuery } from '../config/database.config';

const checkUsers = async () => {
  try {
    console.log('👥 Verificando usuarios existentes...');
    
    const users = await executeQuery('SELECT id, name, email, role FROM users');
    console.log(`✅ Usuarios encontrados: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 Lista de usuarios:');
      users.forEach((user: any) => {
        console.log(`   - ${user.name} (${user.email}) - ID: ${user.id} - Rol: ${user.role}`);
      });
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
  
  process.exit(0);
};

checkUsers();