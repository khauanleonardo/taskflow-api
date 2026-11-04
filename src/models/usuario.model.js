const prisma = require('../database/prisma');
const pool = require('../database/db');

// Nunca devolvemos senha_hash: todo select usa estes campos (Dia 8)
const camposPublicos = { id: true, nome: true, email: true, criado_em: true };

const usuarioModel = {
  // Usado só no login: busca por e-mail com tolerância a oscilação do Prisma
  buscarPorEmailComSenha: async (email) => {
    const emailLimpo = String(email).trim().toLowerCase();

    // 1. Tenta consultar via Prisma com limite de 2.5 segundos
    try {
      const buscaPrisma = prisma.usuarios.findFirst({
        where: { email: { equals: emailLimpo, mode: 'insensitive' } }
      });
      const timeoutPrisma = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Prisma timeout')), 2500)
      );
      const u = await Promise.race([buscaPrisma, timeoutPrisma]);
      if (u) {
        return {
          id: u.id,
          nome: u.nome,
          email: u.email,
          senha: u.senha_hash
        };
      }
    } catch (err) {
      console.warn('⚠️ Prisma oscilou no login, usando conexão direta pg:', err.message);
    }

    // 2. Se o pool do Prisma demorar, usa o pool pg (que já está conectado)
    try {
      const res = await pool.query(
        'SELECT id, nome, email, senha_hash FROM usuarios WHERE LOWER(email) = $1 LIMIT 1',
        [emailLimpo]
      );
      if (res.rows.length > 0) {
        const u = res.rows[0];
        return {
          id: u.id,
          nome: u.nome,
          email: u.email,
          senha: u.senha_hash
        };
      }
    } catch (errPg) {
      console.error('⚠️ Erro na consulta fallback pg:', errPg.message);
    }

    return null;
  },

  buscarPorId: async (id) => {
    try {
      const busca = prisma.usuarios.findUnique({
        where: { id: Number(id) },
        select: camposPublicos
      });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000));
      return await Promise.race([busca, timeout]);
    } catch (e) {
      const res = await pool.query('SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    }
  },

  // LISTAR com fallback (resolve o erro 500 no Kanban)
  listar: async () => {
    try {
      const busca = prisma.usuarios.findMany({
        select: camposPublicos,
        orderBy: { id: 'asc' }
      });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000));
      return await Promise.race([busca, timeout]);
    } catch (e) {
      const res = await pool.query('SELECT id, nome, email, criado_em FROM usuarios ORDER BY id ASC');
      return res.rows;
    }
  },

  criar: async ({ nome, email, senha }) => {
    try {
      return await prisma.usuarios.create({
        data: {
          nome,
          email: String(email).trim().toLowerCase(),
          senha_hash: senha
        },
        select: camposPublicos
      });
    } catch (e) {
      const res = await pool.query(
        'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
        [nome, String(email).trim().toLowerCase(), senha]
      );
      return res.rows[0];
    }
  },

  atualizar: async (id, { nome, email, senha }) => {
    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (email !== undefined) data.email = String(email).trim().toLowerCase();
    if (senha !== undefined) data.senha_hash = senha;

    try {
      return await prisma.usuarios.update({
        where: { id: Number(id) },
        data,
        select: camposPublicos
      });
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      const res = await pool.query(
        'UPDATE usuarios SET nome = COALESCE($1, nome), email = COALESCE($2, email), senha_hash = COALESCE($3, senha_hash) WHERE id = $4 RETURNING id, nome, email, criado_em',
        [data.nome, data.email, data.senha_hash, Number(id)]
      );
      return res.rows[0] || null;
    }
  },

  remover: async (id) => {
    try {
      return await prisma.usuarios.delete({
        where: { id: Number(id) },
        select: camposPublicos
      });
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      const res = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id, nome, email, criado_em', [Number(id)]);
      return res.rows[0] || null;
    }
  }
};

module.exports = usuarioModel;
