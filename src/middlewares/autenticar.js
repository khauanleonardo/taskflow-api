// src/middlewares/autenticar.js
const jwt = require('jsonwebtoken');

module.exports = function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Token malformatado. Use: Bearer <token>' });
  }

  const token = partes[1];
  const segredo = process.env.JWT_SECRET || 'taskflow_segredo_super_secreto_senai_2026';

  jwt.verify(token, segredo, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
    req.usuario = decoded;
    next();
  });
};
