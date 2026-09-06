let tarefas = [
  {
    id: 1,
    texto: 'Configurar rotas e controllers da API',
    prioridade: 'alta',
    coluna: 'andamento',
    usuarioId: 1,
    projetoId: 1,
    concluidaEm: null
  }
];
let proximoId = 2;

module.exports = {
  listar: (filtros = {}) => {
    let resultado = tarefas;

    if (filtros.coluna) {
      resultado = resultado.filter(t => t.coluna === filtros.coluna);
    }
    if (filtros.usuarioId !== undefined && filtros.usuarioId !== null) {
      resultado = resultado.filter(t => t.usuarioId === filtros.usuarioId);
    }
    if (filtros.projetoId !== undefined && filtros.projetoId !== null) {
      resultado = resultado.filter(t => t.projetoId === filtros.projetoId);
    }

    return resultado;
  },

  listarPorProjeto: (projetoId) => tarefas.filter(t => t.projetoId === projetoId),

  listarPorUsuario: (usuarioId) => tarefas.filter(t => t.usuarioId === usuarioId),

  listarPorColuna: (coluna) => tarefas.filter(t => t.coluna === coluna),

  buscar: (id) => tarefas.find(t => t.id === id),

  adicionar: (dados) => {
    const nova = {
      id: proximoId++,
      texto: dados.texto,
      prioridade: dados.prioridade || 'baixa',
      coluna: dados.coluna || 'afazer',
      usuarioId: dados.usuarioId || null,
      projetoId: dados.projetoId || null,
      concluidaEm: dados.concluidaEm || null
    };
    tarefas.push(nova);
    return nova;
  },

  atualizar: (id, dados) => {
    const idx = tarefas.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tarefas[idx] = { ...tarefas[idx], ...dados, id };
    return tarefas[idx];
  },

  remover: (id) => {
    const idx = tarefas.findIndex(t => t.id === id);
    if (idx === -1) return null;
    return tarefas.splice(idx, 1)[0];
  }
};