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

function formatarTarefa(t) {
  if (!t) return null;
  const pRef = t.refPrioridade || {};
  const idPrioridade = t.idprioridade || pRef.id || 2;
  const prioridadeTexto = mapaIdParaTexto[idPrioridade] || (t.prioridade ? String(t.prioridade).toLowerCase() : 'media');

  return {
    id: t.id,
    texto: t.texto,
    titulo: t.texto,
    coluna: t.coluna,
    status: t.coluna,
    ordem: t.ordem ?? 0,
    descricao: t.descricao || '',
    usuario_id: t.usuario_id,
    usuario: t.usuario?.nome || `Usuário #${t.usuario_id}`,
    projeto_id: t.projeto_id,
    projeto: t.projeto?.nome || `Projeto #${t.projeto_id}`,
    idprioridade: idPrioridade,
    prioridade: prioridadeTexto,
    prioridade_rotulo: pRef.nome || pRef.descricao || 'Média',
    prioridade_cor: pRef.cor || (idPrioridade === 4 ? '#A855F7' : idPrioridade === 3 ? '#FF5065' : idPrioridade === 1 ? '#41D686' : '#F6C330'),
    criado_em: t.criado_em,
    iniciada_em: t.iniciada_em || null,
    concluida_em: t.concluida_em || null
  };
}

const includePadrao = {
  refPrioridade: {
    select: {
      id: true,
      nome: true,
      descricao: true,
      cor: true
    }
  },
  usuario: {
    select: {
      id: true,
      nome: true
    }
  },
  projeto: {
    select: {
      id: true,
      nome: true
    }
  }
};

class Tarefa {
  static async listar(filtros = {}) {
    const where = {};

    const usuarioId = filtros.usuarioId || filtros.usuario_id;
    if (usuarioId) {
      where.usuario_id = Number(usuarioId);
    }

    const coluna = filtros.coluna || filtros.status;
    if (coluna) {
      where.coluna = coluna;
    }

    const tarefas = await prisma.tarefas.findMany({
      where,
      orderBy: { id: 'asc' },
      include: includePadrao
    });

    return tarefas.map(formatarTarefa);
  }

  static async buscarPorId(id) {
    const tarefa = await prisma.tarefas.findUnique({
      where: { id: Number(id) },
      include: includePadrao
    });
    return formatarTarefa(tarefa);
  }

  static async criar(dados) {
    const texto = dados.texto || dados.titulo || 'Nova Tarefa';
    const coluna = dados.coluna || dados.status || 'afazer';
    const usuario_id = Number(dados.usuario_id || dados.usuarioId || 1);
    const projeto_id = Number(dados.projeto_id || dados.projetoId || 1);
    const descricao = dados.descricao || '';

    let idprioridade = 2;
    if (dados.idprioridade !== undefined && dados.idprioridade !== null) {
      idprioridade = Number(dados.idprioridade);
    } else if (dados.prioridade) {
      idprioridade = mapaTextoParaId[String(dados.prioridade).toLowerCase()] || 2;
    }
    const prioridadeTexto = mapaIdParaTexto[idprioridade] || 'media';

    const nova = await prisma.tarefas.create({
      data: {
        texto,
        coluna,
        ordem: Number(dados.ordem) || 0,
        usuario_id,
        projeto_id,
        idprioridade,
        prioridade: prioridadeTexto,
        descricao,
        iniciada_em: coluna === 'andamento' ? new Date() : null,
        concluida_em: coluna === 'concluido' ? new Date() : null
      },
      include: includePadrao
    });

    return formatarTarefa(nova);
  }

  static async atualizar(id, dados) {
    const idNum = Number(id);
    const tarefaAtual = await prisma.tarefas.findUnique({ where: { id: idNum } });
    if (!tarefaAtual) return null;

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

      if (tarefaAtual.coluna === 'afazer' && novaColuna === 'andamento') {
        data.iniciada_em = new Date();
      } else if (tarefaAtual.coluna === 'andamento' && novaColuna === 'afazer') {
        data.iniciada_em = null;
      }
    }

    if (dados.idprioridade !== undefined && dados.idprioridade !== null) {
      const pId = Number(dados.idprioridade);
      data.idprioridade = pId;
      data.prioridade = mapaIdParaTexto[pId] || 'media';
    } else if (dados.prioridade !== undefined) {
      const pStr = String(dados.prioridade).toLowerCase();
      const pId = mapaTextoParaId[pStr] || 2;
      data.idprioridade = pId;
      data.prioridade = mapaIdParaTexto[pId] || 'media';
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

    const atualizada = await prisma.tarefas.update({
      where: { id: idNum },
      data,
      include: includePadrao
    });

    return formatarTarefa(atualizada);
  }

  static async remover(id) {
    try {
      await prisma.tarefas.delete({
        where: { id: Number(id) }
      });
      return true;
    } catch (err) {
      if (err.code === 'P2025') return false;
      throw err;
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
