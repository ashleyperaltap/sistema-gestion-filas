const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
