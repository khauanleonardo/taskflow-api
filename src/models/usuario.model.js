const prisma = require('../database/prisma');

// Nunca devolvemos senha_hash: todo select usa estes campos (Dia 8, desafio)
const camposPublicos = { id: true, nome: true, email: true, criado_em: true };

const usuarioModel = {
  // Usado só no login: precisa da senha para conferir
  buscarPorEmailComSenha: async (email) => {
    const u = await prisma.usuarios.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    if (!u) return null;
    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      senha: u.senha_hash
    };
  },

  buscarPorId: (id) => prisma.usuarios.findUnique({
    where: { id: Number(id) },
    select: camposPublicos
  }),

  listar: () => prisma.usuarios.findMany({
    select: camposPublicos,
    orderBy: { id: 'asc' }
  }),

  // Dia 8, exercício: create sem devolver a senha. P2002 (e-mail repetido) é traduzido pelo tratarErros
  criar: ({ nome, email, senha }) => prisma.usuarios.create({
    data: {
      nome,
      email: String(email).trim().toLowerCase(),
      senha_hash: senha
    },
    select: camposPublicos
  }),

  // Dia 8, exercício: update só com os campos enviados
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
      throw erro;
    }
  },

  // Dia 8, exercício: delete; P2025 vira null (controller responde 404)
  remover: async (id) => {
    try {
      return await prisma.usuarios.delete({
        where: { id: Number(id) },
        select: camposPublicos
      });
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      throw erro;
    }
  }
};

module.exports = usuarioModel;
