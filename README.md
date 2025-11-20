# Home Fest & Eventos - API de Blog

API simples em Node + Express para alimentar o blog do site Home Fest & Eventos.

Endpoints principais:

- `GET /blog/posts` — lista de posts
- `GET /blog/posts/:slug` — detalhe de um post

Endpoint opcional (admin), que usa a API da OpenAI para gerar um artigo:

- `POST /admin/generate-post`

## Uso rápido

```bash
npm install
npm start
```

Crie um arquivo `.env` na raiz com:

```bash
OPENAI_API_KEY=seu_token_aqui
PORT=3000
ORIGIN_FRONTEND=http://localhost:5173
```