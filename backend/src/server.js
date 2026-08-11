const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const serviciosRoutes = require("./routes/servicios");
const turnosRoutes = require("./routes/turnos");
const usuariosRoutes = require("./routes/usuarios");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use("/api/servicios", serviciosRoutes);
app.use("/api/turnos", turnosRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Ruta de prueba para verificar que el servidor está vivo
app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok", mensaje: "Backend funcionando correctamente" });
});
async function inicializarBaseDeDatos() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT
      );
    `);

    const result = await pool.query('SELECT COUNT(*) FROM servicios');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO servicios (nombre, descripcion) VALUES 
        ('Caja / Pagos', 'Atención para pagos y depósitos'),
        ('Atención al Cliente', 'Consultas generales y reclamos'),
        ('Soporte Técnico', 'Asistencia para fallas de servicio');
      `);
      console.log('Servicios de prueba creados exitosamente');
    }
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }
}

inicializarBaseDeDatos();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
