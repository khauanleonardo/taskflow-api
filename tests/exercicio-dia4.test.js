const { Prisma } = require('@prisma/client');
const validar = require('../src/middlewares/validar.middleware');
const schemas = require('../src/schemas/schemas');
const tratarErros = require('../src/middlewares/erro.middleware');
const criarErro = require('../src/utils/criarErro');

// Erro que o validar entregou ao next (ele usa next(erro), não throw)
function erroEntregueAoNext(next) {
  const primeiraChamada = next.mock.calls[0];
  return primeiraChamada ? primeiraChamada[0] : undefined;
}

// Um res de mentira com encadeamento
function criarRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

// Silencia o console.error do tratarErros
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Exercício do Dia 4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('validar(schemas.usuario) com e-mail "ana@": 400, um detalhe sobre o e-mail e o next não é chamado sem erro', () => {
    const middleware = validar(schemas.usuario);
    const req = { body: { nome: 'Ana Souza', email: 'ana@', senha: '123456' } };
    const next = jest.fn();

    middleware(req, {}, next);

    const erro = erroEntregueAoNext(next);
    expect(erro.status).toBe(400);
    expect(erro.detalhes).toEqual([
      "O campo 'email' deve ser um email válido",
    ]);
    expect(next).not.toHaveBeenCalledWith();
  });

  test('validar(schemas.usuario) com nome "Al" e senha "123": dois detalhes de tamanho mínimo, na ordem', () => {
    const middleware = validar(schemas.usuario);
    const req = { body: { nome: 'Al', email: 'ana@teste.com', senha: '123' } };
    const next = jest.fn();

    middleware(req, {}, next);

    const erro = erroEntregueAoNext(next);
    expect(erro.detalhes).toEqual([
      "O campo 'nome' deve ter ao menos 3 caracteres",
      "O campo 'senha' deve ter ao menos 6 caracteres",
    ]);
  });

  test('validar(schemas.projeto) com descricao de 201 caracteres: detalhe de tamanho máximo', () => {
    const middleware = validar(schemas.projeto);
    const req = { body: { nome: 'TaskFlow', descricao: 'a'.repeat(201) } };
    const next = jest.fn();

    middleware(req, {}, next);

    const erro = erroEntregueAoNext(next);
    expect(erro.detalhes).toEqual([
      "O campo 'descricao' deve ter no máximo 200 caracteres",
    ]);
  });

  test('tratarErros com criarErro(400, "Dados inválidos", [...]): status 400 uma vez e o json leva os detalhes', () => {
    const detalhes = ["O campo 'nome' é obrigatório"];
    const erro = criarErro(400, 'Dados inválidos', detalhes);
    const res = criarRes();

    tratarErros(erro, { method: 'POST', url: '/projetos' }, res, jest.fn());

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: { mensagem: 'Dados inválidos', detalhes },
    });
  });

  test('tratarErros com erro do Prisma P2025 (PUT): 404 com "Registro não encontrado"', () => {
    const erroPrisma = new Prisma.PrismaClientKnownRequestError(
      'Record to update not found.',
      { code: 'P2025', clientVersion: '6.0.0' }
    );
    const res = criarRes();

    tratarErros(erroPrisma, { method: 'PUT', url: '/tarefas/99' }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      erro: { mensagem: 'Registro não encontrado', detalhes: undefined },
    });
  });
});