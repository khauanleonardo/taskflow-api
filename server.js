const express = require('express');
const cors = require('cors');

const app = express();
const PORTA = process.env.PORT || 3000;

// Middlewares — executados antes das rotasn
app.use(cors());
app.use(express.json());

// ■■ Dados em memória ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
let tarefas = [
  { id: 1, texto: 'Estudar Node', prioridade: 'alta', coluna: 'afazer', cidade: 'Natal/RN' },
  { id: 2, texto: 'Criar API', prioridade: 'alta', coluna: 'andamento', cidade: 'Natal/RN' },
  { id: 3, texto: 'Testar Postman', prioridade: 'media', coluna: 'concluido', cidade: 'Natal/RN' }
];
let proximoId = 4;

let usuarios = [
  { id: 1, nome: 'admin', email: 'admin@taskflow.com', senha: '1234' }
];
let proximoIdUsuario = 2;

// ■■ Rota de Status ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
app.get('/', (req, res) => {
  res.json({ api: 'TaskFlow', versao: '1.0', status: 'online' });
});

// ■■ DESAFIO DIA 5 — Rotas de Estatísticas ■■■■■■■■■■■■■■■■
app.get('/estatisticas/resumo', (req, res) => {
  const total = tarefas.length;
  const afazer = tarefas.filter(t => t.coluna === 'afazer').length;
  const andamento = tarefas.filter(t => t.coluna === 'andamento').length;
  const concluido = tarefas.filter(t => t.coluna === 'concluido').length;

  const porPrioridade = {
    alta: tarefas.filter(t => t.prioridade === 'alta').length,
    media: tarefas.filter(t => t.prioridade === 'media').length,
    baixa: tarefas.filter(t => t.prioridade === 'baixa').length
  };

  let prioridadeMaisComum = 'media';
  let maxCount = -1;
  Object.entries(porPrioridade).forEach(([prio, count]) => {
    if (count > maxCount) {
      maxCount = count;
      prioridadeMaisComum = prio;
    }
  });

  const resumo = `Você tem ${total} tarefas.${concluido} concluída(s), ${andamento} em andamento e${afazer} a fazer. Prioridade mais comum: ${prioridadeMaisComum}.`;

  res.json({ resumo });
});

app.get('/estatisticas', (req, res) => {
  const { coluna } = req.query;

  let lista = tarefas;
  if (coluna) {
    lista = tarefas.filter(t => t.coluna === coluna);
  }

  const total = lista.length;

  const porColuna = {
    afazer: lista.filter(t => t.coluna === 'afazer').length,
    andamento: lista.filter(t => t.coluna === 'andamento').length,
    concluido: lista.filter(t => t.coluna === 'concluido').length
  };

  const porPrioridade = {
    alta: lista.filter(t => t.prioridade === 'alta').length,
    media: lista.filter(t => t.prioridade === 'media').length,
    baixa: lista.filter(t => t.prioridade === 'baixa').length
  };

  let colunaComMaisTarefas = 'afazer';
  let maxCol = -1;
  Object.entries(porColuna).forEach(([col, count]) => {
    if (count > maxCol) {
      maxCol = count;
      colunaComMaisTarefas = col;
    }
  });

  let prioridadeMaisComum = 'media';
  let maxPrio = -1;
  Object.entries(porPrioridade).forEach(([prio, count]) => {
    if (count > maxPrio) {
      maxPrio = count;
      prioridadeMaisComum = prio;
    }
  });

  res.json({
    total,
    porColuna,
    porPrioridade,
    colunaComMaisTarefas,
    prioridadeMaisComum
  });
});

// ■■ Rotas de Tarefas (CRUD) ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
app.get('/tarefas', (req, res) => {
  const { coluna, prioridade } = req.query;
  let resultado = tarefas;
  if (coluna) resultado = resultado.filter(t => t.coluna === coluna);
  if (prioridade) resultado = resultado.filter(t => t.prioridade === prioridade);
  res.json(resultado);
});

app.get('/tarefas/:id', (req, res) => {
  const id = Number(req.params.id);
  const tarefa = tarefas.find(t => t.id === id);
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

app.post('/tarefas', (req, res) => {
  const { texto, prioridade, coluna, cidade } = req.body;
  const novaTarefa = {
    id: proximoId++,
    texto,
    prioridade: prioridade || 'media',
    coluna: coluna || 'afazer',
    cidade: cidade || ''
  };
  tarefas.push(novaTarefa);
  res.status(201).json(novaTarefa);
});

app.put('/tarefas/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = tarefas.findIndex(t => t.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  
  const { texto, prioridade, coluna, cidade } = req.body;
  tarefas[indice] = { id, texto, prioridade, coluna, cidade };
  res.json(tarefas[indice]);
});

app.delete('/tarefas/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!tarefas.find(t => t.id === id)) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  tarefas = tarefas.filter(t => t.id !== id);
  res.json({ mensagem: 'Tarefa removida com sucesso', id });
});

// ■■ Rotas de Usuários ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
app.get('/usuarios', (req, res) => res.json(usuarios));

app.get('/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(usuario);
});

app.post('/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;
  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({ erro: 'Email já cadastrado' });
  }
  const novoUsuario = { id: proximoIdUsuario++, nome, email, senha };
  usuarios.push(novoUsuario);
  res.status(201).json(novoUsuario);
});

app.put('/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = usuarios.findIndex(u => u.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Usuário não encontrado' });
  
  const { nome, email, senha } = req.body;
  usuarios[indice] = { id, nome, email, senha };
  res.json(usuarios[indice]);
});

app.delete('/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!usuarios.find(u => u.id === id)) return res.status(404).json({ erro: 'Usuário não encontrado' });
  usuarios = usuarios.filter(u => u.id !== id);
  res.json({ mensagem: 'Usuário removido com sucesso', id });
});

// ■■ Rota 404 Genérica ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    metodo: req.method,
    caminho: req.url
  });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});