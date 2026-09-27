// taskflow-api/src/models/tarefa.model.js
let tarefas = [
  {
    id: 1,
    titulo: 'Configurar banco de dados',
    texto: 'Configurar banco de dados',
    descricao: 'Criar as tabelas e schemas necessários',
    prioridade: 'ALTA',
    coluna: 'A FAZER',
    cidadeUf: 'São Paulo - SP',
    endereco: { cep: '01001-000', cidade: 'São Paulo', uf: 'SP', bairro: 'Sé', rua: 'Praça da Sé' },
    criadaEm: '2026-09-20T10:00:00.000Z'
  },
  {
    id: 2,
    titulo: 'Desenvolver API REST com MVC',
    texto: 'Desenvolver API REST com MVC',
    descricao: 'Separar routes, controllers e models',
    prioridade: 'ALTA',
    coluna: 'EM ANDAMENTO',
    cidadeUf: 'Natal - RN',
    endereco: { cep: '59000-000', cidade: 'Natal', uf: 'RN', bairro: 'Tirol', rua: 'Av. Hermes da Fonseca' },
    criadaEm: '2026-09-21T11:00:00.000Z'
  },
  {
    id: 3,
    titulo: 'Criar componentes React',
    texto: 'Criar componentes React',
    descricao: 'Montar tela de login e Kanban',
    prioridade: 'MEDIA',
    coluna: 'CONCLUÍDO',
    cidadeUf: 'Curitiba - PR',
    endereco: { cep: '80000-000', cidade: 'Curitiba', uf: 'PR', bairro: 'Centro', rua: 'Rua XV de Novembro' },
    criadaEm: '2026-09-22T09:00:00.000Z'
  }
];
let proximoId = 4;

function normalizar(col) {
  if (!col) return 'A FAZER';
  const c = String(col).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (c.includes('fazer')) return 'A FAZER';
  if (c.includes('andamento')) return 'EM ANDAMENTO';
  if (c.includes('conclu')) return 'CONCLUÍDO';
  return col.toUpperCase();
}

const tarefaModel = {
  listar(filtros = {}) {
    let resultado = [...tarefas];
    if (filtros.coluna) {
      resultado = resultado.filter((t) => normalizar(t.coluna) === normalizar(filtros.coluna));
    }
    return resultado;
  },

  buscarPorId(id) {
    return tarefas.find((t) => t.id === Number(id)) || null;
  },

  criar(dados) {
    const nomeTarefa = (dados.titulo || dados.texto || '').trim();
    const nova = {
      id: proximoId++,
      titulo: nomeTarefa,
      texto: nomeTarefa,
      descricao: dados.descricao ? dados.descricao.trim() : '',
      prioridade: (dados.prioridade || 'MEDIA').toUpperCase(),
      coluna: normalizar(dados.coluna),
      cidadeUf: dados.cidadeUf || '',
      endereco: dados.endereco || null,
      criadaEm: new Date().toISOString()
    };
    tarefas.push(nova);
    return nova;
  },

  atualizar(id, dados) {
    const index = tarefas.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;

    const anterior = tarefas[index];
    const nomeTarefa = dados.titulo !== undefined ? dados.titulo.trim() : (dados.texto !== undefined ? dados.texto.trim() : anterior.titulo);

    tarefas[index] = {
      ...anterior,
      titulo: nomeTarefa,
      texto: nomeTarefa,
      descricao: dados.descricao !== undefined ? dados.descricao.trim() : anterior.descricao,
      prioridade: dados.prioridade !== undefined ? dados.prioridade.toUpperCase() : anterior.prioridade,
      coluna: dados.coluna !== undefined ? normalizar(dados.coluna) : anterior.coluna,
      cidadeUf: dados.cidadeUf !== undefined ? dados.cidadeUf : anterior.cidadeUf,
      endereco: dados.endereco !== undefined ? dados.endereco : anterior.endereco
    };

    return tarefas[index];
  },

  remover(id) {
    const index = tarefas.findIndex((t) => t.id === Number(id));
    if (index === -1) return false;
    tarefas.splice(index, 1);
    return true;
  }
};

module.exports = tarefaModel;
