const express = require('express');
const controller = require('../controllers/tarefas.controller');
const validar = require('../middlewares/validar.middleware');
const autenticar = require('../middlewares/autenticar');
const schemas = require('../schemas/schemas');

const router = express.Router();
const idValido = validar(schemas.id, 'params');
router.use(autenticar);
router.get('/', validar(schemas.filtroTarefas, 'query'), controller.listar);
router.post('/', validar(schemas.tarefa), controller.criar);
router.get('/:id', idValido, controller.buscarPorId);
router.put('/:id', idValido, validar(schemas.tarefaAtualizacao), controller.atualizar);
router.delete('/:id', idValido, controller.remover);
router.patch('/:id/avancar', idValido, controller.avancar);
module.exports = router;
