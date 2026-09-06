const usuarioModel = require('../models/usuario.model');
const tarefaModel = require('../models/tarefa.model');

const usuariosController = {
  listar(req, res) {
    res.json(usuarioModel.listar());
  },

  buscarPorId(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const usuario = usuarioModel.buscar(id);
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    res.json(usuario);
  },

  criar(req, res) {
    const { nome, email } = req.body;

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }

    const emailTratado = email.trim().toLowerCase();

    if (usuarioModel.buscarPorEmail(emailTratado)) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    const novoUsuario = usuarioModel.adicionar({
      nome: nome.trim(),
      email: emailTratado
    });

    res.status(201).json(novoUsuario);
  },

  atualizar(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const usuarioExistente = usuarioModel.buscar(id);
    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const { nome, email } = req.body;
    const dadosParaAtualizar = {};

    if (nome !== undefined) {
      if (typeof nome !== 'string' || !nome.trim()) {
        return res.status(400).json({ erro: 'Nome inválido' });
      }
      dadosParaAtualizar.nome = nome.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ erro: 'Email inválido' });
      }
      const emailTratado = email.trim().toLowerCase();
      const usuarioComMesmoEmail = usuarioModel.buscarPorEmail(emailTratado);
      
      if (usuarioComMesmoEmail && usuarioComMesmoEmail.id !== id) {
        return res.status(400).json({ erro: 'Email já está em uso por outro usuário' });
      }
      dadosParaAtualizar.email = emailTratado;
    }

    const atualizado = usuarioModel.atualizar(id, dadosParaAtualizar);
    res.json(atualizado);
  },

  // Base C: Proteger usuário que possui tarefas
  remover(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const usuario = usuarioModel.buscar(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const tarefasDoUsuario = tarefaModel.listarPorUsuario(id);
    if (tarefasDoUsuario.length > 0) {
      return res.status(400).json({
        erro: 'Usuário possui tarefas. Remova as tarefas antes de deletar o usuário.'
      });
    }

    const removido = usuarioModel.remover(id);
    res.json({ mensagem: 'Usuário removido com sucesso', usuario: removido });
  }
};

module.exports = usuariosController;