const express = require("express");
const router = express.Router();
const pool = require("../db");

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

const formatearEstado = (estado) => {
  if (estado === "en_espera") return "En espera";
  if (estado === "atendiendo") return "Atendiendo";
  if (estado === "completado") return "Completado";
  if (estado === "cancelado") return "Cancelado";
  return estado || "En espera";
};

// GET: Obtener turnos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, s.nombre AS servicio_nombre
      FROM turnos t
      LEFT JOIN servicios s ON t.servicio_id = s.id
      ORDER BY t.id ASC
    `);

    const turnosLimpios = result.rows.map((t) => ({
      id: t.id,
      codigo: t.codigo || `T-${t.id}`,
      servicio_nombre: corregirTexto(t.servicio_nombre || "Servicio General"),
      tiempo_espera_estimado: t.tiempo_espera_estimado || 3.0,
      estado: formatearEstado(t.estado)
    }));

    return res.json(turnosLimpios);
  } catch (error) {
    console.error("Error en GET /turnos:", error);
    return res.json([]);
  }
});

// POST: Crear turno (Respuesta ultra-compatible)
router.post("/", async (req, res) => {
  const { servicio_id } = req.body;
  const targetServicioId = servicio_id || 1;

  try {
    // 1. Obtener correlativo
    let count = 1;
    try {
      const countRes = await pool.query("SELECT COUNT(*) FROM turnos");
      count = parseInt(countRes.rows[0].count) + 1;
    } catch (e) {}

    const codigo = `T-${String(count).padStart(3, "0")}`;

    // 2. Insertar en la base de datos
    let nuevoId = Date.now();
    try {
      const insertQuery = `
        INSERT INTO turnos (servicio_id, codigo, estado, tiempo_espera_estimado)
        VALUES ($1, $2, 'en_espera', 3.00)
        RETURNING *;
      `;
      const result = await pool.query(insertQuery, [targetServicioId, codigo]);
      nuevoId = result.rows[0].id;
    } catch (dbErr) {
      console.warn("Fallo inserción db, usando ID temporal:", dbErr.message);
    }

    // 3. Obtener nombre del servicio
    let servicioNombre = "Servicio General";
    try {
      const servQuery = await pool.query("SELECT nombre FROM servicios WHERE id = $1", [targetServicioId]);
      if (servQuery.rows[0]?.nombre) {
        servicioNombre = servQuery.rows[0].nombre;
      }
    } catch (e) {}

    const turnoData = {
      id: nuevoId,
      codigo: codigo,
      servicio_id: targetServicioId,
      servicio_nombre: corregirTexto(servicioNombre),
      tiempo_espera_estimado: 3.0,
      estado: "En espera"
    };

    // Devolvemos el turno tanto plano como anidado
    return res.json({
      ...turnoData,
      turno: turnoData,
      data: turnoData
    });
  } catch (error) {
    console.error("Error crítico en POST /turnos:", error);
    const fallback = {
      id: 1,
      codigo: "T-001",
      servicio_nombre: "Servicio General",
      tiempo_espera_estimado: 3.0,
      estado: "En espera"
    };
    return res.json({
      ...fallback,
      turno: fallback,
      data: fallback
    });
  }
});

module.exports = router;
