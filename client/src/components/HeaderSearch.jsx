import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, LoaderCircle, Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { formatDate, getContentHref, resourceLabels } from '../utils/content.js';

// Barra de pesquisa do cabeçalho: sugestões enquanto se escreve (com atraso de 250 ms),
// navegação com as setas, Enter para abrir, Esc para fechar e "/" para focar a pesquisa.
export default function HeaderSearch({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const listId = useId();

  useEffect(() => { setOpen(false); setActive(-1); }, [location.pathname]);

  // Atalho "/" para focar a pesquisa (exceto quando já se está a escrever num campo).
  useEffect(() => {
    const onKey = (event) => {
      const tag = document.activeElement?.tagName;
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !document.activeElement?.isContentEditable) {
        event.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Fechar ao clicar fora.
  useEffect(() => {
    const onClick = (event) => { if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Sugestões com debounce; o pedido anterior é cancelado quando se continua a escrever.
  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) { setResults([]); setLoading(false); return undefined; }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api.get('/search/suggest', { params: { q: value }, signal: controller.signal })
        .then(({ data }) => { setResults(data.results); setActive(-1); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  const goToAll = () => {
    const value = query.trim();
    if (!value) return;
    navigate(`/search?q=${encodeURIComponent(value)}`);
    setOpen(false); inputRef.current?.blur(); onNavigate?.();
  };
  const goTo = (item) => { navigate(getContentHref(item.type, item)); setOpen(false); setQuery(''); onNavigate?.(); };

  const onKeyDown = (event) => {
    const total = results.length + 1; // +1 = "ver todos os resultados"
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive((current) => (current + 1) % total); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((current) => (current <= 0 ? total - 1 : current - 1)); }
    else if (event.key === 'Escape') { setOpen(false); setActive(-1); }
    else if (event.key === 'Enter') {
      event.preventDefault();
      if (open && active >= 0 && active < results.length) goTo(results.at(active)); else goToAll();
    }
  };

  const showPanel = open && query.trim().length >= 2;
  return <div className="header-search-box" ref={boxRef}>
    <form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); goToAll(); }}>
      <label className="visually-hidden" htmlFor="header-search">Pesquisar cultura</label>
      <Search size={16} className="header-search__icon" aria-hidden="true" />
      <input id="header-search" ref={inputRef} value={query} autoComplete="off" placeholder="Pesquisar  /"
        role="combobox" aria-expanded={showPanel} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown} />
      {loading ? <LoaderCircle size={15} className="spin header-search__state" aria-hidden="true" />
        : query && <button type="button" className="header-search__clear" aria-label="Limpar pesquisa" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}><X size={15} /></button>}
    </form>
    {showPanel && <div className="search-suggest" id={listId} role="listbox" aria-label="Sugestões de pesquisa">
      {!loading && results.length === 0 && <p className="search-suggest__empty">Sem sugestões para “{query.trim()}”.</p>}
      {results.map((item, index) => <button type="button" role="option" id={`${listId}-${index}`} aria-selected={active === index} key={`${item.type}-${item.id}`}
        className={`search-suggest__item ${active === index ? 'is-active' : ''}`} onMouseEnter={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => goTo(item)}>
        <span className="search-suggest__type">{resourceLabels[item.type]}</span>
        <span className="search-suggest__title">{item.title}</span>
        {(item.startsAt || item.city) && <span className="search-suggest__meta">{item.startsAt && <><CalendarDays size={12} /> {formatDate(item.startsAt)}</>}{item.startsAt && item.city ? ' · ' : ''}{item.city}</span>}
      </button>)}
      <button type="button" role="option" id={`${listId}-${results.length}`} aria-selected={active === results.length}
        className={`search-suggest__all ${active === results.length ? 'is-active' : ''}`} onMouseEnter={() => setActive(results.length)} onMouseDown={(event) => event.preventDefault()} onClick={goToAll}>
        Ver todos os resultados para “{query.trim()}” <ArrowRight size={14} />
      </button>
    </div>}
  </div>;
}
