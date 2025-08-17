import { Router } from "express";
import { db } from "../db";
import { livros } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /livros – listar todos
router.get("/", async (req, res) => {
  const resultado = await db.select().from(livros);
  res.json(resultado);
});

// POST /livros – adicionar novo
router.post("/", async (req, res) => {
  const { titulo, autor, genero, ano_publicacao, status_leitura, resenha, nota, capa_url } = req.body;
  const novo = await db.insert(livros).values({
    titulo,
    autor,
    genero,
    ano_publicacao,
    status_leitura,
    resenha,
    nota,
    capa_url,
  });
  res.json(novo);
});

// PUT /livros/:id – atualizar
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  const atualizado = await db.update(livros).set(dados).where(eq(livros.id, Number(id)));
  res.json(atualizado);
});

// DELETE /livros/:id – remover
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deletado = await db.delete(livros).where(eq(livros.id, Number(id)));
  res.json(deletado);
});

export default router;
