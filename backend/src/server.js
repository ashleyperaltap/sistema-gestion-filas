const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas
const serviciosRoutes = require("./routes/servicios");
const turnosRoutes = require("./routes/turnos");

// Registrar rutas de la API
app.use("/api/servicios", serviciosRoutes);
app.use("/api/turnos", turnosRoutes);

// Ruta base de prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
