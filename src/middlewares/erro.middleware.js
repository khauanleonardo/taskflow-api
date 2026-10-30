const { Prisma } = require('@prisma/client');
const traduzirErroPrisma = require('../utils/traduzirErroPrisma');

// Middleware central de erros (UC14 - Dia 8, passo 6). Sempre o último do server.js
function tratarErros(erro, req, res, next) {
  if (res.headersSent) return next(erro);

  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    erro = traduzirErroPrisma(erro, req.method);
  }

  const status = erro.status || 500;
  const mensagem = status === 500 ? 'Erro interno no servidor' : erro.message;

  console.error('[ERRO]', status, req.method, req.url, erro.message);

  return res.status(status).json({
    erro: {
      mensagem,
      detalhes: erro.detalhes
    }
  });
}

module.exports = tratarErros;
