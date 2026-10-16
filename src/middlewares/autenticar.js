const jwt = require('jsonwebtoken');
const criarErro = require('../utils/criarErro');

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    throw criarErro(401, 'Token não fornecido');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw criarErro(401, 'Formato do token inválido');
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'taskflow_chave_secreta_senai_uc12');
    req.usuario = decodificado;
    next();
  } catch (err) {
    throw criarErro(401, 'Token inválido ou expirado');
  }
}

module.exports = autenticar;
