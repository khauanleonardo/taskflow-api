const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10, // máximo de 10 conexões simultâneas
  idleTimeoutMillis: 30000, // encerra conexões inativas após 30s para evitar sockets mortos no Neon
  connectionTimeoutMillis: 10000 // tempo limite de 10s para abrir nova conexão
});

// Evita que o Node trave caso o Neon encerre uma conexão em segundo plano
pool.on('error', (err) => {
  console.warn('Aviso de conexão do banco (Neon):', err.message);
});

module.exports = pool;
