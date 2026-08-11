const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://gestion_filas_db_user:L2WcdGfS4vwy6fpePBcx6wCkJsQHgKTx@dpg-d9t517afngtc73cpsi30-a.ohio-postgres.render.com/gestion_filas_db",
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
