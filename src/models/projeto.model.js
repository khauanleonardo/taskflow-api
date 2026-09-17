let projetos = [
  { id: 1, nome: 'TaskFlow API', descricao: 'Backend em Express' }
];

const projetoModel = {
  listar: () => projetos,
  buscarPorId: (id) => projetos.find(p => p.id === Number(id)),
  criar: (dados) => {
    const novo = { id: projetos.length ? Math.max(...projetos.map(p => p.id)) + 1 : 1, ...dados };
    projetos.push(novo);
    return novo;
  },
  atualizar: (id, dados) => {
    const idx = projetos.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    projetos[idx] = { ...projetos[idx], ...dados };
    return projetos[idx];
  },
  remover: (id) => {
    const idx = projetos.findIndex(p => p.id === Number(id));
    if (idx === -1) return false;
    projetos.splice(idx, 1);
    return true;
  }
};

module.exports = projetoModel;