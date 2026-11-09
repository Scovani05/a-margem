import { useEffect, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { EmptyState, ErrorState, Loading, PageIntro } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { formatDate, imageFor } from '../utils/content.js';

const PAGE_SIZE = 20;

// Revista: todas as notícias, da mais recente para a mais antiga (a API ordena por publishedAt).
export default function MagazinePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [draft, setDraft] = useState(q);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  usePageMeta('Revista: últimas notícias', 'As notícias mais recentes da cultura portuguesa: cinema, música, literatura, artes visuais e muito mais.');

  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data)).catch(() => setCategories([])); }, []);

  // Sempre que muda a categoria ou a pesquisa, volta à primeira página.
  useEffect(() => {
    const controller = new AbortController();
    setItems(null); setError(''); setPage(1); setDraft(q);
    api.get('/articles', { params: { limit: PAGE_SIZE, page: 1, ...(category ? { category } : {}), ...(q ? { q } : {}) }, signal: controller.signal })
      .then(({ data }) => { setItems(data.rows); setTotal(data.total); setPages(data.pages); })
      .catch((err) => { if (err.code !== 'ERR_CANCELED') setError(err.response?.data?.message || 'Não foi possível carregar as notícias.'); });
    return () => controller.abort();
  }, [category, q]);

  // "Carregar mais": pede a página seguinte e junta-a à lista.
  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data } = await api.get('/articles', { params: { limit: PAGE_SIZE, page: page + 1, ...(category ? { category } : {}), ...(q ? { q } : {}) } });
      setItems((current) => [...current, ...data.rows]);
      setPage(page + 1);
    } catch (err) { setError(err.response?.data?.message || 'Não foi possível carregar mais notícias.'); }
    finally { setLoadingMore(false); }
  };

  const choose = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug); else next.delete('category');
    setSearchParams(next);
  };
  const submit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (draft.trim()) next.set('q', draft.trim()); else next.delete('q');
    setSearchParams(next);
  };

  const [lead, ...rest] = items || [];
  const filtered = Boolean(category || q);

  return <div className="container inner-page magazine-page">
    <PageIntro eyebrow="Revista À Margem" title={<>Últimas <em>notícias.</em></>} text="Tudo o que se passa na cultura portuguesa, da notícia mais recente para a mais antiga." />

    <section className="news-toolbar" aria-label="Filtrar notícias">
      <div className="news-chips" role="group" aria-label="Categorias">
        <button type="button" className={`news-chip ${!category ? 'is-active' : ''}`} onClick={() => choose('')}>Todas</button>
        {categories.map((entry) => <button type="button" key={entry.id} className={`news-chip ${category === entry.slug ? 'is-active' : ''}`} style={{ '--chip-color': entry.color }} onClick={() => choose(entry.slug)}>{entry.name}</button>)}
      </div>
      <form className="news-search" role="search" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="news-q">Pesquisar notícias</label>
        <Search size={16} aria-hidden="true" />
        <input id="news-q" className="form-control" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Pesquisar notícias" />
      </form>
    </section>

    {error ? <ErrorState message={error} /> : !items ? <Loading label="A carregar notícias…" /> : !items.length ? <EmptyState title="Sem notícias por aqui" text="Experimenta outra categoria ou outra pesquisa." /> : <>
      <p className="news-count">{total} {total === 1 ? 'notícia' : 'notícias'}{filtered ? ' encontradas' : ''}</p>

      {/* A notícia mais recente aparece em destaque. */}
      <article className="news-lead">
        <Link to={`/magazine/${lead.slug}`} className="news-lead__image"><img src={imageFor(lead)} alt="" /></Link>
        <div className="news-lead__copy">
          <p className="news-meta"><span className="news-tag" style={{ '--chip-color': lead.category?.color }}>{lead.category?.name || 'Revista'}</span><time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt, { month: 'long' })}</time></p>
          <h2><Link to={`/magazine/${lead.slug}`}>{lead.title}</Link></h2>
          <p className="news-lead__excerpt">{lead.excerpt}</p>
          <Link className="text-link" to={`/magazine/${lead.slug}`}>Ler a notícia <ArrowUpRight size={15} /></Link>
        </div>
      </article>

      {/* As restantes, em lista cronológica. */}
      {rest.length > 0 && <ol className="news-list">
        {rest.map((item) => <li key={item.id} className="news-item">
          <time className="news-item__date" dateTime={item.publishedAt}><b>{new Date(item.publishedAt).getDate()}</b>{`${new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(new Date(item.publishedAt)).replace('.', '')} ${new Date(item.publishedAt).getFullYear()}`}</time>
          <div className="news-item__copy">
            <span className="news-tag" style={{ '--chip-color': item.category?.color }}>{item.category?.name || 'Revista'}</span>
            <h3><Link to={`/magazine/${item.slug}`}>{item.title}</Link></h3>
            <p>{item.excerpt}</p>
          </div>
          <Link to={`/magazine/${item.slug}`} className="news-item__thumb" tabIndex={-1} aria-hidden="true"><img src={imageFor(item)} alt="" loading="lazy" /></Link>
        </li>)}
      </ol>}

      {page < pages && <div className="news-more"><button type="button" className="btn btn-outline-dark" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'A carregar…' : 'Carregar mais notícias'}</button></div>}
    </>}
  </div>;
}
