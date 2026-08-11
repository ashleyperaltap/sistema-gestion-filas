const express = require("express");
const router = express.Router();
const pool = require("../db");

// Función Helper para corregir texto y formato
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

// GET: Obtener todos los turnos (Panel Administrativo)
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT t.id, t.codigo, t.estado, t.tiempo_espera_estimado, s.nombre AS servicio_nombre
      FROM turnos t
      LEFT JOIN servicios s ON t.servicio_id = s.id
      ORDER BY t.created_at ASC
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
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST: Crear nuevo turno (Vista Usuario)
router.post("/", async (req, res) => {
  const { servicio_id } = req.body;
  try {
    // Generar código de turno básico
    const countQuery = await pool.query("SELECT COUNT(*) FROM turnos");
    const count = parseInt(countQuery.rows[0].count) + 1;
    const codigo = `A-${String(count).padStart(3, "0")}`;

    // Insertar turno
    const insertQuery = `
      INSERT INTO turnos (servicio_id, codigo, estado, tiempo_espera_estimado)
      VALUES ($1, $2, 'en_espera', 3.00)
      RETURNING *
    `;
    const newTurno = await pool.query(insertQuery, [servicio_id, codigo]);

    // Obtener nombre del servicio
    const servQuery = await pool.query("SELECT nombre FROM servicios WHERE id = $1", [servicio_id]);
    const servicioNombre = servQuery.rows[0] ? servQuery.rows[0].nombre : "";

    res.json({
      ...newTurno.rows[0],
      servicio_nombre: corregirTexto(servicioNombre),
      estado: formatearEstado(newTurno.rows[0].estado)
    });
  } catch (error) {
    console.error("Error al crear turno:", error);
    res.status(500).json({ error: "Error al generar el turno" });
  }
});

module.exports = router;
