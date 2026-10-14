const pool = require('../database/db');

module.exports = {
  listar: async (usuarioId) => {
    if (usuarioId) {
      const result = await pool.query('SELECT * FROM projetos WHERE usuario_id = $1 ORDER BY id', [usuarioId]);
      return result.rows;
    }
    const result = await pool.query('SELECT * FROM projetos ORDER BY id');
    return result.rows;
  },

  buscar: async (id) => {
    const result = await pool.query('SELECT * FROM projetos WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  adicionar: async ({ nome, descricao, usuarioId }) => {
    const result = await pool.query(
      'INSERT INTO projetos (nome, descricao, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [nome, descricao || null, usuarioId || 1]
    );
    return result.rows[0];
  },

  atualizar: async (id, dados) => {
    const { nome, descricao } = dados;
    const result = await pool.query(
      `UPDATE projetos 
       SET nome = COALESCE($1, nome), descricao = COALESCE($2, descricao) 
       WHERE id = $3 
       RETURNING *`,
      [nome, descricao, id]
    );
    return result.rows[0] || null;
  },

  remover: async (id) => {
    const result = await pool.query('DELETE FROM projetos WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
};