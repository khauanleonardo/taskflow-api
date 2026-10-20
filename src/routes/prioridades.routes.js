const express = require('express');
const router = express.Router();
const controller = require('../controllers/prioridades.controller');
const validar = require('../middlewares/validar.middleware');
const schemas = require('../schemas/schemas');

const idValido = validar(schemas.id, 'params');

router.get('/', controller.listar);
router.post('/', validar(schemas.prioridade), controller.criar);
router.get('/:id', idValido, controller.buscarPorId);
router.put('/:id', idValido, validar(schemas.prioridade), controller.atualizar);
router.delete('/:id', idValido, controller.remover);

module.exports = router;
