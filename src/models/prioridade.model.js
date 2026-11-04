const prisma = require('../database/prisma');
const pool = require('../database/db');

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
    try {
      const busca = prisma.prioridades.findMany({ orderBy: { id: 'asc' } });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000));
      const prioridades = await Promise.race([busca, timeout]);
      return prioridades.map(formatarPrioridade);
    } catch (e) {
      const res = await pool.query('SELECT * FROM prioridades ORDER BY id ASC');
      return res.rows.map(formatarPrioridade);
    }
  },

  async buscarPorId(id) {
    try {
      const p = await prisma.prioridades.findUnique({ where: { id: Number(id) } });
      return formatarPrioridade(p);
    } catch (e) {
      const res = await pool.query('SELECT * FROM prioridades WHERE id = $1', [Number(id)]);
      return formatarPrioridade(res.rows[0]);
    }
  },

  async criar(dados) {
    const nome = dados.nome || dados.descricao || 'Normal';
    try {
      const nova = await prisma.prioridades.create({
        data: {
          nome,
          descricao: dados.descricao || nome,
          cor: dados.cor || '#A855F7',
          ativo: dados.ativo ?? true
        }
      });
      return formatarPrioridade(nova);
    } catch (e) {
      const res = await pool.query(
        'INSERT INTO prioridades (nome, descricao, cor, ativo) VALUES ($1, $2, $3, $4) RETURNING *',
        [nome, dados.descricao || nome, dados.cor || '#A855F7', dados.ativo ?? true]
      );
      return formatarPrioridade(res.rows[0]);
    }
  },

  async atualizar(id, dados) {
    const data = {};
    if (dados.nome !== undefined) data.nome = dados.nome;
    if (dados.descricao !== undefined) data.descricao = dados.descricao;
    if (dados.cor !== undefined) data.cor = dados.cor;
    if (dados.ativo !== undefined) data.ativo = dados.ativo;

    try {
      const atualizada = await prisma.prioridades.update({
        where: { id: Number(id) },
        data
      });
      return formatarPrioridade(atualizada);
    } catch (e) {
      const res = await pool.query(
        'UPDATE prioridades SET nome = COALESCE($1, nome), descricao = COALESCE($2, descricao), cor = COALESCE($3, cor) WHERE id = $4 RETURNING *',
        [data.nome, data.descricao, data.cor, Number(id)]
      );
      return formatarPrioridade(res.rows[0]);
    }
  },

  async remover(id) {
    try {
      await prisma.prioridades.delete({ where: { id: Number(id) } });
    } catch (e) {
      await pool.query('DELETE FROM prioridades WHERE id = $1', [Number(id)]);
    }
    return true;
  }
};

module.exports = prioridadeModel;
