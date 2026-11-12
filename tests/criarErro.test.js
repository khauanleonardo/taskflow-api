const criarErro = require('../src/utils/criarErro');

describe('criarErro', () => {
  test('deve criar um erro com status e mensagem', () => {
    const erro = criarErro(400, 'Requisição inválida');
    expect(erro).toBeInstanceOf(Error);
    expect(erro.status).toBe(400);
    expect(erro.message).toBe('Requisição inválida');
  });

  test('deve criar erro sem detalhes quando não informados', () => {
    const erro = criarErro(404, 'Não encontrado');
    expect(erro.detalhes).toBeUndefined();
  });

  test('deve anexar detalhes quando fornecidos', () => {
    const detalhes = ['Campo título obrigatório'];
    const erro = criarErro(422, 'Erro de validação', detalhes);
    expect(erro.detalhes).toEqual(detalhes);
  });

  test('deve ser capturado por bloco try/catch', () => {
    expect(() => {
      throw criarErro(401, 'Não autorizado');
    }).toThrow('Não autorizado');
  });
});
