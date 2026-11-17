const db = require('../database/db');

const colunaValida = new Set(['afazer', 'andamento', 'concluido']);
const normalizarColuna = (value) => {
  const v = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '');
  const map = { 'a fazer': 'afazer', afazer: 'afazer', todo: 'afazer', backlog: 'afazer', 'em andamento': 'andamento', andamento: 'andamento', doing: 'andamento', 'emfoco': 'andamento', concluido: 'concluido', done: 'concluido' };
  return map[v] || (colunaValida.has(v) ? v : null);
};
const normalizarPrioridade = (value) => String(value || 'media').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function formatarTarefa(row) {
  if (!row) return null;
  return {
    id: row.id,
    texto: row.texto,
    titulo: row.texto,
    coluna: normalizarColuna(row.coluna) || row.coluna,
    status: normalizarColuna(row.coluna) || row.coluna,
    ordem: row.ordem || 0,
    usuario_id: row.usuario_id,
    usuario_nome: row.usuario_nome || null,
    projeto_id: row.projeto_id,
    projeto_nome: row.projeto_nome || null,
    idprioridade: row.idprioridade,
    prioridade: normalizarPrioridade(row.prioridade_nome || row.prioridade),
    prioridade_cor: row.prioridade_cor || null,
    descricao: row.descricao || '',
    criado_em: row.criado_em,
    concluida_em: row.concluida_em || null,
    cidade_uf: row.cidade_uf || null,
    cep: row.cep || null,
    cidade: row.cidade || null,
    uf: row.uf || null,
    bairro: row.bairro || null,
    rua: row.rua || null,
  };
}

const selectTarefas = `SELECT t.*, p.nome AS prioridade_nome, p.cor AS prioridade_cor,
  u.nome AS usuario_nome, pr.nome AS projeto_nome
  FROM tarefas t
  LEFT JOIN prioridades p ON p.id = t.idprioridade
  LEFT JOIN usuarios u ON u.id = t.usuario_id
  LEFT JOIN projetos pr ON pr.id = t.projeto_id`;

class Tarefa {
  static async listar(filtros = {}) {
    const conditions = [];
    const values = [];
    const userId = filtros.usuarioId || filtros.usuario_id;
    if (userId) { values.push(Number(userId)); conditions.push(`t.usuario_id = $${values.length}`); }
    const col = filtros.coluna || filtros.status;
    if (col) {
      const normalized = normalizarColuna(col);
      if (!normalized) return [];
      if (normalized === 'concluido') conditions.push(`lower(t.coluna) IN ('concluido', 'done')`);
      else { values.push(normalized); conditions.push(`lower(t.coluna) = $${values.length}`); }
    }
    const priorityId = filtros.idprioridade || filtros.prioridadeId;
    const priorityName = filtros.prioridade;
    if (priorityId) { values.push(Number(priorityId)); conditions.push(`t.idprioridade = $${values.length}`); }
    else if (priorityName) { values.push(normalizarPrioridade(priorityName)); conditions.push(`lower(coalesce(p.nome, t.prioridade)) = $${values.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(`${selectTarefas} ${where} ORDER BY t.ordem ASC, t.id ASC LIMIT 500`, values);
    return result.rows.map(formatarTarefa);
  }

  static async buscarPorId(id) {
    const result = await db.query(`${selectTarefas} WHERE t.id = $1`, [id]);
    return result.rows.length ? formatarTarefa(result.rows[0]) : null;
  }

  static async criar(data) {
    const texto = data.texto || data.titulo;
    const coluna = normalizarColuna(data.coluna || data.status) || 'afazer';
    const usuarioId = Number(data.usuario_id || data.usuarioId);
    const projetoId = Number(data.projeto_id || data.projetoId);
    const priorityId = Number(data.idprioridade || data.prioridade_id);
    const priority = normalizarPrioridade(data.prioridade);
    const descricao = data.descricao || '';
    const result = await db.query(`
      INSERT INTO tarefas (texto, coluna, usuario_id, projeto_id, idprioridade, prioridade, descricao, cep, cidade_uf, cidade, uf, bairro, rua)
      VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT lower(nome) FROM prioridades WHERE id = $5), $6), $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`, [texto, coluna, usuarioId, projetoId, priorityId, priority, descricao, data.cep || null, data.cidade_uf || null, data.cidade || null, data.uf || null, data.bairro || null, data.rua || null]);
    return this.buscarPorId(result.rows[0].id);
  }

  static async atualizar(id, data) {
    const sets = [];
    const values = [];
    const add = (field, value) => { values.push(value); sets.push(`${field} = $${values.length}`); };
    if (data.texto !== undefined || data.titulo !== undefined) add('texto', data.texto ?? data.titulo);
    if (data.coluna !== undefined || data.status !== undefined) {
      const normalized = normalizarColuna(data.coluna ?? data.status);
      if (!normalized) return null;
      add('coluna', normalized);
      if (normalized === 'concluido') sets.push('concluida_em = COALESCE(concluida_em, CURRENT_TIMESTAMP)');
      else sets.push('concluida_em = NULL');
    }
    if (data.descricao !== undefined) add('descricao', data.descricao);
    if (data.prioridade !== undefined && data.idprioridade === undefined) add('prioridade', normalizarPrioridade(data.prioridade));
    if (data.idprioridade !== undefined || data.prioridade_id !== undefined) {
      const pid = Number(data.idprioridade ?? data.prioridade_id);
      add('idprioridade', pid);
      values.push(pid); sets.push(`prioridade = (SELECT lower(nome) FROM prioridades WHERE id = $${values.length})`);
    }
    if (data.usuario_id !== undefined || data.usuarioId !== undefined) add('usuario_id', Number(data.usuario_id ?? data.usuarioId));
    if (data.projeto_id !== undefined || data.projetoId !== undefined) add('projeto_id', Number(data.projeto_id ?? data.projetoId));
    for (const field of ['cep', 'cidade_uf', 'cidade', 'uf', 'bairro', 'rua']) if (data[field] !== undefined) add(field, data[field] || null);
    if (data.cidadeUf !== undefined && data.cidade_uf === undefined) add('cidade_uf', data.cidadeUf || null);
    if (!sets.length) return this.buscarPorId(id);
    values.push(id);
    const result = await db.query(`UPDATE tarefas SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING id`, values);
    return result.rows.length ? this.buscarPorId(id) : null;
  }

  static async remover(id) {
    const result = await db.query('DELETE FROM tarefas WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  static async avancar(id) {
    const task = await this.buscarPorId(id);
    if (!task) return null;
    const next = { afazer: 'andamento', andamento: 'concluido', concluido: 'concluido' }[task.coluna];
    return this.atualizar(id, { coluna: next });
  }
}
Tarefa.adicionar = Tarefa.criar;
Tarefa.excluir = Tarefa.remover;
module.exports = Tarefa;
