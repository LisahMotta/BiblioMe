export type WishlistItem = {
  id: number;
  titulo: string;
  autor?: string;
  capa_url?: string;
  observacao?: string;
};

export type Livro = {
  id: number;
  titulo: string;
  autor?: string;
  capa_url?: string;
  genero?: string;
  ano_publicacao?: number;
  status_leitura: string;
  resenha?: string;
  nota?: number;
};

const API_URL = "http://localhost:3000"; // ajuste se necessário

export interface IDataStore {
  getWishlist(): Promise<WishlistItem[]>;
  addWishlist(item: Omit<WishlistItem, "id">): Promise<WishlistItem>;
  removeWishlist(id: number): Promise<void>;
  moveWishlistToBiblioteca(id: number): Promise<void>;

  getLivros(): Promise<Livro[]>;
  addLivro(data: Omit<Livro, "id">): Promise<Livro>;
}

export class ApiDataStore implements IDataStore {
  async getWishlist(): Promise<WishlistItem[]> {
    const res = await fetch(`${API_URL}/wishlist`);
    return res.json();
  }

  async addWishlist(item: Omit<WishlistItem, "id">): Promise<WishlistItem> {
    const res = await fetch(`${API_URL}/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    return res.json();
  }

  async removeWishlist(id: number): Promise<void> {
    await fetch(`${API_URL}/wishlist/${id}`, { method: "DELETE" });
  }

  async moveWishlistToBiblioteca(id: number): Promise<void> {
    await fetch(`${API_URL}/wishlist/${id}/move`, { method: "POST" });
  }

  async getLivros(): Promise<Livro[]> {
    const res = await fetch(`${API_URL}/livros`);
    return res.json();
  }

  async addLivro(data: Omit<Livro, "id">): Promise<Livro> {
    const res = await fetch(`${API_URL}/livros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }
}