require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "";

// ------- CORS CONFIG -------
const allowedOrigins = new Set();

// ORIGIN_FRONTEND único
if (process.env.ORIGIN_FRONTEND) {
  allowedOrigins.add(process.env.ORIGIN_FRONTEND.trim());
}

// Vários domínios em CORS_ORIGINS separados por vírgula
if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(",").forEach((origin) => {
    const clean = origin.trim();
    if (clean) allowedOrigins.add(clean);
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Thunder Client / servidor sem origin
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.warn("Origin não permitido pelo CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// ------- FUNÇÕES UTILITÁRIAS PARA posts.json -------

const postsFilePath = path.join(__dirname, "posts.json");

function readPosts() {
  try {
    if (!fs.existsSync(postsFilePath)) {
      return [];
    }
    const raw = fs.readFileSync(postsFilePath, "utf-8");
    if (!raw.trim()) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao ler posts.json:", err);
    return [];
  }
}

function writePosts(posts) {
  try {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao gravar posts.json:", err);
  }
}

// ------- MIDDLEWARE DE API KEY -------

function requireApiKey(req, res, next) {
  if (!API_KEY) {
    console.warn("API_KEY não configurada no servidor.");
    return res.status(500).json({ error: "API_KEY não configurada no servidor" });
  }

  const key = req.header("x-api-key");
  if (!key) {
    return res.status(401).json({ error: "x-api-key não enviada" });
  }

  if (key !== API_KEY) {
    return res.status(403).json({ error: "API key inválida" });
  }

  next();
}

// ------- ROTAS PÚBLICAS (SEM API KEY) -------

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Home Fest Blog API online",
  });
});

// Listar todos os posts
app.get(["/posts", "/api/posts"], (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

// Obter post por slug
app.get(["/posts/:slug", "/api/posts/:slug"], (req, res) => {
  const { slug } = req.params;
  const posts = readPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return res.status(404).json({ error: "Post não encontrado" });
  }

  res.json(post);
});

// ------- ROTAS PROTEGIDAS (COM API KEY) -------

// Criar novo post
app.post(["/posts", "/api/posts"], requireApiKey, (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    coverAlt,
    date,
    readingTime,
    tags,
  } = req.body;

  if (!title || !slug) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: title e slug" });
  }

  const posts = readPosts();

  if (posts.some((p) => p.slug === slug)) {
    return res.status(409).json({ error: "Já existe um post com esse slug" });
  }

  const newPost = {
    title,
    slug,
    excerpt: excerpt || "",
    content: content || "",
    coverImage: coverImage || "",
    coverAlt: coverAlt || "",
    date: date || new Date().toISOString().slice(0, 10),
    readingTime: readingTime || "",
    tags: Array.isArray(tags) ? tags : [],
  };

  posts.push(newPost);
  writePosts(posts);

  res.status(201).json(newPost);
});

// Atualizar post existente
app.put(["/posts/:slug", "/api/posts/:slug"], requireApiKey, (req, res) => {
  const { slug } = req.params;
  const {
    title,
    excerpt,
    content,
    coverImage,
    coverAlt,
    date,
    readingTime,
    tags,
  } = req.body;

  const posts = readPosts();
  const index = posts.findIndex((p) => p.slug === slug);

  if (index === -1) {
    return res.status(404).json({ error: "Post não encontrado" });
  }

  const existing = posts[index];

  const updatedPost = {
    ...existing,
    title: title ?? existing.title,
    excerpt: excerpt ?? existing.excerpt,
    content: content ?? existing.content,
    coverImage: coverImage ?? existing.coverImage,
    coverAlt: coverAlt ?? existing.coverAlt,
    date: date ?? existing.date,
    readingTime: readingTime ?? existing.readingTime,
    tags: Array.isArray(tags) ? tags : existing.tags,
  };

  posts[index] = updatedPost;
  writePosts(posts);

  res.json(updatedPost);
});

// Deletar post
app.delete(
  ["/posts/:slug", "/api/posts/:slug"],
  requireApiKey,
  (req, res) => {
    const { slug } = req.params;
    const posts = readPosts();
    const index = posts.findIndex((p) => p.slug === slug);

    if (index === -1) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    const deleted = posts[index];
    posts.splice(index, 1);
    writePosts(posts);

    res.json({ success: true, deleted });
  }
);

// ------- START -------

app.listen(PORT, () => {
  console.log(`Home Fest Blog API rodando na porta ${PORT}`);
});
