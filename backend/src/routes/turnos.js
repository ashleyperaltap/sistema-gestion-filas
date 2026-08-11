const express = require("express");
const router = express.Router();
const pool = require("../db");

// Helper para limpiar caracteres
const corregirTexto = (texto) => {
  if (!texto) return "";
  return texto
    .replace(/Ã³|Ã³/g, "ó")
    .replace(/Ã¡|Ã/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã/g, "í")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ");
};

// Helper para formatear estado
const formatearEstado = (estado) => {
  if (estado === "en_espera") return "En espera";
  if (estado === "atendiendo") return "Atendiendo";
  if (estado === "completado") return "Completado";
  if (estado === "cancelado") return "Cancelado";
  return estado || "En espera";
};

// GET: Obtener todos los turnos
router.get("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    // Asegurar existencia de la tabla
    await pool.query(`
      CREATE TABLE IF NOT EXISTS turnos (
        id SERIAL PRIMARY KEY,
        servicio_id INT,
        codigo VARCHAR(20),
        estado VARCHAR(20) DEFAULT 'en_espera',
        tiempo_espera_estimado NUMERIC DEFAULT 3.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const query = `
      SELECT t.id, t.codigo, t.estado, t.tiempo_espera_estimado, s.nombre AS servicio_nombre
      FROM turnos t
      LEFT JOIN servicios s ON t.servicio_id = s.id
      ORDER BY t.id ASC
    `;
    const result = await pool.query(query);

    const turnosLimpios = result.rows.map((t) => ({
      ...t,
      servicio_nombre: corregirTexto(t.servicio_nombre || "Servicio"),
      estado: formatearEstado(t.estado)
    }));

    return res.json(turnosLimpios);
  } catch (error) {
    console.error("Error GET turnos:", error);
    return res.json([]);
  }
});

// POST: Crear turno
router.post("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const { servicio_id } = req.body;

  try {
    const countQuery = await pool.query("SELECT COUNT(*) FROM turnos");
    const count = parseInt(countQuery.rows[0].count) + 1;
    const codigo = `T-${String(count).padStart(3, "0")}`;

    const insertQuery = `
      INSERT INTO turnos (servicio_id, codigo, estado, tiempo_espera_estimado)
      VALUES ($1, $2, 'en_espera', 3.00)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [servicio_id || 1, codigo]);

    const servQuery = await pool.query("SELECT nombre FROM servicios WHERE id = $1", [servicio_id || 1]);
    const servicioNombre = servQuery.rows[0] ? servQuery.rows[0].nombre : "Servicio";

    return res.json({
      ...result.rows[0],
      servicio_nombre: corregirTexto(servicioNombre),
      estado: formatearEstado(result.rows[0].estado)
    });
  } catch (error) {
    console.error("Error POST turnos:", error);
    return res.status(500).json({ error: "No se pudo generar el turno", detalle: error.message });
  }
});

module.exports = router;
