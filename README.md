# Sistema de Locação de Veículos

Projeto da disciplina Programação com Frameworks Web. API REST em Node.js e Express com Prisma ORM e MySQL, autenticação por JWT e interface em React.

## Integrantes

- Nome completo do aluno 1
- Nome completo do aluno 2

## Funcionalidades

- Cadastro e login de usuários, com senha armazenada com bcrypt e autenticação por JWT
- Cadastro e listagem de veículos, com filtro de disponibilidade
- Registro de locação com cálculo do valor total no backend
- Listagem do histórico de locações do usuário autenticado
- Finalização de locação, que libera o veículo novamente

## Requisitos

- Node.js 20.19 ou superior
- MySQL 8
- npm

## Estrutura

```
backend/
  prisma/            schema.prisma, migrations e seed
  src/routes/        mapeamento dos endpoints
  src/controllers/   entrada e saída HTTP
  src/services/      validações e regras de negócio
  src/middlewares/   autenticação e tratamento de erros
  src/lib/           cliente Prisma e classe de erro
frontend/
  src/components/    componentes React
  src/api.js         integração com a API via fetch
```

## Configuração do banco

1. Crie o banco de dados:

```sql
CREATE DATABASE locadora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Dentro de `backend`, copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`.

## Executando o backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm run dev
```

A API sobe em `http://localhost:3333`. O comando `npm run seed` cadastra veículos de exemplo.

## Executando o frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

A interface fica disponível em `http://localhost:5173`.

## Endpoints

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | /auth/register | não | Cadastra usuário |
| POST | /auth/login | não | Retorna o JWT |
| GET | /auth/me | sim | Dados do usuário autenticado |
| POST | /veiculos | sim | Cadastra veículo |
| GET | /veiculos | sim | Lista veículos; `?disponivel=true` filtra disponíveis |
| POST | /locacoes | sim | Registra locação |
| GET | /locacoes | sim | Lista as locações do usuário autenticado |
| PATCH | /locacoes/:id/finalizar | sim | Finaliza locação |

As rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

## Códigos de resposta

- 400 dados inválidos
- 401 não autenticado ou token inválido
- 403 locação pertencente a outro usuário
- 404 recurso inexistente
- 409 conflito (e-mail ou placa duplicados, veículo indisponível, locação já finalizada)

## Decisões

- A identificação do usuário vem sempre do token, nunca do corpo da requisição.
- O valor total é calculado no service: qualquer fração de 24 horas conta como diária completa, com mínimo de uma diária.
- A reserva do veículo usa `updateMany` condicionado a `disponivel: true` dentro de uma transação, o que impede duas locações ativas simultâneas para o mesmo veículo.
- A finalização também usa `updateMany` condicionado a `status: ATIVA` dentro de uma transação.
- O hash da senha nunca é retornado pela API.
- O histórico é preservado: não há exclusão de veículos nem de locações.
- O gerador `prisma-client-js` foi escolhido para que o projeto rode em JavaScript puro, sem compilar TypeScript.
