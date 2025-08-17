import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const livros = pgTable("livros", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  autor: text("autor"),
  genero: text("genero"),
  ano_publicacao: integer("ano_publicacao"),
  status_leitura: text("status_leitura").$type<"não lido" | "lendo" | "lido">().notNull(),
  resenha: text("resenha"),
  nota: integer("nota"), // 0 a 5
  capa_url: text("capa_url"),
  createdAt: timestamp("created_at").defaultNow()
});

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  autor: text("autor"),
  capa_url: text("capa_url"),
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow()
});