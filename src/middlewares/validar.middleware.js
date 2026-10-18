const criarErro = require('../utils/criarErro');

/**
 * Middleware fábrica para validação declarativa (UC14 Dia 2)
 * @param {Object} schema - Regras de validação
 * @param {string} [origem='body'] - 'body', 'params' ou 'query'
 */
function validar(schema, origem = 'body') {
  return function (req, res, next) {
    const dados = req[origem] || {};
    const erros = [];

    for (const campo in schema) {
      const regras = schema[campo];
      const valor = dados[campo];
      const ausente = valor === undefined || valor === null || valor === '';

      // 1. Campo obrigatório ausente
      if (regras.obrigatorio && ausente) {
        erros.push({ campo, mensagem: `O campo '${campo}' é obrigatório` });
        continue;
      }

      // Se for opcional e não foi enviado, pula
      if (ausente) continue;

      // 2. Validação de tipo 'inteiro' (usado em IDs e FKs)
      if (regras.tipo === 'inteiro') {
        const numero = typeof valor === 'string' ? Number(valor) : valor;
        if (!Number.isInteger(numero) || numero <= 0) {
          erros.push({ campo, mensagem: `O campo '${campo}' deve ser um inteiro positivo` });
        }
      } else if (regras.tipo === 'string' || regras.tipo === 'texto') {
        if (typeof valor !== 'string' || valor.trim() === '') {
          erros.push({ campo, mensagem: `O campo '${campo}' deve ser um texto válido` });
        }
      }

      // 3. Validação de lista permitida (suporta tanto .enum quanto .valoresPermitidos)
      const listaPermitida = regras.enum || regras.valoresPermitidos;
      if (listaPermitida && Array.isArray(listaPermitida)) {
        if (!listaPermitida.includes(valor)) {
          erros.push({
            campo,
            mensagem: `O campo '${campo}' deve ser: ${listaPermitida.join(', ')}`
          });
        }
      }

      // 4. Formato de email
      if (regras.formato === 'email') {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(valor)) {
          erros.push({ campo, mensagem: `O campo '${campo}' deve ser um email válido` });
        }
      }

      // 5. MinLength
      if (regras.minLength && typeof valor === 'string' && valor.length < regras.minLength) {
        erros.push({
          campo,
          mensagem: `O campo '${campo}' deve ter ao menos ${regras.minLength} caracteres`
        });
      }

      // 6. MaxLength
      if (regras.maxLength && typeof valor === 'string' && valor.length > regras.maxLength) {
        erros.push({
          campo,
          mensagem: `O campo '${campo}' deve ter no máximo ${regras.maxLength} caracteres`
        });
      }
    }

    // Se houver erros, repassa para o middleware de erro com next()
    if (erros.length > 0) {
      return next(criarErro(400, 'Dados inválidos', erros));
    }

    next();
  };
}

module.exports = validar;
