const traduzirErroPrisma = require('../src/utils/traduzirErroPrisma');

describe('traduzirErroPrisma', () => {
  test('P2002: deve retornar status 409 e mensagem de valor repetido', () => {
    const erroPrisma = {
      code: 'P2002',
      meta: { target: ['email'] }
    };
    const erro = traduzirErroPrisma(erroPrisma);
    expect(erro.status).toBe(409);
    expect(erro.message).toBe('Já existe um registro com esse valor');
    expect(erro.detalhes).toEqual(['Valor repetido em: email']);
  });

  test('P2003 no DELETE: deve retornar status 409', () => {
    const erroPrisma = { code: 'P2003' };
    const erro = traduzirErroPrisma(erroPrisma, 'DELETE');
    expect(erro.status).toBe(409);
    expect(erro.message).toBe('Não é possível excluir: existem registros ligados a este');
  });

  test('P2003 fora do DELETE: deve retornar status 400', () => {
    const erroPrisma = { code: 'P2003' };
    const erro = traduzirErroPrisma(erroPrisma, 'POST');
    expect(erro.status).toBe(400);
    expect(erro.message).toBe('Um dos ids informados não existe');
  });

  test('P2025: deve retornar status 404 de registro não encontrado', () => {
    const erroPrisma = { code: 'P2025' };
    const erro = traduzirErroPrisma(erroPrisma);
    expect(erro.status).toBe(404);
    expect(erro.message).toBe('Registro não encontrado');
  });

  test('código desconhecido: deve retornar o erro original sem alterar', () => {
    const erroGenerico = new Error('Erro de conexão');
    erroGenerico.code = 'P9999';
    const resultado = traduzirErroPrisma(erroGenerico);
    expect(resultado).toBe(erroGenerico);
  });
});
