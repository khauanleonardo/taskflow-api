let tarefas = [
  { id: 1, titulo: 'casa', cidadeUf: 'São Gonçalo do Amarante - RN', prioridade: 'ALTA', coluna: 'A FAZER' },
  { id: 2, titulo: 'atividade', cidadeUf: 'Natal - RN', prioridade: 'ALTA', coluna: 'A FAZER' },
  { id: 3, titulo: 'texto 1', cidadeUf: 'cidade 1', prioridade: 'MEDIA', coluna: 'EM ANDAMENTO' },
  { id: 4, titulo: 'texto 4', cidadeUf: 'cidade 4', prioridade: 'MEDIA', coluna: 'CONCLUÍDO' },
  { id: 5, titulo: 'casa', cidadeUf: 'São Gonçalo do Amarante - RN', prioridade: 'ALTA', coluna: 'CONCLUÍDO' }
];

let proximoId = 6;

module.exports = {
  getTarefas: () => tarefas,
  criarTarefa: (dados) => {
    const nova = {
      id: proximoId++,
      titulo: dados.titulo || 'Nova Tarefa',
      cidadeUf: dados.cidadeUf || '',
      prioridade: dados.prioridade || 'BAIXA',
      coluna: dados.coluna || 'A FAZER'
    };
    tarefas.push(nova);
    return nova;
  },
  atualizarTarefa: (id, dados) => {
    const index = tarefas.findIndex(t => t.id === id);
    if (index === -1) return null;
    tarefas[index] = { ...tarefas[index], ...dados, id };
    return tarefas[index];
  },
  deletarTarefa: (id) => {
    const index = tarefas.findIndex(t => t.id === id);
    if (index === -1) return false;
    tarefas = tarefas.filter(t => t.id !== id);
    return true;
  }
};
