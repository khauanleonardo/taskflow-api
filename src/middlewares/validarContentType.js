// src/middlewares/validarContentType.js
module.exports = function validarContentType(req, res, next) {
  // Apenas métodos com corpo enviado precisam de verificação
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (
      req.body &&
      Object.keys(req.body).length > 0 &&
      (!contentType || !contentType.includes('application/json'))
    ) {
      return res.status(415).json({
        erro: 'Content-Type deve ser obrigatoriamente application/json'
      });
    }
  }
  next();
};
