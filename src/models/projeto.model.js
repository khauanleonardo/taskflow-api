const prisma = require('../database/prisma');
const pool = require('../database/db');

module.exports = {
  listar: async (usuarioId) => {
    try {
      const busca = prisma.projetos.findMany({
        where: usuarioId ? { usuario_id: Number(usuarioId) } : undefined,
        orderBy: { nome: 'asc' }
      });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000));
      return await Promise.race([busca, timeout]);
    } catch (e) {
      const res = await pool.query('SELECT * FROM projetos ORDER BY nome ASC');
      return res.rows;
    }
  },

  buscar: async (id) => {
    try {
      return await prisma.projetos.findUnique({ where: { id: Number(id) } });
    } catch (e) {
      const res = await pool.query('SELECT * FROM projetos WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    }
  },

  adicionar: async ({ nome, descricao, usuarioId }) => {
    try {
      return await prisma.projetos.create({
        data: {
          nome,
          descricao: descricao || null,
          usuario_id: Number(usuarioId || 1)
        }
      });
    } catch (e) {
      const res = await pool.query(
        'INSERT INTO projetos (nome, descricao, usuario_id) VALUES ($1, $2, $3) RETURNING *',
        [nome, descricao || null, Number(usuarioId || 1)]
      );
      return res.rows[0];
    }
  },

  atualizar: async (id, { nome, descricao }) => {
    try {
      return await prisma.projetos.update({
        where: { id: Number(id) },
        data: { nome, descricao }
      });
    } catch (e) {
      const res = await pool.query(
        'UPDATE projetos SET nome = COALESCE($1, nome), descricao = COALESCE($2, descricao) WHERE id = $3 RETURNING *',
        [nome, descricao, Number(id)]
      );
      return res.rows[0] || null;
    }
  },

  remover: async (id) => {
    try {
      return await prisma.projetos.delete({ where: { id: Number(id) } });
    } catch (e) {
      const res = await pool.query('DELETE FROM projetos WHERE id = $1 RETURNING *', [Number(id)]);
      return res.rows[0] || null;
    }
  }
};
