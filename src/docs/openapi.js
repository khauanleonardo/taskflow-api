// Documento OpenAPI 3.0.3 do TaskFlow (Dia 9)
// Junta de forma modular a documentação de cada recurso
const comum = require('./comum');
const auth = require('./auth.docs');
const tarefas = require('./tarefas.docs');
const prioridades = require('./prioridades.docs');
const projetos = require('./projetos.docs');
const usuarios = require('./usuarios.docs');

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'API do TaskFlow · SENAI CTGAS-ER. Para testar rotas protegidas, faça login em POST /auth/login, clique no botão Authorize no topo e cole o token JWT gerado.'
  },
  // O uso da URL relativa '/' resolve automaticamente tanto localhost quanto Vercel (UC14 Cap. 11.3)
  servers: [
    { url: '/', description: 'Este servidor' }
  ],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth' },
    { name: 'Tarefas' },
    { name: 'Prioridades' },
    { name: 'Projetos' },
    { name: 'Usuários' }
  ],
  paths: {
    ...auth.paths,
    ...tarefas.paths,
    ...prioridades.paths,
    ...projetos.paths,
    ...usuarios.paths
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ...comum.schemas,
      ...auth.schemas,
      ...tarefas.schemas,
      ...prioridades.schemas,
      ...projetos.schemas,
      ...usuarios.schemas
    }
  }
};
