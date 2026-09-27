// src/routes/projetos.routes.js
const express = require('express');
const router = express.Router();
const projetosController = require('../controllers/projetos.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');
const autenticar = require('../middlewares/autenticar');

// Rota específica de resumo antes de :id
router.get('/:id/resumo', projetosController.resumo);

// CRUD
router.get('/', projetosController.listar);
router.get('/:id', projetosController.buscarPorId);
router.post('/', autenticar, validar(schemas.projeto), projetosController.criar);
router.put('/:id', autenticar, projetosController.atualizar);
router.delete('/:id', autenticar, projetosController.remover);

module.exports = router;
