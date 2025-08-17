import React from "react";
import "./Hero.css";

type HeroProps = {
  onCadastrarLivro?: () => void;
  onAdicionarWishlist?: () => void;
};

export default function Hero({
  onCadastrarLivro,
  onAdicionarWishlist,
}: HeroProps) {
  return (
    <>
      <header className="navbar">
        <nav>
          <a href="#wishlist">Wishlist</a>
          <a href="#meus-livros">Meus Livros</a>
        </nav>
      </header>

      <section className="hero">
        <div className="glass">
          <h1 className="logo">
            Biblio<span>Me</span>
          </h1>
          <p className="tagline">Minha Biblioteca na Nuvem</p>

          <div className="actions">
            <button className="btn btn-primary" onClick={onCadastrarLivro}>
              Cadastrar Livro
            </button>
            <button className="btn btn-secondary" onClick={onAdicionarWishlist}>
              Adicionar à Wishlist
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
