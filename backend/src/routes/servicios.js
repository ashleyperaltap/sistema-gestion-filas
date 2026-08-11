const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    // Forzar el header a UTF-8
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    // Limpiar registros antiguos con problemas de codificación
    await pool.query("TRUNCATE TABLE servicios RESTART IDENTITY;");

    // Insertar registros con codificación limpia
    await pool.query(`
      INSERT INTO servicios (nombre, descripcion) VALUES 
      ('Caja de atencion', 'Pagos y cobros generales'),
      ('Informacion', 'Consultas generales y orientacion'),
      ('Servicio al cliente', 'Reclamos, quejas y solicitudes');
    `);

    const result = await pool.query("SELECT * FROM servicios ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error en servicios:", error);
    res.status(500).json({ error: "Error al obtener los servicios" });
  }
});

module.exports = router;
