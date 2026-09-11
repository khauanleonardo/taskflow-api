const projetoModel = require('../models/projeto.model');

const projetosController = {
  listar(req, res) {
    res.json(projetoModel.listar());
  },
  buscarPorId(req, res) {
    const projeto = projetoModel.buscarPorId(req.params.id);
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
    res.json(projeto);
  },
  criar(req, res) {
    const novo = projetoModel.criar(req.body);
    res.status(201).json(novo);
  },
  atualizar(req, res) {
    const atualizado = projetoModel.atualizar(req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ erro: 'Projeto não encontrado' });
    res.json(atualizado);
  },
  remover(req, res) {
    const removido = projetoModel.remover(req.params.id);
    if (!removido) return res.status(404).json({ erro: 'Projeto não encontrado' });
    res.status(204).send();
  }
};

module.exports = projetosController;