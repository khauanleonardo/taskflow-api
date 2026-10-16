const db = require('../database/db');

function formatarTarefa(row) {
  if (!row) return null;
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao || '',
    status: row.status,
    prioridade: row.prioridade || 'media',
    criada_em: row.criada_em,
    concluida_em: row.concluida_em || null
  };
}

class Tarefa {
  static async listar(filtros = {}) {
    const condicoes = [];
    const valores = [];

    if (filtros.status) {
      valores.push(filtros.status);
      condicoes.push(`status = $${valores.length}`);
    }

    if (filtros.prioridade) {
      valores.push(filtros.prioridade);
      condicoes.push(`prioridade = $${valores.length}`);
    }

    if (filtros.busca) {
      valores.push(`%${filtros.busca}%`);
      condicoes.push(`(titulo ILIKE $${valores.length} OR descricao ILIKE $${valores.length})`);
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

  static async criar({ titulo, descricao = '', status = 'todo', prioridade = 'media' }) {
    const query = `
      INSERT INTO tarefas (titulo, descricao, status, prioridade)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const resultado = await db.query(query, [titulo, descricao, status, prioridade]);
    return formatarTarefa(resultado.rows[0]);
  }

  static async atualizar(id, dados) {
    const campos = [];
    const valores = [];

    if (dados.titulo !== undefined) {
      valores.push(dados.titulo);
      campos.push(`titulo = $${valores.length}`);
    }

    if (dados.descricao !== undefined) {
      valores.push(dados.descricao);
      campos.push(`descricao = $${valores.length}`);
    }

    if (dados.status !== undefined) {
      valores.push(dados.status);
      campos.push(`status = $${valores.length}`);
    }

    if (dados.prioridade !== undefined) {
      valores.push(dados.prioridade);
      campos.push(`prioridade = $${valores.length}`);
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
    // Chama a Stored Procedure do banco
    await db.query('CALL avancar_tarefa($1)', [id]);
    return await this.buscarPorId(id);
  }
}

module.exports = Tarefa;
