const validar = require('../src/middlewares/validar.middleware');
const schemas = require('../src/schemas/schemas');

// Uma tarefa com todos os campos certos.
// Cada chamada devolve um objeto novo, então um teste não estraga o outro.
function tarefaValida() {
  return {
    texto: 'Revisar o plano de teste',
    coluna: 'afazer',
    usuario_id: 1,
    projeto_id: 1,
    idprioridade: 2,
  };
}

// O validar NÃO lança erro: ele chama next(erro).
// Esta função devolve o erro que foi entregue ao next.
function erroEntregueAoNext(next) {
  const primeiraChamada = next.mock.calls[0];
  return primeiraChamada ? primeiraChamada[0] : undefined;
}

describe('validar', () => {
  test('chama o next quando os dados estão certos', () => {
    const middleware = validar(schemas.tarefa);
    const req = { body: tarefaValida() };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('sem body: 400 com um detalhe por campo obrigatório', () => {
    const middleware = validar(schemas.tarefa);
    const req = {};
    const next = jest.fn();

    middleware(req, {}, next);

    const erro = erroEntregueAoNext(next);
    expect(erro.status).toBe(400);
    expect(erro.message).toBe('Dados inválidos');
    expect(erro.detalhes).toEqual([
      "O campo 'texto' é obrigatório",
      "O campo 'coluna' é obrigatório",
      "O campo 'usuario_id' é obrigatório",
      "O campo 'projeto_id' é obrigatório",
      "O campo 'idprioridade' é obrigatório",
    ]);
    // Com erro, o next recebe o erro e NÃO é chamado sem argumentos
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalledWith();
  });

  test('coluna fora da lista: diz os valores aceitos', () => {
    const middleware = validar(schemas.tarefa);
    const req = { body: { ...tarefaValida(), coluna: 'feito' } };
    const next = jest.fn();

    middleware(req, {}, next);

    const erro = erroEntregueAoNext(next);
    expect(erro.detalhes).toEqual([
      "O campo 'coluna' deve ser: afazer, andamento, concluido",
    ]);
    expect(next).not.toHaveBeenCalledWith();
  });

  test('id da URL: aceita "7" e barra "abc"', () => {
    const middleware = validar(schemas.id, 'params');
    const nextBom = jest.fn();
    const nextRuim = jest.fn();

    middleware({ params: { id: '7' } }, {}, nextBom);
    middleware({ params: { id: 'abc' } }, {}, nextRuim);

    expect(nextBom).toHaveBeenCalledTimes(1);
    expect(nextBom).toHaveBeenCalledWith();

    const erro = erroEntregueAoNext(nextRuim);
    expect(erro.detalhes).toEqual([
      "O campo 'id' deve ser um inteiro positivo",
    ]);
    expect(nextRuim).not.toHaveBeenCalledWith();
  });

  test('campo opcional não enviado não gera erro', () => {
    const middleware = validar(schemas.projeto);
    const req = { body: { nome: 'TaskFlow' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});