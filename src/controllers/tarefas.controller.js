const tarefaModel = require('../models/tarefa.model');

async function listar(req, res) {
  try {
    const tarefas = await tarefaModel.listar(req.query);
    res.json(tarefas);
  } catch (err) {
    console.error('Erro ao listar tarefas:', err.message);
    res.status(500).json({ erro: 'Erro ao listar tarefas' });
  }
}

async function buscar(req, res) {
  try {
    const id = Number(req.params.id);
    const tarefa = await tarefaModel.buscar(id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    res.json(tarefa);
  } catch (err) {
    console.error('Erro ao buscar tarefa:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar tarefa' });
  }
}

async function criar(req, res) {
  try {
    const dados = {
      ...req.body,
      usuarioId: req.body.usuarioId || req.body.usuario_id || req.usuario?.id || 1,
      projetoId: req.body.projetoId || req.body.projeto_id || 1
    };
    const nova = await tarefaModel.adicionar(dados);
    res.status(201).json(nova);
  } catch (err) {
    console.error('Erro ao criar tarefa:', err.message);
    res.status(500).json({ erro: 'Erro ao criar tarefa' });
  }
}

async function atualizar(req, res) {
  try {
    const id = Number(req.params.id);
    const atualizada = await tarefaModel.atualizar(id, req.body);
    if (!atualizada) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    res.json(atualizada);
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
  }
}

async function remover(req, res) {
  try {
    const id = Number(req.params.id);
    const removida = await tarefaModel.remover(id);
    if (!removida) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao remover tarefa:', err.message);
    res.status(500).json({ erro: 'Erro ao remover tarefa' });
  }
}

async function avancar(req, res) {
  try {
    const id = Number(req.params.id);
    const atualizada = await tarefaModel.avancar(id);
    if (!atualizada) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    res.json(atualizada);
  } catch (err) {
    console.error('Erro ao avançar tarefa:', err.message);
    res.status(500).json({ erro: 'Erro ao avançar tarefa' });
  }
}

module.exports = { listar, buscar, criar, atualizar, remover, avancar };
