const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const prisma = require('../src/database/prisma');
const pool = require('../src/database/db');

afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

const token = jwt.sign(
  { id: 1, nome: 'Teste' },
  process.env.JWT_SECRET || 'taskflow_chave_secreta_senai_uc12'
);

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('rotas da API', () => {
  // Teste 1 (Slide 29)
  test('GET / responde 200 com a mensagem da API', async () => {
    const resposta = await request(app).get('/');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      mensagem: 'TaskFlow API funcionando!',
    });
  });

  // Teste 2 (Slide 30)
  test('rota que não existe responde 404', async () => {
    const resposta = await request(app).get('/nao-existe');
    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe('Rota não encontrada');
  });

  // Teste 3 (Slide 31)
  test('GET /tarefas sem token responde 401', async () => {
    const resposta = await request(app).get('/tarefas');
    expect(resposta.status).toBe(401);
  });

  // Teste 4 (Slide 31)
  test('GET /tarefas com token falso responde 401', async () => {
    const resposta = await request(app)
      .get('/tarefas')
      .set('Authorization', 'Bearer abc.def.ghi');
    expect(resposta.status).toBe(401);
  });

  // Teste 5 (Slide 32)
  test('POST /tarefas inválido responde 400', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({ texto: '' });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.mensagem).toBe('Dados inválidos');
  });

  // Teste 6 (Slide 33)
  test('POST /tarefas sem JSON responde 415', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('texto solto');
    expect(resposta.status).toBe(415);
  });

  // ==========================================
  // EXERCÍCIOS (Slide 35)
  // ==========================================

  // Exercício 1: GET /prioridades sem token -> 401
  test('GET /prioridades sem token responde 401', async () => {
    const resposta = await request(app).get('/prioridades');
    expect(resposta.status).toBe(401);
  });

  // Exercício 2: GET /tarefas com segredo errado -> 401
  test('GET /tarefas com token assinado com segredo errado responde 401', async () => {
    const tokenErrado = jwt.sign({ id: 1 }, 'outro-segredo');
    const resposta = await request(app)
      .get('/tarefas')
      .set('Authorization', `Bearer ${tokenErrado}`);
    expect(resposta.status).toBe(401);
  });

  // Exercício 3: POST /tarefas vazio {} -> 400 e os 5 campos obrigatórios
  test('POST /tarefas com body vazio {} responde 400 e detalhes dos 5 campos obrigatórios', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.mensagem).toBe('Dados inválidos');
    expect(resposta.body.erro.detalhes).toEqual([
      "O campo 'texto' é obrigatório",
      "O campo 'coluna' é obrigatório",
      "O campo 'usuario_id' é obrigatório",
      "O campo 'projeto_id' é obrigatório",
      "O campo 'idprioridade' é obrigatório",
    ]);
  });

  // Exercício 4: POST /tarefas com coluna 'feito' -> 400 e detalhe da coluna
  test('POST /tarefas com coluna inválida "feito" responde 400 e detalhe da coluna', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        texto: 'Estudar para a prova',
        coluna: 'feito',
        usuario_id: 1,
        projeto_id: 1,
        idprioridade: 1,
      });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.mensagem).toBe('Dados inválidos');
    expect(resposta.body.erro.detalhes).toEqual([
      "O campo 'coluna' deve ser: afazer, andamento, concluido",
    ]);
  });

  // Exercício 5: GET /rota/que/nao/existe com token -> 404
  test('GET /rota/que/nao/existe com token responde 404', async () => {
    const resposta = await request(app)
      .get('/rota/que/nao/existe')
      .set('Authorization', `Bearer ${token}`);
    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe('Rota não encontrada');
  });
});
