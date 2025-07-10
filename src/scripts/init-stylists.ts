/**
 * @file Script para inicializar la tabla stylists en la base de datos
 * @description Crea la tabla stylists e inserta los datos iniciales
 */

import { executeQuery } from '../config/database.config';

const createStylistsTable = async () => {
  try {
    console.log('🎨 Creando tabla stylists...');
    
    // Crear tabla stylists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS stylists (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        photo_url VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_stylists_featured (is_featured),
        INDEX idx_stylists_specialty (specialty)
      );
    `;
    
    await executeQuery(createTableQuery);
    console.log('✅ Tabla stylists creada exitosamente');
    
    // Crear usuarios para las estilistas
    console.log('👥 Creando usuarios para estilistas...');
    
    const createUsersQuery = `
      INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES
      ('stylist-001', 'Laura Rodríguez', 'laura@laurabraids.com', '$2a$10$example.hash.for.laura', 'ADMIN', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      ('stylist-002', 'Carmen Vásquez', 'carmen@laurabraids.com', '$2a$10$example.hash.for.carmen', 'CUSTOMER', '2024-01-10 00:00:00', '2024-01-10 00:00:00'),
      ('stylist-003', 'Ana María Torres', 'ana@laurabraids.com', '$2a$10$example.hash.for.ana', 'CUSTOMER', '2024-01-15 00:00:00', '2024-01-15 00:00:00')
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      email = VALUES(email);
    `;
    
    await executeQuery(createUsersQuery);
    console.log('✅ Usuarios de estilistas creados');
    
    // Insertar datos iniciales de estilistas
    console.log('🎨 Insertando datos iniciales de estilistas...');
    
    const insertDataQuery = `
      INSERT INTO stylists (id, user_id, name, specialty, bio, photo_url, years_experience, rating, total_reviews, is_featured, is_available, hourly_rate, created_at, updated_at) VALUES
      ('stylist-001', 'stylist-001', 'Laura Rodríguez', 'Trenzas Africanas', 'Especialista en trenzas africanas con más de 10 años de experiencia. Creadora de LauraBraids.', 'https://example.com/laura.jpg', 10, 4.9, 50, TRUE, TRUE, 25.00, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      ('stylist-002', 'stylist-002', 'Carmen Vásquez', 'Extensiones y Trenzas Largas', 'Experta en extensiones y trenzas largas. Reconocida por su técnica impecable y creatividad.', 'https://example.com/carmen.jpg', 8, 4.8, 35, TRUE, TRUE, 30.00, '2024-01-10 00:00:00', '2024-01-10 00:00:00'),
      ('stylist-003', 'stylist-003', 'Ana María Torres', 'Trenzas Infantiles', 'Especialista en trenzas para niñas. Paciente y cariñosa, crea diseños divertidos y coloridos.', 'https://example.com/ana.jpg', 5, 4.7, 20, FALSE, TRUE, 20.00, '2024-01-15 00:00:00', '2024-01-15 00:00:00')
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      specialty = VALUES(specialty),
      bio = VALUES(bio),
      photo_url = VALUES(photo_url),
      is_featured = VALUES(is_featured);
    `;
    
    await executeQuery(insertDataQuery);
    console.log('✅ Datos iniciales insertados exitosamente');
    
    console.log('🎉 Inicialización de stylists completada');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error al inicializar stylists:', error);
    process.exit(1);
  }
};

createStylistsTable();