const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM servicios ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error en servicios:", error);
    res.status(500).json({ error: "Error al obtener los servicios" });
  }
});

module.exports = router;
