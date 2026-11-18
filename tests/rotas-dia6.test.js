const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const prisma = require('../src/database/prisma');
const pool = require('../src/database/db');

// Fecha as duas conexões no fim, para o Jest encerrar
afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

// ids que existem no branch test (confira em Tables, no Neon)
const USUARIO_ID = 1;
const PROJETO_ID = 1;
const PRIORIDADE_ID = 1;

const token = jwt.sign({ id: 1, nome: 'Teste' }, process.env.JWT_SECRET);

describe('Dia 6: rotas com o banco de teste', () => {
  // Teste 7: rota protegida com token devolve uma lista (só lê)
  test('GET /prioridades com token: 200 e uma lista', async () => {
    const resposta = await request(app)
      .get('/prioridades')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  // Teste 8: o único que grava, e ele mesmo apaga o que criou
  test('POST /tarefas cria (201) e o DELETE remove', async () => {
    const nova = {
      texto: 'Tarefa criada pelo teste',
      coluna: 'afazer',
      usuario_id: USUARIO_ID,
      projeto_id: PROJETO_ID,
      idprioridade: PRIORIDADE_ID,
    };

    const criada = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send(nova);

    expect(criada.status).toBe(201);
    expect(criada.body).toHaveProperty('id');

    const removida = await request(app)
      .delete(`/tarefas/${criada.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removida.status).toBe(200);
  });

  // Teste 9: id que não existe no branch test
  test('GET /tarefas/999999 responde 404', async () => {
    const resposta = await request(app)
      .get('/tarefas/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe('Tarefa não encontrada');
  });

  // Exercício 1: lista de tarefas
  test('GET /tarefas com token: 200 e uma lista', async () => {
    const resposta = await request(app)
      .get('/tarefas')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  // Exercício 2: lista de projetos
  test('GET /projetos: 200 e uma lista', async () => {
    const resposta = await request(app)
      .get('/projetos')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  // Exercício 3: cria, busca pelo id e remove no fim
  test('cria, busca por id e remove uma tarefa', async () => {
    const criada = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        texto: 'Tarefa de busca pelo teste',
        coluna: 'afazer',
        usuario_id: USUARIO_ID,
        projeto_id: PROJETO_ID,
        idprioridade: PRIORIDADE_ID,
      });

    expect(criada.status).toBe(201);
    const id = criada.body.id;

    const buscada = await request(app)
      .get(`/tarefas/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(buscada.status).toBe(200);
    expect(buscada.body.texto).toBe('Tarefa de busca pelo teste');

    const removida = await request(app)
      .delete(`/tarefas/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removida.status).toBe(200);
  });

  // Exercício 4: depois de remover, o mesmo id dá 404
  test('depois de remover, GET /tarefas/:id responde 404', async () => {
    const criada = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        texto: 'Tarefa para remover pelo teste',
        coluna: 'afazer',
        usuario_id: USUARIO_ID,
        projeto_id: PROJETO_ID,
        idprioridade: PRIORIDADE_ID,
      });

    expect(criada.status).toBe(201);
    const id = criada.body.id;

    const removida = await request(app)
      .delete(`/tarefas/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removida.status).toBe(200);

    const depois = await request(app)
      .get(`/tarefas/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(depois.status).toBe(404);
  });
});
