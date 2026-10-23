const db = require('../database/db');

// Mapeamento completo incluindo Urgente (ID 4)
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

function formatarTarefa(row) {
  if (!row) return null;

  const prioridadeTexto = String(row.prioridade || '').toLowerCase();
  const idprioridade = Number(row.idprioridade) || mapaTextoParaId[prioridadeTexto] || 2;
  const textoFinal = mapaIdParaTexto[idprioridade] || prioridadeTexto || 'media';

  return {
    id: row.id,
    texto: row.texto,
    titulo: row.texto,
    coluna: row.coluna,
    status: row.coluna,
    ordem: row.ordem || 0,
    usuario_id: row.usuario_id,
    projeto_id: row.projeto_id,
    idprioridade,
    prioridade: textoFinal,
    descricao: row.descricao || '',
    criado_em: row.criado_em,
    concluida_em: row.concluida_em || null
  };
}

class Tarefa {
  static async listar(filtros = {}) {
    const condicoes = [];
    const valores = [];

    const usuarioId = filtros.usuarioId || filtros.usuario_id;
    if (usuarioId) {
      valores.push(Number(usuarioId));
      condicoes.push(`usuario_id = $${valores.length}`);
    }

    const coluna = filtros.coluna || filtros.status;
    if (coluna) {
      valores.push(coluna);
      condicoes.push(`coluna = $${valores.length}`);
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
    const query = `SELECT * FROM tarefas ${where} ORDER BY id ASC`;

    const resultado = await db.query(query, valores);
    return resultado.rows.map(formatarTarefa);
  }

  static async buscarPorId(id) {
    const query = 'SELECT * FROM tarefas WHERE id = $1';
    const resultado = await db.query(query, [id]);
    if (resultado.rows.length === 0) return null;
    return formatarTarefa(resultado.rows[0]);
  }

  static async criar(dados) {
    const texto = dados.texto || dados.titulo || 'Nova Tarefa';
    const coluna = dados.coluna || dados.status || 'afazer';
    const usuario_id = Number(dados.usuario_id || dados.usuarioId || 1);
    const projeto_id = Number(dados.projeto_id || dados.projetoId || 1);
    const descricao = dados.descricao || '';

    // Trata idprioridade e texto da prioridade
    let idprioridade = 2;
    if (dados.idprioridade !== undefined && dados.idprioridade !== null) {
      idprioridade = Number(dados.idprioridade);
    } else if (dados.prioridade) {
      idprioridade = mapaTextoParaId[String(dados.prioridade).toLowerCase()] || 2;
    }
    const prioridadeTexto = mapaIdParaTexto[idprioridade] || 'media';

    // Grava tanto idprioridade quanto prioridade com fallback automático
    try {
      const queryComFk = `
        INSERT INTO tarefas (texto, coluna, usuario_id, projeto_id, prioridade, idprioridade, descricao)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const resultado = await db.query(queryComFk, [
        texto,
        coluna,
        usuario_id,
        projeto_id,
        prioridadeTexto,
        idprioridade,
        descricao
      ]);
      return formatarTarefa(resultado.rows[0]);
    } catch (erroFk) {
      // Fallback caso a coluna idprioridade não exista na tabela local
      const querySimples = `
        INSERT INTO tarefas (texto, coluna, usuario_id, projeto_id, prioridade, descricao)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const resultado = await db.query(querySimples, [
        texto,
        coluna,
        usuario_id,
        projeto_id,
        prioridadeTexto,
        descricao
      ]);
      return formatarTarefa(resultado.rows[0]);
    }
  }

  static async atualizar(id, dados) {
    const campos = [];
    const valores = [];

    if (dados.texto !== undefined || dados.titulo !== undefined) {
      valores.push(dados.texto || dados.titulo);
      campos.push(`texto = $${valores.length}`);
    }

    if (dados.coluna !== undefined || dados.status !== undefined) {
      valores.push(dados.coluna || dados.status);
      campos.push(`coluna = $${valores.length}`);
    }

    if (dados.descricao !== undefined) {
      valores.push(dados.descricao);
      campos.push(`descricao = $${valores.length}`);
    }

    if (dados.idprioridade !== undefined && dados.idprioridade !== null) {
      const idNum = Number(dados.idprioridade);
      const textoPrioridade = mapaIdParaTexto[idNum] || 'media';

      valores.push(idNum);
      campos.push(`idprioridade = $${valores.length}`);

      valores.push(textoPrioridade);
      campos.push(`prioridade = $${valores.length}`);
    } else if (dados.prioridade !== undefined) {
      const pStr = String(dados.prioridade).toLowerCase();
      valores.push(pStr);
      campos.push(`prioridade = $${valores.length}`);
    }

    if (dados.usuario_id !== undefined || dados.usuarioId !== undefined) {
      valores.push(Number(dados.usuario_id || dados.usuarioId));
      campos.push(`usuario_id = $${valores.length}`);
    }

    if (dados.projeto_id !== undefined || dados.projetoId !== undefined) {
      valores.push(Number(dados.projeto_id || dados.projetoId));
      campos.push(`projeto_id = $${valores.length}`);
    }

    if (campos.length === 0) {
      return await this.buscarPorId(id);
    }

    valores.push(id);
    const query = `
      UPDATE tarefas
      SET ${campos.join(', ')}
      WHERE id = $${valores.length}
      RETURNING *
    `;

    try {
      const resultado = await db.query(query, valores);
      if (resultado.rows.length === 0) return null;
      return formatarTarefa(resultado.rows[0]);
    } catch (errUpdate) {
      // Se falhar por causa do campo idprioridade na query UPDATE, tenta sem ele
      const camposSemFk = campos.filter((c) => !c.startsWith('idprioridade'));
      const querySemFk = `
        UPDATE tarefas
        SET ${camposSemFk.join(', ')}
        WHERE id = $${valores.length}
        RETURNING *
      `;
      const resultado = await db.query(querySemFk, valores);
      if (resultado.rows.length === 0) return null;
      return formatarTarefa(resultado.rows[0]);
    }
  }

  static async remover(id) {
    const query = 'DELETE FROM tarefas WHERE id = $1 RETURNING id';
    const resultado = await db.query(query, [id]);
    return resultado.rowCount > 0;
  }
}

Tarefa.adicionar = Tarefa.criar;
Tarefa.excluir = Tarefa.remover;

module.exports = Tarefa;
