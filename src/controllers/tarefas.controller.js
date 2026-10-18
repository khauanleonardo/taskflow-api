const Tarefa = require('../models/tarefa.model');
const criarErro = require('../utils/criarErro');

async function listar(req, res, next) {
  try {
    const tarefas = await Tarefa.listar(req.query);
    return res.status(200).json(tarefas);
  } catch (err) {
    return next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const tarefa = await Tarefa.buscarPorId(id);

    if (!tarefa) {
      return next(criarErro(404, 'Tarefa não encontrada'));
    }

    return res.status(200).json(tarefa);
  } catch (err) {
    return next(err);
  }
}

async function criar(req, res, next) {
  try {
    const novaTarefa = await Tarefa.criar(req.body);
    return res.status(201).json(novaTarefa);
  } catch (err) {
    return next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const tarefaAtualizada = await Tarefa.atualizar(id, req.body);

    if (!tarefaAtualizada) {
      return next(criarErro(404, 'Tarefa não encontrada'));
    }

    return res.status(200).json(tarefaAtualizada);
  } catch (err) {
    return next(err);
  }
}

async function remover(req, res, next) {
  try {
    const id = Number(req.params.id);
    const removida = await Tarefa.remover(id);

    if (!removida) {
      return next(criarErro(404, 'Tarefa não encontrada'));
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function avancar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const tarefa = await Tarefa.avancar(id);

    if (!tarefa) {
      return next(criarErro(404, 'Tarefa não encontrada'));
    }

    return res.status(200).json(tarefa);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  excluir: remover,
  avancar
};
