// src/controllers/projetos.controller.js
const projetoModel = require('../models/projeto.model');
const tarefaModel = require('../models/tarefa.model');

const projetosController = {
  listar(req, res) {
    res.json(projetoModel.listar());
  },

  buscarPorId(req, res) {
    const { id } = req.params;
    const projeto = projetoModel.buscarPorId(id);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }
    res.json(projeto);
  },

  criar(req, res) {
    const { nome, descricao } = req.body;
    const novo = projetoModel.criar({ nome, descricao });
    res.status(201).json(novo);
  },

  atualizar(req, res) {
    const { id } = req.params;
    const atualizado = projetoModel.atualizar(id, req.body);
    if (!atualizado) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }
    res.json(atualizado);
  },

  remover(req, res) {
    const { id } = req.params;

    // Regra de dependência: impede exclusão de projeto com tarefas associadas
    const tarefasDoProjeto = tarefaModel.listar({ projetoId: id });
    if (tarefasDoProjeto.length > 0) {
      return res.status(400).json({
        erro: 'Não é possível excluir projeto com tarefas associadas'
      });
    }

    const removido = projetoModel.remover(id);
    if (!removido) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }
    res.json({ mensagem: 'Projeto removido com sucesso' });
  },

  resumo(req, res) {
    const { id } = req.params;
    const projeto = projetoModel.buscarPorId(id);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    const tarefas = tarefaModel.listar({ projetoId: id });
    const total = tarefas.length;
    const concluidas = tarefas.filter((t) => t.coluna === 'concluido').length;

    res.json({
      projeto: projeto.nome,
      totalTarefas: total,
      concluidas,
      percentualConcluido: total > 0 ? Math.round((concluidas / total) * 100) : 0
    });
  }
};

module.exports = projetosController;
