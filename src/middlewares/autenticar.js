const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ erro: 'Erro no Token' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: 'Token malformatado' });
  }

  const segredo = process.env.JWT_SECRET || 'chave_secreta_taskflow_123';

  jwt.verify(token, segredo, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }

    req.usuarioId = decoded.id;
    return next();
  });
};