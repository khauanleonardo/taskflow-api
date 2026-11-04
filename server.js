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
const PORT = process.env.PORT || process.env.PORTA || 3001;

// Configuração flexível de CORS (Dia 10 - Slide 17)
// Aceita a URL do front na Vercel cadastrada em CORS_ORIGIN e também o localhost
const origensPermitidas = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas sem origin (Postman, Swagger local) ou domínios da Vercel/localhost
    if (!origin || origensPermitidas.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use(express.json());

// Log de requisição
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Rota raiz de teste (Dia 10 - Teste 1 do Slide 18) ───────────────────────
app.get('/', (req, res) => {
  res.json({ mensagem: 'TaskFlow API funcionando!' });
});

// Documentação Swagger com assets via CDN jsDelivr (Dia 10 - Passo 3)
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

// Rota 404: nenhuma rota atendeu
app.use((req, res, next) => {
  const rota = `${req.method} ${req.url}`;
  return next(criarErro(404, `Rota ${rota} não encontrada`));
});

// Middleware central de tratamento de erros (SEMPRE POR ÚLTIMO)
app.use(tratarErros);

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
  console.log(`📖 Documentação Swagger em http://localhost:${PORT}/docs`);
});

// Teste opcional assíncrono do banco
db.query('SELECT NOW()')
  .then((res) => {
    console.log(`Banco conectado com sucesso: ${res.rows[0].now.toISOString()}`);
  })
  .catch((err) => {
    console.warn('Aviso na conexão direta pg:', err.message);
  });

module.exports = app;
