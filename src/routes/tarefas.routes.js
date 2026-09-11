const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

router.get('/', tarefasController.listar);
router.get('/:id', tarefasController.buscarPorId);
router.post('/', validar(schemas.tarefa), tarefasController.criar);
router.put('/:id', validar(schemas.tarefa), tarefasController.atualizar);
router.delete('/:id', tarefasController.remover);

module.exports = router;