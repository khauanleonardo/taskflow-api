const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  // Header vem no formato: "Bearer eyJhbG..."
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ erro: 'Formato do token inválido' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'taskflow_chave_secreta_senai_uc12');
    req.usuario = decodificado; // Disponível para os controllers
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;
