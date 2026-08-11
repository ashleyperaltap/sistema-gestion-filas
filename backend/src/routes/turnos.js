const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../db");

const PREFIJOS = { 1: "A", 2: "B", 3: "C" }; // letra según id_servicio (ajustar si agregan más servicios)

// Genera un código de turno tipo "A-045"
async function generarCodigo(idServicio) {
  const letra = PREFIJOS[idServicio] || "X";
  const resultado = await pool.query(
    "SELECT COUNT(*) AS total FROM turnos WHERE id_servicio = $1",
    [idServicio]
  );
  const numero = parseInt(resultado.rows[0].total, 10) + 1;
  return `${letra}-${String(numero).padStart(3, "0")}`;
}

// POST /api/turnos  { id_servicio, id_usuario (opcional) }
// Crea un turno virtual y consulta al servicio de IA el tiempo estimado de espera
router.post("/", async (req, res) => {
  const { id_servicio, id_usuario } = req.body;
  if (!id_servicio) {
    return res.status(400).json({ error: "id_servicio es requerido" });
  }

  try {
    const enEspera = await pool.query(
      "SELECT COUNT(*) AS total FROM turnos WHERE id_servicio = $1 AND estado = 'en_espera'",
      [id_servicio]
    );
    const personasEnFila = parseInt(enEspera.rows[0].total, 10);

    let tiempoEstimado = null;
    try {
      const aiUrl = `${process.env.AI_SERVICE_URL}/predecir`;
      const respuestaIA = await axios.post(aiUrl, { personas_en_fila: personasEnFila });
      tiempoEstimado = respuestaIA.data.tiempo_estimado;
    } catch (errorIA) {
      console.warn("No se pudo contactar el servicio de IA, se usa una estimación básica:", errorIA.message);
      tiempoEstimado = personasEnFila * 3;
    }

    const codigo = await generarCodigo(id_servicio);
    const insercion = await pool.query(
      `INSERT INTO turnos (codigo, id_usuario, id_servicio, tiempo_estimado, estado)
       VALUES ($1, $2, $3, $4, 'en_espera') RETURNING *`,
      [codigo, id_usuario || null, id_servicio, tiempoEstimado]
    );

    res.status(201).json({ turno: insercion.rows[0], personas_en_fila: personasEnFila });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar el turno" });
  }
});

// GET /api/turnos/reportes/resumen -> indicadores para el panel administrativo
// (Debe declararse ANTES que "/:id" para que Express no confunda "reportes" con un id)
router.get("/reportes/resumen", async (req, res) => {
  try {
    const enEspera = await pool.query(
      "SELECT COUNT(*) AS total FROM turnos WHERE estado = 'en_espera'"
    );
    const atendidosHoy = await pool.query(
      `SELECT COUNT(*) AS total FROM turnos
       WHERE estado = 'atendido' AND hora_solicitud::date = CURRENT_DATE`
    );
    const promedio = await pool.query(
      "SELECT AVG(tiempo_estimado) AS promedio FROM turnos WHERE estado = 'en_espera'"
    );

    res.json({
      turnos_en_espera: parseInt(enEspera.rows[0].total, 10),
      turnos_atendidos_hoy: parseInt(atendidosHoy.rows[0].total, 10),
      tiempo_promedio_estimado: parseFloat(promedio.rows[0].promedio) || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar el resumen" });
  }
});

// GET /api/turnos?estado=en_espera -> listar turnos (para el panel administrativo)
router.get("/", async (req, res) => {
  const { estado } = req.query;
  try {
    const consulta = estado
      ? await pool.query(
          `SELECT t.*, s.nombre AS servicio FROM turnos t
           JOIN servicios s ON s.id = t.id_servicio
           WHERE t.estado = $1 ORDER BY t.hora_solicitud ASC`,
          [estado]
        )
      : await pool.query(
          `SELECT t.*, s.nombre AS servicio FROM turnos t
           JOIN servicios s ON s.id = t.id_servicio
           ORDER BY t.hora_solicitud DESC LIMIT 50`
        );
    res.json(consulta.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los turnos" });
  }
});

// GET /api/turnos/:id -> consultar el estado de un turno específico (vista de usuario)
router.get("/:id", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT t.*, s.nombre AS servicio FROM turnos t
       JOIN servicios s ON s.id = t.id_servicio
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    const turno = resultado.rows[0];
    const posicion = await pool.query(
      `SELECT COUNT(*) AS delante FROM turnos
       WHERE id_servicio = $1 AND estado = 'en_espera' AND hora_solicitud < $2`,
      [turno.id_servicio, turno.hora_solicitud]
    );

    res.json({ ...turno, turnos_delante: parseInt(posicion.rows[0].delante, 10) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar el turno" });
  }
});

// PUT /api/turnos/:id/atender -> el personal marca el turno como atendido
router.put("/:id/atender", async (req, res) => {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    const turnoResultado = await cliente.query(
      "SELECT * FROM turnos WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    if (turnoResultado.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return res.status(404).json({ error: "Turno no encontrado" });
    }
    const turno = turnoResultado.rows[0];

    await cliente.query("UPDATE turnos SET estado = 'atendido' WHERE id = $1", [turno.id]);

    const tiempoRealMin =
      (new Date() - new Date(turno.hora_solicitud)) / 60000;

    await cliente.query(
      `INSERT INTO historial_atencion (id_turno, hora_inicio_atencion, hora_fin_atencion, tiempo_real_espera)
       VALUES ($1, NOW(), NOW(), $2)`,
      [turno.id, tiempoRealMin.toFixed(2)]
    );

    await cliente.query("COMMIT");
    res.json({ mensaje: "Turno atendido y registrado en el historial" });
  } catch (error) {
    await cliente.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al atender el turno" });
  } finally {
    cliente.release();
  }
});

module.exports = router;