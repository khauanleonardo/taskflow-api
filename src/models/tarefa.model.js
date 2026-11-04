const prisma = require('../database/prisma');
const pool = require('../database/db');

// Chave automática: se o Prisma oscilar no computador local, não faz o usuário esperar
let prismaOffline = false;

async function executarComFallback(fnPrisma, fnPg) {
  if (!prismaOffline) {
    try {
      const timeout = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('Prisma timeout')), 350)
      );
      return await Promise.race([fnPrisma(), timeout]);
    } catch (e) {
      prismaOffline = true;
      // Tenta reabilitar o Prisma após 1 minuto
      setTimeout(() => { prismaOffline = false; }, 60000);
    }
  }
  return await fnPg();
}

const mapaIdParaTexto = { 1: 'baixa', 2: 'media', 3: 'alta', 4: 'urgente' };
const mapaTextoParaId = { baixa: 1, baixo: 1, media: 2, medio: 2, média: 2, médio: 2, alta: 3, alto: 3, urgente: 4 };

const incluirNomes = {
  projeto: { select: { nome: true } },
  usuario: { select: { nome: true } },
  refPrioridade: { select: { nome: true, descricao: true, cor: true } }
};

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
    usuario: usuario?.nome || dados.usuario_nome,
    projeto_id: dados.projeto_id,
    projeto: projeto?.nome || dados.projeto_nome,
    idprioridade: idPrioridade,
    prioridade: refPrioridade?.descricao || refPrioridade?.nome || dados.prioridade_descricao || mapaIdParaTexto[idPrioridade] || 'media',
    prioridade_rotulo: refPrioridade?.nome || dados.prioridade_nome || 'Média',
    prioridade_cor: refPrioridade?.cor || dados.prioridade_cor || corPadrao,
    criado_em: dados.criado_em,
    iniciada_em: dados.iniciada_em,
    concluida_em: dados.concluida_em
  };
}

function prioridadeParaId(dados) {
  if (dados.idprioridade !== undefined && dados.idprioridade !== null) return Number(dados.idprioridade) || 2;
  if (dados.prioridade) return mapaTextoParaId[String(dados.prioridade).toLowerCase()] || 2;
  return 2;
}

class Tarefa {
  static async listar(filtros = {}) {
    return executarComFallback(
      async () => {
        const where = {};
        const usuarioId = filtros.usuarioId || filtros.usuario_id;
        if (usuarioId) where.usuario_id = Number(usuarioId);
        const coluna = filtros.coluna || filtros.status;
        if (coluna) where.coluna = coluna;

        const tarefas = await prisma.tarefas.findMany({
          where,
          orderBy: { id: 'asc' },
          include: incluirNomes
        });
        return tarefas.map(formatarTarefa);
      },
      async () => {
        const sql = `
          SELECT t.*, p.nome AS projeto_nome, u.nome AS usuario_nome,
                 pr.nome AS prioridade_nome, pr.descricao AS prioridade_descricao, pr.cor AS prioridade_cor
          FROM tarefas t
          LEFT JOIN projetos p ON p.id = t.projeto_id
          LEFT JOIN usuarios u ON u.id = t.usuario_id
          LEFT JOIN prioridades pr ON pr.id = t.idprioridade
          ORDER BY t.id ASC
        `;
        const res = await pool.query(sql);
        return res.rows.map(formatarTarefa);
      }
    );
  }

  static async buscarPorId(id) {
    const idNum = Number(id);
    return executarComFallback(
      async () => {
        const t = await prisma.tarefas.findUnique({ where: { id: idNum }, include: incluirNomes });
        return formatarTarefa(t);
      },
      async () => {
        const sql = `
          SELECT t.*, p.nome AS projeto_nome, u.nome AS usuario_nome,
                 pr.nome AS prioridade_nome, pr.descricao AS prioridade_descricao, pr.cor AS prioridade_cor
          FROM tarefas t
          LEFT JOIN projetos p ON p.id = t.projeto_id
          LEFT JOIN usuarios u ON u.id = t.usuario_id
          LEFT JOIN prioridades pr ON pr.id = t.idprioridade
          WHERE t.id = $1
        `;
        const res = await pool.query(sql, [idNum]);
        return formatarTarefa(res.rows[0]);
      }
    );
  }

