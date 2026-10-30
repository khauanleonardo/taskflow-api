const prisma = require('../database/prisma');

module.exports = {
  // Dia 7: findMany, ordenado por nome
  listar: (usuarioId) => prisma.projetos.findMany({
    where: usuarioId ? { usuario_id: Number(usuarioId) } : undefined,
    orderBy: { nome: 'asc' }
  }),

  // Dia 7: findUnique pelo id
  buscar: (id) => prisma.projetos.findUnique({
    where: { id: Number(id) }
  }),

  // Dia 8, exercício: create com data
  adicionar: ({ nome, descricao, usuarioId }) => prisma.projetos.create({
    data: {
      nome,
      descricao: descricao || null,
      usuario_id: Number(usuarioId || 1)
    }
  }),

  // Dia 8, exercício: update; P2025 vira null (controller responde 404)
  atualizar: async (id, { nome, descricao }) => {
    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;

    try {
      return await prisma.projetos.update({
        where: { id: Number(id) },
        data
      });
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      throw erro;
    }
  },

  // Dia 8, exercício: delete; P2025 vira null (controller responde 404)
  remover: async (id) => {
    try {
      return await prisma.projetos.delete({
        where: { id: Number(id) }
      });
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      throw erro;
    }
  }
};
