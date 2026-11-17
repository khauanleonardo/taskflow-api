let traduzirErroPrisma;
try {
  traduzirErroPrisma = require('../utils/traduzirErroPrisma');
} catch (e) {}

function tratarErros(erroOriginal, req, res, next) {
  let erro = erroOriginal;

  // Traduz erros conhecidos do Prisma (P2002, P2003, P2025)
  if (traduzirErroPrisma && erroOriginal && erroOriginal.code) {
    erro = traduzirErroPrisma(erroOriginal, req?.method);
  }

  const status = erro.status || 500;
  console.error('[ERRO]', req?.method, req?.url, erro.message);

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
