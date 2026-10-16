const { Router } = require('express');
const tarefasController = require('../controllers/tarefas.controller');

const router = Router();

router.get('/', tarefasController.listar);
router.get('/:id', tarefasController.buscarPorId);
router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.remover);
router.patch('/:id/avancar', tarefasController.avancar);

module.exports = router;
