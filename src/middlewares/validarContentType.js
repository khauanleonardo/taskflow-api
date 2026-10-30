const criarErro = require('../utils/criarErro');

// Mesmo formato de erro do resto da API (Dia 9, slide 25)
module.exports = function validarContentType(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (
      req.body &&
      Object.keys(req.body).length > 0 &&
      (!contentType || !contentType.includes('application/json'))
    ) {
      return next(criarErro(415, 'Content-Type inválido. Use: application/json'));
    }
  }
  next();
};
