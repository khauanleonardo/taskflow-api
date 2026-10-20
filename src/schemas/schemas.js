const schemas = {
  // Passo 3 (Slide 16): Schema do ID na URL e FKs
  id: {
    id: { obrigatorio: true, tipo: 'inteiro' },
  },

  // Passo 3 (Slide 16): Schema da tarefa com idprioridade como inteiro
  tarefa: {
    texto: { obrigatorio: true, tipo: 'string' },
    coluna: {
      obrigatorio: true,
      tipo: 'string',
      enum: ['afazer', 'andamento', 'concluido']
    },
    usuario_id: { obrigatorio: true, tipo: 'inteiro' },
    projeto_id: { obrigatorio: true, tipo: 'inteiro' },
    idprioridade: { obrigatorio: true, tipo: 'inteiro' },
  },

  // Schema de prioridade
  prioridade: {
    nome: { obrigatorio: true, tipo: 'string', minLength: 3 },
  },

  // Passo 6 (Slide 21): Schema de usuário
  usuario: {
    nome: { obrigatorio: true, tipo: 'string', minLength: 3 },
    email: { obrigatorio: true, tipo: 'string', formato: 'email' },
    senha: { obrigatorio: true, tipo: 'string', minLength: 6 },
  },

  // Slide 7 e 21: Schema de projeto
  projeto: {
    nome: { obrigatorio: true, tipo: 'string' },
    descricao: { obrigatorio: false, tipo: 'string', maxLength: 200 },
  },

  // Slide 24: Desafio de query string
  filtroTarefas: {
    usuarioId: { obrigatorio: false, tipo: 'inteiro' },
  },

  // Schema de login
  login: {
    email: { obrigatorio: true, tipo: 'string', formato: 'email' },
    senha: { obrigatorio: true, tipo: 'string' },
  },
};

module.exports = schemas;
