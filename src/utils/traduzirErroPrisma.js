const criarErro = require('./criarErro');

/**
 * Tradutor centralizado de erros do Prisma (UC14 - Dia 8).
 * P2002 → 409 (valor repetido)
 * P2003 → 409 no DELETE, 400 no restante (id de referência não existe)
 * P2025 → 404 (registro não encontrado)
 * Código desconhecido: devolve o erro como veio (vira 500).
 */
function traduzirErroPrisma(erro, metodo) {
  if (erro.code === 'P2002') {
    const alvo = erro.meta?.target;
    const campos = Array.isArray(alvo) ? alvo.join(', ') : (alvo || 'campo');
    return criarErro(409, 'Já existe um registro com esse valor',
      [`Valor repetido em: ${campos}`]);
  }

  if (erro.code === 'P2003') {
    if (metodo === 'DELETE') {
      return criarErro(409, 'Não é possível excluir: existem registros ligados a este');
    }
    return criarErro(400, 'Um dos ids informados não existe');
  }

  if (erro.code === 'P2025') {
    return criarErro(404, 'Registro não encontrado');
  }

  return erro;
}

module.exports = traduzirErroPrisma;
