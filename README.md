# À Margem

A À Margem é uma plataforma de descoberta cultural e revista digital independente sobre cultura em Portugal. Tem um catálogo público (eventos, obras, artistas, espaços, artigos e coleções), área de cliente e um backoffice para administradores.

Projeto da unidade curricular **Aplicações para a Internet II** (ESTGV, 2025/2026).

O catálogo tem programação real de novembro e dezembro de 2026 no Porto e em Braga (Casa da Música, Teatro Nacional São João, Batalha Centro de Cinema e Theatro Circo), recolhida nas páginas oficiais e com ligação para a fonte em cada ficha. As capas são ilustrações gráficas do projeto.

## Versão online

| Parte | Serviço | URL |
| --- | --- | --- |
| Frontend (React) | Render — Static Site | https://a-margem-web.onrender.com |
| API (Express) | Render — Web Service | https://a-margem-api.onrender.com/api/health |
| Base de dados | Neon — PostgreSQL | (privada, acedida pela API) |

O plano gratuito do Render adormece a API quando não há tráfego: o primeiro pedido pode demorar 30–60 segundos.

## Tecnologias obrigatórias

| Requisito | Como foi cumprido |
| --- | --- |
| Arquitetura MVC | `server/src/models` (Modelos Sequelize), `server/src/controllers` (Controladores), `server/src/routes` (Rotas) e as Vistas em React (`client/src`) |
| Interface com Bootstrap | `bootstrap` importado em `client/src/main.jsx`; grelha, botões, formulários, tabelas e alertas do Bootstrap |
| PostgreSQL com Sequelize | Modelos e migrações em Sequelize; base de dados no Neon |
| Express | API REST em `server/src/app.js` e `server/src/routes/index.js` |
| Axios | Único cliente HTTP (`client/src/api/client.js`); não há `fetch` no projeto |
| React + Hooks | Componentes funcionais com `useState`, `useEffect`, `useMemo`, `useCallback`, `useContext` e hooks próprios (`usePageMeta`) |
| Projeto online | Neon + Render |

## Perfis de utilizador

| Perfil | Como se obtém | O que pode fazer |
| --- | --- | --- |
| **Cliente** | Registo público em `/register` (ou criado por um admin) | Guardar conteúdos, gerir o perfil, alterar a palavra-passe, terminar sessões, enviar sugestões e ver o estado delas. |
| **Admin** | Criado pelo seed (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) ou promovido por outro admin | Tudo o que o cliente faz + backoffice em `/admin`: conteúdos, moderação de sugestões, utilizadores e perfis, newsletter, mensagens, **explorador da base de dados** (tabelas, pesquisa, edição, exportação CSV, consola SQL só de leitura) e registo de atividade. |

O perfil é validado no servidor em todos os pedidos: `requireAuth` + `requireAdmin` são aplicados a todo o prefixo `/api/admin`. Esconder botões no React é apenas conforto visual, não é a proteção.

## Funcionalidades recentes

- **Imagens do computador:** nos formulários do backoffice, o botão "Escolher do computador" envia a imagem (JPG, PNG, WebP ou GIF, até 2,5 MB) para a API, que valida o tipo pelo conteúdo real do ficheiro e a guarda na tabela `media` do PostgreSQL (o disco do Render é apagado a cada deploy). A imagem fica disponível em `/api/media/:id`.
- **Conteúdo real:** o catálogo é sobre cultura portuguesa (discos portugueses de 2026, exposições em Lisboa, concertos de artistas portugueses até ao fim do ano), com ligação para a fonte em cada ficha (`server/src/seed/content.js`). As fotografias são de edifícios e objetos, com licença livre (Wikimedia Commons); os créditos estão na página Sobre. Não são usadas fotografias de pessoas nem capas de discos, por terem direitos de autor.
- **Pesquisa:** sugestões enquanto se escreve na barra do cabeçalho (setas, Enter, Esc e atalho `/`), pesquisa que ignora acentos (`unaccent`) e exige todas as palavras, filtros por tipo com contagens e resultados atualizados enquanto se escreve.

## Segurança

