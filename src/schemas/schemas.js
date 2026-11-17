const schemas = {
  id: { id: { obrigatorio: true, tipo: 'inteiro' } },

  // Criação: os relacionamentos e a prioridade são obrigatórios conforme os slides.
  tarefa: {
    texto: { obrigatorio: true, tipo: 'string' },
    coluna: { obrigatorio: true, tipo: 'string', enum: ['afazer', 'andamento', 'concluido'] },
    usuario_id: { obrigatorio: true, tipo: 'inteiro' },
    projeto_id: { obrigatorio: true, tipo: 'inteiro' },
    idprioridade: { obrigatorio: true, tipo: 'inteiro' },
    prioridade: { obrigatorio: false, tipo: 'string' },
    descricao: { obrigatorio: false, tipo: 'string' },
  },

  // Atualização parcial: permite mover apenas a coluna sem enviar dados repetidos.
  tarefaAtualizacao: {
    texto: { obrigatorio: false, tipo: 'string' },
    coluna: { obrigatorio: false, tipo: 'string', enum: ['afazer', 'andamento', 'concluido'] },
    usuario_id: { obrigatorio: false, tipo: 'inteiro' },
    projeto_id: { obrigatorio: false, tipo: 'inteiro' },
    idprioridade: { obrigatorio: false, tipo: 'inteiro' },
    prioridade: { obrigatorio: false, tipo: 'string' },
    descricao: { obrigatorio: false, tipo: 'string' },
  },

  prioridade: { nome: { obrigatorio: true, tipo: 'string', minLength: 3 } },
  usuario: {
    nome: { obrigatorio: true, tipo: 'string', minLength: 3 },
    email: { obrigatorio: true, tipo: 'string', formato: 'email' },
    senha: { obrigatorio: true, tipo: 'string', minLength: 6 },
  },
  usuarioAtualizacao: {
    nome: { obrigatorio: false, tipo: 'string', minLength: 3 },
    email: { obrigatorio: false, tipo: 'string', formato: 'email' },
    cargo: { obrigatorio: false, tipo: 'string' },
    nivel_acesso: { obrigatorio: false, tipo: 'string' },
    senha: { obrigatorio: false, tipo: 'string', minLength: 6 },
  },
  projeto: {
    nome: { obrigatorio: true, tipo: 'string' },
    descricao: { obrigatorio: false, tipo: 'string', maxLength: 200 },
  },
  filtroTarefas: { usuarioId: { obrigatorio: false, tipo: 'inteiro' } },
  login: {
    email: { obrigatorio: true, tipo: 'string', formato: 'email' },
    senha: { obrigatorio: true, tipo: 'string' },
  },
};
module.exports = schemas;
