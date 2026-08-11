const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas
const serviciosRoutes = require("./routes/servicios");
const turnosRoutes = require("./routes/turnos");

// Rutas con /api
app.use("/api/servicios", serviciosRoutes);
app.use("/api/turnos", turnosRoutes);

// Rutas directas (por si Vercel las llama sin /api)
app.use("/servicios", serviciosRoutes);
app.use("/turnos", turnosRoutes);

app.get("/", (req, res) => {
  res.send("Backend activo");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
