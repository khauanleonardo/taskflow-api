require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/database/db');
const criarErro = require('./src/utils/criarErro');
const manipuladorDeErros = require('./src/middlewares/erro.middleware');

const tarefasRoutes = require('./src/routes/tarefas.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Log simples de requisição
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/tarefas', tarefasRoutes);

// Rota raiz para conferência
app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow online' });
});

// 404 para qualquer rota que não existir
app.use((req, res, next) => {
  next(criarErro(`Rota ${req.method} ${req.originalUrl} não encontrada`, 404));
});

// Middleware central de tratamento de erros (SEMPRE POR ÚLTIMO)
app.use(manipuladorDeErros);

// Teste de conexão com o banco e inicialização do servidor
db.query('SELECT NOW()')
  .then((res) => {
    console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
    console.log(`Banco conectado: ${res.rows[0].now.toISOString()}`);
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no banco PostgreSQL:', err.message);
  });

app.listen(PORT);
