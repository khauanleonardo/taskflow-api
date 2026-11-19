# TaskFlow API

API REST do TaskFlow, com arquitetura MVC, autenticação JWT e documentação Swagger.

![Testes](https://github.com/khauanleonardo/taskflow-api/actions/workflows/testes.yml/badge.svg)

## Como rodar

1. Instale as dependências: `npm install`
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `DIRECT_URL` e `JWT_SECRET`.
3. Crie o arquivo `.env.test` (usado só pelos testes), com `AMBIENTE=teste` e a string do branch de teste do banco.
4. Inicie o servidor em modo de desenvolvimento: `npm run dev`
5. Rode os testes: `npm test`

A documentação Swagger fica em `/docs`.

## Testes de integração contínua

Cada push e pull request na `main` roda `npm test` no GitHub Actions (arquivo `.github/workflows/testes.yml`). Os valores de `DATABASE_URL`, `DIRECT_URL` e `JWT_SECRET` ficam nos secrets do repositório, e nunca no código.