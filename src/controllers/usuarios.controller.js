// src/controllers/usuarios.controller.js
const usuarioModel = require('../models/usuario.model');
const tarefaModel = require('../models/tarefa.model');

const usuariosController = {
  listar(req, res) {
    res.json(usuarioModel.listar());
  },

  buscarPorId(req, res) {
    const { id } = req.params;
    const usuario = usuarioModel.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json(usuario);
  },

  criar(req, res) {
    const { nome, email, senha } = req.body;

    const existente = usuarioModel.buscarPorEmail(email);
    if (existente) {
      return res.status(400).json({ erro: 'E-mail já cadastrado no sistema' });
    }

    const novo = usuarioModel.criar({ nome, email, senha });
    res.status(201).json(novo);
  },

  atualizar(req, res) {
    const { id } = req.params;
    const atualizado = usuarioModel.atualizar(id, req.body);
    if (!atualizado) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json(atualizado);
  },

  remover(req, res) {
    const { id } = req.params;

    // Regra de dependência: impede deletar se o usuário tiver tarefas
    const tarefasDoUsuario = tarefaModel.listar({ usuarioId: id });
    if (tarefasDoUsuario.length > 0) {
      return res.status(400).json({
        erro: 'Não é possível excluir usuário com tarefas vinculadas'
      });
    }

    const removido = usuarioModel.remover(id);
    if (!removido) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json({ mensagem: 'Usuário removido com sucesso' });
  }
};

module.exports = usuariosController;
