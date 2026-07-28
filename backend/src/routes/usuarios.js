const express = require("express");
const router = express.Router();
const pool = require("../db");

// NOTA DE SEGURIDAD: para simplificar el prototipo académico, las contraseñas
// se comparan en texto plano. En una versión de producción real se debe usar
// una librería como bcrypt para almacenar y verificar contraseñas cifradas.

// POST /api/usuarios/registro
router.post("/registro", async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: "nombre, correo y contrasena son requeridos" });
  }
  try {
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena)
       VALUES ($1, $2, $3) RETURNING id, nombre, correo, rol`,
      [nombre, correo, contrasena]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Ese correo ya está registrado" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

// POST /api/usuarios/login
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const resultado = await pool.query(
      "SELECT id, nombre, correo, rol FROM usuarios WHERE correo = $1 AND contrasena = $2",
      [correo, contrasena]
    );
    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

module.exports = router;
