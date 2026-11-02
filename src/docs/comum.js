// Peças compartilhadas por todos os recursos OpenAPI (UC14 - Dia 9)

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

// Atalho para resposta com objeto único
const json = (nome) => ({
  'application/json': {
    schema: { $ref: `#/components/schemas/${nome}` }
  }
});

// Atalho para resposta com array/lista de objetos (UC14 Cap. 8.5)
const jsonLista = (nome) => ({
  'application/json': {
    schema: {
      type: 'array',
      items: { $ref: `#/components/schemas/${nome}` }
    }
  }
});

// Parâmetro {id} padrão para a URL
const parametroId = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id numérico do registro',
  schema: { type: 'integer', example: 1 }
};

module.exports = { json, jsonLista, parametroId, schemas };
