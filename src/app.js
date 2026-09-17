const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios.routes');
const projetosRoutes = require('./routes/projetos.routes');
const tarefasRoutes = require('./routes/tarefas.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);
app.use('/tarefas', tarefasRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow rodando com sucesso!' });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});