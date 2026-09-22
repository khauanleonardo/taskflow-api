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

// 1. CORS — lê a origem do .env ou libera localhost:5173
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// 2. Parse do body JSON
app.use(express.json());

// 3. Middlewares globais de infraestrutura (na ordem da apostila)
app.use(validarContentType);
app.use(logger);

// 4. Rotas da aplicação
app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);

// 5. Rota 404 — sempre por último para capturar endpoints inexistentes
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
});
