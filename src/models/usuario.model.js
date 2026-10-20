const pool = require('../database/db');

function formatarUsuario(u) {
  if (!u) return null;
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    criado_em: u.criado_em
  };
}

const usuarioModel = {
  buscarPorEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (result.rows.length === 0) return null;
    const u = result.rows[0];
    return {
      ...formatarUsuario(u),
      senha: u.senha_hash || u.senha
    };
  },

  buscarPorId: async (id) => {
    const result = await pool.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? formatarUsuario(result.rows[0]) : null;
  },

  listarTodos: async () => {
    const result = await pool.query(
      'SELECT id, nome, email, criado_em FROM usuarios ORDER BY id'
    );
    return result.rows.map(formatarUsuario);
  },

  listar: async () => {
    return usuarioModel.listarTodos();
  },

  criar: async ({ nome, email, senha }) => {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
      [nome, email, senha]
    );
    return formatarUsuario(result.rows[0]);
  },

  atualizar: async (id, { nome, email, senha }) => {
    const result = await pool.query(
      `UPDATE usuarios 
       SET nome = COALESCE($1, nome),
           email = COALESCE($2, email),
           senha_hash = COALESCE($3, senha_hash)
       WHERE id = $4
       RETURNING id, nome, email, criado_em`,
      [nome || null, email || null, senha || null, id]
    );
    return result.rows.length > 0 ? formatarUsuario(result.rows[0]) : null;
  },

  remover: async (id) => {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }
};

module.exports = usuarioModel;
