const pool = require('../database/db');

function formatarUsuario(u) {
  if (!u) return null;
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    senha: u.senha_hash || u.senha,
    criado_em: u.criado_em
  };
}

const usuarioModel = {
  buscarPorEmail: async (email) => {
    try {
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      if (result.rows.length > 0) {
        return formatarUsuario(result.rows[0]);
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar usuário por email no banco:', err.message);
      return null;
    }
  },

  buscarPorId: async (id) => {
    try {
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE id = $1',
        [id]
      );
      return result.rows.length > 0 ? formatarUsuario(result.rows[0]) : null;
    } catch (err) {
      console.error('Erro ao buscar usuário por ID:', err.message);
      return null;
    }
  },

  listarTodos: async () => {
    try {
      const result = await pool.query('SELECT * FROM usuarios ORDER BY id');
      return result.rows.map(formatarUsuario);
    } catch (err) {
      console.error('Erro ao listar usuários do banco:', err.message);
      return [];
    }
  }
};

module.exports = usuarioModel;

