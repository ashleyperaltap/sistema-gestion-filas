const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "dpg-d9t517afngtc73cpsi30-a",
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("error", (err) => {
  console.error("Error inesperado en el cliente de PG:", err);
});

module.exports = pool;
