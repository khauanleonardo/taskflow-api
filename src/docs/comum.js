// Peças usadas por todos os recursos (Dia 9, slide 17 e 19)

const schemas = {
  Erro: {
    type: 'object',
    properties: {
      erro: {
        type: 'object',
        properties: {
          mensagem: { type: 'string', example: 'Tarefa não encontrada' },
          detalhes: {
            type: 'array',
            items: { type: 'string' },
            example: ["O campo 'texto' é obrigatório"]
          }
        }
      }
    }
  }
};

// Atalho: content JSON apontando para um schema de components
const json = (nome) => ({
  'application/json': {
    schema: { $ref: `#/components/schemas/${nome}` }
  }
});

// Parâmetro {id} da URL: igual em tarefas, projetos, usuários e prioridades
const parametroId = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id numérico do registro',
  schema: { type: 'integer', example: 1 }
};

module.exports = { json, parametroId, schemas };
