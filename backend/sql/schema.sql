-- Esquema de la base de datos: Sistema Inteligente de Gestión de Filas
-- Ejecutar este archivo una sola vez sobre la base de datos creada para el proyecto.

DROP TABLE IF EXISTS historial_atencion;
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario', -- 'usuario' o 'admin'
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE turnos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL,
  id_usuario INTEGER REFERENCES usuarios(id),
  id_servicio INTEGER NOT NULL REFERENCES servicios(id),
  hora_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
  tiempo_estimado NUMERIC(6,2), -- minutos, calculado por el servicio de IA
  estado VARCHAR(20) NOT NULL DEFAULT 'en_espera' -- en_espera, llamando, atendido, cancelado
);

CREATE TABLE historial_atencion (
  id SERIAL PRIMARY KEY,
  id_turno INTEGER NOT NULL REFERENCES turnos(id),
  hora_inicio_atencion TIMESTAMP,
  hora_fin_atencion TIMESTAMP,
  tiempo_real_espera NUMERIC(6,2) -- minutos reales, para reentrenar el modelo de IA
);

-- Datos iniciales de ejemplo (servicios)
INSERT INTO servicios (nombre, descripcion) VALUES
  ('Caja de atención', 'Pagos y cobros generales'),
  ('Información', 'Consultas generales y orientación'),
  ('Servicio al cliente', 'Reclamos, quejas y solicitudes');

-- Usuario administrador de ejemplo (contraseña: admin123, sin cifrar; ver nota de seguridad en el README)
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
  ('Administrador', 'admin@centro.com', 'admin123', 'admin');
