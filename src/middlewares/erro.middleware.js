function tratarErros(erro, req, res, next) {
  const status = erro.status || 500;
  console.error('[ERRO]', req.method, req.url, erro.message);

  const mensagem = status === 500
    ? 'Erro interno no servidor'
    : erro.message;

  return res.status(status).json({
    erro: {
      mensagem,
      detalhes: erro.detalhes
    }
  });
}

module.exports = tratarErros;
