require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/database/db');
const criarErro = require('./src/utils/criarErro');
const tratarErros = require('./src/middlewares/erro.middleware');

const tarefasRoutes = require('./src/routes/tarefas.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Log de requisição
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas da aplicação
app.use('/tarefas', tarefasRoutes);

// Rota raiz de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow online' });
});

// 1) Rota 404: nenhuma rota atendeu? Então não existe (Slide 22)
app.use((req, res, next) => {
  const rota = `${req.method} ${req.url}`;
  throw criarErro(404, `Rota ${rota} não encontrada`);
});

// 2) Middleware central de tratamento de erros (SEMPRE POR ÚLTIMO)
app.use(tratarErros);

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
