const jwt = require('jsonwebtoken');

// Lista de usuários cadastrados
const usuariosCadastrados = [
  { id: 1, nome: 'Admin', email: 'admin@taskflow.com', senha: '1234' },
  { id: 2, nome: 'Alice', email: 'alice@email.com', senha: '123456' },
  { id: 3, nome: 'Khauan', email: 'khauan@taskflow.com', senha: '1234' }
];

function login(req, res) {
  const { email, senha, password } = req.body;
  const senhaInformada = senha || password;

  if (!email || !senhaInformada) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  // Busca o usuário na lista (ou aceita 'admin' direto)
  const usuarioEncontrado = usuariosCadastrados.find(
    u => u.email.toLowerCase() === email.toLowerCase() || (email === 'admin' && u.email === 'admin@taskflow.com')
  );

  // Se não encontrar ou a senha estiver incorreta
  if (!usuarioEncontrado || usuarioEncontrado.senha !== senhaInformada) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const usuario = {
    id: usuarioEncontrado.id,
    nome: usuarioEncontrado.nome,
    email: usuarioEncontrado.email
  };

  const secret = process.env.JWT_SECRET || 'taskflow_chave_secreta_senai_uc12';
  const token = jwt.sign(usuario, secret, { expiresIn: '8h' });

  return res.json({ token, usuario });
}

function logout(req, res) {
  return res.json({ mensagem: 'Logout efetuado com sucesso' });
}

module.exports = { login, logout };
