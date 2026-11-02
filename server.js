const dns = require('node:dns');
// Força resolução IPv4 primeiro, evitando timeouts em conexões IPv6 locais/roteadores
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const db = require('./src/database/db');
const criarErro = require('./src/utils/criarErro');
const tratarErros = require('./src/middlewares/erro.middleware');
const openapi = require('./src/docs/openapi');

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

// Documentação Swagger com assets via CDN jsDelivr (funciona na Vercel e local - Capítulo 11.2)
const SWAGGER_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  customCssUrl: `${SWAGGER_CDN}/swagger-ui.css`,
  customJs: [
    `${SWAGGER_CDN}/swagger-ui-bundle.js`,
    `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`,
  ],
}));

// Registro das rotas principais
app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);
app.use('/prioridades', prioridadesRoutes);

// Rota 404: nenhuma rota atendeu (Slide 22). Fica depois de todas as rotas
app.use((req, res, next) => {
  const rota = `${req.method} ${req.url}`;
  return next(criarErro(404, `Rota ${rota} não encontrada`));
});

// Middleware central de tratamento de erros (SEMPRE POR ÚLTIMO)
app.use(tratarErros);

// Teste de conexão e inicialização
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
  console.log(`📖 Documentação Swagger em http://localhost:${PORT}/docs`);
});

// Teste opcional assíncrono do banco sem bloquear a inicialização
db.query('SELECT NOW()')
  .then((res) => {
    console.log(`Banco conectado com sucesso: ${res.rows[0].now.toISOString()}`);
  })
  .catch((err) => {
    console.warn('Aviso na conexão direta pg:', err.message);
  });

module.exports = app;
