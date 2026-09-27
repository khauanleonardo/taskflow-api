// taskflow-api/src/middlewares/schemas.js
const schemas = {
  login: {
    camposObrigatorios: ['email', 'senha']
  },
  usuario: {
    camposObrigatorios: ['nome', 'email', 'senha']
  },
  tarefa: {
    // A validação agora aceita ou 'titulo' ou 'texto'
    validarPersonalizado: (corpo) => {
      if (!corpo.titulo?.trim() && !corpo.texto?.trim()) {
        return 'Título da tarefa é obrigatório';
      }
      return null;
    },
    camposObrigatorios: []
  },
  projeto: {
    camposObrigatorios: ['nome']
  }
};

module.exports = schemas;
