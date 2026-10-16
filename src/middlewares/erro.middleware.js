function manipuladorDeErros(err, req, res, next) {
  const status = err.status || 500;

  // Erros 500 não devem vazar detalhes internos para o cliente
  const mensagem = status === 500
    ? 'Ocorreu um erro interno no servidor.'
    : (err.message || 'Erro na requisição.');

  if (status === 500) {
    console.error('❌ [ERRO 500 INTERNO]:', err);
  }

  return res.status(status).json({
    erro: {
      mensagem
    }
  });
}

module.exports = manipuladorDeErros;
