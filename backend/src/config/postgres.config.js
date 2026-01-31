const { Pool } = require('pg')

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: process.env.POSTGRES_DB,
  password: "postgres",
  port: process.env.POSTGRES_PORT,
})

async function initPostgres() {
  const client = await pool.connect();
  
  //creating Apis table
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        rate_limit INTEGER NOT NULL,
        window_ms INTEGER NOT NULL,
        strategy VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
      `);
  }
  catch (error) {
    console.error("postgres database initialization error :", error)
    throw error;
  }
  finally {
    client.release()
  }
}

module.exports = { pool , initPostgres }