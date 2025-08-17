import { Router } from "express";
import { db } from "../db";
import { wishlist, livros } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /wishlist – listar todos
router.get("/", async (req, res) => {
  const resultado = await db.select().from(wishlist);
  res.json(resultado);
});

// POST /wishlist – adicionar novo
router.post("/", async (req, res) => {
  const { titulo, autor, capa_url, observacao } = req.body;
  const novo = await db.insert(wishlist).values({
    titulo,
    autor,
    capa_url,
    observacao,
  });
  res.json(novo);
});

// DELETE /wishlist/:id – remover
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deletado = await db.delete(wishlist).where(eq(wishlist.id, Number(id)));
  res.json(deletado);
});

// POST /wishlist/:id/mover-para-biblioteca – move o livro para a biblioteca e remove da wishlist
router.post("/:id/mover-para-biblioteca", async (req, res) => {
  const { id } = req.params;
  // Busca o livro na wishlist
  const [livro] = await db.select().from(wishlist).where(eq(wishlist.id, Number(id)));
  if (!livro) return res.status(404).json({ error: "Livro não encontrado na wishlist" });
  // Insere na tabela livros
  await db.insert(livros).values({
    titulo: livro.titulo,
    autor: livro.autor,
    capa_url: livro.capa_url,
    status_leitura: "não lido"
  });
  // Remove da wishlist
  await db.delete(wishlist).where(eq(wishlist.id, Number(id)));
  res.json({ sucesso: true });
});

export default router;
