const criarErro = require('../utils/criarErro');

/**
 * Middleware fábrica para validação declarativa de entrada (UC14 Dia 2)
 * Suporta origens: 'body', 'params' e 'query'
 */
function validar(schema, origem = 'body') {
  return function (req, res, next) {
    const dados = req[origem] || {};
    const erros = [];

    for (const campo in schema) {
      const regras = schema[campo];
      const valor = dados[campo];
      const ausente = valor === undefined || valor === null || valor === '';

      // Regra 1: Campo obrigatório ausente
      if (regras.obrigatorio && ausente) {
        erros.push(`O campo '${campo}' é obrigatório`);
        continue;
      }

      // Opcional e não enviado: não valida
      if (ausente) continue;

      // Regra 2: Tipo inteiro positivo (IDs e FKs)
      if (regras.tipo === 'inteiro') {
        const numero = typeof valor === 'string' ? Number(valor) : valor;
        if (!Number.isInteger(numero) || numero <= 0) {
          erros.push(`O campo '${campo}' deve ser um inteiro positivo`);
        }
      } else if (regras.tipo === 'string' || regras.tipo === 'texto') {
        if (typeof valor !== 'string' || valor.trim() === '') {
          erros.push(`O campo '${campo}' deve ser um texto válido`);
        }
      }

      // Regra 3: Valores permitidos (enum)
      const listaPermitida = regras.enum || regras.valoresPermitidos;
      if (listaPermitida && Array.isArray(listaPermitida)) {
        if (!listaPermitida.includes(valor)) {
          erros.push(`O campo '${campo}' deve ser: ${listaPermitida.join(', ')}`);
        }
      }

      // Regra 4: Formato de e-mail
      if (regras.formato === 'email') {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(valor)) {
          erros.push(`O campo '${campo}' deve ser um email válido`);
        }
      }

      // Regra 5: Tamanho mínimo
      if (regras.minLength && typeof valor === 'string' && valor.length < regras.minLength) {
        erros.push(`O campo '${campo}' deve ter ao menos ${regras.minLength} caracteres`);
      }

      // Regra 6: Tamanho máximo
      if (regras.maxLength && typeof valor === 'string' && valor.length > regras.maxLength) {
        erros.push(`O campo '${campo}' deve ter no máximo ${regras.maxLength} caracteres`);
      }
    }

    // Se houver falhas, repassa para o middleware de erro com os detalhes formatados
    if (erros.length > 0) {
      return next(criarErro(400, 'Dados inválidos', erros));
    }

    next();
  };
}

module.exports = validar;
