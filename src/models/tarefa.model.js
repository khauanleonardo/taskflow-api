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

// Relações do schema.prisma trazidas com select otimizado (incluindo a cor da prioridade)
const incluirNomes = {
  projeto: { select: { nome: true } },
  usuario: { select: { nome: true } },
  refPrioridade: { select: { nome: true, descricao: true, cor: true } }
};

// Converte o registro retornado pelo Prisma no contrato JSON esperado pelo Front-end e Swagger
function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  const { projeto, usuario, refPrioridade, ...dados } = tarefa;

  const idPrioridade = dados.idprioridade || 2;
  const corPadrao = idPrioridade === 4 ? '#A855F7' : idPrioridade === 3 ? '#FF5065' : idPrioridade === 1 ? '#41D686' : '#F6C330';

  return {
    id: dados.id,
    texto: dados.texto,
    titulo: dados.texto,
    coluna: dados.coluna,
    status: dados.coluna,
    ordem: dados.ordem,
    descricao: dados.descricao || '',
    usuario_id: dados.usuario_id,
    usuario: usuario?.nome,
    projeto_id: dados.projeto_id,
    projeto: projeto?.nome,
    idprioridade: idPrioridade,
    prioridade: refPrioridade?.descricao || refPrioridade?.nome || mapaIdParaTexto[idPrioridade] || 'media',
    prioridade_rotulo: refPrioridade?.nome || 'Média',
    prioridade_cor: refPrioridade?.cor || corPadrao,
    criado_em: dados.criado_em,
    iniciada_em: dados.iniciada_em,
    concluida_em: dados.concluida_em
  };
}

// Converte idprioridade ou texto legado para ID numérico
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
  // findMany com where dinâmico e include das relações
  static async listar(filtros = {}) {
    const where = {};

    const usuarioId = filtros.usuarioId || filtros.usuario_id;
    if (usuarioId !== undefined && usuarioId !== null && usuarioId !== '') {
      where.usuario_id = Number(usuarioId);
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

  // findUnique pela PK com include
  static async buscarPorId(id) {
    const tarefa = await prisma.tarefas.findUnique({
      where: { id: Number(id) },
      include: incluirNomes
    });

    return formatarTarefa(tarefa);
  }

  // Criação da tarefa com validação de coluna e datas
  static async criar(dados) {
    const texto = dados.texto || dados.titulo || 'Nova Tarefa';
    const coluna = dados.coluna || dados.status || 'afazer';
    const idPrioridade = prioridadeParaId(dados);
    const usuarioId = Number(dados.usuario_id || dados.usuarioId || 1);
    const projetoId = Number(dados.projeto_id || dados.projetoId || 1);
    const descricao = dados.descricao || '';
    const ordem = dados.ordem !== undefined ? Number(dados.ordem) : 0;

    const data = {
      texto,
      coluna,
      descricao,
      ordem,
      usuario_id: usuarioId,
      projeto_id: projetoId,
      idprioridade: idPrioridade,
      prioridade: mapaIdParaTexto[idPrioridade] || 'media'
    };

    if (coluna === 'andamento') {
      data.iniciada_em = new Date();
    } else if (coluna === 'concluido') {
      data.iniciada_em = new Date();
      data.concluida_em = new Date();
    }

    const nova = await prisma.tarefas.create({
      data,
      include: incluirNomes
    });

    return formatarTarefa(nova);
  }

  // Atualização com ciclo de vida das colunas e das datas (iniciada_em e concluida_em)
  static async atualizar(id, dados) {
    const idNum = Number(id);
    const atual = await prisma.tarefas.findUnique({ where: { id: idNum } });
    if (!atual) return null;

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

  // Exclusão retornando o registro removido
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

  // Avançar uma coluna no fluxo do Kanban
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
