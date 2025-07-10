-- Crear tabla stylists en la base de datos laurabraids_db
-- Esta tabla almacenará todas las estilistas del sistema

CREATE TABLE IF NOT EXISTS stylists (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    bio TEXT,
    photo_url VARCHAR(500),
    years_experience INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_stylists_featured (is_featured),
    INDEX idx_stylists_available (is_available),
    INDEX idx_stylists_rating (rating)
);

-- Insertar datos iniciales para testing
-- Nota: Requiere usuarios existentes con IDs correspondientes
INSERT INTO stylists (id, user_id, name, specialty, bio, photo_url, years_experience, rating, total_reviews, is_featured, is_available, hourly_rate, created_at, updated_at) VALUES
('stylist-001', 'user-001', 'Laura Rodríguez', 'Trenzas Africanas', 'Especialista en trenzas africanas con más de 10 años de experiencia. Creadora de LauraBraids.', 'https://example.com/laura.jpg', 10, 4.85, 127, TRUE, TRUE, 45.00, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('stylist-002', 'user-002', 'Carmen Vásquez', 'Extensiones y Trenzas Largas', 'Experta en extensiones y trenzas largas. Reconocida por su técnica impecable y creatividad.', 'https://example.com/carmen.jpg', 8, 4.92, 89, TRUE, TRUE, 50.00, '2024-01-10 00:00:00', '2024-01-10 00:00:00'),
('stylist-003', 'user-003', 'Ana María Torres', 'Trenzas Infantiles', 'Especialista en trenzas para niñas. Paciente y cariñosa, crea diseños divertidos y coloridos.', 'https://example.com/ana.jpg', 5, 4.75, 45, FALSE, TRUE, 35.00, '2024-01-15 00:00:00', '2024-01-15 00:00:00')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
specialty = VALUES(specialty),
bio = VALUES(bio),
photo_url = VALUES(photo_url),
years_experience = VALUES(years_experience),
rating = VALUES(rating),
total_reviews = VALUES(total_reviews),
is_featured = VALUES(is_featured),
is_available = VALUES(is_available),
hourly_rate = VALUES(hourly_rate);