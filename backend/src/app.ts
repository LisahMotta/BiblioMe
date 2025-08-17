import express from "express";
import livrosRoutes from "./routes/livros";
import wishlistRoutes from "./routes/wishlist";
import cors from "cors";

const app = express();

// Habilita o CORS para permitir requisições de outros domínios
app.use(cors());
app.use(express.json());
app.use("/livros", livrosRoutes);
app.use("/wishlist", wishlistRoutes);

export default app;
