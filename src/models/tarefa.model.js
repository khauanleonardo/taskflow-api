const db = require('../database/db');

// Mapeamentos entre o ID numérico do schema e o texto do banco/kanban
const mapaIdParaTexto = {
  1: 'baixa',
  2: 'media',
  3: 'alta'
};

const mapaTextoParaId = {
  baixa: 1,
  media: 2,
  alta: 3
};

function formatarTarefa(row) {
  if (!row) return null;

  const prioridadeTexto = String(row.prioridade || 'media').toLowerCase();
  const idprioridade = mapaTextoParaId[prioridadeTexto] || (Number(row.idprioridade) || 2);

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
    prioridade: prioridadeTexto,
    descricao: row.descricao || '',
    criado_em: row.criado_em,
    concluida_em: row.concluida_em || null,
    cidade_uf: row.cidade_uf || null,
    cep: row.cep || null,
    cidade: row.cidade || null,
    uf: row.uf || null,
    bairro: row.bairro || null,
    rua: row.rua || null
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

    if (filtros.prioridade) {
      valores.push(filtros.prioridade);
      condicoes.push(`prioridade = $${valores.length}`);
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

    let prioridade = 'media';
    if (dados.idprioridade !== undefined) {
      prioridade = mapaIdParaTexto[Number(dados.idprioridade)] || 'media';
    } else if (dados.prioridade !== undefined) {
      prioridade = String(dados.prioridade).toLowerCase();
    }

    const query = `
      INSERT INTO tarefas (texto, coluna, usuario_id, projeto_id, prioridade, descricao)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const resultado = await db.query(query, [
      texto,
      coluna,
      usuario_id,
      projeto_id,
      prioridade,
      descricao
    ]);
    return formatarTarefa(resultado.rows[0]);
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

    if (dados.idprioridade !== undefined) {
      const textoPrioridade = mapaIdParaTexto[Number(dados.idprioridade)] || 'media';
      valores.push(textoPrioridade);
      campos.push(`prioridade = $${valores.length}`);
    } else if (dados.prioridade !== undefined) {
      valores.push(String(dados.prioridade).toLowerCase());
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

    const resultado = await db.query(query, valores);
    if (resultado.rows.length === 0) return null;
    return formatarTarefa(resultado.rows[0]);
  }

  static async remover(id) {
    const query = 'DELETE FROM tarefas WHERE id = $1 RETURNING id';
    const resultado = await db.query(query, [id]);
    return resultado.rowCount > 0;
  }

  static async avancar(id) {
    await db.query('SELECT avancar_tarefa($1)', [id]);
    return await this.buscarPorId(id);
  }
}

// Aliases de compatibilidade
Tarefa.adicionar = Tarefa.criar;
Tarefa.excluir = Tarefa.remover;

module.exports = Tarefa;
