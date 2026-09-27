// src/models/usuario.model.js
let usuarios = [
  { id: 1, nome: 'Admin', email: 'admin@taskflow.com', senha: '1234' },
  { id: 2, nome: 'Alice', email: 'alice@email.com', senha: '123456' }
];
let proximoId = 3;

const usuarioModel = {
  listar() {
    return usuarios.map(({ senha, ...resto }) => resto);
  },

  buscarPorId(id) {
    const user = usuarios.find((u) => u.id === Number(id));
    if (!user) return null;
    const { senha, ...resto } = user;
    return resto;
  },

  buscarPorEmail(email) {
    return usuarios.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
  },

  criar({ nome, email, senha }) {
    const novo = {
      id: proximoId++,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: String(senha)
    };
    usuarios.push(novo);
    const { senha: s, ...semSenha } = novo;
    return semSenha;
  },

  atualizar(id, { nome, email, senha }) {
    const index = usuarios.findIndex((u) => u.id === Number(id));
    if (index === -1) return null;

    if (nome) usuarios[index].nome = nome.trim();
    if (email) usuarios[index].email = email.trim().toLowerCase();
    if (senha) usuarios[index].senha = String(senha);

    const { senha: s, ...semSenha } = usuarios[index];
    return semSenha;
  },

  remover(id) {
    const index = usuarios.findIndex((u) => u.id === Number(id));
    if (index === -1) return false;
    usuarios.splice(index, 1);
    return true;
  }
};

module.exports = usuarioModel;
