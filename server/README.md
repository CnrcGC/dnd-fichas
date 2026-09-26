# Backend da plataforma RPG

Serviço modular em Fastify 5, PostgreSQL e Better Auth. Requer Node.js 20 ou superior.

## Desenvolvimento local

1. Copie `.env.example` para `.env` e substitua os valores locais. Nunca versione `.env`.
2. Crie um banco PostgreSQL vazio.
3. Execute `npm ci`.
4. Execute `npm run db:setup`. A ordem é intencional: o Better Auth cria o schema de autenticação e a migração da plataforma adiciona as tabelas que referenciam usuários.
5. Execute `npm run dev`.

Health checks:

- `GET /health/live`: processo disponível;
- `GET /health/ready`: banco acessível e migrações da plataforma presentes.

Em desenvolvimento, o OpenAPI fica em `/documentation`. As rotas de personagens ficam em `/api/v1/characters` e exigem a sessão HttpOnly do Better Auth.

## Validação

```text
npm run lint
npm test
```

Os testes HTTP usam injeção do Fastify e não fingem uma integração PostgreSQL. Testes de constraints, transações e restauração exigem uma instância descartável real do PostgreSQL.
