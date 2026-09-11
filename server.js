require('dotenv').config();

const express = require('express');
const cors = require('cors');

const logger = require('./src/middlewares/logger');
const validarContentType = require('./src/middlewares/validarContentType');
const temporizador = require('./src/middlewares/temporizador');

const authRoutes = require('./src/routes/auth.routes');
const tarefasRoutes = require('./src/routes/tarefas.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const projetosRoutes = require('./src/routes/projetos.routes');

const app = express();
const PORTA = process.env.PORTA || 3001;

// 1. CORS — Primeiro Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// 2. Middlewares Globais
app.use(express.json());
app.use(validarContentType);
app.use(logger);
app.use(temporizador);

// 3. Rotas Públicas e da API
app.get('/', (req, res) => {
  res.json({ status: 'Online', mensagem: 'API TaskFlow rodando!' });
});

app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);

// 4. Tratamento de Rota Não Encontrada (404)
app.use((req, res) => {
  res.status(404).json({ erro: 'Não encontrada' });
});

app.listen(PORTA, () => {
  console.log(`Servidor TaskFlow rodando na porta ${PORTA}`);
});