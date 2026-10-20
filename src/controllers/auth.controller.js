const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const criarErro = require('../utils/criarErro');

const usuariosFallback = [
  { id: 1, nome: 'Ana Lima', email: 'ana@taskflow.com', senha: '1234' },
  { id: 2, nome: 'Carlos Souza', email: 'carlos@taskflow.com', senha: '1234' },
  { id: 3, nome: 'Beatriz Costa', email: 'beatriz@taskflow.com', senha: '1234' },
  { id: 6, nome: 'Admin', email: 'admin@taskflow.com', senha: '1234' }
];

async function login(req, res, next) {
  try {
    const email = req.body?.email || req.query?.email;
    const senhaInformada = req.body?.senha || req.body?.password || req.query?.senha || req.query?.password;

    if (!email || !senhaInformada) {
      return next(criarErro(400, 'Email e senha são obrigatórios'));
    }

    const emailLimpo = String(email).trim().toLowerCase();

    // 1. Busca no Neon
    let usuarioEncontrado = await usuarioModel.buscarPorEmail(emailLimpo);

    // 2. Fallback caso necessário
    if (!usuarioEncontrado) {
      usuarioEncontrado = usuariosFallback.find(
        (u) => u.email.toLowerCase() === emailLimpo || (emailLimpo === 'admin' && u.email === 'admin@taskflow.com')
      );
    }

    if (!usuarioEncontrado) {
      return next(criarErro(401, 'Credenciais inválidas'));
    }

    // 3. Validação de senha
    const senhaCorreta = usuarioEncontrado.senha;
    if (String(senhaCorreta) !== String(senhaInformada)) {
      return next(criarErro(401, 'Credenciais inválidas'));
    }

    const usuario = {
      id: usuarioEncontrado.id,
      nome: usuarioEncontrado.nome,
      email: usuarioEncontrado.email
    };

    const secret = process.env.JWT_SECRET || 'taskflow_chave_secreta_senai_uc12';
    const token = jwt.sign(usuario, secret, { expiresIn: '8h' });

    return res.status(200).json({ token, usuario });
  } catch (err) {
    return next(err);
  }
}

function logout(req, res) {
  return res.status(200).json({ mensagem: 'Logout efetuado com sucesso' });
}

module.exports = { login, logout };
