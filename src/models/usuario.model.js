let usuarios = [
  { id: 1, nome: 'Admin', email: 'admin', senha: '1234' },
  { id: 2, nome: 'Alice', email: 'alice@email.com', senha: '123456' }
];

const usuarioModel = {
  listar: () => usuarios.map(({ senha, ...u }) => u),
  buscarPorId: (id) => {
    const u = usuarios.find(u => u.id === Number(id));
    if (!u) return null;
    const { senha, ...resto } = u;
    return resto;
  },
  buscarPorEmail: (email) => usuarios.find(u => u.email === email),
  criar: (dados) => {
    const novo = { id: usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1, ...dados };
    usuarios.push(novo);
    const { senha, ...resto } = novo;
    return resto;
  },
  atualizar: (id, dados) => {
    const idx = usuarios.findIndex(u => u.id === Number(id));
    if (idx === -1) return null;
    usuarios[idx] = { ...usuarios[idx], ...dados };
    const { senha, ...resto } = usuarios[idx];
    return resto;
  },
  remover: (id) => {
    const idx = usuarios.findIndex(u => u.id === Number(id));
    if (idx === -1) return false;
    usuarios.splice(idx, 1);
    return true;
  }
};

module.exports = usuarioModel;