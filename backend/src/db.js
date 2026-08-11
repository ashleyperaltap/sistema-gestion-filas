const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://gestion_filas_db_user:L2WcdGfS4vwy6fpePBcx6wCkJsQHgKTx@dpg-d9t5l7afngtc73cpsi30-a/gestion_filas_db",
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("error", (err) => {
  console.error("Error inesperado en el cliente de PG:", err);
});

module.exports = pool;
