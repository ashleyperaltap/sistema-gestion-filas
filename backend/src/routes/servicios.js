const express = require("express");
const router = express.Router();
const pool = require("../db");

// Función para corregir la codificación UTF-8/Latin-1
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

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM servicios ORDER BY id ASC");
    
    // Mapear los resultados y limpiar la ortografía
    const serviciosLimpios = result.rows.map((servicio) => ({
      ...servicio,
      nombre: corregirTexto(servicio.nombre),
      descripcion: corregirTexto(servicio.descripcion)
    }));

    res.json(serviciosLimpios);
  } catch (error) {
    console.error("Error en servicios:", error);
    res.status(500).json({ error: "Error al obtener los servicios" });
  }
});

module.exports = router;
