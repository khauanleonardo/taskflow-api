import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // ou a URL da sua API no Vercel
});

// Interceptor de REQUISIÇÃO (Injeta o token automaticamente)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de RESPOSTA (Captura token expirado/inválido 401)
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(erro);
  }
);

export default api;