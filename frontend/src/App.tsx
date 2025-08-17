import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BookSuggestions, { type BookSuggestionItem } from "./components/BookSuggestions";
import { ApiDataStore } from "./dataStore";
const dataStore = new ApiDataStore();

const API_URL = "http://localhost:3000"; // ajuste a porta se necessário
const HERO_BG = "https://SEU-LINK-DE-IMAGEM.jpg"; // ⬅️ Troque pela URL da sua imagem

type WishlistItem = {
  id: number;
  titulo: string;
  autor?: string;
  capa_url?: string;
  observacao?: string;
};

type Livro = {
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

// ======== CLASSES REUTILIZÁVEIS PARA BOTÕES (usadas junto com Tailwind) ========
const BTN_BASE =
  "px-5 py-2 rounded-full font-bold transition shadow-[0_6px_14px_rgba(0,0,0,0.20)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/40";

const BTN_PRIMARY =
  `${BTN_BASE} !text-white !bg-[#d43f6b] shadow-[0_6px_14px_rgba(212,63,107,0.40)] hover:!bg-[#ff5a8a]`;

const BTN_SECONDARY =
  `${BTN_BASE} !text-white/95 bg-white/10 border border-[#d43f6b]/50 backdrop-blur-sm hover:!bg-[#d43f6b] hover:!text-white`;

const BTN_CANCEL =
  `${BTN_BASE} !text-white bg-gray-500/80 hover:bg-gray-600`;

function App() {
  // ------------------ Biblioteca: formulário ------------------
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    genero: "",
    ano_publicacao: "",
    status_leitura: "não lido",
    resenha: "",
    nota: "",
    capa_url: "",
  });

  // Estado para abrir/fechar sugestões e query
  const [bookQuery, setBookQuery] = useState("");
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // ------------------ Wishlist: formulário ------------------
  const [wishlistForm, setWishlistForm] = useState({
    titulo: "",
    autor: "",
    capa_url: "",
    observacao: "",
  });

  // Estado para abrir/fechar sugestões e query
  const [bookQueryW, setBookQueryW] = useState("");
  const [openSuggestionsW, setOpenSuggestionsW] = useState(false);
  const suggestionsRefW = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // ------------------ Dados ------------------
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [biblioteca, setBiblioteca] = useState<Livro[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingBiblioteca, setLoadingBiblioteca] = useState(false);

  // Mostrar/ocultar formulários
  const [showForm, setShowForm] = useState(false);
  const [showWishlistForm, setShowWishlistForm] = useState(false);

  // ------------------ Carregar dados ------------------
  useEffect(() => {
    fetchWishlist();
    fetchBiblioteca();
  }, []);

