const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

// Middleware de autenticação importado
const autenticar = require('../middlewares/autenticar');

// Rotas protegidas pelo middleware 'autenticar'
router.get('/', autenticar, tarefasController.listar);
router.get('/:id', autenticar, tarefasController.buscarPorId);
router.post('/', autenticar, validar(schemas.tarefa), tarefasController.criar);
router.put('/:id', autenticar, validar(schemas.tarefa), tarefasController.atualizar);
router.delete('/:id', autenticar, tarefasController.remover);

module.exports = router;