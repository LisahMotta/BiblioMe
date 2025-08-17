import React, { useEffect, useState } from "react";

export type BookSuggestionItem = {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  source: "google" | "openlibrary";
};

type Props = {
  /** Texto de busca (ex.: título digitado) */
  query: string;
  /** Abre/fecha o dropdown */
  open: boolean;
  /** Chamado ao escolher uma sugestão */
  onPick: (s: BookSuggestionItem) => void;
  /** Chamado para fechar dropdown (ex.: no botão Fechar ou clique fora) */
  onClose: () => void;
  /** Ref do contêiner que envolve input + dropdown, usado para clique-fora */
  anchorRef: React.RefObject<HTMLDivElement>;
  /** Visual (default: "dark") */
  variant?: "dark" | "light";
  /** Máx. resultados (default: 8) */
  limit?: number;
  /** Debounce em ms (default: 400) */
  debounceMs?: number;
};

const BookSuggestions: React.FC<Props> = ({
  query,
  open,
  onPick,
  onClose,
  anchorRef,
  variant = "dark",
  limit = 8,
  debounceMs = 400,
}) => {
  const [suggestions, setSuggestions] = useState<BookSuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca compartilhada: Google Books + fallback Open Library
  const getBookSuggestions = async (q: string): Promise<BookSuggestionItem[]> => {
    // 1) Google Books
    const g = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
        q
      )}&maxResults=${limit}&printType=books&projection=lite`
    ).then((r) => r.json());

    let items: BookSuggestionItem[] = (g.items || []).map((it: any) => ({
      id: it.id,
      title: it.volumeInfo?.title || "Sem título",
      authors: it.volumeInfo?.authors || [],
      thumbnail:
        it.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") ||
        it.volumeInfo?.imageLinks?.smallThumbnail?.replace("http://", "https://") ||
        null,
      source: "google",
    }));

    // 2) Fallback Open Library
    if (!items.length) {
      const o = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=${limit}`
      ).then((r) => r.json());

      items = (o.docs || []).map((d: any) => {
        const coverId = d.cover_i;
        return {
          id: d.key || String(Math.random()),
          title: d.title || "Sem título",
          authors: d.author_name || [],
          thumbnail: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : null,
          source: "openlibrary" as const,
        };
      });
    }

    return items;
  };

  // Debounce da busca
  useEffect(() => {
    if (!open) return; // só busca se estiver aberto
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await getBookSuggestions(q);
        setSuggestions(items);
      } catch (e) {
        console.error(e);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  // Clique fora -> fecha
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [anchorRef, onClose]);

  if (!open) return null;

  const isDark = variant === "dark";
  const wrapCls =
    "absolute left-0 right-0 mt-2 z-20 rounded-xl overflow-hidden border shadow-2xl";
  const darkCls =
    "border-white/20 bg-black/70 backdrop-blur-md divide-y divide-white/10";
  const lightCls =
    "border-gray-200 bg-white/95 backdrop-blur-sm divide-y divide-gray-100";

  return (
    <div className={`${wrapCls} ${isDark ? darkCls : lightCls}`}>
      {loading && (
        <div className={`px-4 py-3 text-sm ${isDark ? "text-white/85" : "text-gray-700"}`}>
          Buscando capas…
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className={`px-4 py-3 text-sm ${isDark ? "text-white/80" : "text-gray-600"}`}>
          Nenhuma capa encontrada.
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <ul className="max-h-72 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className={`flex items-center gap-3 p-3 cursor-pointer ${
                isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
              onClick={() => onPick(s)}
            >
              {s.thumbnail ? (
                <img
                  src={s.thumbnail}
                  alt=""
                  className={`w-10 h-14 object-cover rounded border ${
                    isDark ? "border-white/20" : "border-gray-200"
                  }`}
                />
              ) : (
                <div
                  className={`w-10 h-14 rounded border flex items-center justify-center text-xs ${
                    isDark
                      ? "bg-white/10 border-white/20 text-white/60"
                      : "bg-gray-100 border-gray-200 text-gray-500"
                  }`}
                >
                  Sem capa
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-semibold truncate ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {s.title}
                </div>
                <div
                  className={`text-xs truncate ${
                    isDark ? "text-white/80" : "text-gray-600"
                  }`}
                >
                  {s.authors?.length ? s.authors.join(", ") : "Autor desconhecido"}
                </div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-wide ${
                  isDark ? "text-white/60" : "text-gray-500"
                }`}
              >
                {s.source === "google" ? "Google" : "OpenLib"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className={`${isDark ? "bg-black/40" : "bg-gray-50"} p-2 text-right`}>
        <button
          type="button"
          className={`text-xs font-bold px-2 py-1 rounded border ${
            isDark
              ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
              : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
          }`}
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default BookSuggestions;
