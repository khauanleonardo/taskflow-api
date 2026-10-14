const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');
const autenticar = require('../middlewares/autenticar');

// Listar e Buscar (Públicas ou com auth opcional)
router.get('/', tarefasController.listar);
router.get('/:id', tarefasController.buscar);

// Criar, Atualizar, Remover e Avançar (Protegidas com JWT)
router.post('/', autenticar, tarefasController.criar);
router.put('/:id', autenticar, tarefasController.atualizar);
router.delete('/:id', autenticar, tarefasController.remover);
router.patch('/:id/avancar', autenticar, tarefasController.avancar);

module.exports = router;
