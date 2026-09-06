const tarefaModel = require('../models/tarefa.model');
const usuarioModel = require('../models/usuario.model');
const projetoModel = require('../models/projeto.model');

const PRIORIDADES_VALIDAS = ['alta', 'media', 'baixa'];
const COLUNAS_VALIDAS = ['afazer', 'andamento', 'concluido'];

const tarefasController = {
  // Nível 1C: Filtrar por coluna, usuarioId e/ou projetoId via req.query
  listar(req, res) {
    const { coluna, usuarioId, projetoId } = req.query;

    const filtros = {
      coluna,
      usuarioId: usuarioId ? parseInt(usuarioId, 10) : undefined,
      projetoId: projetoId ? parseInt(projetoId, 10) : undefined
    };

    const resultado = tarefaModel.listar(filtros);
    res.json(resultado);
  },

  buscarPorId(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const tarefa = tarefaModel.buscar(id);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });

    res.json(tarefa);
  },

  criar(req, res) {
    const { texto, prioridade, coluna, usuarioId, projetoId } = req.body;

    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({ erro: 'Texto é obrigatório' });
    }

    // Base B: Validação de Prioridade
    if (prioridade && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({ erro: 'Prioridade inválida. Use: alta, media ou baixa' });
    }

    // Base B: Validação de Coluna
    if (coluna && !COLUNAS_VALIDAS.includes(coluna)) {
      return res.status(400).json({ erro: 'Coluna inválida. Use: afazer, andamento ou concluido' });
    }

    const parsedUsuarioId = usuarioId ? parseInt(usuarioId, 10) : null;
    const parsedProjetoId = projetoId ? parseInt(projetoId, 10) : null;

    // Base A: Validar existência do usuário
    if (parsedUsuarioId) {
      const usuarioExiste = usuarioModel.buscar(parsedUsuarioId);
      if (!usuarioExiste) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }
    }

    // Nível 2B: Validar existência do projeto
    if (parsedProjetoId) {
      const projetoExiste = projetoModel.buscar(parsedProjetoId);
      if (!projetoExiste) {
        return res.status(400).json({ erro: 'Projeto não encontrado' });
      }
    }

    const colunaFinal = coluna || 'afazer';

    // Nível 1A: Limite WIP de 2 tarefas em andamento por usuário
    if (colunaFinal === 'andamento' && parsedUsuarioId) {
      const tarefasEmAndamento = tarefaModel.listar({
        usuarioId: parsedUsuarioId,
        coluna: 'andamento'
      });
      if (tarefasEmAndamento.length >= 2) {
        return res.status(400).json({ erro: 'Limite de 2 tarefas em andamento por usuário atingido' });
      }
    }

    // Nível 1B: Definição automática de data de conclusão
    const concluidaEm = colunaFinal === 'concluido' ? new Date().toISOString() : null;

    const novaTarefa = tarefaModel.adicionar({
      texto: texto.trim(),
      prioridade: prioridade || 'baixa',
      coluna: colunaFinal,
      usuarioId: parsedUsuarioId,
      projetoId: parsedProjetoId,
      concluidaEm
    });

    res.status(201).json(novaTarefa);
  },

  atualizar(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const tarefaExistente = tarefaModel.buscar(id);
    if (!tarefaExistente) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    const { prioridade, coluna, usuarioId, projetoId } = req.body;

    // Base B: Validações
    if (prioridade && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({ erro: 'Prioridade inválida. Use: alta, media ou baixa' });
    }

    if (coluna && !COLUNAS_VALIDAS.includes(coluna)) {
      return res.status(400).json({ erro: 'Coluna inválida. Use: afazer, andamento ou concluido' });
    }

    const parsedUsuarioId = usuarioId !== undefined ? (usuarioId ? parseInt(usuarioId, 10) : null) : tarefaExistente.usuarioId;
    const parsedProjetoId = projetoId !== undefined ? (projetoId ? parseInt(projetoId, 10) : null) : tarefaExistente.projetoId;

    // Base A: Validar existência do usuário caso alterado
    if (parsedUsuarioId) {
      const usuarioExiste = usuarioModel.buscar(parsedUsuarioId);
      if (!usuarioExiste) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }
    }

    // Nível 2B: Validar existência do projeto caso alterado
    if (parsedProjetoId) {
      const projetoExiste = projetoModel.buscar(parsedProjetoId);
      if (!projetoExiste) {
        return res.status(400).json({ erro: 'Projeto não encontrado' });
      }
    }

    const novaColuna = coluna || tarefaExistente.coluna;

    // Nível 1A: Limite WIP de 2 tarefas em andamento na atualização
    if (novaColuna === 'andamento' && parsedUsuarioId) {
      const tarefasAndamentoUsuario = tarefaModel.listar({
        usuarioId: parsedUsuarioId,
        coluna: 'andamento'
      }).filter(t => t.id !== id);

      if (tarefasAndamentoUsuario.length >= 2) {
        return res.status(400).json({ erro: 'Limite de 2 tarefas em andamento por usuário atingido' });
      }
    }

    // Nível 1B: Data de conclusão automática
    let concluidaEm = tarefaExistente.concluidaEm;
    if (coluna !== undefined) {
      if (coluna === 'concluido' && tarefaExistente.coluna !== 'concluido') {
        concluidaEm = new Date().toISOString();
      } else if (coluna !== 'concluido' && tarefaExistente.coluna === 'concluido') {
        concluidaEm = null;
      }
    }

    const dadosParaAtualizar = {
      ...req.body,
      usuarioId: parsedUsuarioId,
      projetoId: parsedProjetoId,
      concluidaEm
    };

    const atualizada = tarefaModel.atualizar(id, dadosParaAtualizar);
    res.json(atualizada);
  },

  remover(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const removida = tarefaModel.remover(id);
    if (!removida) return res.status(404).json({ erro: 'Tarefa não encontrada' });

    res.json({ mensagem: 'Tarefa removida com sucesso', tarefa: removida });
  },

  // Nível 2A: Ranking de usuários nas estatísticas
  estatisticas(req, res) {
    const { coluna } = req.query;
    const base = coluna ? tarefaModel.listarPorColuna(coluna) : tarefaModel.listar();

    const porColuna = {
      afazer: base.filter(t => t.coluna === 'afazer').length,
      andamento: base.filter(t => t.coluna === 'andamento').length,
      concluido: base.filter(t => t.coluna === 'concluido').length
    };

    // Construção do ranking de usuários
    const todosUsuarios = usuarioModel.listar();
    const todasTarefas = tarefaModel.listar();

    const rankingUsuarios = todosUsuarios.map(u => {
      const totalTarefas = todasTarefas.filter(t => t.usuarioId === u.id).length;
      return {
        usuarioId: u.id,
        nome: u.nome,
        totalTarefas
      };
    }).sort((a, b) => b.totalTarefas - a.totalTarefas);

    res.json({
      total: base.length,
      porColuna,
      rankingUsuarios
    });
  },

  resumo(req, res) {
    const tarefas = tarefaModel.listar();
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.coluna === 'concluido').length;
    const emAndamento = tarefas.filter(t => t.coluna === 'andamento').length;
    const aFazer = tarefas.filter(t => t.coluna === 'afazer').length;

    res.json({
      mensagem: `Você tem ${total} tarefas. ${concluidas} concluídas, ${emAndamento} em andamento e ${aFazer} a fazer.`
    });
  }
};

module.exports = tarefasController;