const projetoModel = require('../models/projeto.model');
const Tarefa = require('../models/tarefa.model');
const criarErro = require('../utils/criarErro');

const projetosController = {
  async listar(req, res, next) {
    try {
      const projetos = await projetoModel.listar();
      return res.status(200).json(projetos);
    } catch (err) {
      return next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const projeto = await projetoModel.buscar(id);
      if (!projeto) {
        return next(criarErro(404, 'Projeto não encontrado'));
      }
      return res.status(200).json(projeto);
    } catch (err) {
      return next(err);
    }
  },

  async criar(req, res, next) {
    try {
      const { nome, descricao } = req.body;
      const novo = await projetoModel.adicionar({ nome, descricao, usuarioId: 1 });
      return res.status(201).json(novo);
    } catch (err) {
      return next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const atualizado = await projetoModel.atualizar(id, req.body);
      if (!atualizado) {
        return next(criarErro(404, 'Projeto não encontrado'));
      }
      return res.status(200).json(atualizado);
    } catch (err) {
      return next(err);
    }
  },

  async remover(req, res, next) {
    try {
      const id = Number(req.params.id);

      // O schema usa ON DELETE CASCADE: o banco apagaria as tarefas em silêncio.
      // Por isso a API confere antes e responde 409.
      const tarefasDoProjeto = await Tarefa.listar({ projetoId: id });
      if (tarefasDoProjeto.length > 0) {
        return next(criarErro(409, 'Não é possível excluir projeto com tarefas associadas'));
      }

      const removido = await projetoModel.remover(id);
      if (!removido) {
        return next(criarErro(404, 'Projeto não encontrado'));
      }
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  },

  async resumo(req, res, next) {
    try {
      const id = Number(req.params.id);
      const projeto = await projetoModel.buscar(id);
      if (!projeto) {
        return next(criarErro(404, 'Projeto não encontrado'));
      }
      const tarefas = await Tarefa.listar({ projetoId: id });
      const total = tarefas.length;
      const concluidas = tarefas.filter((t) => t.coluna === 'concluido').length;

      return res.status(200).json({
        projeto: projeto.nome,
        totalTarefas: total,
        concluidas,
        percentualConcluido: total > 0 ? Math.round((concluidas / total) * 100) : 0
      });
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = projetosController;
