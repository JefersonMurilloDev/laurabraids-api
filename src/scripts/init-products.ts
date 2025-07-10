/**
 * @file Script para inicializar la tabla products en la base de datos
 * @description Crea la tabla products e inserta los datos iniciales
 */

import { executeQuery } from '../config/database.config';

const createProductsTable = async () => {
  try {
    console.log('Creando tabla products...');
    
    // Crear tabla products
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        sku VARCHAR(100),
        brand VARCHAR(100),
        weight_grams INT,
        image_url VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await executeQuery(createTableQuery);
    console.log('Tabla products creada exitosamente');
    
    // Insertar datos iniciales
    console.log('Insertando datos iniciales...');
    
    const insertDataQuery = `
      INSERT INTO products (id, name, description, price, stock_quantity, sku, image_url, is_active, created_at, updated_at) VALUES
      ('prod-001', 'Extensiones Kanekalon Premium', 'Extensiones de alta calidad para trenzas Box Braids y Knotless. Fibra suave y duradera.', 25.99, 50, 'Extensiones', 'https://example.com/kanekalon-extensions.jpg', TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      ('prod-002', 'Aceite Protector para Trenzas', 'Aceite nutritivo especial para mantener las trenzas hidratadas y brillantes. Libre de sulfatos.', 15.50, 30, 'Cuidado', 'https://example.com/protective-oil.jpg', TRUE, '2024-01-05 00:00:00', '2024-01-05 00:00:00'),
      ('prod-003', 'Peine de Cola para Trenzas', 'Peine profesional de cola fina para crear particiones perfectas en las trenzas.', 8.99, 20, 'Accesorios', 'https://example.com/tail-comb.jpg', TRUE, '2024-01-10 00:00:00', '2024-01-10 00:00:00'),
      ('prod-004', 'Gel Fijador Sin Alcohol', 'Gel fijador especial para trenzas que no reseca el cabello. Proporciona hold duradero.', 12.75, 25, 'Cuidado', 'https://example.com/holding-gel.jpg', TRUE, '2024-01-15 00:00:00', '2024-01-15 00:00:00'),
      ('prod-005', 'Cuentas Decorativas Doradas', 'Set de cuentas decorativas doradas para personalizar trenzas Fulani y otros estilos.', 18.25, 0, 'Accesorios', 'https://example.com/golden-beads.jpg', FALSE, '2024-01-20 00:00:00', '2024-01-25 00:00:00')
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description),
      price = VALUES(price),
      stock_quantity = VALUES(stock_quantity),
      sku = VALUES(sku),
      image_url = VALUES(image_url),
      is_active = VALUES(is_active);
    `;
    
    await executeQuery(insertDataQuery);
    console.log('Datos iniciales insertados exitosamente');
    
    console.log('Inicialización de productos completada');
    process.exit(0);
    
  } catch (error) {
    console.error('Error al inicializar productos:', error);
    process.exit(1);
  }
};

createProductsTable();