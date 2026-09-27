// src/controllers/tarefas.controller.js
const tarefaModel = require('../models/tarefa.model');
const usuarioModel = require('../models/usuario.model');
const projetoModel = require('../models/projeto.model');

const tarefasController = {
  listar(req, res) {
    const { coluna, prioridade, usuarioId, projetoId } = req.query;
    const tarefas = tarefaModel.listar({ coluna, prioridade, usuarioId, projetoId });
    res.json(tarefas);
  },

  buscarPorId(req, res) {
    const { id } = req.params;
    const tarefa = tarefaModel.buscarPorId(id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    res.json(tarefa);
  },

  criar(req, res) {
    const { texto, descricao, prioridade, coluna, cidadeUf, usuarioId, projetoId } = req.body;

    // Validação de chaves estrangeiras
    if (usuarioId && !usuarioModel.buscarPorId(usuarioId)) {
      return res.status(400).json({ erro: 'usuarioId informado não existe' });
    }
    if (projetoId && !projetoModel.buscarPorId(projetoId)) {
      return res.status(400).json({ erro: 'projetoId informado não existe' });
    }

    // Regra WIP (Limite de 2 tarefas em andamento por usuário)
    const colunaAlvo = (coluna || 'afazer').toLowerCase();
    const idUsuario = usuarioId || req.usuario?.id;

    if (idUsuario && colunaAlvo === 'andamento') {
      const emAndamento = tarefaModel.contarPorUsuarioEColuna(idUsuario, 'andamento');
      if (emAndamento >= 2) {
        return res.status(400).json({
          erro: 'Limite de 2 tarefas em andamento atingido para este usuário'
        });
      }
    }

    const novaTarefa = tarefaModel.criar({
      texto,
      descricao,
      prioridade,
      coluna: colunaAlvo,
      cidadeUf,
      usuarioId: idUsuario,
      projetoId
    });

    res.status(201).json(novaTarefa);
  },

  atualizar(req, res) {
    const { id } = req.params;
    const tarefaExistente = tarefaModel.buscarPorId(id);
    if (!tarefaExistente) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    const { usuarioId, projetoId, coluna } = req.body;

    if (usuarioId && !usuarioModel.buscarPorId(usuarioId)) {
      return res.status(400).json({ erro: 'usuarioId informado não existe' });
    }
    if (projetoId && !projetoModel.buscarPorId(projetoId)) {
      return res.status(400).json({ erro: 'projetoId informado não existe' });
    }

    // Regra WIP ao mover para "andamento"
    const novaColuna = coluna ? coluna.toLowerCase() : tarefaExistente.coluna;
    const idUsuario = usuarioId || tarefaExistente.usuarioId;

    if (idUsuario && novaColuna === 'andamento' && tarefaExistente.coluna !== 'andamento') {
      const emAndamento = tarefaModel.contarPorUsuarioEColuna(idUsuario, 'andamento');
      if (emAndamento >= 2) {
        return res.status(400).json({
          erro: 'Limite de 2 tarefas em andamento atingido para este usuário'
        });
      }
    }

    const atualizada = tarefaModel.atualizar(id, req.body);
    res.json(atualizada);
  },

  remover(req, res) {
    const { id } = req.params;
    const removido = tarefaModel.remover(id);
    if (!removido) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    res.json({ mensagem: 'Tarefa removida com sucesso' });
  },

  estatisticas(req, res) {
    const todas = tarefaModel.listar();
    const total = todas.length;

    const porColuna = {
      afazer: todas.filter((t) => t.coluna === 'afazer').length,
      andamento: todas.filter((t) => t.coluna === 'andamento').length,
      concluido: todas.filter((t) => t.coluna === 'concluido').length
    };

    const porPrioridade = {
      alta: todas.filter((t) => t.prioridade === 'alta').length,
      media: todas.filter((t) => t.prioridade === 'media').length,
      baixa: todas.filter((t) => t.prioridade === 'baixa').length
    };

    res.json({
      total,
      porColuna,
      porPrioridade
    });
  },

  resumo(req, res) {
    const todas = tarefaModel.listar();
    const concluidas = todas.filter((t) => t.coluna === 'concluido').length;
    res.json({
      mensagem: `O TaskFlow possui ${todas.length} tarefas cadastradas, das quais ${concluidas} estão concluídas.`
    });
  }
};

module.exports = tarefasController;
