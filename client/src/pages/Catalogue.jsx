import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import ContentCard from '../components/ContentCard.jsx';
import { EmptyState, ErrorState, Loading, PageIntro } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

const configs = {
  events: { title: 'Eventos', text: 'Concertos, sessões, exposições e encontros para sair de casa.', eyebrow: 'Agenda cultural' },
  works: { title: 'Obras', text: 'Filmes, álbuns, livros e projetos para encontrar pela primeira vez — ou voltar a ver de outra maneira.', eyebrow: 'Catálogo cultural' },
  artists: { title: 'Artistas', text: 'Criadores e projetos independentes que vale a pena conhecer.', eyebrow: 'Pessoas e práticas' },
  venues: { title: 'Espaços', text: 'Salas, galerias, livrarias e outros lugares onde a cultura ganha corpo.', eyebrow: 'Mapa cultural' },
  articles: { title: 'Revista', text: 'Ensaios, conversas e recomendações para ler com tempo.', eyebrow: 'Ideias para levar contigo' },
  collections: { title: 'Coleções', text: 'Percursos editoriais para entrar num tema por várias portas.', eyebrow: 'Curadoria À Margem' }
};

function setQueryParam(params, key, value) {
  const next = new URLSearchParams(params);
  if (value) next.set(key, value); else next.delete(key);
  if (key !== 'page') next.delete('page');
  return next;
}

export default function CataloguePage({ resource }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [queryDraft, setQueryDraft] = useState(searchParams.get('q') || '');
  const config = configs[resource];
  const queryString = useMemo(() => searchParams.toString(), [searchParams]);
  usePageMeta(config.title, config.text);

  useEffect(() => { setQueryDraft(searchParams.get('q') || ''); }, [searchParams]);
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError('');
    api.get(`/${resource}`, { params: Object.fromEntries(new URLSearchParams(queryString)), signal: controller.signal })
      .then(({ data: result }) => setData(result))
      .catch((err) => { if (err.code !== 'ERR_CANCELED') setError(err.response?.data?.message || 'Não foi possível carregar o catálogo.'); });
    return () => controller.abort();
  }, [resource, queryString]);

  useEffect(() => {
    if (['events', 'works', 'articles'].includes(resource)) api.get('/categories').then(({ data: result }) => setCategories(result)).catch(() => setCategories([]));
  }, [resource]);

  const update = (key, value) => setSearchParams(setQueryParam(searchParams, key, value));
  const submitSearch = (event) => { event.preventDefault(); update('q', queryDraft.trim()); };
  const clearFilters = () => { setQueryDraft(''); setSearchParams({}); };

  return <div className="container inner-page catalogue-page">
    <PageIntro eyebrow={config.eyebrow} title={config.title} text={config.text} />
    <section className="catalogue-toolbar" aria-label="Pesquisa e filtros">
      <form className="catalogue-search" onSubmit={submitSearch}><label className="visually-hidden" htmlFor="catalogue-q">Pesquisar {config.title.toLowerCase()}</label><input id="catalogue-q" value={queryDraft} onChange={(event) => setQueryDraft(event.target.value)} placeholder="O que te apetece encontrar?" /><button className="btn btn-dark" type="submit">Pesquisar</button></form>
      <div className="filter-row"><span className="filter-row__label"><SlidersHorizontal size={15} /> Afinar</span>
        {['events', 'works', 'articles'].includes(resource) && <><label className="visually-hidden" htmlFor="filter-category">Categoria</label><select id="filter-category" className="form-select" value={searchParams.get('category') || ''} onChange={(event) => update('category', event.target.value)}><option value="">Todas as categorias</option>{categories.map((category) => <option value={category.slug} key={category.id}>{category.name}</option>)}</select></>}
        {['events', 'artists', 'venues'].includes(resource) && <><label className="visually-hidden" htmlFor="filter-city">Localização</label><input id="filter-city" className="form-control filter-city" value={searchParams.get('city') || ''} onChange={(event) => update('city', event.target.value)} placeholder="Cidade ou região" /></>}
        {resource === 'events' && <><label className="visually-hidden" htmlFor="filter-from">A partir de</label><input id="filter-from" className="form-control filter-date" type="date" value={searchParams.get('from') || ''} onChange={(event) => update('from', event.target.value)} /><label className="visually-hidden" htmlFor="filter-to">Até</label><input id="filter-to" className="form-control filter-date" type="date" value={searchParams.get('to') || ''} onChange={(event) => update('to', event.target.value)} /></>}
        {resource === 'works' && <><label className="visually-hidden" htmlFor="filter-type">Tipo de obra</label><select id="filter-type" className="form-select" value={searchParams.get('type') || ''} onChange={(event) => update('type', event.target.value)}><option value="">Todos os formatos</option><option value="album">Álbum</option><option value="film">Filme</option><option value="book">Livro</option><option value="photography">Fotografia</option><option value="exhibition">Exposição</option><option value="creative-project">Projeto criativo</option></select></>}
        <label className="visually-hidden" htmlFor="filter-sort">Ordenar</label><select id="filter-sort" className="form-select filter-sort" value={searchParams.get('sort') || ''} onChange={(event) => update('sort', event.target.value)}><option value="">{resource === 'events' ? 'Em breve' : 'Em destaque'}</option><option value="newest">Mais recentes</option><option value="title">Título A–Z</option></select>
        {queryString && <button className="btn btn-link clear-filters" type="button" onClick={clearFilters}><X size={14} /> Limpar</button>}
      </div>
    </section>
    {error ? <ErrorState message={error} /> : !data ? <Loading /> : <>
      <div className="catalogue-result-meta"><span>{data.total} {data.total === 1 ? 'resultado' : 'resultados'}</span>{searchParams.get('q') && <span>para “{searchParams.get('q')}”</span>}</div>
      {data.rows.length ? <div className="row g-4 content-grid">{data.rows.map((item) => <div className="col-12 col-sm-6 col-lg-4" key={item.id}><ContentCard type={resource} item={item} /></div>)}</div> : <EmptyState title="Não encontrámos nada por aqui" text="Experimenta outra pesquisa ou limpa os filtros para veres tudo o que temos." />}
      {data.pages > 1 && <nav className="catalogue-pagination" aria-label="Paginação"><button className="btn btn-outline-dark" disabled={data.page <= 1} onClick={() => update('page', String(data.page - 1))}>Anterior</button><span>Página {data.page} de {data.pages}</span><button className="btn btn-outline-dark" disabled={data.page >= data.pages} onClick={() => update('page', String(data.page + 1))}>Seguinte</button></nav>}
    </>}
  </div>;
}
