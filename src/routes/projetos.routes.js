const express = require('express');
const router = express.Router();
const controller = require('../controllers/projetos.controller');
const validar = require('../middlewares/validar.middleware');
const schemas = require('../schemas/schemas');

const idValido = validar(schemas.id, 'params');

router.get('/:id/resumo', idValido, controller.resumo);
router.get('/', controller.listar);
router.get('/:id', idValido, controller.buscarPorId);
router.post('/', validar(schemas.projeto), controller.criar);
router.put('/:id', idValido, validar(schemas.projeto), controller.atualizar);
router.delete('/:id', idValido, controller.remover);

module.exports = router;
