import { Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import ContentCard from '../components/ContentCard.jsx';
import { EmptyState, ErrorState, Loading, PageIntro } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { resourceLabels } from '../utils/content.js';

const types = ['', 'events', 'works', 'artists', 'venues', 'articles', 'collections'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [data, setData] = useState(null); const [error, setError] = useState('');
  const queryString = useMemo(() => params.toString(), [params]);
  const q = params.get('q') || '';
  usePageMeta(q ? `Pesquisa: ${q}` : 'Pesquisa cultural', 'Pesquisa eventos, obras, artistas, espaços, artigos e coleções na À Margem.');
  useEffect(() => setDraft(q), [q]);
  useEffect(() => {
    if (!q.trim()) { setData({ groups: [], total: 0 }); return; }
    const controller = new AbortController(); setData(null); setError('');
    api.get('/search', { params: Object.fromEntries(new URLSearchParams(queryString)), signal: controller.signal })
      .then(({ data: result }) => setData(result))
      .catch((err) => { if (err.code !== 'ERR_CANCELED') setError(err.response?.data?.message || 'Não foi possível fazer a pesquisa.'); });
    return () => controller.abort();
  }, [q, queryString]);
  const submit = (event) => { event.preventDefault(); const next = new URLSearchParams(params); draft.trim() ? next.set('q', draft.trim()) : next.delete('q'); next.delete('page'); setParams(next); };
  const setType = (type) => { const next = new URLSearchParams(params); type ? next.set('type', type) : next.delete('type'); setParams(next); };
  const clear = () => { setDraft(''); setParams({}); };
  return <div className="container inner-page search-page"><PageIntro eyebrow="Uma busca que abre caminhos" title={<>O que tens<br />em <em>mente?</em></>} text="Procura por nome, categoria, lugar ou palavra-chave. A pesquisa atravessa a revista e o mapa cultural." />
    <form className="global-search" onSubmit={submit}><label className="visually-hidden" htmlFor="global-q">Pesquisar em toda a À Margem</label><SearchIcon size={20} /><input id="global-q" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Um artista, uma ideia, um lugar…" autoFocus /><button className="btn btn-dark" type="submit">Pesquisar</button></form>
    <div className="search-filter-row"><label className="form-label" htmlFor="search-type">Mostrar</label><select className="form-select" id="search-type" value={params.get('type') || ''} onChange={(event) => setType(event.target.value)}>{types.map((type) => <option key={type || 'all'} value={type}>{type ? resourceLabels[type] : 'Todos os conteúdos'}</option>)}</select>{q && <button className="btn btn-link" type="button" onClick={clear}><X size={15} /> Limpar pesquisa</button>}</div>
    {!q ? <div className="search-suggestions"><p className="eyebrow">Portas de entrada</p><div>{['Eventos', 'Obras', 'Artistas', 'Espaços', 'Revista', 'Coleções'].map((label, index) => <Link to={['/discover/events', '/discover/works', '/discover/artists', '/discover/venues', '/magazine', '/collections'][index]} key={label}>{label} ↗</Link>)}</div></div> : error ? <ErrorState message={error} /> : !data ? <Loading /> : data.total === 0 ? <EmptyState title="Não encontrámos resultados" text={`Ainda não há conteúdo publicado para “${q}”. Experimenta outras palavras.`} /> : <div className="search-results"><p className="search-results__count">{data.total} {data.total === 1 ? 'resultado' : 'resultados'} para <strong>“{q}”</strong></p>{data.groups.filter((group) => group.results.length).map((group) => <section key={group.type} className="search-group"><div className="section-heading"><div><p className="eyebrow">{resourceLabels[group.type]}</p><h2>{group.results.length} {group.results.length === 1 ? 'descoberta' : 'descobertas'}</h2></div></div><div className="row g-4">{group.results.map((item) => <div className="col-12 col-sm-6 col-lg-3" key={`${group.type}-${item.id}`}><ContentCard type={group.type} item={item} /></div>)}</div></section>)}</div>}
  </div>;
}