  static async criar(dados) {
    const texto = dados.texto || dados.titulo || 'Nova Tarefa';
    const coluna = dados.coluna || dados.status || 'afazer';
    const idPrioridade = prioridadeParaId(dados);
    const usuarioId = Number(dados.usuario_id || dados.usuarioId || 1);
    const projetoId = Number(dados.projeto_id || dados.projetoId || 1);
    const descricao = dados.descricao || '';
    const ordem = dados.ordem !== undefined ? Number(dados.ordem) : 0;

    const data = {
      texto, coluna, descricao, ordem,
      usuario_id: usuarioId, projeto_id: projetoId, idprioridade: idPrioridade,
      prioridade: mapaIdParaTexto[idPrioridade] || 'media'
    };

    if (coluna === 'andamento') data.iniciada_em = new Date();
    else if (coluna === 'concluido') { data.iniciada_em = new Date(); data.concluida_em = new Date(); }

    return executarComFallback(
      async () => {
        const nova = await prisma.tarefas.create({ data, include: incluirNomes });
        return formatarTarefa(nova);
      },
      async () => {
        const sql = `
          INSERT INTO tarefas (texto, coluna, descricao, ordem, usuario_id, projeto_id, idprioridade, prioridade, iniciada_em, concluida_em)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;
        const res = await pool.query(sql, [
          data.texto, data.coluna, data.descricao, data.ordem,
          data.usuario_id, data.projeto_id, data.idprioridade, data.prioridade,
          data.iniciada_em || null, data.concluida_em || null
        ]);
        return this.buscarPorId(res.rows[0].id);
      }
    );
  }

  static async atualizar(id, dados) {
    const idNum = Number(id);
    const atual = await this.buscarPorId(idNum);
    if (!atual) return null;

    const data = {};
    if (dados.texto !== undefined || dados.titulo !== undefined) data.texto = dados.texto || dados.titulo;
    if (dados.descricao !== undefined) data.descricao = dados.descricao;
    if (dados.coluna !== undefined || dados.status !== undefined) {
      const novaColuna = dados.coluna || dados.status;
      data.coluna = novaColuna;
      if (novaColuna === 'concluido') data.concluida_em = new Date();
      else data.concluida_em = null;
      if (atual.coluna === 'afazer' && novaColuna === 'andamento') data.iniciada_em = new Date();
      else if (atual.coluna === 'andamento' && novaColuna === 'afazer') data.iniciada_em = null;
    }
    if (dados.idprioridade !== undefined && dados.idprioridade !== null) {
      data.idprioridade = Number(dados.idprioridade);
      data.prioridade = mapaIdParaTexto[data.idprioridade] || 'media';
    } else if (dados.prioridade !== undefined) {
      data.idprioridade = mapaTextoParaId[String(dados.prioridade).toLowerCase()] || 2;
      data.prioridade = mapaIdParaTexto[data.idprioridade] || 'media';
    }
    if (dados.usuario_id !== undefined) data.usuario_id = Number(dados.usuario_id);
    if (dados.projeto_id !== undefined) data.projeto_id = Number(dados.projeto_id);
    if (dados.ordem !== undefined) data.ordem = Number(dados.ordem);

    return executarComFallback(
      async () => {
        const atualizada = await prisma.tarefas.update({
          where: { id: idNum },
          data,
          include: incluirNomes
        });
        return formatarTarefa(atualizada);
      },
      async () => {
        const sql = `
          UPDATE tarefas
          SET texto = COALESCE($1, texto),
              coluna = COALESCE($2, coluna),
              descricao = COALESCE($3, descricao),
              idprioridade = COALESCE($4, idprioridade),
              prioridade = COALESCE($5, prioridade),
              iniciada_em = $6,
              concluida_em = $7
          WHERE id = $8
          RETURNING *
        `;
        await pool.query(sql, [
          data.texto, data.coluna, data.descricao, data.idprioridade, data.prioridade,
          data.iniciada_em !== undefined ? data.iniciada_em : atual.iniciada_em,
          data.concluida_em !== undefined ? data.concluida_em : atual.concluida_em,
          idNum
        ]);
        return this.buscarPorId(idNum);
      }
    );
  }

  static async remover(id) {
    const idNum = Number(id);
    const tarefa = await this.buscarPorId(idNum);
    return executarComFallback(
      async () => {
        await prisma.tarefas.delete({ where: { id: idNum } });
        return tarefa;
      },
      async () => {
        await pool.query('DELETE FROM tarefas WHERE id = $1', [idNum]);
        return tarefa;
      }
    );
  }

  static async avancar(id) {
    const tarefa = await this.buscarPorId(id);
    if (!tarefa) return null;
    const proximaColuna = { afazer: 'andamento', andamento: 'concluido', concluido: 'concluido' }[tarefa.coluna] || 'afazer';
    return await this.atualizar(id, { coluna: proximaColuna });
  }
}

Tarefa.adicionar = Tarefa.criar;
Tarefa.excluir = Tarefa.remover;

module.exports = Tarefa;
