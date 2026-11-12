const criarErro = require('../src/utils/criarErro');
const traduzirErroPrisma = require('../src/utils/traduzirErroPrisma');

describe('Exercício do Dia 3', () => {
  test('P2002 sem meta.target deve exibir campo genérico', () => {
    const erroPrisma = { code: 'P2002' };
    const erro = traduzirErroPrisma(erroPrisma);
    expect(erro.status).toBe(409);
    expect(erro.detalhes).toEqual(['Valor repetido em: campo']);
  });

  test('criarErro deve aceitar status 500 para erro interno', () => {
    const erro = criarErro(500, 'Erro interno do servidor');
    expect(erro.status).toBe(500);
    expect(erro.message).toBe('Erro interno do servidor');
  });

  test('P2003 em PUT deve retornar status 400', () => {
    const erroPrisma = { code: 'P2003' };
    const erro = traduzirErroPrisma(erroPrisma, 'PUT');
    expect(erro.status).toBe(400);
    expect(erro.message).toBe('Um dos ids informados não existe');
  });
});
