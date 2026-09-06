const projetoModel = require('../models/projeto.model');
const tarefaModel = require('../models/tarefa.model');

const projetosController = {
  listar(req, res) {
    res.json(projetoModel.listar());
  },

  buscarPorId(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const projeto = projetoModel.buscar(id);
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });

    res.json(projeto);
  },

  criar(req, res) {
    const { nome, descricao } = req.body;
    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({ erro: 'O nome do projeto é obrigatório' });
    }

    const novoProjeto = projetoModel.adicionar({ nome: nome.trim(), descricao });
    res.status(201).json(novoProjeto);
  },

  atualizar(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const atualizado = projetoModel.atualizar(id, req.body);
    if (!atualizado) return res.status(404).json({ erro: 'Projeto não encontrado' });

    res.json(atualizado);
  },

  // Nível 2B: Impede remoção se houver tarefas vinculadas
  remover(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const projeto = projetoModel.buscar(id);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    const tarefasDoProjeto = tarefaModel.listarPorProjeto(id);
    if (tarefasDoProjeto.length > 0) {
      return res.status(400).json({
        erro: 'Projeto possui tarefas associadas. Remova as tarefas antes.'
      });
    }

    const removido = projetoModel.remover(id);
    res.json({ mensagem: 'Projeto removido com sucesso', projeto: removido });
  },

  // Nível 2C: Mapeamento e métricas das colunas
  resumo(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const projeto = projetoModel.buscar(id);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    const tarefasDoProjeto = tarefaModel.listarPorProjeto(id);

    const porColuna = {
      afazer: tarefasDoProjeto.filter(t => t.coluna === 'afazer').length,
      andamento: tarefasDoProjeto.filter(t => t.coluna === 'andamento').length,
      concluido: tarefasDoProjeto.filter(t => t.coluna === 'concluido').length
    };

    res.json({
      projeto,
      totalTarefas: tarefasDoProjeto.length,
      porColuna
    });
  }
};

module.exports = projetosController;