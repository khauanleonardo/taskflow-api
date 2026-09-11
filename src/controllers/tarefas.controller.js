const tarefaModel = require('../models/tarefa.model');

const tarefasController = {
  listar(req, res) {
    res.json(tarefaModel.listar());
  },
  buscarPorId(req, res) {
    const tarefa = tarefaModel.buscarPorId(req.params.id);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.json(tarefa);
  },
  criar(req, res) {
    const nova = tarefaModel.criar(req.body);
    res.status(201).json(nova);
  },
  atualizar(req, res) {
    const atualizada = tarefaModel.atualizar(req.params.id, req.body);
    if (!atualizada) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.json(atualizada);
  },
  remover(req, res) {
    const removida = tarefaModel.remover(req.params.id);
    if (!removida) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.status(204).send();
  }
};

module.exports = tarefasController;