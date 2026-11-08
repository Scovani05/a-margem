# À Margem

À Margem is a Portuguese cultural discovery platform and independent digital magazine. Its public catalogue, editorial content, and moderation tools use React, React Router, Bootstrap, Axios, Express MVC, PostgreSQL, and Sequelize.

All initial catalogue records are marked **Demonstração** in the interface. They are fictional examples for local development, not verified events, venues, people, or editorial claims.

## Perfis de utilizador

| Perfil | Como se obtém | O que pode fazer |
| --- | --- | --- |
| **Cliente** | Registo público em `/register` (ou criado por um admin) | Guardar conteúdos, gerir o perfil, alterar a palavra-passe, terminar sessões, enviar sugestões e ver o estado delas. |
| **Admin** | Criado pelo seed (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) ou promovido por outro admin | Tudo o que o cliente faz + backoffice em `/admin`: conteúdos, moderação, utilizadores e perfis, newsletter, mensagens, **explorador da base de dados** (tabelas, pesquisa, edição, exportação CSV, consola SQL só de leitura) e registo de atividade. |

O perfil é validado no servidor em todos os pedidos (`requireAuth` + `requireAdmin` aplicados a todo o prefixo `/api/admin`), por isso esconder botões no React não é a única proteção.

## Segurança

- Palavras-passe com bcrypt (custo 12) e política mínima (10+ caracteres, letras e números).
- JWT HS256 com `issuer`/`audience`, validade de 8 h e versão de sessão: mudar a palavra-passe, repor a palavra-passe, mudar o perfil ou "terminar todas as sessões" invalida os tokens antigos.
- Bloqueio temporário da conta após 5 tentativas de login falhadas (15 min) e limitação de pedidos por IP nas rotas sensíveis (`trust proxy` ativo para o Render).
- Cabeçalhos HTTP de segurança na API (CSP, HSTS, nosniff, X-Frame-Options) e CSP/HSTS/X-Frame-Options no Vercel (`client/vercel.json`); CORS restrito a `CLIENT_URL`.
- Respostas de conta/admin com `Cache-Control: no-store`; erros internos não expõem detalhes.
- Explorador da base de dados nunca mostra hashes de palavras-passe ou tokens; a consola SQL aceita só uma instrução `SELECT`/`WITH`/`EXPLAIN`, dentro de uma transação `READ ONLY` com limite de 5 s.
- Registo de auditoria (`audit_logs`) para logins, falhas de login e todas as alterações feitas no backoffice.
- Ligação TLS ao Neon com verificação de certificado; segredos apenas em variáveis de ambiente.

## Requirements

- Node.js 20 or newer and npm.
- PostgreSQL 14 or newer.
- Separate PostgreSQL database for development.

## Install and configure

```powershell
npm run install:all
Copy-Item server/.env.example server/.env
```

Edit `server/.env` and set `DATABASE_URL` to a PostgreSQL connection string. Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and use it for `JWT_SECRET`. Optionally configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding to create an administrator. The seed script never uses a built-in production password.

## Database

```powershell
npm run db:migrate
npm run seed
```

`npm run db:rollback` reverses the latest migration. `npm run seed` is safe to rerun and adds only the clearly labelled demonstration catalogue. Set both `ADMIN_EMAIL` and `ADMIN_PASSWORD` to provision the first administrator. Otherwise create a normal account and promote it directly in PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-address@example.com';
```

## Start the app

Open two terminals from the repository root:

```powershell
npm run dev:server
npm run dev:client
```

The API is available at `http://localhost:4000/api`; Vite serves the client at `http://localhost:5173`. The API requires PostgreSQL and will not silently switch to browser storage or static fallback data.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:client` | Start Vite development server |
| `npm run dev:server` | Start Express with nodemon |
| `npm run build` | Build the React client |
| `npm test` | Run server input-validation and slug tests |
| `npm run db:migrate` | Apply pending Sequelize QueryInterface migrations |
| `npm run db:rollback` | Roll back the most recent migration |
| `npm run seed` | Add demonstration data and the optional admin (`ADMIN_*`) and client (`CLIENT_*`) accounts |

## Architecture

- `client/src/pages`, `components`, `hooks`, and `api` contain the React application. React Router handles navigation; Axios is the only HTTP client; Bootstrap provides layout and controls.
- `server/src/models` defines Sequelize models. `controllers` handle HTTP input/output, `routes` register REST endpoints, `services` hold catalogue/search and editorial logic, and `middleware` handles authentication, validation, rate limiting, and errors.
- `server/src/migrations` contains versioned schema changes. `server/src/seed` contains development seed data.
- Passwords are bcrypt-hashed. JWTs are kept in browser session storage. Admin access is checked by the API on every protected request.
- Password recovery provides a development-only reset link in the API response. No email is sent unless a provider is configured in a future deployment.
- Newsletter signup stores consent and an unsubscribe token. It does not send campaigns.
- Public pages update titles and descriptions client-side, and the API exposes a sitemap. This SPA does not server-render article metadata; server-side rendering or prerendering should be added before relying on full social-card previews or broad crawler support.

## Deployment notes

The checked-in deployment files target a Vercel static frontend, a Render Express API, and Neon PostgreSQL:

1. Push this repository to a Git provider and import it into Vercel. Set the Vercel project root directory to `client`; `client/vercel.json` supplies the SPA rewrite needed for direct links. Add `VITE_API_URL=https://<render-service>.onrender.com/api` and `VITE_PUBLIC_URL=https://<your-vercel-domain>` to the Vercel production environment, then redeploy.
2. Create a Neon PostgreSQL project and copy its connection string from the Neon Console. Keep the connection string private; the application reads it through `DATABASE_URL` and Neon requires TLS.
3. Create a Render Blueprint from the repository root using `render.yaml`. During initial setup, provide the Neon `DATABASE_URL`, the Vercel origin for both `CLIENT_URL` and `PUBLIC_URL`, and let Render generate `JWT_SECRET`. The start command applies pending migrations before starting the API, and `/api/health` is the health check. `DATABASE_SSL=true` is set for the Neon connection.
4. Once the Render URL is known, set `VITE_API_URL` in Vercel to that API URL and redeploy the frontend. The API uses Render's `RENDER_EXTERNAL_URL` for its robots sitemap URL unless `API_PUBLIC_URL` is explicitly set.

The Render API Blueprint uses the free service plan, which can sleep when idle. Do not seed fictional demonstration content into a public production database. No mail service or third-party content feed is configured. For local development, continue to use `server/.env` and `client/.env` copied from their `.env.example` files.