useEffect(() => {
  dataStore.getLivros().then(setBiblioteca);
  dataStore.getWishlist().then(setWishlist);
}, []);

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const res = await fetch(`${API_URL}/wishlist`);
      const data = await res.json();
      setWishlist(data);
    } catch {
      alert("Erro ao carregar wishlist!");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const fetchBiblioteca = async () => {
    setLoadingBiblioteca(true);
    try {
      const res = await fetch(`${API_URL}/livros`);
      const data = await res.json();
      setBiblioteca(data);
    } catch {
      alert("Erro ao carregar biblioteca!");
    } finally {
      setLoadingBiblioteca(false);
    }
  };

  // ------------------ Handlers Biblioteca ------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/livros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ano_publicacao: form.ano_publicacao ? Number(form.ano_publicacao) : null,
          nota: form.nota ? Number(form.nota) : null,
        }),
      });
      if (!response.ok) throw new Error("Erro ao cadastrar livro");

      alert("Livro cadastrado com sucesso!");
      setForm({
        titulo: "",
        autor: "",
        genero: "",
        ano_publicacao: "",
        status_leitura: "não lido",
        resenha: "",
        nota: "",
        capa_url: "",
      });
      fetchBiblioteca();
      setShowForm(false);
      setBookQuery("");
      setOpenSuggestions(false);
    } catch {
      alert("Erro ao cadastrar livro!");
    }
  };

  // ------------------ Handlers Wishlist ------------------
  const handleWishlistChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setWishlistForm({ ...wishlistForm, [e.target.name]: e.target.value });
  };

  const handleWishlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wishlistForm),
      });
      if (!response.ok) throw new Error();
      setWishlistForm({ titulo: "", autor: "", capa_url: "", observacao: "" });
      fetchWishlist();
      setShowWishlistForm(false);
      setBookQueryW("");
      setOpenSuggestionsW(false);
    } catch {
      alert("Erro ao adicionar à wishlist!");
    }
  };

  const removeFromWishlist = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/wishlist/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      fetchWishlist();
    } catch {
      alert("Erro ao remover da wishlist!");
    }
  };

  const moveToBiblioteca = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/wishlist/${id}/mover-para-biblioteca`, {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      fetchWishlist();
      fetchBiblioteca();
    } catch {
      alert("Erro ao mover para biblioteca!");
    }
  };

  // ------------------ Aplicar sugestões ------------------
  const applySuggestion = (sug: BookSuggestionItem) => {
    setForm((prev) => ({
      ...prev,
      capa_url: sug.thumbnail || prev.capa_url,
      autor:
        prev.autor || (sug.authors?.length ? sug.authors.join(", ") : prev.autor),
    }));
    setOpenSuggestions(false);
  };

  const applySuggestionWishlist = (sug: BookSuggestionItem) => {
    setWishlistForm((prev) => ({
      ...prev,
      capa_url: sug.thumbnail || prev.capa_url,
      autor:
        prev.autor || (sug.authors?.length ? sug.authors.join(", ") : prev.autor),
    }));
    setOpenSuggestionsW(false);
  };

  // ------------------ RELATÓRIOS PDF ------------------
  const formatDateTime = () => {
    const d = new Date();
    return d.toLocaleString();
  };

  const generateBibliotecaPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 48;
    const marginY = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relatório - Meus Livros (BiblioMe)", marginX, marginY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em ${formatDateTime()}`, marginX, marginY + 16);
    doc.setTextColor(0);

    const rows = biblioteca.map((b) => [
      b.titulo || "-",
      b.autor || "-",
      b.genero || "-",
      b.ano_publicacao ?? "-",
      b.status_leitura || "-",
      (b.nota ?? "-").toString(),
    ]);

    autoTable(doc, {
      startY: marginY + 36,
      head: [["Título", "Autor", "Gênero", "Ano", "Status", "Nota"]],
      body: rows,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [212, 63, 107] }, // #d43f6b
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: marginX, right: marginX },
      didDrawPage: () => {
        const str = "BiblioMe • Relatório de Biblioteca";
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(str, marginX, doc.internal.pageSize.getHeight() - 20);
      },
    });

    doc.save("relatorio_biblioteca.pdf");
  };

  const generateWishlistPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 48;
    const marginY = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relatório - Wishlist (BiblioMe)", marginX, marginY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em ${formatDateTime()}`, marginX, marginY + 16);
    doc.setTextColor(0);

    const rows = wishlist.map((w) => [w.titulo || "-", w.autor || "-", w.observacao || "-"]);

    autoTable(doc, {
      startY: marginY + 36,
      head: [["Título", "Autor", "Observação"]],
      body: rows,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [212, 63, 107] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: marginX, right: marginX },
      didDrawPage: () => {
        const str = "BiblioMe • Relatório de Wishlist";
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(str, marginX, doc.internal.pageSize.getHeight() - 20);
      },
    });

    doc.save("relatorio_wishlist.pdf");
  };

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO com imagem e overlay */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4 pt-28 pb-16"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        <div className="relative z-10 max-w-3xl w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl p-6">
          <h1 className="logo m-0">
            Biblio<span>Me</span>
          </h1>
          <p className="subtitulo">Minha Biblioteca na Nuvem</p>

          <div className="flex flex-wrap justify-center gap-3">
            <button className={BTN_PRIMARY} onClick={() => setShowForm(true)}>
              Cadastrar Livro
            </button>
            <button className={BTN_SECONDARY} onClick={() => setShowWishlistForm(true)}>
              Adicionar à Wishlist
            </button>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <main className="flex-1 bg-gray-100 px-4 sm:px-6 pb-12">
        {/* ------- Formulário Biblioteca ------- */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="form-mask relative z-10 -mt-12 mb-10 w-full max-w-2xl mx-auto
             rounded-2xl border border-white/20 bg-transparent backdrop-blur-md
             shadow-xl p-6 text-white"
          >
            {/* overlay interno (máscara) */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 10%, rgba(0,0,0,0.35), rgba(0,0,0,0.55))," +
                  "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.65))",
              }}
            />

            <div className="mb-4">
              <h3 className="text-xl font-extrabold text-white">Cadastrar novo livro</h3>
              <p className="text-sm text-white/95">
                Preencha os campos abaixo e salve para adicionar à sua biblioteca.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título + Sugestões */}
              <div className="md:col-span-2 relative" ref={suggestionsRef}>
                <label htmlFor="titulo" className="block text-sm font-semibold text-pink-200 mb-1">
                  Título *
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  value={form.titulo}
                  onChange={(e) => {
                    handleChange(e);
                    setBookQuery(e.target.value);
                    setOpenSuggestions(true);
                  }}
                  onFocus={() => setOpenSuggestions(true)}
                  required
                  placeholder="Ex.: Dom Casmurro"
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                             text-white placeholder-white/70 shadow-sm focus:outline-none
                             focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />

                <BookSuggestions
                  query={bookQuery}
                  open={openSuggestions}
                  onPick={applySuggestion}
                  onClose={() => setOpenSuggestions(false)}
                  anchorRef={suggestionsRef}
                  variant="dark"
                />
              </div>

              {/* Autor */}
              <div>
                <label htmlFor="autor" className="block text-sm font-semibold text-pink-200 mb-1">
                  Autor
                </label>
                <input
                  id="autor"
                  name="autor"
                  value={form.autor}
                  onChange={handleChange}
                  placeholder="Ex.: Machado de Assis"
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                             text-white placeholder-white/70 shadow-sm focus:outline-none
                             focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Gênero */}
              <div>
                <label htmlFor="genero" className="block text-sm font-semibold text-pink-200 mb-1">
                  Gênero
                </label>
                <input
                  id="genero"
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  placeholder="Ex.: Romance"
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                             text-white placeholder-white/70 shadow-sm focus:outline-none
                             focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Ano */}
              <div>
                <label htmlFor="ano_publicacao" className="block text-sm font-semibold text-pink-200 mb-1">
                  Ano de Publicação
                </label>
                <input
                  id="ano_publicacao"
                  name="ano_publicacao"
                  value={form.ano_publicacao}
                  onChange={handleChange}
                  type="number"
                  min="1000"
                  max="2099"
                  placeholder="Ex.: 1899"
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                             text-white placeholder-white/70 shadow-sm focus:outline-none
                             focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status_leitura" className="block text-sm font-semibold text-pink-200 mb-1">
                  Status de leitura
                </label>
                <select
                  id="status_leitura"
                  name="status_leitura"
                  value={form.status_leitura}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                             text-white shadow-sm focus:outline-none focus:ring-2
                             focus:ring-pink-500 focus:border-pink-500"
                >
                  <option className="bg-black" value="não lido">Não lido</option>
                  <option className="bg-black" value="lendo">Lendo</option>
                  <option className="bg-black" value="lido">Lido</option>
                </select>
              </div>

              {/* Nota (range) */}
              <div>
                <label htmlFor="nota" className="block text-sm font-semibold text-pink-200 mb-1">
                  Nota (0 a 5)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="nota"
                    name="nota"
                    value={form.nota}
                    onChange={handleChange}
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    className="flex-1 accent-pink-500"
                  />
                  <span className="w-10 text-sm font-semibold text-white/95 text-center">
                    {form.nota || "0"}
                  </span>
                </div>
              </div>

              {/* URL da capa */}
              <div className="md:col-span-2">
                <label htmlFor="capa_url" className="block text-sm font-semibold text-pink-200 mb-1">
                  URL da Capa
                </label>
                <input
                  id="capa_url"
                  name="capa_url"
                  value={form.capa_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                             text-white placeholder-white/70 shadow-sm focus:outline-none
                             focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {form.capa_url && (
                  <div className="mt-3">
                    <img
                      src={form.capa_url}
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      alt="Prévia da capa"
                      className="h-40 rounded-lg object-cover border border-white/25 shadow"
                    />
                  </div>
                )}
                {form.capa_url && (
                  <div className="mt-2 text-xs text-white/85">
                    Capa selecionada automaticamente. Você pode trocar se quiser.
                  </div>
                )}
              </div>

              {/* Resenha */}
              <div className="md:col-span-2">
                <label htmlFor="resenha" className="block text-sm font-semibold text-pink-200 mb-1">
                  Resenha
                </label>
                <textarea
                  id="resenha"
                  name="resenha"
                  value={form.resenha}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Escreva aqui suas impressões..."
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                             text-white placeholder-white/70 shadow-sm focus:outline-none
                             focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" className="btn-gray" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-pink">
                Salvar
              </button>
            </div>
          </form>
        )}

        {/* ------- Biblioteca (lista + PDF) ------- */}
        <section id="meus-livros" className="w-full max-w-2xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="titulo-section m-0">Meus Livros</h2>
            <button className={BTN_SECONDARY} onClick={generateBibliotecaPDF}>
              Gerar PDF
            </button>
          </div>

          {loadingBiblioteca ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : (
            <ul className="space-y-4">
              {biblioteca.map((item) => (
                <li key={item.id} className="flex items-center bg-white p-3 rounded shadow">
                  {item.capa_url && (
                    <img
                      src={item.capa_url}
                      alt="Capa"
                      className="w-12 h-16 object-cover rounded mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">{item.titulo}</div>
                    {item.autor && <div className="text-sm text-gray-600">{item.autor}</div>}
                    {item.genero && <div className="text-xs text-gray-500">Gênero: {item.genero}</div>}
                    {item.ano_publicacao && <div className="text-xs text-gray-500">Ano: {item.ano_publicacao}</div>}
                    {item.status_leitura && <div className="text-xs text-gray-500">Status: {item.status_leitura}</div>}
                    {item.resenha && <div className="text-xs text-gray-500">Resenha: {item.resenha}</div>}
                    {item.nota !== undefined && <div className="text-xs text-gray-500">Nota: {item.nota}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ------- Wishlist (form + lista + PDF) ------- */}
        <section id="wishlist" className="w-full max-w-xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="titulo-section m-0">Wishlist</h2>
            <button className={BTN_SECONDARY} onClick={generateWishlistPDF}>
              Gerar PDF
            </button>
          </div>

          {showWishlistForm && (
            <form
              onSubmit={handleWishlistSubmit}
              className="form-mask relative z-10 mb-6 w-full
                 rounded-2xl border border-white/20 bg-transparent backdrop-blur-md
                 shadow-xl p-5 text-white overflow-hidden"
            >
              <h3 className="text-lg font-bold mb-3">Adicionar à Wishlist</h3>

              <div className="space-y-4">
                {/* Título com sugestões */}
                <div className="relative" ref={suggestionsRefW}>
                  <label htmlFor="w_titulo" className="block text-sm font-semibold text-pink-200 mb-1">
                    Título *
                  </label>
                  <input
                    id="w_titulo"
                    name="titulo"
                    value={wishlistForm.titulo}
                    onChange={(e) => {
                      handleWishlistChange(e);
                      setBookQueryW(e.target.value);
                      setOpenSuggestionsW(true);
                    }}
                    onFocus={() => setOpenSuggestionsW(true)}
                    required
                    placeholder="Ex.: A Biblioteca da Meia-Noite"
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                       text-white placeholder-white/70 shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />

                  <BookSuggestions
                    query={bookQueryW}
                    open={openSuggestionsW}
                    onPick={applySuggestionWishlist}
                    onClose={() => setOpenSuggestionsW(false)}
                    anchorRef={suggestionsRefW}
                    variant="dark"
                  />
                </div>

                <div>
                  <label htmlFor="w_autor" className="block text-sm font-semibold text-pink-200 mb-1">
                    Autor
                  </label>
                  <input
                    id="w_autor"
                    name="autor"
                    value={wishlistForm.autor}
                    onChange={handleWishlistChange}
                    placeholder="Ex.: Matt Haig"
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                       text-white placeholder-white/70 shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label htmlFor="w_capa" className="block text-sm font-semibold text-pink-200 mb-1">
                    URL da Capa (opcional)
                  </label>
                  <input
                    id="w_capa"
                    name="capa_url"
                    value={wishlistForm.capa_url}
                    onChange={handleWishlistChange}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                       text-white placeholder-white/70 shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label htmlFor="w_obs" className="block text-sm font-semibold text-pink-200 mb-1">
                    Observação
                  </label>
                  <textarea
                    id="w_obs"
                    name="observacao"
                    value={wishlistForm.observacao}
                    onChange={handleWishlistChange}
                    rows={3}
                    placeholder="Por que você quer ler este livro?"
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2
                       text-white placeholder-white/70 shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3 justify-end">
                <button
                  type="button"
                  className="btn-gray"
                  onClick={() => {
                    setShowWishlistForm(false);
                    setBookQueryW("");
                    setOpenSuggestionsW(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-pink">
                  Salvar
                </button>
              </div>
            </form>
          )}

          {loadingWishlist ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : wishlist.length === 0 ? (
            <div className="text-center text-gray-500 bg-white/70 rounded-xl p-4">
              Sua lista está vazia. Adicione um livro para começar!
            </div>
          ) : (
            <ul className="space-y-4">
              {wishlist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow
                     border border-gray-200"
                >
                  {item.capa_url && (
                    <img
                      src={item.capa_url}
                      alt="Capa"
                      className="w-12 h-16 object-cover rounded mr-4 border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{item.titulo}</div>
                    {item.autor && <div className="text-sm text-gray-600">{item.autor}</div>}
                    {item.observacao && <div className="text-xs text-gray-500 mt-1">{item.observacao}</div>}
                  </div>
                  <div className="flex flex-col gap-2 ml-4 text-sm">
                    <button
                      onClick={() => moveToBiblioteca(item.id)}
                      className="text-[#d43f6b] hover:underline font-semibold"
                    >
                      Mover para Biblioteca
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
