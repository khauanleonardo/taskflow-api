const { json, parametroId } = require('./comum');

// Prioridades: as rotas não pedem token (security: [])
const paths = {
  '/prioridades': {
    get: {
      tags: ['Prioridades'],
      summary: 'Lista as prioridades',
      security: [],
      responses: {
        '200': {
          description: 'Lista de prioridades',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Prioridade' } } } }
        }
      }
    },
    post: {
      tags: ['Prioridades'],
      summary: 'Cria uma prioridade',
      security: [],
      requestBody: { required: true, content: json('PrioridadeEntrada') },
      responses: {
        '201': { description: 'Prioridade criada', content: json('Prioridade') },
        '400': { description: 'Dados inválidos', content: json('Erro') }
      }
    }
  },

  '/prioridades/{id}': {
    get: {
      tags: ['Prioridades'],
      summary: 'Busca uma prioridade pelo id',
      security: [],
      parameters: [parametroId],
      responses: {
        '200': { description: 'Prioridade encontrada', content: json('Prioridade') },
        '400': { description: 'Id inválido', content: json('Erro') },
        '404': { description: 'Prioridade não encontrada', content: json('Erro') }
      }
    },
    put: {
      tags: ['Prioridades'],
      summary: 'Atualiza uma prioridade',
      security: [],
      parameters: [parametroId],
      requestBody: { required: true, content: json('PrioridadeEntrada') },
      responses: {
        '200': { description: 'Prioridade atualizada', content: json('Prioridade') },
        '400': { description: 'Dados inválidos', content: json('Erro') },
        '404': { description: 'Prioridade não encontrada', content: json('Erro') }
      }
    },
    delete: {
      tags: ['Prioridades'],
      summary: 'Exclui uma prioridade',
      security: [],
      parameters: [parametroId],
      responses: {
        '204': { description: 'Prioridade excluída' },
        '400': { description: 'Id inválido', content: json('Erro') },
        '404': { description: 'Prioridade não encontrada', content: json('Erro') }
      }
    }
  }
};

const schemas = {
  Prioridade: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 2 },
      nome: { type: 'string', example: 'Média' },
      descricao: { type: 'string', example: 'Médio' },
      cor: { type: 'string', example: '#F6C330' },
      ativo: { type: 'boolean', example: true }
    }
  },
  PrioridadeEntrada: {
    type: 'object',
    required: ['nome'],
    properties: {
      nome: { type: 'string', minLength: 3, example: 'Média' },
      descricao: { type: 'string', example: 'Médio' },
      cor: { type: 'string', example: '#F6C330' },
      ativo: { type: 'boolean', example: true }
    }
  }
};

module.exports = { paths, schemas };
