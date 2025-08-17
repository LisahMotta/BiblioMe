import express from "express";

const router = express.Router();

// Mock temporário (troque por integração com banco)
let wishlist: any[] = [];
let livros: any[] = [];
let nextId = 1;

// --- Wishlist ---
router.get("/wishlist", (req, res) => {
  res.json(wishlist);
});

router.post("/wishlist", (req, res) => {
  const item = { id: nextId++, ...req.body };
  wishlist.push(item);
  res.status(201).json(item);
});

router.delete("/wishlist/:id", (req, res) => {
  const id = Number(req.params.id);
  wishlist = wishlist.filter((item) => item.id !== id);
  res.status(204).end();
});

router.post("/wishlist/:id/mover-para-biblioteca", (req, res) => {
  const id = Number(req.params.id);
  const item = wishlist.find((w) => w.id === id);
  if (item) {
    livros.push({
      id: nextId++,
      titulo: item.titulo,
      autor: item.autor,
      capa_url: item.capa_url,
      status_leitura: "não lido",
      resenha: "",
      nota: null,
    });
    wishlist = wishlist.filter((w) => w.id !== id);
    res.status(200).json({ ok: true });
  } else {
    res.status(404).json({ error: "Item não encontrado" });
  }
});

// --- Biblioteca ---
router.get("/livros", (req, res) => {
  res.json(livros);
});

router.post("/livros", (req, res) => {
  const livro = { id: nextId++, ...req.body };
  livros.push(livro);
  res.status(201).json(livro);
});

export default router;