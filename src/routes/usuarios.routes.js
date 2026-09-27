// src/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');
const autenticar = require('../middlewares/autenticar');

router.get('/', usuariosController.listar);
router.get('/:id', usuariosController.buscarPorId);
router.post('/', validar(schemas.usuario), usuariosController.criar);
router.put('/:id', autenticar, usuariosController.atualizar);
router.delete('/:id', autenticar, usuariosController.remover);

module.exports = router;
