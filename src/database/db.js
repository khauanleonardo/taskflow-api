const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                      // Máximo de conexões no pool
  idleTimeoutMillis: 30000,     // Mantém conexões abertas por 30 segundos
  connectionTimeoutMillis: 8000,// Limite de espera para conectar
  keepAlive: true               // Evita que a rede corte conexões ociosas
});

// Captura erros inesperados em clientes inativos do pool sem derrubar a API
pool.on('error', (err) => {
  console.error('⚠️ Erro inesperado no pool do PostgreSQL:', err.message);
});

module.exports = pool;
