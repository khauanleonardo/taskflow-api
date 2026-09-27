// src/middlewares/validar.js
function validar(schema) {
  return (req, res, next) => {
    const corpo = req.body || {};
    const faltando = [];

    for (const campo of schema.camposObrigatorios) {
      if (corpo[campo] === undefined || corpo[campo] === null || String(corpo[campo]).trim() === '') {
        faltando.push(campo);
      }
    }

    if (faltando.length > 0) {
      return res.status(400).json({
        erro: `Campos obrigatórios ausentes: ${faltando.join(', ')}`
      });
    }

    next();
  };
}

module.exports = validar;
