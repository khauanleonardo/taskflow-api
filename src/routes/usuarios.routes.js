const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const validar = require('../middlewares/validar.middleware');
const schemas = require('../schemas/schemas');

// Validação de ID na URL (Slide 21)
const idValido = validar(schemas.id, 'params');

router.get('/', controller.listar);
router.post('/', validar(schemas.usuario), controller.criar);
router.get('/:id', idValido, controller.buscarPorId);
router.put('/:id', idValido, validar(schemas.usuario), controller.atualizar);
router.delete('/:id', idValido, controller.remover);

module.exports = router;
