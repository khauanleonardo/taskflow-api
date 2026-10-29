/**
 * Tradutor centralizado de erros do Prisma (UC14 - Dia 8)
 * Converte códigos P2002, P2003 e P2025 em respostas HTTP amigáveis.
 */
function traduzirErroPrisma(erro) {
  if (!erro || !erro.code) return null;

  switch (erro.code) {
    case 'P2002': {
      const campos = erro.meta?.target
        ? (Array.isArray(erro.meta.target) ? erro.meta.target.join(', ') : erro.meta.target)
        : 'campo';
      return {
        status: 409,
        mensagem: `Já existe um registro com o valor informado para: ${campos}`
      };
    }
    case 'P2003': {
      const campo = erro.meta?.field_name || 'chave estrangeira';
      return {
        status: 400,
        mensagem: `Referência inválida: ${campo} não encontrado no banco de dados`
      };
    }
    case 'P2025': {
      return {
        status: 404,
        mensagem: 'Registro não encontrado'
      };
    }
    default:
      return null;
  }
}

module.exports = traduzirErroPrisma;
