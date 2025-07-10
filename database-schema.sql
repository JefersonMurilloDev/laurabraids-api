-- =====================================================
-- SCHEMA DE BASE DE DATOS LAURABRAIDS
-- Versión: 1.0
-- Motor: MySQL 8.0+
-- Descripción: Esquema profesional para aplicación de trenzas
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS laurabraids_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE laurabraids_db;

-- =====================================================
-- TABLA: users (Usuarios del sistema)
-- =====================================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN', 'STYLIST') NOT NULL DEFAULT 'CUSTOMER',
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
);

-- =====================================================
-- TABLA: stylists (Estilistas profesionales)
-- =====================================================
CREATE TABLE stylists (
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

-- =====================================================
-- TABLA: categories (Categorías de estilos)
-- =====================================================
CREATE TABLE categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categories_active (is_active),
    INDEX idx_categories_order (display_order)
);

-- =====================================================
-- TABLA: styles (Estilos de trenzas)
-- =====================================================
CREATE TABLE styles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    photo_url VARCHAR(500),
    base_price DECIMAL(8,2) NOT NULL,
    estimated_duration_minutes INT,
    difficulty_level ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT') DEFAULT 'MEDIUM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_styles_category (category_id),
    INDEX idx_styles_active (is_active),
    INDEX idx_styles_price (base_price),
    INDEX idx_styles_difficulty (difficulty_level)
);

-- =====================================================
-- TABLA: stylist_styles (Relación muchos a muchos)
-- =====================================================
CREATE TABLE stylist_styles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    stylist_id CHAR(36) NOT NULL,
    style_id CHAR(36) NOT NULL,
    custom_price DECIMAL(8,2), -- Precio personalizado del estilista
    is_specialty BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES styles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_stylist_style (stylist_id, style_id),
    INDEX idx_stylist_styles_stylist (stylist_id),
    INDEX idx_stylist_styles_style (style_id)
);

-- =====================================================
-- TABLA: products (Productos de la tienda)
-- =====================================================
CREATE TABLE products (
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

-- =====================================================
-- TABLA: appointments (Citas programadas)
-- =====================================================
CREATE TABLE appointments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) NOT NULL,
    stylist_id CHAR(36) NOT NULL,
    style_id CHAR(36) NOT NULL,
    appointment_date DATETIME NOT NULL,
    estimated_end_date DATETIME,
    status ENUM('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    total_price DECIMAL(8,2) NOT NULL,
    notes TEXT,
    cancellation_reason VARCHAR(255),
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE RESTRICT,
    FOREIGN KEY (style_id) REFERENCES styles(id) ON DELETE RESTRICT,
    INDEX idx_appointments_customer (customer_id),
    INDEX idx_appointments_stylist (stylist_id),
    INDEX idx_appointments_date (appointment_date),
    INDEX idx_appointments_status (status)
);

-- =====================================================
-- TABLA: reviews (Reseñas polimórficas)
-- =====================================================
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    reviewable_id CHAR(36) NOT NULL,
    reviewable_type ENUM('STYLIST', 'PRODUCT', 'STYLE') NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(100),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reviews_reviewable (reviewable_type, reviewable_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_featured (is_featured),
    INDEX idx_reviews_user (user_id)
);

-- =====================================================
-- TABLA: order_items (Items de pedidos de productos)
-- =====================================================
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) NOT NULL,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address TEXT,
    billing_address TEXT,
    payment_method VARCHAR(50),
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_number (order_number)
);

CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);

-- =====================================================
-- DATOS INICIALES (SEEDS)
-- =====================================================

-- Categorías por defecto
INSERT INTO categories (id, name, description, display_order) VALUES
(UUID(), 'Protectoras', 'Estilos que protegen el cabello natural', 1),
(UUID(), 'Clásicas', 'Trenzas tradicionales y atemporales', 2),
(UUID(), 'Modernas', 'Estilos contemporáneos y de tendencia', 3),
(UUID(), 'Extensiones', 'Estilos con cabello adicional', 4),
(UUID(), 'Especiales', 'Ocasiones especiales y eventos', 5);

-- Usuario administrador por defecto
INSERT INTO users (id, name, email, password_hash, role, is_active, email_verified_at) VALUES
(UUID(), 'Administrador', 'admin@laurabraids.com', '$2b$10$example_hash_here', 'ADMIN', TRUE, NOW());