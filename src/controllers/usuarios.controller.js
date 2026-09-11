const usuarioModel = require('../models/usuario.model');

const usuariosController = {
  listar(req, res) {
    res.json(usuarioModel.listar());
  },
  buscarPorId(req, res) {
    const usuario = usuarioModel.buscarPorId(req.params.id);
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(usuario);
  },
  criar(req, res) {
    const novo = usuarioModel.criar(req.body);
    res.status(201).json(novo);
  },
  atualizar(req, res) {
    const atualizado = usuarioModel.atualizar(req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(atualizado);
  },
  remover(req, res) {
    const removido = usuarioModel.remover(req.params.id);
    if (!removido) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.status(204).send();
  }
};

module.exports = usuariosController;