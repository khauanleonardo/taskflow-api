require('dotenv').config();

const express = require('express');
const cors = require('cors');

const logger = require('./src/middlewares/logger');
const validarContentType = require('./src/middlewares/validarContentType');
const temporizador = require('./src/middlewares/temporizador');
const autenticar = require('./src/middlewares/autenticar');

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

// 3. Rota Pública e Auth
app.get('/', (req, res) => {
  res.json({ status: 'Online', mensagem: 'API TaskFlow rodando!' });
});

app.use('/auth', authRoutes);

// 4. Rotas Protegidas por JWT (Exigem Token)
app.use('/tarefas', autenticar, tarefasRoutes);
app.use('/usuarios', autenticar, usuariosRoutes);
app.use('/projetos', autenticar, projetosRoutes);

// 5. Tratamento de Rota Não Encontrada (404)
app.use((req, res) => {
  res.status(404).json({ erro: 'Não encontrada' });
});

app.listen(PORTA, () => {
  console.log(`Servidor TaskFlow rodando na porta ${PORTA}`);
});