const { json, parametroId } = require('./comum');

// Projetos: as rotas não pedem token hoje (security: [])
const paths = {
  '/projetos': {
    get: {
      tags: ['Projetos'],
      summary: 'Lista os projetos, em ordem de nome',
      security: [],
      responses: {
        '200': {
          description: 'Lista de projetos',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Projeto' } } } }
        }
      }
    },
    post: {
      tags: ['Projetos'],
      summary: 'Cria um projeto',
      security: [],
      requestBody: { required: true, content: json('ProjetoEntrada') },
      responses: {
        '201': { description: 'Projeto criado', content: json('Projeto') },
        '400': { description: 'Dados inválidos', content: json('Erro') }
      }
    }
  },

  '/projetos/{id}': {
    get: {
      tags: ['Projetos'],
      summary: 'Busca um projeto pelo id',
      security: [],
      parameters: [parametroId],
      responses: {
        '200': { description: 'Projeto encontrado', content: json('Projeto') },
        '400': { description: 'Id inválido', content: json('Erro') },
        '404': { description: 'Projeto não encontrado', content: json('Erro') }
      }
    },
    put: {
      tags: ['Projetos'],
      summary: 'Atualiza um projeto',
      security: [],
      parameters: [parametroId],
      requestBody: { required: true, content: json('ProjetoEntrada') },
      responses: {
        '200': { description: 'Projeto atualizado', content: json('Projeto') },
        '400': { description: 'Dados inválidos', content: json('Erro') },
        '404': { description: 'Projeto não encontrado', content: json('Erro') }
      }
    },
    delete: {
      tags: ['Projetos'],
      summary: 'Exclui um projeto (só se não tiver tarefas)',
      security: [],
      parameters: [parametroId],
      responses: {
        '204': { description: 'Projeto excluído' },
        '400': { description: 'Id inválido', content: json('Erro') },
        '404': { description: 'Projeto não encontrado', content: json('Erro') },
        '409': { description: 'Projeto tem tarefas associadas', content: json('Erro') }
      }
    }
  },

  '/projetos/{id}/resumo': {
    get: {
      tags: ['Projetos'],
      summary: 'Resumo do projeto: total de tarefas e percentual concluído',
      security: [],
      parameters: [parametroId],
      responses: {
        '200': { description: 'Resumo do projeto', content: json('ProjetoResumo') },
        '400': { description: 'Id inválido', content: json('Erro') },
        '404': { description: 'Projeto não encontrado', content: json('Erro') }
      }
    }
  }
};

const schemas = {
  Projeto: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nome: { type: 'string', example: 'TaskFlow' },
      descricao: { type: 'string', nullable: true, example: 'Projeto da disciplina' },
      usuario_id: { type: 'integer', example: 1 },
      criado_em: { type: 'string', format: 'date-time', nullable: true }
    }
  },
  ProjetoEntrada: {
    type: 'object',
    required: ['nome'],
    properties: {
      nome: { type: 'string', example: 'TaskFlow' },
      descricao: { type: 'string', maxLength: 200, example: 'Projeto da disciplina' }
    }
  },
  ProjetoResumo: {
    type: 'object',
    properties: {
      projeto: { type: 'string', example: 'TaskFlow' },
      totalTarefas: { type: 'integer', example: 4 },
      concluidas: { type: 'integer', example: 1 },
      percentualConcluido: { type: 'integer', example: 25 }
    }
  }
};

module.exports = { paths, schemas };
