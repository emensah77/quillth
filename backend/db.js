const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.SUPABASE_DB_USER,
    host: process.env.SUPABASE_DB_HOST,
    database: process.env.SUPABASE_DB_NAME,
    password: process.env.SUPABASE_DB_PASSWORD,    
    port: 5432, // Standard port for PostgreSQL
    ssl: {
    rejectUnauthorized: false // For secure connection (required for some configurations)
  }
});

module.exports = pool;
