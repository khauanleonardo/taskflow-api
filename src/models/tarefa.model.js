const prisma = require('../database/prisma');

const mapaIdParaTexto = {
  1: 'baixa',
  2: 'media',
  3: 'alta',
  4: 'urgente'
};

const mapaTextoParaId = {
  baixa: 1,
  baixo: 1,
  media: 2,
  medio: 2,
  média: 2,
  médio: 2,
  alta: 3,
  alto: 3,
  urgente: 4
};

// Nomes que o front mostra no card. As chaves são as relações do schema.prisma.
const incluirNomes = {
  projeto: { select: { nome: true } },
  usuario: { select: { nome: true } },
  refPrioridade: { select: { nome: true, descricao: true } }
};

// Converte o registro do Prisma no formato que a API devolve (o front lê esses campos)
function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  const { projeto, usuario, refPrioridade, ...dados } = tarefa;

  return {
    id: dados.id,
    texto: dados.texto,
    coluna: dados.coluna,
    ordem: dados.ordem,
    descricao: dados.descricao || '',
    usuario_id: dados.usuario_id,
    usuario: usuario?.nome,
    projeto_id: dados.projeto_id,
    projeto: projeto?.nome,
    idprioridade: dados.idprioridade,
    prioridade: refPrioridade?.descricao || refPrioridade?.nome || 'Médio',
    criado_em: dados.criado_em,
    iniciada_em: dados.iniciada_em,
    concluida_em: dados.concluida_em
  };
}

// Descobre o id da prioridade a partir do body (idprioridade ou texto legado)
function prioridadeParaId(dados) {
  if (dados.idprioridade !== undefined && dados.idprioridade !== null) {
    return Number(dados.idprioridade) || 2;
  }
  if (dados.prioridade) {
    return mapaTextoParaId[String(dados.prioridade).toLowerCase()] || 2;
  }
  return 2;
}

class Tarefa {
  static async listar(filtros = {}) {
    const where = {};

    const usuarioId = filtros.usuarioId || filtros.usuario_id;
    if (usuarioId) {
      where.usuario_id = Number(usuarioId);
    }

    const projetoId = filtros.projetoId || filtros.projeto_id;
    if (projetoId) {
      where.projeto_id = Number(projetoId);
    }

    const coluna = filtros.coluna || filtros.status;
    if (coluna) {
      where.coluna = coluna;
    }

    const tarefas = await prisma.tarefas.findMany({
      where,
      orderBy: { id: 'asc' },
      include: incluirNomes
    });

    return tarefas.map(formatarTarefa);
  }

  static async buscarPorId(id) {
    const tarefa = await prisma.tarefas.findUnique({
      where: { id: Number(id) },
      include: incluirNomes
    });
    return formatarTarefa(tarefa);
  }

  // Dia 8, passo 2: create com data. O id não vai: o banco gera
  static async criar(dados) {
    const coluna = dados.coluna || dados.status || 'afazer';
    const idprioridade = prioridadeParaId(dados);

    const nova = await prisma.tarefas.create({
      data: {
        texto: dados.texto || dados.titulo || 'Nova Tarefa',
        coluna,
        ordem: Number(dados.ordem) || 0,
        descricao: dados.descricao || '',
        usuario_id: Number(dados.usuario_id || dados.usuarioId || 1),
        projeto_id: Number(dados.projeto_id || dados.projetoId || 1),
        idprioridade,
        prioridade: mapaIdParaTexto[idprioridade] || 'media',
        iniciada_em: coluna === 'andamento' ? new Date() : null,
        concluida_em: coluna === 'concluido' ? new Date() : null
      },
      include: incluirNomes
    });

    return formatarTarefa(nova);
  }

  // Dia 8, passo 3: findUnique antes (regras de iniciada_em) e update com where + data
  static async atualizar(id, dados) {
    const idNum = Number(id);
    const atual = await prisma.tarefas.findUnique({ where: { id: idNum } });
    if (!atual) return null; // o controller lança 404

    const data = {};

    if (dados.texto !== undefined || dados.titulo !== undefined) {
      data.texto = dados.texto || dados.titulo;
    }

    if (dados.descricao !== undefined) {
      data.descricao = dados.descricao;
    }

    if (dados.coluna !== undefined || dados.status !== undefined) {
      const novaColuna = dados.coluna || dados.status;
      data.coluna = novaColuna;

      if (novaColuna === 'concluido') {
        data.concluida_em = new Date();
      } else {
        data.concluida_em = null;
      }

      if (atual.coluna === 'afazer' && novaColuna === 'andamento') {
        data.iniciada_em = new Date();
      } else if (atual.coluna === 'andamento' && novaColuna === 'afazer') {
        data.iniciada_em = null;
      }
    }

    if (dados.idprioridade !== undefined && dados.idprioridade !== null) {
      data.idprioridade = Number(dados.idprioridade);
      data.prioridade = mapaIdParaTexto[data.idprioridade] || 'media';
    } else if (dados.prioridade !== undefined) {
      data.idprioridade = mapaTextoParaId[String(dados.prioridade).toLowerCase()] || 2;
      data.prioridade = mapaIdParaTexto[data.idprioridade] || 'media';
    }

    if (dados.usuario_id !== undefined || dados.usuarioId !== undefined) {
      data.usuario_id = Number(dados.usuario_id || dados.usuarioId);
    }

    if (dados.projeto_id !== undefined || dados.projetoId !== undefined) {
      data.projeto_id = Number(dados.projeto_id || dados.projetoId);
    }

    if (dados.ordem !== undefined) {
      data.ordem = Number(dados.ordem);
    }

    try {
      const atualizada = await prisma.tarefas.update({
        where: { id: idNum },
        data,
        include: incluirNomes
      });
      return formatarTarefa(atualizada);
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      throw erro;
    }
  }

  // Dia 8, passo 4: delete devolve o registro excluído. P2025 vira null (controller: 404)
  static async remover(id) {
    try {
      const tarefa = await prisma.tarefas.delete({
        where: { id: Number(id) },
        include: incluirNomes
      });
      return formatarTarefa(tarefa);
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      throw erro;
    }
  }

  static async avancar(id) {
    const tarefa = await this.buscarPorId(id);
    if (!tarefa) return null;

    const proximaColuna = {
      afazer: 'andamento',
      andamento: 'concluido',
      concluido: 'concluido'
    }[tarefa.coluna] || 'afazer';

    return await this.atualizar(id, { coluna: proximaColuna });
  }
}

Tarefa.adicionar = Tarefa.criar;
Tarefa.excluir = Tarefa.remover;

module.exports = Tarefa;
