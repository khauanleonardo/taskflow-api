// Achata as relações da tarefa no formato que o front espera.
// Função pura: não altera o objeto recebido, devolve um novo.
function formatarTarefa(tarefa) {
  const { prioridade, projeto, ...campos } = tarefa;

  return {
    ...campos,
    prioridade: prioridade?.descricao ?? null,
    prioridade_cor: prioridade?.cor ?? null,
    projeto: projeto?.nome ?? null,
  };
}

module.exports = formatarTarefa;