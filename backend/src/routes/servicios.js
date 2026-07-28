const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/servicios -> lista todos los servicios activos
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, nombre, descripcion FROM servicios WHERE activo = TRUE ORDER BY id"
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los servicios" });
  }
});

module.exports = router;
