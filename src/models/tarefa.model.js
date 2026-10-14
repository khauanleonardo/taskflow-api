const pool = require('../database/db');

function normalizarColuna(coluna) {
  if (!coluna) return 'A FAZER';
  const c = String(coluna).trim().toLowerCase();
  if (c === 'todo' || c === 'afazer' || c === 'a fazer') return 'A FAZER';
  if (c === 'doing' || c === 'andamento' || c === 'em andamento') return 'EM ANDAMENTO';
  if (c === 'done' || c === 'concluido' || c === 'concluído' || c === 'concluida' || c === 'concluída') return 'CONCLUÍDO';
  return coluna;
}

function formatarTarefa(t) {
  if (!t) return null;
  return {
    ...t,
    titulo: t.texto || t.titulo || '',
    coluna: normalizarColuna(t.coluna),
    prioridade: String(t.prioridade || 'MEDIA').toUpperCase(),
    cidadeUf: t.cidade_uf || (t.cidade && t.uf ? `${t.cidade} - ${t.uf}` : (t.cidade || '')),
    endereco: {
      cep: t.cep || '',
      cidade: t.cidade || '',
      uf: t.uf || '',
      bairro: t.bairro || '',
      rua: t.rua || '',
    }
  };
}

module.exports = {
  listar: async (filtros = {}) => {
    const { coluna, projetoId, usuarioId } = filtros;
    let query = 'SELECT * FROM tarefas';
    const condicoes = [];
    const valores = [];

    if (coluna) {
      valores.push(coluna);
      condicoes.push(`coluna = $${valores.length}`);
    }
    if (projetoId) {
      valores.push(projetoId);
      condicoes.push(`projeto_id = $${valores.length}`);
    }
    if (usuarioId) {
      valores.push(usuarioId);
      condicoes.push(`usuario_id = $${valores.length}`);
    }

    if (condicoes.length > 0) {
      query += ' WHERE ' + condicoes.join(' AND ');
    }

    query += ' ORDER BY id';

    const result = await pool.query(query, valores);
    return result.rows.map(formatarTarefa);
  },

  buscar: async (id) => {
    const result = await pool.query(
      'SELECT * FROM tarefas WHERE id = $1',
      [id]
    );
    return formatarTarefa(result.rows[0]) || null;
  },

  adicionar: async (dados) => {
    const texto = dados.titulo || dados.texto || 'Nova Tarefa';
    const prioridade = String(dados.prioridade || 'media').toLowerCase();
    const coluna = normalizarColuna(dados.coluna || 'A FAZER');
    const usuarioId = dados.usuarioId || dados.usuario_id || 1;
    const projetoId = dados.projetoId || dados.projeto_id || 1;
    const descricao = dados.descricao || null;
    const cidadeUf = dados.cidadeUf || dados.cidade_uf || null;
    const cep = dados.endereco?.cep || dados.cep || null;
    const cidade = dados.endereco?.cidade || dados.cidade || null;
    const uf = dados.endereco?.uf || dados.uf || null;
    const bairro = dados.endereco?.bairro || dados.bairro || null;
    const rua = dados.endereco?.rua || dados.rua || null;

    const result = await pool.query(
      `INSERT INTO tarefas (texto, prioridade, coluna, usuario_id, projeto_id, descricao, cidade_uf, cep, cidade, uf, bairro, rua)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [texto, prioridade, coluna, usuarioId, projetoId, descricao, cidadeUf, cep, cidade, uf, bairro, rua]
    );
    return formatarTarefa(result.rows[0]);
  },

  atualizar: async (id, dados) => {
    const atual = await pool.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    if (atual.rows.length === 0) return null;

    const row = atual.rows[0];
    const texto = dados.titulo !== undefined ? dados.titulo : (dados.texto !== undefined ? dados.texto : row.texto);
    const prioridade = dados.prioridade !== undefined ? String(dados.prioridade).toLowerCase() : row.prioridade;
    const coluna = dados.coluna !== undefined ? normalizarColuna(dados.coluna) : row.coluna;
    const usuarioId = dados.usuarioId || dados.usuario_id || row.usuario_id;
    const projetoId = dados.projetoId || dados.projeto_id || row.projeto_id;
    const descricao = dados.descricao !== undefined ? dados.descricao : row.descricao;
    const cidadeUf = dados.cidadeUf !== undefined ? dados.cidadeUf : (dados.cidade_uf !== undefined ? dados.cidade_uf : row.cidade_uf);
    const cep = dados.endereco?.cep !== undefined ? dados.endereco.cep : (dados.cep !== undefined ? dados.cep : row.cep);
    const cidade = dados.endereco?.cidade !== undefined ? dados.endereco.cidade : (dados.cidade !== undefined ? dados.cidade : row.cidade);
    const uf = dados.endereco?.uf !== undefined ? dados.endereco.uf : (dados.uf !== undefined ? dados.uf : row.uf);
    const bairro = dados.endereco?.bairro !== undefined ? dados.endereco.bairro : (dados.bairro !== undefined ? dados.bairro : row.bairro);
    const rua = dados.endereco?.rua !== undefined ? dados.endereco.rua : (dados.rua !== undefined ? dados.rua : row.rua);

    const result = await pool.query(
      `UPDATE tarefas 
       SET texto = $1, prioridade = $2, coluna = $3, usuario_id = $4, projeto_id = $5,
           descricao = $6, cidade_uf = $7, cep = $8, cidade = $9, uf = $10, bairro = $11, rua = $12
       WHERE id = $13
       RETURNING *`,
      [texto, prioridade, coluna, usuarioId, projetoId, descricao, cidadeUf, cep, cidade, uf, bairro, rua, id]
    );
    return formatarTarefa(result.rows[0]);
  },

  remover: async (id) => {
    const result = await pool.query('DELETE FROM tarefas WHERE id = $1 RETURNING *', [id]);
    return formatarTarefa(result.rows[0]) || null;
  },

  avancar: async (id) => {
    await pool.query('SELECT avancar_tarefa($1)', [id]);
    const res = await pool.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    return formatarTarefa(res.rows[0]) || null;
  }
};
