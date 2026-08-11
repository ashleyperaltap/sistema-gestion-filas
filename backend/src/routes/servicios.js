const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    // 1. Asegurar que la tabla existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT
      );
    `);

    // 2. Verificar si está vacía e insertar
    const check = await pool.query("SELECT COUNT(*) FROM servicios");
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO servicios (nombre, descripcion) VALUES 
        ('Caja / Pagos', 'Atención para pagos y depósitos'),
        ('Atención al Cliente', 'Consultas generales y reclamos'),
        ('Soporte Técnico', 'Asistencia para fallas de servicio');
      `);
    }

    // 3. Devolver los servicios
    const result = await pool.query("SELECT * FROM servicios ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error en servicios:", error);
    res.status(500).json({ error: "Error al obtener los servicios", detalle: error.message });
  }
});

module.exports = router;