- Palavras-passe guardadas com bcrypt (custo 12) e política mínima (10+ caracteres, com letras e números).
- Autenticação com JWT (HS256, `issuer`/`audience`, validade de 8 h). Cada conta tem uma "versão de sessão": mudar ou repor a palavra-passe, mudar o perfil ou "terminar todas as sessões" invalida os tokens antigos.
- Bloqueio temporário da conta após 5 tentativas de login falhadas (15 min) e limitação de pedidos por IP nas rotas sensíveis.
- Cabeçalhos HTTP de segurança na API (CSP, HSTS, nosniff, X-Frame-Options); CORS restrito ao endereço do frontend (`CLIENT_URL`).
- Respostas de conta e de administração com `Cache-Control: no-store`; os erros internos não expõem detalhes.
- O explorador da base de dados nunca mostra hashes de palavras-passe nem tokens. A consola SQL aceita uma única instrução `SELECT`/`WITH`/`EXPLAIN`, executada numa transação `READ ONLY` com limite de 5 s.
- Registo de auditoria (`audit_logs`) de logins, falhas de login e todas as alterações feitas no backoffice.
- Ligação TLS ao Neon com verificação de certificado; segredos apenas em variáveis de ambiente (nunca no Git).

## Requisitos para correr localmente

- Node.js 20 ou superior e npm.
- PostgreSQL 14 ou superior (ou uma base de dados no Neon).

## Instalar e configurar

```powershell
npm run install:all
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Edita `server/.env`:

- `DATABASE_URL` — ligação ao PostgreSQL.
- `JWT_SECRET` — segredo aleatório com pelo menos 32 caracteres. Para gerar: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` e `CLIENT_EMAIL` / `CLIENT_PASSWORD` (opcional) — contas criadas pelo seed.

## Base de dados

```powershell
npm run db:migrate
npm run seed
```

`npm run db:rollback` desfaz a última migração. `npm run seed` pode ser repetido sem duplicar dados. Também é possível promover uma conta diretamente no PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'o-teu-email@example.com';
```

## Arrancar a aplicação

Em dois terminais, a partir da raiz do repositório:

```powershell
npm run dev:server
npm run dev:client
```

A API fica em `http://localhost:4000/api` e o Vite serve o site em `http://localhost:5173`.

## Scripts

| Comando | Função |
| --- | --- |
| `npm run dev:client` | Servidor de desenvolvimento do Vite |
| `npm run dev:server` | Express com nodemon |
| `npm run build` | Build do React (gera também `404.html` para os links diretos no Render) |
| `npm test` | Testes do servidor (rotas, validação, segurança, migrações) |
| `npm run db:migrate` | Aplica as migrações pendentes |
| `npm run db:rollback` | Desfaz a última migração |
| `npm run seed` | Dados de demonstração e contas opcionais |

## Estrutura

```text
client/                 React + Vite + Bootstrap + Axios
  src/api/client.js     instância do Axios (envia o token JWT)
  src/context/          AuthContext (sessão do utilizador)
  src/pages/            páginas públicas, conta e backoffice (pages/admin)
  src/components/       componentes reutilizáveis
server/                 Express + Sequelize (MVC)
  src/models/           Modelos (tabelas)
  src/controllers/      Controladores (lógica de cada pedido)
  src/routes/           Rotas da API REST
  src/middleware/       autenticação, perfis, validação, limitação de pedidos
  src/migrations/       migrações versionadas da base de dados
  src/seed/             dados de demonstração
  test/                 testes (node:test)
```

## Publicação (Neon + Render)

1. **Neon** — criar o projeto PostgreSQL e copiar a connection string para `DATABASE_URL` (e a ligação direta para `DATABASE_URL_UNPOOLED`, usada nas migrações).
2. **Render — API** (Web Service): build `cd server && npm ci`; start `cd server && npm run db:migrate && npm start`. Variáveis: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `DATABASE_SSL=true`, `JWT_SECRET`, `CLIENT_URL` (URL do frontend), `PUBLIC_URL`, `NODE_ENV=production`. `SEED_ON_START=true` corre o seed no arranque (útil no plano gratuito, sem consola); depois deve voltar a `false`.
3. **Render — Frontend** (Static Site): build `cd client && npm ci && npm run build`; publish `client/dist`; variável `VITE_API_URL=https://a-margem-api.onrender.com/api`.
4. **Alternativa Vercel** — importar o repositório com a pasta `client` como raiz; o `client/vercel.json` já tem o rewrite para a SPA e os cabeçalhos de segurança. Acrescentar o domínio do Vercel a `CLIENT_URL` na API.
