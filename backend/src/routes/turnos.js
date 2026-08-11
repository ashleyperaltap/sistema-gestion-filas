const express = require("express");
const router = express.Router();
const pool = require("../db");

const corregirTexto = (texto) => {
  if (!texto) return texto;
  return texto
    .replace(/Ã³|Ã³/g, "ó")
    .replace(/Ã¡|Ã/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã/g, "í")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ");
};

const formatearEstado = (estado) => {
  if (estado === "en_espera") return "En espera";
  if (estado === "atendiendo") return "Atendiendo";
  if (estado === "completado") return "Completado";
  if (estado === "cancelado") return "Cancelado";
  return estado;
};

// GET: Obtener todos los turnos
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT t.*, s.nombre AS servicio_nombre
      FROM turnos t
      LEFT JOIN servicios s ON t.servicio_id = s.id
      ORDER BY t.id ASC
    `;
    const result = await pool.query(query);

    const turnosLimpios = result.rows.map((t) => ({
      ...t,
      servicio_nombre: corregirTexto(t.servicio_nombre),
      estado: formatearEstado(t.estado)
    }));

    res.json(turnosLimpios);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    res.status(500).json({ error: "Error al obtener turnos" });
  }
});

// POST: Generar un nuevo turno
router.post("/", async (req, res) => {
  const { servicio_id } = req.body;
  try {
    // 1. Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS turnos (
        id SERIAL PRIMARY KEY,
        servicio_id INT REFERENCES servicios(id),
        codigo VARCHAR(20),
        estado VARCHAR(20) DEFAULT 'en_espera',
        tiempo_espera_estimado NUMERIC DEFAULT 3.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Generar el código de turno
    const countQuery = await pool.query("SELECT COUNT(*) FROM turnos");
    const count = parseInt(countQuery.rows[0].count) + 1;
    const codigo = `T-${String(count).padStart(3, "0")}`;

    // 3. Insertar el turno
    const insertQuery = `
      INSERT INTO turnos (servicio_id, codigo, estado, tiempo_espera_estimado)
      VALUES ($1, $2, 'en_espera', 3.00)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [servicio_id, codigo]);

    // 4. Obtener nombre del servicio
    const servQuery = await pool.query("SELECT nombre FROM servicios WHERE id = $1", [servicio_id]);
    const servicioNombre = servQuery.rows[0] ? servQuery.rows[0].nombre : "Servicio";

    res.json({
      ...result.rows[0],
      servicio_nombre: corregirTexto(servicioNombre),
      estado: formatearEstado(result.rows[0].estado)
    });
  } catch (error) {
    console.error("Error detallado al crear turno:", error);
    res.status(500).json({ error: "Error al generar el turno", detalle: error.message });
  }
});

module.exports = router;
