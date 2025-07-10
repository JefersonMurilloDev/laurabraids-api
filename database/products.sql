-- Crear tabla products en la base de datos laurabraids_db
-- Esta tabla almacenará todos los productos disponibles para venta

CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    brand VARCHAR(50),
    weight_grams INT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_products_sku (sku),
    INDEX idx_products_active (is_active),
    INDEX idx_products_stock (stock_quantity),
    INDEX idx_products_price (price)
);

-- Insertar datos iniciales para testing
INSERT INTO products (id, name, description, price, stock_quantity, sku, brand, weight_grams, image_url, is_active, created_at, updated_at) VALUES
('prod-001', 'Extensiones Kanekalon Premium', 'Extensiones de alta calidad para trenzas Box Braids y Knotless. Fibra suave y duradera.', 25.99, 50, 'EXT-KANEKALON-001', 'Kanekalon', 200, 'https://example.com/kanekalon-extensions.jpg', TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('prod-002', 'Aceite Protector para Trenzas', 'Aceite nutritivo especial para mantener las trenzas hidratadas y brillantes. Libre de sulfatos.', 15.50, 30, 'CARE-OIL-001', 'NaturalHair', 150, 'https://example.com/protective-oil.jpg', TRUE, '2024-01-05 00:00:00', '2024-01-05 00:00:00'),
('prod-003', 'Peine de Cola para Trenzas', 'Peine profesional de cola fina para crear particiones perfectas en las trenzas.', 8.99, 20, 'ACC-COMB-001', 'ProHair', 25, 'https://example.com/tail-comb.jpg', TRUE, '2024-01-10 00:00:00', '2024-01-10 00:00:00'),
('prod-004', 'Gel Fijador Sin Alcohol', 'Gel fijador especial para trenzas que no reseca el cabello. Proporciona hold duradero.', 12.75, 25, 'CARE-GEL-001', 'StyleFix', 250, 'https://example.com/holding-gel.jpg', TRUE, '2024-01-15 00:00:00', '2024-01-15 00:00:00'),
('prod-005', 'Cuentas Decorativas Doradas', 'Set de cuentas decorativas doradas para personalizar trenzas Fulani y otros estilos.', 18.25, 0, 'ACC-BEADS-001', 'Decorative', 50, 'https://example.com/golden-beads.jpg', FALSE, '2024-01-20 00:00:00', '2024-01-25 00:00:00');