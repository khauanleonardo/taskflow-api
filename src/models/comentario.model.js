const pool = require('../database/db');

module.exports = {
  listarPorTarefa: async (tarefaId) => {
    const result = await pool.query(
      `SELECT c.*, u.nome AS usuario_nome, u.email AS usuario_email
       FROM comentarios c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.tarefa_id = $1
       ORDER BY c.id`,
      [tarefaId]
    );
    return result.rows;
  },

  buscar: async (id) => {
    const result = await pool.query('SELECT * FROM comentarios WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  adicionar: async ({ texto, tarefaId, usuarioId }) => {
    const result = await pool.query(
      'INSERT INTO comentarios (texto, tarefa_id, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [texto, tarefaId, usuarioId || 1]
    );
    return result.rows[0];
  },

  remover: async (id) => {
    const result = await pool.query('DELETE FROM comentarios WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
};