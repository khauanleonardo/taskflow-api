const prisma = require('../database/prisma');

function formatarPrioridade(p) {
  if (!p) return null;
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao || p.nome,
    cor: p.cor || (p.id === 4 ? '#A855F7' : p.id === 3 ? '#FF5065' : p.id === 1 ? '#41D686' : '#F6C330'),
    ativo: p.ativo ?? true
  };
}

const prioridadeModel = {
  async listar() {
    const prioridades = await prisma.prioridades.findMany({
      orderBy: { id: 'asc' }
    });
    return prioridades.map(formatarPrioridade);
  },

  async buscarPorId(id) {
    const p = await prisma.prioridades.findUnique({
      where: { id: Number(id) }
    });
    return formatarPrioridade(p);
  },

  async criar(dados) {
    const nome = dados.nome || dados.descricao || 'Normal';
    const nova = await prisma.prioridades.create({
      data: {
        nome,
        descricao: dados.descricao || nome,
        cor: dados.cor || '#A855F7',
        ativo: dados.ativo ?? true
      }
    });
    return formatarPrioridade(nova);
  },

  async atualizar(id, dados) {
    const data = {};
    if (dados.nome !== undefined) data.nome = dados.nome;
    if (dados.descricao !== undefined) data.descricao = dados.descricao;
    if (dados.cor !== undefined) data.cor = dados.cor;
    if (dados.ativo !== undefined) data.ativo = dados.ativo;

    const atualizada = await prisma.prioridades.update({
      where: { id: Number(id) },
      data
    });
    return formatarPrioridade(atualizada);
  },

  async remover(id) {
    await prisma.prioridades.delete({
      where: { id: Number(id) }
    });
    return true;
  }
};

module.exports = prioridadeModel;
