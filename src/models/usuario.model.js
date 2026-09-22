// src/models/usuario.model.js
let usuarios = [
  {
    id: 1,
    nome: 'Admin',
    email: 'admin@taskflow.com',
    senha: '1234'
  },
  {
    id: 2,
    nome: 'Alice',
    email: 'alice@email.com',
    senha: '123456'
  }
];

const usuarioModel = {
  // Busca o usuário pelo e-mail
  buscarPorEmail(email) {
    return usuarios.find(u => u.email === email);
  },

  // Retorna todos os usuários
  listarTodos() {
    return usuarios;
  }
};

module.exports = usuarioModel;
