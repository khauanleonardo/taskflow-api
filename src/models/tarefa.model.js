let tarefas = [
  { id: 1, texto: 'Estudar Node.js', prioridade: 'alta', coluna: 'afazer', usuarioId: 1 },
  { id: 2, texto: 'Configurar CORS', prioridade: 'media', coluna: 'andamento', usuarioId: 1 }
];

const tarefaModel = {
  listar: () => tarefas,
  buscarPorId: (id) => tarefas.find(t => t.id === Number(id)),
  criar: (dados) => {
    const nova = { id: tarefas.length ? Math.max(...tarefas.map(t => t.id)) + 1 : 1, ...dados };
    tarefas.push(nova);
    return nova;
  },
  atualizar: (id, dados) => {
    const idx = tarefas.findIndex(t => t.id === Number(id));
    if (idx === -1) return null;
    tarefas[idx] = { ...tarefas[idx], ...dados };
    return tarefas[idx];
  },
  remover: (id) => {
    const idx = tarefas.findIndex(t => t.id === Number(id));
    if (idx === -1) return false;
    tarefas.splice(idx, 1);
    return true;
  }
};

module.exports = tarefaModel;