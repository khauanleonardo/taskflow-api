function temporizador(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    const duracao = Date.now() - inicio;
    console.log(`[TEMPO] ${req.method} ${req.url} — ${duracao}ms`);
  });

  next();
}

module.exports = temporizador;