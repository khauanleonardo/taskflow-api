require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Middlewares da Semana 11
const logger = require('./src/middlewares/logger');
const temporizador = require('./src/middlewares/temporizador');

// Rotas MVC
const authRoutes = require('./src/routes/auth.routes');
const tarefasRoutes = require('./src/routes/tarefas.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const projetosRoutes = require('./src/routes/projetos.routes');

const app = express();
const PORT = process.env.PORT || process.env.PORTA || 3001;

// CORS: aceita localhost, Codespaces e Vercel
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('github.dev') || 
        origin.includes('app.github.dev') || 
        origin.includes('vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Pipeline de middlewares globais
if (typeof logger === 'function') app.use(logger);
if (typeof temporizador === 'function') app.use(temporizador);

// Rota de boas-vindas / health check
app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow online!', versao: '1.0.0' });
});

// Montagem das rotas
app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);

// Tratamento de rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento de erro global (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

// Inicia a porta localmente (fora da Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor TaskFlow rodando na porta ${PORT}`);
  });
}

// Obrigatório para a Vercel funcionar como Serverless
module.exports = app;
