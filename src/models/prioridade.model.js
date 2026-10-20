const db = require('../database/db');

const prioridadesPadrao = [
  { id: 1, nome: 'Baixa' },
  { id: 2, nome: 'Média' },
  { id: 3, nome: 'Alta' }
];

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
          INSERT INTO prioridades (nome) VALUES ('Baixa'), ('Média'), ('Alta')
        `);
      }
    } catch (err) {
      // Se não houver permissão DDL, o fallback em memória atende
    }
  },

  async listar() {
    try {
      const resultado = await db.query('SELECT * FROM prioridades ORDER BY id ASC');
      return resultado.rows;
    } catch (err) {
      return prioridadesPadrao;
    }
  },

  async buscarPorId(id) {
    try {
      const resultado = await db.query('SELECT * FROM prioridades WHERE id = $1', [id]);
      if (resultado.rows.length > 0) return resultado.rows[0];
      return prioridadesPadrao.find((p) => p.id === Number(id)) || null;
    } catch (err) {
      return prioridadesPadrao.find((p) => p.id === Number(id)) || null;
    }
  },

  async criar({ nome }) {
    try {
      const resultado = await db.query(
        'INSERT INTO prioridades (nome) VALUES ($1) RETURNING *',
        [nome]
      );
      return resultado.rows[0];
    } catch (err) {
      const novoId = prioridadesPadrao.length + 1;
      const novo = { id: novoId, nome };
      prioridadesPadrao.push(novo);
      return novo;
    }
  },

  async atualizar(id, { nome }) {
    try {
      const resultado = await db.query(
        'UPDATE prioridades SET nome = $1 WHERE id = $2 RETURNING *',
        [nome, id]
      );
      return resultado.rows[0] || null;
    } catch (err) {
      const item = prioridadesPadrao.find((p) => p.id === Number(id));
      if (item) item.nome = nome;
      return item || null;
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

// Inicializa a tabela no banco caso ainda não exista
prioridadeModel.inicializarTabela().catch(() => {});

module.exports = prioridadeModel;
