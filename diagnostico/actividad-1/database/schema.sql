-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS planta_reciclaje;
USE planta_reciclaje;

-- Crear la tabla única de materiales
CREATE TABLE IF NOT EXISTS materiales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    cantidad DECIMAL(15, 3) NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índice para búsquedas rápidas por nombre
    INDEX idx_nombre (nombre)
);

-- Insertar datos iniciales
INSERT INTO materiales (nombre, unidad_medida, cantidad) VALUES
('Vidrio', 'kg', 1000),
('Hierro', 'kg', 500),
('Aluminio', 'kg', 300),
('Cobre', 'kg', 150),
('Bronce', 'kg', 80),
('Cartón', 'kg', 2000),
('Papel Blanco', 'kg', 750),
('Tapas de plástico', 'kg', 250),
('Aceite de girasol', 'm³', 50),
('Baterías de vehículos', 'unidades', 25);

-- Verificar los datos
SELECT * FROM materiales;