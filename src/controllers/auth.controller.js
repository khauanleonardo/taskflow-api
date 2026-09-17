const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');

const authController = {
  login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const usuario = usuarioModel.buscarPorEmail(email);

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Adicionado fallback para evitar o erro se o .env falhar
    const segredo = process.env.JWT_SECRET || 'chave_secreta_taskflow_123';

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      segredo,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome }
    });
  }
};

module.exports = authController;