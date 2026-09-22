require('dotenv').config();
const express = require('express');
const cors = require('cors');

const logger = require('./src/middlewares/logger');
const validarContentType = require('./src/middlewares/validarContentType');

// Rotas da aplicação
const authRoutes = require('./src/routes/auth.routes');
const tarefasRoutes = require('./src/routes/tarefas.routes');

const app = express();
const PORT = process.env.PORT || process.env.PORTA || 3001;

// 1. CORS liberado (permite tanto localhost quanto Vercel)
app.use(cors());

// 2. Parse do body JSON
app.use(express.json());

// 3. Middlewares globais de infraestrutura
app.use(validarContentType);
app.use(logger);

// 4. Rotas da aplicação
app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);

// 5. Rota 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// 6. Só inicia a porta se for executado diretamente no terminal local
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
