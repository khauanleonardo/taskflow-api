require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/database/db');
const criarErro = require('./src/utils/criarErro');
const tratarErros = require('./src/middlewares/erro.middleware');

// Rotas da aplicação
const tarefasRoutes = require('./src/routes/tarefas.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const projetosRoutes = require('./src/routes/projetos.routes');
const prioridadesRoutes = require('./src/routes/prioridades.routes');
const authRoutes = require('./src/routes/auth.routes');

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

// Rota raiz de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow online' });
});

// Registro das rotas principais
app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);
app.use('/prioridades', prioridadesRoutes);

// Rota 404: nenhuma rota atendeu (Slide 22)
app.use((req, res, next) => {
  const rota = `${req.method} ${req.url}`;
  return next(criarErro(404, `Rota ${rota} não encontrada`));
});

// Middleware central de tratamento de erros (SEMPRE POR ÚLTIMO)
app.use(tratarErros);

// Teste de conexão com o banco e inicialização
db.query('SELECT NOW()')
  .then((res) => {
    console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
    console.log(`Banco conectado: ${res.rows[0].now.toISOString()}`);
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no banco PostgreSQL:', err.message);
  });

app.listen(PORT);
