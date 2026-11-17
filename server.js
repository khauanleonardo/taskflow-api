const dns = require('node:dns');
// Força resolução IPv4 primeiro, evitando timeouts em conexões IPv6 locais/roteadores
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const app = require('./app');
const db = require('./src/database/db');

const PORT = process.env.PORT || process.env.PORTA || 3001;

// Inicialização do servidor HTTP
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
  console.log(`📖 Documentação Swagger em http://localhost:${PORT}/docs`);
});

// Teste opcional assíncrono do banco
db.query('SELECT NOW()')
  .then((res) => {
    console.log(`Banco conectado com sucesso: ${res.rows[0].now.toISOString()}`);
  })
  .catch((err) => {
    console.warn('Aviso na conexão direta pg:', err.message);
  });
