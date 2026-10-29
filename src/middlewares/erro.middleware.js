const traduzirErroPrisma = require('../utils/traduzirErroPrisma');

function tratarErros(erro, req, res, next) {
  const erroPrisma = traduzirErroPrisma(erro);

  const status = erroPrisma ? erroPrisma.status : (erro.status || 500);
  const mensagem = erroPrisma
    ? erroPrisma.mensagem
    : (status === 500 ? 'Erro interno no servidor' : erro.message);

  if (status === 500) {
    console.error('[ERRO 500]', req.method, req.url, erro);
  } else {
    console.warn(`[AVISO ${status}]`, req.method, req.url, mensagem);
  }

  return res.status(status).json({
    erro: {
      mensagem,
      detalhes: erro.detalhes || (erroPrisma ? erro.meta : undefined)
    }
  });
}

module.exports = tratarErros;
