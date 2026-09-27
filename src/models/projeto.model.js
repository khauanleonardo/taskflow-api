// src/models/projeto.model.js
let projetos = [
  { id: 1, nome: 'TaskFlow App', descricao: 'Sistema de gestão Kanban para equipes' },
  { id: 2, nome: 'Website Institucional', descricao: 'Landing page para apresentação do produto' }
];
let proximoId = 3;

const projetoModel = {
  listar() {
    return [...projetos];
  },

  buscarPorId(id) {
    return projetos.find((p) => p.id === Number(id)) || null;
  },

  criar({ nome, descricao }) {
    const novo = {
      id: proximoId++,
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : null
    };
    projetos.push(novo);
    return novo;
  },

  atualizar(id, { nome, descricao }) {
    const index = projetos.findIndex((p) => p.id === Number(id));
    if (index === -1) return null;

    if (nome !== undefined) projetos[index].nome = nome.trim();
    if (descricao !== undefined) projetos[index].descricao = descricao ? descricao.trim() : null;

    return projetos[index];
  },

  remover(id) {
    const index = projetos.findIndex((p) => p.id === Number(id));
    if (index === -1) return false;
    projetos.splice(index, 1);
    return true;
  }
};

module.exports = projetoModel;
