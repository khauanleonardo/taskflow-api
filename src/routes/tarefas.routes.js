const express = require('express');
const controller = require('../controllers/tarefas.controller');
const validar = require('../middlewares/validar.middleware');
const autenticar = require('../middlewares/autenticar');
const schemas = require('../schemas/schemas');

const router = express.Router();
const idValido = validar(schemas.id, 'params');

// Todas as rotas de tarefas exigem o token JWT (Dia 9: Swagger mostra 401 sem token)
router.use(autenticar);

// Listar com validação opcional de query (Desafio Slide 24)
router.get('/', validar(schemas.filtroTarefas, 'query'), controller.listar);

// Criar tarefa com validação do body
router.post('/', validar(schemas.tarefa), controller.criar);

// Rotas com ID na URL protegidas com idValido
router.get('/:id', idValido, controller.buscarPorId);
router.put('/:id', idValido, validar(schemas.tarefa), controller.atualizar);
router.delete('/:id', idValido, controller.remover);
router.patch('/:id/avancar', idValido, controller.avancar);

module.exports = router;
