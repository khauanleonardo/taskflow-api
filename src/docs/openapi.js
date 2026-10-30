// Documento OpenAPI 3.0.3 do TaskFlow (Dia 9).
// Cada recurso tem seu arquivo .docs.js; aqui juntamos tudo com spread.
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
    description: 'API do TaskFlow · SENAI CTGAS-ER. Para rotas protegidas, clique em Authorize e cole só o token JWT (sem a palavra Bearer).'
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local' },
    // Troque pela URL da sua API na Vercel
    { url: 'https://SEU-PROJETO.vercel.app', description: 'Vercel' }
  ],
  // Vale para todas as rotas. As que não pedem token têm security: [] no próprio .docs.js
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
    // Nomes únicos por recurso: dois schemas com o mesmo nome se sobrescrevem
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
