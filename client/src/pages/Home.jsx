import { ArrowDown, ArrowRight, ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import ContentCard from '../components/ContentCard.jsx';
import { ErrorState, Loading, SectionHeading } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { imageFor } from '../utils/content.js';

function ContentGrid({ type, items, className = '' }) {
  return <div className={`row g-4 content-grid ${className}`}>{items.map((item) => <div className="col-12 col-sm-6 col-lg-3" key={`${type}-${item.id}`}><ContentCard type={type} item={item} /></div>)}</div>;
}

export function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
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
  const hero = data.hero;
  const heroType = hero?.items ? 'collections' : 'articles';
  const heroHref = hero ? (heroType === 'collections' ? `/collections/${hero.slug}` : `/magazine/${hero.slug}`) : '/discover';

  return <>
    <section className="home-hero container-fluid">
      <div className="home-hero__copy">
        <p className="eyebrow"><span className="eyebrow-dot" /> A cultura acontece por todo o lado</p>
        <h1>O próximo<br />fascínio pode<br /><em>estar ao lado.</em></h1>
        <p className="home-hero__text">Histórias, pessoas e lugares para descobrires com tempo. Um mapa cultural feito à mão, para quem prefere ir um pouco mais longe.</p>
        <div className="home-hero__actions"><Link className="btn btn-lime" to="/discover">Começar a descobrir <ArrowRight size={17} /></Link><Link className="text-link" to="/magazine">Ler a revista <ArrowUpRight size={16} /></Link></div>
        <div className="hero-note"><span>01</span><span>Curadoria independente<br />de cultura portuguesa</span></div>
      </div>
      <div className="home-hero__art" aria-label="Composição gráfica abstrata em tons de azul, vermelho e amarelo">
        <div className="hero-art__grain" /><div className="hero-art__sun" /><div className="hero-art__arc" /><div className="hero-art__frame"><img src="/images/hero-collage.svg" alt="Colagem editorial abstrata com formas geométricas" /></div>
        <span className="hero-art__vertical">MARGEM DE DESCOBERTA · 2026</span>
        {hero && <Link className="hero-feature" to={heroHref}><span className="hero-feature__image"><img src={imageFor(hero)} alt="" /></span><span><small>EM DESTAQUE · {hero.isDemo ? 'DEMONSTRAÇÃO' : 'ESCOLHA EDITORIAL'}</small><strong>{hero.title}</strong></span><ArrowUpRight size={18} /></Link>}
      </div>
      <div className="home-hero__scroll"><ArrowDown size={15} /> Desce e encontra</div>
    </section>

    <section className="explore-section section-pad container">
      <div className="section-heading"><div><p className="eyebrow">O mapa começa aqui</p><h2>Entra por onde<br className="desktop-break" /> te apetecer.</h2></div><p className="section-heading__aside">A cultura não tem uma porta certa. Segue a curiosidade.</p></div>
      <div className="category-grid">
        {(data.categories || []).map((category, index) => <Link to={`/discover/works?category=${encodeURIComponent(category.slug)}`} key={category.id} className={`category-tile category-tile--${index % 5}`} style={{ '--tile-color': category.color }}><span className="category-tile__index">0{index + 1}</span><span className="category-tile__name">{category.name}</span><span className="category-tile__description">{category.description}</span><ArrowUpRight className="category-tile__arrow" size={19} /></Link>)}
      </div>
    </section>

    <section className="feature-band"><div className="container feature-band__inner"><div><p className="eyebrow">Não é um feed. É uma escolha.</p><h2>Há coisas que<br />merecem <em>tempo.</em></h2></div><p>Descobrimos, lemos, ouvimos e saímos à rua. Depois contamos-te o que encontrámos — com contexto, cuidado e as fontes à vista.</p><Link to="/about" className="btn btn-outline-light">Conhece a À Margem <ArrowUpRight size={17} /></Link></div><span className="feature-band__symbol" aria-hidden="true">∿</span></section>

    <section className="section-pad container">
      <SectionHeading eyebrow="Para começar" title="Trabalho que fica contigo" href="/discover/works" />
      <ContentGrid type="works" items={data.works || []} />
      {!data.works?.length && <p className="quiet-note">Ainda não publicámos obras em destaque.</p>}
    </section>

    <section className="section-pad section-wash"><div className="container"><SectionHeading eyebrow="À volta de nós" title="Pessoas a fazer coisas" href="/discover/artists" /><ContentGrid type="artists" items={data.artists || []} /></div></section>

    <section className="section-pad container magazine-preview"><div className="magazine-preview__intro"><p className="eyebrow">A revista À Margem</p><h2>Olhar melhor<br />é um bom começo.</h2><p>Ensaios, conversas e pequenas descobertas para ler fora da pressa.</p><Link className="btn btn-outline-dark" to="/magazine">Entrar na revista <ArrowRight size={16} /></Link></div><div className="magazine-preview__grid">{(data.articles || []).slice(0, 2).map((item) => <ContentCard type="articles" item={item} key={item.id} variant="content-card--editorial" />)}</div></section>

    <section className="section-pad section-lime"><div className="container"><SectionHeading eyebrow="Guarda para mais tarde" title="Uma boa lista puxa outra" href="/collections" /><ContentGrid type="collections" items={data.collections || []} className="content-grid--collections" /></div></section>

    <section className="section-pad container"><div className="section-heading"><div><p className="eyebrow">Marca na agenda</p><h2>Há vida fora de casa.</h2></div><Link className="text-link" to="/discover/events">Ver agenda <ArrowUpRight size={16} /></Link></div><ContentGrid type="events" items={data.events || []} /></section>

    <section className="home-last-call"><div className="container home-last-call__inner"><div className="home-last-call__icon"><Compass size={30} /></div><div><p className="eyebrow">Tens uma boa pista?</p><h2>A descoberta também<br />começa contigo.</h2><p>Conheces um artista, um lugar ou um evento que merece atenção? Conta-nos.</p></div><Link className="btn btn-dark" to="/submit">Sugerir uma descoberta <ArrowRight size={17} /></Link><Sparkles className="home-last-call__spark" size={40} /></div></section>
  </>;
}
