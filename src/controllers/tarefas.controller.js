const tarefasData = require('../data/tarefasData');

function listar(req, res) {
  res.json(tarefasData.getTarefas());
}

function criar(req, res) {
  const nova = tarefasData.criarTarefa(req.body);
  res.status(201).json(nova);
}

function atualizar(req, res) {
  const id = Number(req.params.id);
  const atualizada = tarefasData.atualizarTarefa(id, req.body);
  if (!atualizada) {
    return res.status(404).json({ erro: 'Tarefa não encontrada' });
  }
  res.json(atualizada);
}

function remover(req, res) {
  const id = Number(req.params.id);
  const removida = tarefasData.deletarTarefa(id);
  if (!removida) {
    return res.status(404).json({ erro: 'Tarefa não encontrada' });
  }
  res.status(204).send();
}

module.exports = { listar, criar, atualizar, remover };
