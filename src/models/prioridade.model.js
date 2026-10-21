const db = require('../database/db');

const prioridadesPadrao = [
  { id: 1, nome: 'Baixa', descricao: 'Baixo' },
  { id: 2, nome: 'Média', descricao: 'Médio' },
  { id: 3, nome: 'Alta', descricao: 'Alto' }
];

function formatarPrioridade(p) {
  if (!p) return null;
  const texto = p.descricao || p.nome || 'Médio';
  return {
    id: p.id,
    nome: p.nome || texto,
    descricao: p.descricao || texto
  };
}

const prioridadeModel = {
  async inicializarTabela() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS prioridades (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(50) NOT NULL
        )
      `);
      const { rows } = await db.query('SELECT COUNT(*) FROM prioridades');
      if (Number(rows[0].count) === 0) {
        await db.query(`
          INSERT INTO prioridades (nome) VALUES ('Baixo'), ('Médio'), ('Alto')
        `);
      }
    } catch (err) {
      // Ignora erro se não tiver permissão DDL
    }
  },

  async listar() {
    try {
      const resultado = await db.query('SELECT * FROM prioridades ORDER BY id ASC');
      return resultado.rows.map(formatarPrioridade);
    } catch (err) {
      return prioridadesPadrao;
    }
  },

  async buscarPorId(id) {
    try {
      const resultado = await db.query('SELECT * FROM prioridades WHERE id = $1', [id]);
      if (resultado.rows.length > 0) return formatarPrioridade(resultado.rows[0]);
      const achado = prioridadesPadrao.find((p) => p.id === Number(id));
      return achado ? formatarPrioridade(achado) : null;
    } catch (err) {
      const achado = prioridadesPadrao.find((p) => p.id === Number(id));
      return achado ? formatarPrioridade(achado) : null;
    }
  },

  async criar({ nome, descricao }) {
    const valor = descricao || nome || 'Normal';
    try {
      const resultado = await db.query(
        'INSERT INTO prioridades (nome) VALUES ($1) RETURNING *',
        [valor]
      );
      return formatarPrioridade(resultado.rows[0]);
    } catch (err) {
      const novoId = prioridadesPadrao.length + 1;
      const novo = { id: novoId, nome: valor, descricao: valor };
      prioridadesPadrao.push(novo);
      return novo;
    }
  },

  async atualizar(id, { nome, descricao }) {
    const valor = descricao || nome;
    try {
      const resultado = await db.query(
        'UPDATE prioridades SET nome = $1 WHERE id = $2 RETURNING *',
        [valor, id]
      );
      return resultado.rows.length > 0 ? formatarPrioridade(resultado.rows[0]) : null;
    } catch (err) {
      const item = prioridadesPadrao.find((p) => p.id === Number(id));
      if (item) {
        item.nome = valor;
        item.descricao = valor;
      }
      return item ? formatarPrioridade(item) : null;
    }
  },

  async remover(id) {
    try {
      const resultado = await db.query(
        'DELETE FROM prioridades WHERE id = $1 RETURNING id',
        [id]
      );
      return resultado.rowCount > 0;
    } catch (err) {
      const idx = prioridadesPadrao.findIndex((p) => p.id === Number(id));
      if (idx !== -1) {
        prioridadesPadrao.splice(idx, 1);
        return true;
      }
      return false;
    }
  }
};

prioridadeModel.inicializarTabela().catch(() => {});

module.exports = prioridadeModel;
