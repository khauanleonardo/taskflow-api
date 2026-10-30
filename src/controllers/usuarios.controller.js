const usuarioModel = require('../models/usuario.model');
const Tarefa = require('../models/tarefa.model');
const criarErro = require('../utils/criarErro');

const usuariosController = {
  async listar(req, res, next) {
    try {
      const usuarios = await usuarioModel.listar();
      return res.status(200).json(usuarios);
    } catch (err) {
      return next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuarioModel.buscarPorId(id);
      if (!usuario) {
        return next(criarErro(404, 'Usuário não encontrado'));
      }
      return res.status(200).json(usuario);
    } catch (err) {
      return next(err);
    }
  },

  // E-mail repetido não é checado aqui: o banco recusa (P2002) e o tratarErros responde 409
  async criar(req, res, next) {
    try {
      const { nome, email, senha } = req.body;
      const novo = await usuarioModel.criar({ nome, email, senha });
      return res.status(201).json(novo);
    } catch (err) {
      return next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const atualizado = await usuarioModel.atualizar(id, req.body);
      if (!atualizado) {
        return next(criarErro(404, 'Usuário não encontrado'));
      }
      return res.status(200).json(atualizado);
    } catch (err) {
      return next(err);
    }
  },

  async remover(req, res, next) {
    try {
      const id = Number(req.params.id);

      // ON DELETE CASCADE apagaria as tarefas do usuário em silêncio: conferimos antes
      const tarefasDoUsuario = await Tarefa.listar({ usuarioId: id });
      if (tarefasDoUsuario.length > 0) {
        return next(criarErro(409, 'Não é possível excluir usuário com tarefas vinculadas'));
      }

      const removido = await usuarioModel.remover(id);
      if (!removido) {
        return next(criarErro(404, 'Usuário não encontrado'));
      }
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = usuariosController;
