const { json, parametroId } = require('./comum');

// Usuários: as rotas não pedem token hoje (security: [])
// A senha entra no POST e no PUT, mas NUNCA volta na resposta
const paths = {
  '/usuarios': {
    get: {
      tags: ['Usuários'],
      summary: 'Lista os usuários',
      security: [],
      responses: {
        '200': {
          description: 'Lista de usuários',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } } }
        }
      }
    },
    post: {
      tags: ['Usuários'],
      summary: 'Cadastra um usuário',
      security: [],
      requestBody: { required: true, content: json('UsuarioEntrada') },
      responses: {
        '201': { description: 'Usuário criado (sem a senha)', content: json('Usuario') },
        '400': { description: 'Dados inválidos', content: json('Erro') },
        '409': { description: 'E-mail já cadastrado', content: json('Erro') }
      }
    }
  },

  '/usuarios/{id}': {
    get: {
      tags: ['Usuários'],
      summary: 'Busca um usuário pelo id',
      security: [],
      parameters: [parametroId],
      responses: {
        '200': { description: 'Usuário encontrado', content: json('Usuario') },
        '400': { description: 'Id inválido', content: json('Erro') },
        '404': { description: 'Usuário não encontrado', content: json('Erro') }
      }
    },
    put: {
      tags: ['Usuários'],
      summary: 'Atualiza um usuário',
      security: [],
      parameters: [parametroId],
      requestBody: { required: true, content: json('UsuarioEntrada') },
      responses: {
        '200': { description: 'Usuário atualizado (sem a senha)', content: json('Usuario') },
        '400': { description: 'Dados inválidos', content: json('Erro') },
        '404': { description: 'Usuário não encontrado', content: json('Erro') },
        '409': { description: 'E-mail já cadastrado', content: json('Erro') }
      }
    },
    delete: {
      tags: ['Usuários'],
      summary: 'Exclui um usuário (só se não tiver tarefas)',
      security: [],
      parameters: [parametroId],
      responses: {
        '204': { description: 'Usuário excluído' },
        '400': { description: 'Id inválido', content: json('Erro') },
        '404': { description: 'Usuário não encontrado', content: json('Erro') },
        '409': { description: 'Usuário tem tarefas vinculadas', content: json('Erro') }
      }
    }
  }
};

const schemas = {
  Usuario: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nome: { type: 'string', example: 'Ana Lima' },
      email: { type: 'string', format: 'email', example: 'ana@taskflow.com' },
      criado_em: { type: 'string', format: 'date-time', nullable: true }
    }
  },
  UsuarioEntrada: {
    type: 'object',
    required: ['nome', 'email', 'senha'],
    properties: {
      nome: { type: 'string', minLength: 3, example: 'Ana Lima' },
      email: { type: 'string', format: 'email', example: 'ana@taskflow.com' },
      senha: { type: 'string', minLength: 6, example: 'senha123' }
    }
  }
};

module.exports = { paths, schemas };
