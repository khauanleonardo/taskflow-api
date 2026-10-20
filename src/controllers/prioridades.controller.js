const prioridadeModel = require('../models/prioridade.model');
const criarErro = require('../utils/criarErro');

const prioridadesController = {
  async listar(req, res, next) {
    try {
      const prioridades = await prioridadeModel.listar();
      return res.status(200).json(prioridades);
    } catch (err) {
      return next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const prioridade = await prioridadeModel.buscarPorId(id);
      if (!prioridade) {
        return next(criarErro(404, 'Prioridade não encontrada'));
      }
      return res.status(200).json(prioridade);
    } catch (err) {
      return next(err);
    }
  },

  async criar(req, res, next) {
    try {
      const { nome } = req.body;
      const nova = await prioridadeModel.criar({ nome });
      return res.status(201).json(nova);
    } catch (err) {
      return next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const atualizada = await prioridadeModel.atualizar(id, req.body);
      if (!atualizada) {
        return next(criarErro(404, 'Prioridade não encontrada'));
      }
      return res.status(200).json(atualizada);
    } catch (err) {
      return next(err);
    }
  },

  async remover(req, res, next) {
    try {
      const id = Number(req.params.id);
      const removida = await prioridadeModel.remover(id);
      if (!removida) {
        return next(criarErro(404, 'Prioridade não encontrada'));
      }
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = prioridadesController;
