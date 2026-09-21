const jwt = require('jsonwebtoken');

function login(req, res) {
  const { email, senha } = req.body;

  const emailValido = email?.startsWith('admin@') || email === 'admin';
  const senhaValida = senha === '1234' || senha === '123456';

  if (!emailValido || !senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas. Use admin@taskflow.com e senha 1234' });
  }

  const usuario = {
    id: 1,
    nome: 'Admin',
    email: email.includes('@') ? email : 'admin@taskflow.com'
  };

  const secret = process.env.JWT_SECRET || 'taskflow_chave_secreta_senai_uc12';
  const token = jwt.sign(usuario, secret, { expiresIn: '8h' });

  return res.json({ token, usuario });
}

function logout(req, res) {
  return res.json({ mensagem: 'Logout efetuado com sucesso' });
}

module.exports = { login, logout };
