const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const tarefasController = require('../controllers/tarefas.controller');

// Todas as rotas de tarefas exigem o token
router.use(autenticar);

router.get('/', tarefasController.listar);
router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.remover);

module.exports = router;
