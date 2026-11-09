import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Compass, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import ContentCard from '../components/ContentCard.jsx';
import { ErrorState, Loading, SectionHeading } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { formatDate, imageFor } from '../utils/content.js';

function ContentGrid({ type, items, className = '' }) {
  return <div className={`row g-4 content-grid ${className}`}>{items.map((item) => <div className="col-12 col-sm-6 col-lg-3" key={`${type}-${item.id}`}><ContentCard type={type} item={item} /></div>)}</div>;
}

export function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  usePageMeta('Cultura para descobrir');

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    api.get('/home', { signal: controller.signal }).then(({ data: result }) => setData(result))
      .catch((err) => { if (err.code !== 'ERR_CANCELED') setError(err.response?.data?.message || 'Confirma que a API e a base de dados estão ativas.'); });
    return () => controller.abort();
  }, [refresh]);

  if (!data && !error) return <div className="container page-loading"><Loading /></div>;
  if (error) return <div className="container page-loading"><ErrorState message={error} onRetry={() => setRefresh((value) => value + 1)} /></div>;
  // Destaque da página inicial: o primeiro evento em destaque (com fotografia) e os próximos 3 da agenda.
  const spotlight = data.events?.[0] || null;
  const nextUp = data.nextUp || [];
  const counts = data.counts || null;
  const monthLabel = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(new Date());

  return <>
    <section className="home-hero container-fluid">
      <div className="home-hero__copy">
        <p className="eyebrow"><span className="eyebrow-dot" /> Cultura portuguesa · {monthLabel}</p>
        <h1>O que se passa<br />na cultura<br /><em>portuguesa.</em></h1>
        <p className="home-hero__text">Discos novos, exposições e concertos de artistas portugueses, com data, lugar e a ligação para a fonte oficial.</p>
        <form className="hero-search" role="search" onSubmit={(event) => { event.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); }}>
          <label className="visually-hidden" htmlFor="hero-q">Pesquisar artistas, discos, exposições ou concertos</label>
          <Search size={18} aria-hidden="true" />
          <input id="hero-q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Um artista, um disco, um museu…" autoComplete="off" />
          <button className="btn btn-lime" type="submit">Pesquisar</button>
        </form>
        <div className="hero-quick" aria-label="Pesquisas sugeridas">{['Fado', 'MAAT', 'Coliseu', 'Exposição', 'Porto'].map((word) => <Link key={word} to={`/search?q=${encodeURIComponent(word)}`}>{word}</Link>)}</div>
        {counts && <dl className="hero-stats">
          <div><dt>{counts.events}</dt><dd>eventos e exposições</dd></div>
          <div><dt>{counts.works}</dt><dd>discos e obras</dd></div>
          <div><dt>{counts.artists}</dt><dd>artistas</dd></div>
          <div><dt>{counts.venues}</dt><dd>espaços</dd></div>
        </dl>}
      </div>
      <div className="home-hero__art">
        <div className="hero-art__sun" aria-hidden="true" />
        {spotlight && <Link className="hero-photo" to={`/events/${spotlight.slug}`}>
          <img src={imageFor(spotlight)} alt={`Fotografia de ${spotlight.venueName || spotlight.city}`} />
          <span className="hero-photo__caption"><small>{spotlight.category?.name || 'Em destaque'} · {spotlight.venueName || spotlight.city}</small><strong>{spotlight.title}</strong><span>{spotlight.endsAt && new Date(spotlight.startsAt) < new Date() ? `Até ${formatDate(spotlight.endsAt, { month: 'long', year: undefined })}` : formatDate(spotlight.startsAt)}</span></span>
        </Link>}
        {nextUp.length > 0 && <div className="hero-next">
          <p className="hero-next__title"><CalendarDays size={14} /> A seguir</p>
          <ol>{nextUp.map((event) => <li key={event.id}><Link to={`/events/${event.slug}`}>
            <time dateTime={event.startsAt}><b>{new Date(event.startsAt).getDate()}</b>{new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(new Date(event.startsAt)).replace('.', '')}</time>
            <span><strong>{event.title}</strong><small>{event.venueName || event.city}</small></span>
          </Link></li>)}</ol>
          <Link className="text-link" to="/discover/events">Ver a agenda <ArrowRight size={14} /></Link>
        </div>}
      </div>
      <div className="home-hero__scroll"><ArrowDown size={15} /> Desce e encontra</div>
    </section>

    <section className="explore-section section-pad container">
      <div className="section-heading"><div><p className="eyebrow">O mapa começa aqui</p><h2>Entra por onde<br className="desktop-break" /> te apetecer.</h2></div><p className="section-heading__aside">A cultura não tem uma porta certa. Segue a curiosidade.</p></div>
      <div className="category-grid">
        {(data.categories || []).map((category, index) => <Link to={`/discover/works?category=${encodeURIComponent(category.slug)}`} key={category.id} className={`category-tile category-tile--${index % 5}`} style={{ '--tile-color': category.color }}><span className="category-tile__index">0{index + 1}</span><span className="category-tile__name">{category.name}</span><span className="category-tile__description">{category.description}</span><ArrowUpRight className="category-tile__arrow" size={19} /></Link>)}
      </div>
    </section>

    <section className="feature-band"><div className="container feature-band__inner"><div><p className="eyebrow">Não é um feed. É uma escolha.</p><h2>Há coisas que<br />merecem <em>tempo.</em></h2></div><p>Descobrimos, lemos, ouvimos e saímos à rua. Depois contamos-te o que encontrámos - com contexto, cuidado e as fontes à vista.</p><Link to="/about" className="btn btn-outline-light">Conhece a À Margem <ArrowUpRight size={17} /></Link></div><span className="feature-band__symbol" aria-hidden="true">∿</span></section>

    <section className="section-pad container">
      <SectionHeading eyebrow="Para começar" title="Trabalho que fica contigo" href="/discover/works" />
      <ContentGrid type="works" items={data.works || []} />
      {!data.works?.length && <p className="quiet-note">Ainda não publicámos obras em destaque.</p>}
    </section>

    <section className="section-pad section-wash"><div className="container"><SectionHeading eyebrow="À volta de nós" title="Pessoas a fazer coisas" href="/discover/artists" /><ContentGrid type="artists" items={data.artists || []} /></div></section>

    <section className="section-pad container magazine-preview"><div className="magazine-preview__intro"><p className="eyebrow">A revista À Margem</p><h2>Últimas<br />notícias.</h2><p>O que se passa na cultura portuguesa, da notícia mais recente para a mais antiga.</p><Link className="btn btn-outline-dark" to="/magazine">Ver todas as notícias <ArrowRight size={16} /></Link></div><div className="magazine-preview__grid">{(data.articles || []).slice(0, 2).map((item) => <ContentCard type="articles" item={item} key={item.id} variant="content-card--editorial" />)}</div></section>

    <section className="section-pad section-lime"><div className="container"><SectionHeading eyebrow="Guarda para mais tarde" title="Uma boa lista puxa outra" href="/collections" /><ContentGrid type="collections" items={data.collections || []} className="content-grid--collections" /></div></section>

    <section className="section-pad container"><div className="section-heading"><div><p className="eyebrow">Marca na agenda</p><h2>Há vida fora de casa.</h2></div><Link className="text-link" to="/discover/events">Ver agenda <ArrowUpRight size={16} /></Link></div><ContentGrid type="events" items={data.events || []} /></section>

    <section className="home-last-call"><div className="container home-last-call__inner"><div className="home-last-call__icon"><Compass size={30} /></div><div><p className="eyebrow">Tens uma boa pista?</p><h2>A descoberta também<br />começa contigo.</h2><p>Conheces um artista, um lugar ou um evento que merece atenção? Conta-nos.</p></div><Link className="btn btn-dark" to="/submit">Sugerir uma descoberta <ArrowRight size={17} /></Link><Sparkles className="home-last-call__spark" size={40} /></div></section>
  </>;
}
