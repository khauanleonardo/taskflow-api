const { json, parametroId } = require('./comum');

const paths = {
  '/tarefas': {
    get: {
      tags: ['Tarefas'],
      summary: 'Lista todas as tarefas',
      parameters: [
        {
          name: 'usuarioId', in: 'query', required: false,
          description: 'Filtra as tarefas de um usuário',
          schema: { type: 'integer', example: 1 }
        },
        {
          name: 'coluna', in: 'query', required: false,
          description: 'Filtra pela coluna do Kanban',
          schema: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] }
        }
      ],
      responses: {
        '200': {
          description: 'Lista de tarefas',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Tarefa' } } } }
        },
        '400': { description: 'Filtro inválido', content: json('Erro') },
        '401': { description: 'Token ausente ou inválido', content: json('Erro') }
      }
    },
    post: {
      tags: ['Tarefas'],
      summary: 'Cria uma tarefa',
      requestBody: { required: true, content: json('TarefaEntrada') },
      responses: {
        '201': { description: 'Tarefa criada', content: json('Tarefa') },
        '400': { description: 'Dados inválidos ou id de referência inexistente', content: json('Erro') },
        '401': { description: 'Token ausente ou inválido', content: json('Erro') }
      }
    }
  },

  '/tarefas/{id}': {
    get: {
      tags: ['Tarefas'],
      summary: 'Busca uma tarefa pelo id',
      parameters: [parametroId],
      responses: {
        '200': { description: 'Tarefa encontrada', content: json('Tarefa') },
        '400': { description: 'Id inválido', content: json('Erro') },
        '401': { description: 'Token ausente ou inválido', content: json('Erro') },
        '404': { description: 'Tarefa não encontrada', content: json('Erro') }
      }
    },
    put: {
      tags: ['Tarefas'],
      summary: 'Atualiza uma tarefa',
      parameters: [parametroId],
      requestBody: { required: true, content: json('TarefaEntrada') },
      responses: {
        '200': { description: 'Tarefa atualizada', content: json('Tarefa') },
        '400': { description: 'Dados inválidos ou id de referência inexistente', content: json('Erro') },
        '401': { description: 'Token ausente ou inválido', content: json('Erro') },
        '404': { description: 'Tarefa não encontrada', content: json('Erro') }
      }
    },
    delete: {
      tags: ['Tarefas'],
      summary: 'Exclui uma tarefa',
      parameters: [parametroId],
      responses: {
        '200': {
          description: 'Tarefa excluída',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mensagem: { type: 'string', example: 'Tarefa removida' },
                  tarefa: { $ref: '#/components/schemas/Tarefa' }
                }
              }
            }
          }
        },
        '400': { description: 'Id inválido', content: json('Erro') },
        '401': { description: 'Token ausente ou inválido', content: json('Erro') },
        '404': { description: 'Tarefa não encontrada', content: json('Erro') }
      }
    }
  },

  '/tarefas/{id}/avancar': {
    patch: {
      tags: ['Tarefas'],
      summary: 'Move a tarefa para a próxima coluna (afazer → andamento → concluido)',
      parameters: [parametroId],
      responses: {
        '200': { description: 'Tarefa movida', content: json('Tarefa') },
        '400': { description: 'Id inválido', content: json('Erro') },
        '401': { description: 'Token ausente ou inválido', content: json('Erro') },
        '404': { description: 'Tarefa não encontrada', content: json('Erro') }
      }
    }
  }
};

// Formato de SAÍDA: o que a API devolve
const schemas = {
  Tarefa: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      texto: { type: 'string', example: 'Revisar layout' },
      coluna: { type: 'string', enum: ['afazer', 'andamento', 'concluido'], example: 'afazer' },
      ordem: { type: 'integer', example: 0 },
      descricao: { type: 'string', example: 'Revisar as telas do app' },
      usuario_id: { type: 'integer', example: 1 },
      usuario: { type: 'string', example: 'Ana Lima' },
      projeto_id: { type: 'integer', example: 1 },
      projeto: { type: 'string', example: 'TaskFlow' },
      idprioridade: { type: 'integer', example: 2 },
      prioridade: { type: 'string', description: 'Texto da prioridade (descrição)', example: 'Médio' },
      criado_em: { type: 'string', format: 'date-time', nullable: true },
      iniciada_em: { type: 'string', format: 'date-time', nullable: true },
      concluida_em: { type: 'string', format: 'date-time', nullable: true }
    }
  },

  // Formato de ENTRADA: o que o cliente envia (sem id, criado_em, usuario, projeto)
  TarefaEntrada: {
    type: 'object',
    required: ['texto', 'coluna', 'usuario_id', 'projeto_id', 'idprioridade'],
    properties: {
      texto: { type: 'string', example: 'Revisar layout' },
      descricao: { type: 'string', example: 'Revisar as telas do app' },
      coluna: { type: 'string', enum: ['afazer', 'andamento', 'concluido'], example: 'afazer' },
      ordem: { type: 'integer', example: 0 },
      usuario_id: { type: 'integer', example: 1 },
      projeto_id: { type: 'integer', example: 1 },
      idprioridade: { type: 'integer', example: 2, description: '1 Baixa, 2 Média, 3 Alta, 4 Urgente' }
    }
  }
};

module.exports = { paths, schemas };