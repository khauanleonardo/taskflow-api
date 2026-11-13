const formatarTarefa = require('../src/utils/formatarTarefa');

// Uma tarefa como vem do banco, com as relações aninhadas
function tarefaComRelacoes() {
  return {
    id: 1,
    texto: 'Revisar o plano de teste',
    coluna: 'afazer',
    prioridade: { descricao: 'Alto', cor: '#EF4444' },
    projeto: { nome: 'TaskFlow' },
  };
}

describe('formatarTarefa', () => {
  test('achata as relações no formato que o front espera', () => {
    // Preparar
    const tarefa = tarefaComRelacoes();

    // Executar
    const resultado = formatarTarefa(tarefa);

    // Verificar
    expect(resultado).toEqual({
      id: 1,
      texto: 'Revisar o plano de teste',
      coluna: 'afazer',
      prioridade: 'Alto',
      prioridade_cor: '#EF4444',
      projeto: 'TaskFlow',
    });
  });

  test('relação ausente vira null e não quebra', () => {
    // Preparar: tarefa sem prioridade e sem projeto
    const tarefa = { id: 2, texto: 'Sem relações', coluna: 'andamento' };

    // Executar
    const resultado = formatarTarefa(tarefa);

    // Verificar
    expect(resultado).toEqual({
      id: 2,
      texto: 'Sem relações',
      coluna: 'andamento',
      prioridade: null,
      prioridade_cor: null,
      projeto: null,
    });
  });

  test('não altera o objeto original (função pura)', () => {
    // Preparar
    const tarefa = tarefaComRelacoes();

    // Executar
    formatarTarefa(tarefa);

    // Verificar: as relações continuam aninhadas no original
    expect(tarefa.prioridade.descricao).toBe('Alto');
    expect(tarefa.projeto.nome).toBe('TaskFlow');
  });

  test('campos simples passam sem mudar', () => {
    // Preparar
    const tarefa = tarefaComRelacoes();

    // Executar
    const resultado = formatarTarefa(tarefa);

    // Verificar
    expect(resultado.id).toBe(1);
    expect(resultado.texto).toBe('Revisar o plano de teste');
    expect(resultado.coluna).toBe('afazer');
  });

  test('prioridade_cor vem da relação, não de um valor fixo', () => {
    // Preparar
    const tarefa = { ...tarefaComRelacoes(), prioridade: { descricao: 'Urgente', cor: '#A855F7' } };

    // Executar
    const resultado = formatarTarefa(tarefa);

    // Verificar
    expect(resultado.prioridade_cor).toBe('#A855F7');
  });
});