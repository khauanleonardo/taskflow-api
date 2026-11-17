require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Middlewares
let logger;
try { logger = require('./src/middlewares/logger'); } catch (e) {}
let temporizador;
try { temporizador = require('./src/middlewares/temporizador'); } catch (e) {}
const validarContentType = require('./src/middlewares/validarContentType');
const autenticar = require('./src/middlewares/autenticar');
const criarErro = require('./src/utils/criarErro');
const tratarErros = require('./src/middlewares/erro.middleware');

// Swagger (se configurado)
let swaggerUi, openapi;
try {
  swaggerUi = require('swagger-ui-express');
  openapi = require('./src/docs/openapi');
} catch (e) {}

// Rotas da aplicação
const tarefasRoutes = require('./src/routes/tarefas.routes');
const prioridadesRoutes = require('./src/routes/prioridades.routes');
let usuariosRoutes;
try { usuariosRoutes = require('./src/routes/usuarios.routes'); } catch (e) {}
let projetosRoutes;
try { projetosRoutes = require('./src/routes/projetos.routes'); } catch (e) {}
let authRoutes;
try { authRoutes = require('./src/routes/auth.routes'); } catch (e) {}

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(validarContentType);
if (logger) app.use(logger);
if (temporizador) app.use(temporizador);

// Rota raiz (Slide 29)
app.get('/', (req, res) => {
  res.json({ mensagem: 'TaskFlow API funcionando!' });
});

// Documentação Swagger
if (swaggerUi && openapi) {
  const SWAGGER_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customCssUrl: `${SWAGGER_CDN}/swagger-ui.css`,
      customJs: [
        `${SWAGGER_CDN}/swagger-ui-bundle.js`,
        `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`,
      ],
    })
  );
}

// Registro de rotas da aplicação
if (authRoutes) app.use('/auth', authRoutes);
app.use('/tarefas', autenticar, tarefasRoutes);
app.use('/prioridades', autenticar, prioridadesRoutes);
if (usuariosRoutes) app.use('/usuarios', autenticar, usuariosRoutes);
if (projetosRoutes) app.use('/projetos', autenticar, projetosRoutes);

// Rota 404 genérica (Slide 30)
app.use((req, res, next) => {
  next(criarErro(404, 'Rota não encontrada'));
});

// Middleware central de tratamento de erros (SEMPRE POR ÚLTIMO)
app.use(tratarErros);

module.exports = app;
