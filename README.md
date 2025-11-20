# Home Fest & Eventos — API de Blog

API em **Node + Express** usada para alimentar o blog do site Home Fest & Eventos.

Este projeto foi ajustado para funcionar na Railway e responder às rotas usadas pelo frontend em produção.

---

## 📌 Endpoints principais

### Público (sem autenticação)

- `GET /posts`  
- `GET /api/posts`  
  Lista todos os posts, ordenados por data (mais recentes primeiro).

- `GET /posts/:slug`  
- `GET /api/posts/:slug`  
  Retorna os dados completos de um post específico pelo `slug`.

### Protegido por API KEY (escrita)

> Todas essas rotas exigem o header: `x-api-key: <SUA_API_KEY>`

- `POST /posts`  
- `POST /api/posts`  
  Cria um novo post.

  **Body (JSON) exemplo:**
  ```json
  {
    "title": "Como organizar uma festa em casa em BH",
    "slug": "como-organizar-festa-em-casa-bh",
    "excerpt": "Guia completo para fazer uma festa em casa com clima acolhedor.",
    "content": "<h2>Introdução</h2><p>Texto em HTML...</p>",
    "coverImage": "/blog/festa-em-casa.webp",
    "coverAlt": "Descrição da imagem de capa",
    "date": "2025-11-20",
    "readingTime": "6 min",
    "tags": ["Festa em casa", "BH"]
  }
  ```

- `PUT /posts/:slug`  
- `PUT /api/posts/:slug`  
  Atualiza um post existente (mantém o `slug` original).

- `DELETE /posts/:slug`  
- `DELETE /api/posts/:slug`  
  Remove um post.

---

## ⚙️ Variáveis de ambiente (.env)

Crie um arquivo `.env` na raiz com, por exemplo:

```bash
PORT=3000
ORIGIN_FRONTEND=http://localhost:5173

# Domínios permitidos em produção (separados por vírgula)
# Exemplo:
# CORS_ORIGINS=https://homefesteeventos.com.br,https://www.homefesteeventos.com.br,http://localhost:5173
CORS_ORIGINS=

# Chave usada nas rotas protegidas (POST/PUT/DELETE)
API_KEY=sua_chave_aqui

# (Opcional) chave da OpenAI para automação futura de posts
OPENAI_API_KEY=
```

---

## ▶️ Como rodar localmente

```bash
npm install
npm start
```

A API ficará disponível em:

```bash
http://localhost:3000
```

Você pode testar com ferramentas como Thunder Client, Insomnia ou Postman.

---

## 🧪 Exemplo de teste no Thunder Client (POST /posts)

- **Method:** `POST`
- **URL:** `https://home-fest-blog-api-production.up.railway.app/posts` (ou `http://localhost:3000/posts`)
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: <SUA_API_KEY>`
- **Body (JSON):**
  ```json
  {
    "title": "Festa infantil em casa: guia prático",
    "excerpt": "Dicas para organizar uma festa infantil acolhedora, prática e sem stress.",
    "content": "<h2>Por que fazer a festa em casa?</h2><p>...</p>",
    "coverImage": "/blog/festa-infantil-casa.webp",
    "coverAlt": "Imagem de festa infantil em casa",
    "tags": ["Buffet Infantil", "Festa em casa", "BH"]
  }
  ```

Se tudo estiver correto, você receberá `201 Created` com o JSON do novo post.
