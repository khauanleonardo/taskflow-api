require('dotenv').config();
const express = require('express');
const cors = require('cors');

const logger = require('./src/middlewares/logger');
// Ajustado para bater exatamente com os nomes dos seus arquivos na pasta routes:
const authRoutes = require('./src/routes/auth.routes');
const tarefasRoutes = require('./src/routes/tarefas.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(logger);

// Rotas da aplicação
app.use('/auth', authRoutes);
app.use('/tarefas', tarefasRoutes);

app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API rodando em http://localhost:${PORT}`);
});
