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

    // Validação de ID inválido -> 400 Bad Request
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      throw criarErro('ID deve ser um número válido', 400);
    }

    const tarefa = await Tarefa.buscarPorId(id);

    // Tarefa não encontrada -> 404 Not Found
    if (!tarefa) {
      throw criarErro('Tarefa não encontrada', 404);
    }

    return res.status(200).json(tarefa);
  } catch (err) {
    return next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { titulo, descricao, status, prioridade } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
      throw criarErro('O campo "titulo" é obrigatório', 400);
    }

    const novaTarefa = await Tarefa.criar({
      titulo: titulo.trim(),
      descricao: descricao || '',
      status: status || 'todo',
      prioridade: prioridade || 'media'
    });

    return res.status(201).json(novaTarefa);
  } catch (err) {
    return next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      throw criarErro('ID deve ser um número válido', 400);
    }

    const tarefaAtualizada = await Tarefa.atualizar(id, req.body);

    if (!tarefaAtualizada) {
      throw criarErro('Tarefa não encontrada para atualização', 404);
    }

    return res.status(200).json(tarefaAtualizada);
  } catch (err) {
    return next(err);
  }
}

async function remover(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      throw criarErro('ID deve ser um número válido', 400);
    }

    const removida = await Tarefa.remover(id);

    if (!removida) {
      throw criarErro('Tarefa não encontrada para remoção', 404);
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function avancar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      throw criarErro('ID deve ser um número válido', 400);
    }

    const tarefa = await Tarefa.avancar(id);

    if (!tarefa) {
      throw criarErro('Tarefa não encontrada para avançar status', 404);
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
  avancar
};

