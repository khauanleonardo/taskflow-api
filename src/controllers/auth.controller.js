// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');

const authController = {
  login(req, res) {
    const { email, senha } = req.body;

    const usuario = usuarioModel.buscarPorEmail(email);
    if (!usuario || String(usuario.senha) !== String(senha)) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    };

    const segredo = process.env.JWT_SECRET || 'taskflow_segredo_super_secreto_senai_2026';
    const token = jwt.sign(payload, segredo, { expiresIn: '8h' });

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: payload
    });
  }
};

module.exports = authController;
