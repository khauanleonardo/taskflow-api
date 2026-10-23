const prisma = require('../database/prisma');
const pool = require('../database/db');

module.exports = {
  // EXERCÍCIO SLIDE 28: findMany ordenado por nome
  listar: async (usuarioId) => {
    try {
      const where = usuarioId ? { usuario_id: Number(usuarioId) } : undefined;
      return await prisma.projetos.findMany({
        where,
        orderBy: { nome: 'asc' }
      });
    } catch (err) {
      if (usuarioId) {
        const result = await pool.query('SELECT * FROM projetos WHERE usuario_id = $1 ORDER BY nome ASC', [Number(usuarioId)]);
        return result.rows;
      }
      const result = await pool.query('SELECT * FROM projetos ORDER BY nome ASC');
      return result.rows;
    }
  },

  // EXERCÍCIO SLIDE 28: findUnique pelo id
  buscar: async (id) => {
    try {
      return await prisma.projetos.findUnique({
        where: { id: Number(id) }
      });
    } catch (err) {
      const result = await pool.query('SELECT * FROM projetos WHERE id = $1', [Number(id)]);
      return result.rows[0] || null;
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
    } catch (err) {
      const result = await pool.query(
        'INSERT INTO projetos (nome, descricao, usuario_id) VALUES ($1, $2, $3) RETURNING *',
        [nome, descricao || null, Number(usuarioId || 1)]
      );
      return result.rows[0];
    }
  },

  atualizar: async (id, dados) => {
    const { nome, descricao } = dados;
    try {
      return await prisma.projetos.update({
        where: { id: Number(id) },
        data: {
          ...(nome !== undefined && { nome }),
          ...(descricao !== undefined && { descricao })
        }
      });
    } catch (err) {
      const result = await pool.query(
        `UPDATE projetos 
         SET nome = COALESCE($1, nome), descricao = COALESCE($2, descricao) 
         WHERE id = $3 
         RETURNING *`,
        [nome || null, descricao || null, Number(id)]
      );
      return result.rows[0] || null;
    }
  },

  remover: async (id) => {
    try {
      await prisma.projetos.delete({
        where: { id: Number(id) }
      });
      return true;
    } catch (err) {
      const result = await pool.query('DELETE FROM projetos WHERE id = $1 RETURNING *', [Number(id)]);
      return result.rowCount > 0;
    }
  }
};
