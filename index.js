require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// A biblioteca oficial openai v4. Você pode usar depois para gerar posts automaticamente.
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN_FRONTEND = process.env.ORIGIN_FRONTEND || "http://localhost:5173";

app.use(cors({
  origin: ORIGIN_FRONTEND,
}));
app.use(express.json());

// Carrega posts de um arquivo JSON simples
const POSTS_FILE = path.join(__dirname, "posts.json");

function readPosts() {
  if (!fs.existsSync(POSTS_FILE)) {
    return [];
  }
  const text = fs.readFileSync(POSTS_FILE, "utf8");
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Erro ao ler posts.json:", err);
    return [];
  }
}

// GET /blog/posts - lista de posts
app.get("/blog/posts", (req, res) => {
  const posts = readPosts();
  const summaries = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readingTime: p.readingTime || "5 min",
    tags: p.tags || [],
    coverImage: p.coverImage || "",
  }));
  res.json(summaries);
});

// GET /blog/posts/:slug - detalhe
app.get("/blog/posts/:slug", (req, res) => {
  const { slug } = req.params;
  const posts = readPosts();
  const post = posts.find(p => p.slug === slug);
  if (!post) {
    return res.status(404).json({ error: "Post não encontrado" });
  }
  res.json(post);
});

// Rota opcional: gerar um post usando OpenAI (admin)
// IMPORTANTE: Não exponha isso sem autenticação em produção.
app.post("/admin/generate-post", async (req, res) => {
  const { topic, tags } = req.body || {};
  if (!topic) {
    return res.status(400).json({ error: "topic é obrigatório" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY não configurada" });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "Você é um redator especializado em festas, eventos e buffet em domicílio em Belo Horizonte."
        },
        {
          role: "user",
          content: `Crie um artigo em HTML sobre o tema: "${topic}". Use tom acolhedor, sofisticado e prático. Gere título, subtítulos e parágrafos. Não use cabeçalho <h1>, apenas <h2> e <h3>.`
        }
      ]
    });

    const contentText = completion.output[0].content[0].text;

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const slug = topic
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newPost = {
      slug,
      title: topic,
      excerpt: `Artigo sobre ${topic} com dicas práticas para organizar eventos com a Home Fest & Eventos em Belo Horizonte.`,
      date,
      readingTime: "7 min",
      tags: Array.isArray(tags) ? tags : [],
      coverImage: "",
      coverAlt: topic,
      content: contentText,
    };

    const posts = readPosts();
    posts.unshift(newPost);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");

    res.json(newPost);
  } catch (err) {
    console.error("Erro ao gerar post com OpenAI:", err);
    res.status(500).json({ error: "Erro ao gerar post com OpenAI" });
  }
});

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API de Blog Home Fest & Eventos" });
});

app.listen(PORT, () => {
  console.log(`Blog API rodando em http://localhost:${PORT}`);
});