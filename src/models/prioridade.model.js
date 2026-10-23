const db = require('../database/db');

const prioridadesPadrao = [
  { id: 1, nome: 'Baixa', descricao: 'Baixo', cor: '#10b981' },
  { id: 2, nome: 'Média', descricao: 'Médio', cor: '#f59e0b' },
  { id: 3, nome: 'Alta', descricao: 'Alto', cor: '#ef4444' },
  { id: 4, nome: 'Urgente', descricao: 'Urgente', cor: '#a855f7' }
];

function formatarPrioridade(p) {
  if (!p) return null;
  const texto = p.descricao || p.nome || 'Médio';
  return {
    id: p.id,
    nome: p.nome || texto,
    descricao: texto,
    cor: p.cor || (p.id === 4 ? '#a855f7' : p.id === 3 ? '#ef4444' : p.id === 1 ? '#10b981' : '#f59e0b')
  };
}

const prioridadeModel = {
  async listar() {
    try {
      const resultado = await db.query('SELECT * FROM prioridades ORDER BY id ASC');
      if (resultado.rows.length === 0) return prioridadesPadrao;

      // Garante que Urgente (id 4) exista na lista se a tabela só tiver 3 registros antigos
      const lista = resultado.rows.map(formatarPrioridade);
      const temUrgente = lista.some((p) => p.id === 4 || String(p.nome).toLowerCase().includes('urg'));
      if (!temUrgente) {
        lista.push({ id: 4, nome: 'Urgente', descricao: 'Urgente', cor: '#a855f7' });
      }
      return lista;
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

  async criar({ nome, descricao, cor }) {
    const valor = descricao || nome || 'Normal';
    try {
      const resultado = await db.query(
        'INSERT INTO prioridades (nome, descricao, cor) VALUES ($1, $2, $3) RETURNING *',
        [valor, valor, cor || '#a855f7']
      );
      return formatarPrioridade(resultado.rows[0]);
    } catch (err) {
      const novoId = prioridadesPadrao.length + 1;
      const novo = { id: novoId, nome: valor, descricao: valor, cor: cor || '#a855f7' };
      prioridadesPadrao.push(novo);
      return novo;
    }
  }
};

module.exports = prioridadeModel;
