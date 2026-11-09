import { Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import ContentCard from '../components/ContentCard.jsx';
import { EmptyState, ErrorState, Loading, PageIntro } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { resourceLabels } from '../utils/content.js';

const types = ['events', 'works', 'artists', 'venues', 'articles', 'collections'];
const quickIdeas = ['IOLANDA', 'MAAT', 'fado', 'Coliseu', 'exposição', 'Lisboa'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = types.includes(params.get('type')) ? params.get('type') : '';
  const [draft, setDraft] = useState(q);
  const [data, setData] = useState(null); const [error, setError] = useState('');
  const typing = useRef(false);
  usePageMeta(q ? `Pesquisa: ${q}` : 'Pesquisa cultural', 'Pesquisa eventos, obras, artistas, espaços, artigos e coleções na À Margem.');

  // Quando o URL muda (ex.: vindo do cabeçalho), o campo acompanha.
  useEffect(() => { if (!typing.current) setDraft(q); }, [q]);

  // Pesquisa enquanto se escreve: atualiza o URL 350 ms depois da última tecla.
  useEffect(() => {
    if (draft.trim() === q) return undefined;
    typing.current = true;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params);
      draft.trim() ? next.set('q', draft.trim()) : next.delete('q');
      setParams(next, { replace: true });
      typing.current = false;
    }, 350);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    if (q.trim().length < 2) { setData({ groups: [], counts: {}, total: 0 }); return undefined; }
    const controller = new AbortController(); setData(null); setError('');
    api.get('/search', { params: { q, ...(type ? { type } : {}) }, signal: controller.signal })
      .then(({ data: result }) => setData(result))
      .catch((err) => { if (err.code !== 'ERR_CANCELED') setError(err.response?.data?.message || 'Não foi possível fazer a pesquisa.'); });
    return () => controller.abort();
  }, [q, type]);

  const submit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    draft.trim() ? next.set('q', draft.trim()) : next.delete('q');
    setParams(next);
  };
  const setType = (value) => { const next = new URLSearchParams(params); value ? next.set('type', value) : next.delete('type'); setParams(next); };
  const clear = () => { setDraft(''); setParams({}); };
  const counts = data?.counts || {};
  const total = types.reduce((sum, key) => sum + (counts[key] || 0), 0);

  return <div className="container inner-page search-page"><PageIntro eyebrow="Uma busca que abre caminhos" title={<>O que tens<br />em <em>mente?</em></>} text="Procura por nome, lugar, cidade ou palavra-chave. Os acentos não importam: “danca” encontra “dança”." />
    <form className="global-search" onSubmit={submit} role="search">
      <label className="visually-hidden" htmlFor="global-q">Pesquisar em toda a À Margem</label><SearchIcon size={20} />
      <input id="global-q" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Um artista, um espaço, uma cidade…" autoFocus autoComplete="off" />
      {draft && <button type="button" className="global-search__clear" onClick={clear} aria-label="Limpar pesquisa"><X size={18} /></button>}
      <button className="btn btn-dark" type="submit">Pesquisar</button>
    </form>

    {q.trim().length >= 2 && <div className="search-chips" role="tablist" aria-label="Filtrar por tipo de conteúdo">
      <button type="button" role="tab" aria-selected={!type} className={`search-chip ${!type ? 'is-active' : ''}`} onClick={() => setType('')}>Tudo <span>{data ? total : '…'}</span></button>
      {types.map((key) => <button type="button" role="tab" key={key} aria-selected={type === key} disabled={data && !counts[key] && type !== key}
        className={`search-chip ${type === key ? 'is-active' : ''}`} onClick={() => setType(key)}>{resourceLabels[key]} <span>{data ? counts[key] || 0 : '…'}</span></button>)}
    </div>}

    {q.trim().length < 2 ? <div className="search-suggestions">
      <p className="eyebrow">Experimenta</p>
      <div className="search-ideas">{quickIdeas.map((idea) => <button type="button" key={idea} className="search-chip" onClick={() => setDraft(idea)}>{idea}</button>)}</div>
      <p className="eyebrow mt-4">Portas de entrada</p>
      <div>{['Eventos', 'Obras', 'Artistas', 'Espaços', 'Revista', 'Coleções'].map((label, index) => <Link to={['/discover/events', '/discover/works', '/discover/artists', '/discover/venues', '/magazine', '/collections'].at(index)} key={label}>{label} ↗</Link>)}</div>
    </div>
      : error ? <ErrorState message={error} />
      : !data ? <Loading label="A procurar…" />
      : data.total === 0 ? <EmptyState title="Não encontrámos resultados" text={`Não há conteúdo publicado para “${q}”. Experimenta outra palavra, um nome de cidade ou de espaço.`} />
      : <div className="search-results">
        <p className="search-results__count">{type ? counts[type] || 0 : total} {(type ? counts[type] : total) === 1 ? 'resultado' : 'resultados'} para <strong>“{q}”</strong>{type && <> em {resourceLabels[type].toLowerCase()}</>}</p>
        {data.groups.filter((group) => group.results.length).map((group) => <section key={group.type} className="search-group">
          <div className="section-heading"><div><p className="eyebrow">{resourceLabels[group.type]}</p><h2>{group.count} {group.count === 1 ? 'descoberta' : 'descobertas'}</h2></div>
            {!type && group.count > group.results.length && <button type="button" className="text-link" onClick={() => setType(group.type)}>Ver todos ↗</button>}</div>
          <div className="row g-4">{group.results.map((item) => <div className="col-12 col-sm-6 col-lg-3" key={`${group.type}-${item.id}`}><ContentCard type={group.type} item={item} /></div>)}</div>
        </section>)}
      </div>}
  </div>;
}
