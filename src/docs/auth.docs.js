const { json } = require('./comum');

// Login: a rota não pede token (security: [])
const paths = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Faz login e devolve o token JWT',
      security: [],
      requestBody: { required: true, content: json('Login') },
      responses: {
        '200': { description: 'Login feito. Copie o token e use no Authorize', content: json('LoginResposta') },
        '400': { description: 'E-mail ou senha não informados', content: json('Erro') },
        '401': { description: 'Credenciais inválidas', content: json('Erro') }
      }
    }
  }
};

const schemas = {
  Login: {
    type: 'object',
    required: ['email', 'senha'],
    properties: {
      email: { type: 'string', format: 'email', example: 'ana@taskflow.com' },
      senha: { type: 'string', example: '1234' }
    }
  },
  LoginResposta: {
    type: 'object',
    properties: {
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiJ9...' },
      usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Ana Lima' },
          email: { type: 'string', example: 'ana@taskflow.com' }
        }
      }
    }
  }
};

module.exports = { paths, schemas };
