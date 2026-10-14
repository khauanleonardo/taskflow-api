require('dotenv').config();
const express = require('express');
const cors = require('cors');

const logger = require('./src/middlewares/logger');
const validarContentType = require('./src/middlewares/validarContentType');
const pool = require('./src/database/db');

// Teste de conexão com o banco Neon (Slide 14 do Dia 9)
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Erro ao conectar ao banco:', err.message);
  else console.log('Banco conectado:', res.rows[0].now);
});

// Rotas da aplicação
const authRoutes = require('./src/routes/auth.routes');
const tarefasRoutes = require('./src/routes/tarefas.routes');

const app = express();
const PORT = process.env.PORT || process.env.PORTA || 3001;

app.use(cors());
app.use(express.json());
app.use(validarContentType);
app.use(logger);

app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
