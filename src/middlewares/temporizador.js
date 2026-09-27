// src/middlewares/temporizador.js
module.exports = function temporizador(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracao = Date.now() - inicio;
    console.log(`⏱️ ${req.method} ${req.originalUrl} respondeu em ${duracao}ms`);
  });
  next();
};
