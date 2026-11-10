import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Share2, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import ContentCard from '../components/ContentCard.jsx';
import SaveButton from '../components/SaveButton.jsx';
import { ErrorState, Loading } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { formatDate, getContentTitle, imageFor } from '../utils/content.js';

// Títulos das secções de conteúdos ligados (as ligações valem nos dois sentidos).
const relatedTitles = { articles: 'Na revista', artists: 'Artistas', events: 'Eventos', works: 'Obras', venues: 'Espaços', collections: 'Em coleções' };
const relatedTitle = (type, relatedType) => (type === 'articles' && relatedType === 'artists' ? 'Artistas nesta notícia' : relatedTitles[relatedType] || 'Também relacionado');
const labels = { events: 'Evento', works: 'Obra', artists: 'Artista', venues: 'Espaço', articles: 'Revista', collections: 'Coleção' };
const urls = { events: '/events', works: '/works', artists: '/artists', venues: '/venues', articles: '/articles', collections: '/collections' };

function InfoRow({ icon, children }) {
  const Icon = icon;
  return <div className="detail-info-row"><Icon size={17} aria-hidden="true" /><span>{children}</span></div>;
}

function RelatedSection({ title, items, type }) {
  if (!items?.length) return null;
  return <section className="detail-related section-pad"><div className="container"><div className="section-heading"><div><p className="eyebrow">Continua a descoberta</p><h2>{title}</h2></div></div><div className="row g-4">{items.map((item) => <div className="col-12 col-sm-6 col-lg-3" key={`${type}-${item.id}`}><ContentCard type={type} item={item} /></div>)}</div></div></section>;
}

export default function DetailPage({ type }) {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const title = item ? getContentTitle(type, item) : labels[type];
  const description = item?.subtitle || item?.excerpt || item?.description || 'Descobre mais na À Margem.';
  usePageMeta(title, description, { image: item ? imageFor(item) : null, type: type === 'articles' ? 'article' : 'website' });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api.get(`${urls[type]}/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(({ data }) => setItem(data))
      .catch((err) => { if (err.code !== 'ERR_CANCELED') setError(err.response?.status === 404 ? 'Esta página já não está disponível.' : 'Não foi possível carregar o conteúdo.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [type, slug]);

  useEffect(() => {
    if (!item || item.isDemo) return undefined;
    const pageUrl = new URL(window.location.href).toString();
    const schemaTypes = { events: 'Event', works: 'CreativeWork', artists: 'Person', venues: 'Place', articles: 'Article', collections: 'CollectionPage' };
    const json = {
      '@context': 'https://schema.org',
      '@type': schemaTypes[type],
      name: item.title || item.name,
      description: item.excerpt || item.description || item.bio,
      url: pageUrl,
      image: new URL(imageFor(item), window.location.origin).toString()
    };
    if (type === 'events') {
      json.startDate = item.startsAt;
      if (item.endsAt) json.endDate = item.endsAt;
      if (item.venue?.name || item.venueName) json.location = { '@type': 'Place', name: item.venue?.name || item.venueName, address: item.city };
      if (item.status === 'cancelled') json.eventStatus = 'https://schema.org/EventCancelled';
    }
    if (type === 'articles') {
      json.headline = item.title;
      json.datePublished = item.publishedAt;
      json.author = { '@type': 'Organization', name: item.authorName || 'Redação À Margem' };
      json.publisher = { '@type': 'Organization', name: 'À Margem' };
    }
    if (type === 'artists') json.jobTitle = (item.disciplines || []).join(', ');
    if (type === 'venues') json.address = { '@type': 'PostalAddress', addressLocality: item.city };
    let script = document.querySelector('script[data-margem-schema="true"]');
    if (!script) { script = document.createElement('script'); script.type = 'application/ld+json'; script.dataset.margemSchema = 'true'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(json);
    return () => script.remove();
  }, [item, type]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: item.title || item.name, url });
      else { await navigator.clipboard.writeText(url); setShareMessage('Ligação copiada.'); }
    } catch { setShareMessage('Não foi possível partilhar agora.'); }
  };

  if (loading) return <div className="container page-loading"><Loading /></div>;
  if (error || !item) return <div className="container page-loading"><ErrorState message={error || 'Não encontrámos esta página.'} /></div>;

  const location = item.city || item.location;
  const dateText = item.startsAt ? `${formatDate(item.startsAt, { weekday: 'long' })}${item.endsAt ? ` - ${formatDate(item.endsAt, { weekday: 'long' })}` : ''}` : '';
  const eventIsPast = type === 'events' && item.startsAt && new Date(item.startsAt) < new Date();
  // O resumo (description/bio/excerpt) aparece em destaque no topo; o texto completo fica no corpo.
  const body = item.body || item.introduction || '';
  const isLongform = type === 'articles' || type === 'collections';
  const infoTitle = type === 'events' ? item.category?.name : type === 'works' ? item.category?.name : type === 'artists' ? (item.disciplines || []).join(' · ') : type === 'venues' ? item.type : item.category?.name;
  // Obras e eventos de um artista: os encontrados pelo nome (criador/organização) mais os ligados no backoffice.
  const kindOfEntry = (entry) => entry.contentType || entry.type;
  const mergeById = (base, kind) => {
    const list = [...(base || [])];
    for (const entry of item.relatedContent || []) if (kindOfEntry(entry) === kind && !list.some((existing) => existing.id === entry.id)) list.push(entry);
    return list;
  };
  // Artistas ligados a este conteúdo (evento, obra ou artigo): aparecem no topo, com ligação direta à ficha.
  const linkedArtists = type === 'artists' ? [] : mergeById(item.artists, 'artists');
  const artistWorks = type === 'artists' ? mergeById(item.works, 'works') : [];
  const artistEvents = type === 'artists' ? mergeById(item.events, 'events') : [];
  const alreadyLinked = new Set([
    ...artistWorks.map((entry) => `works:${entry.id}`),
    ...artistEvents.map((entry) => `events:${entry.id}`),
    ...(type === 'works' ? (item.artists || []).map((entry) => `artists:${entry.id}`) : []),
    ...(type === 'venues' ? (item.events || []).map((entry) => `events:${entry.id}`) : []),
    ...(type === 'events' && item.venue ? [`venues:${item.venue.id}`] : [])
  ]);
  // contentType diz o tipo de conteúdo (uma obra tem também um campo "type" próprio, ex.: album).
  const kindOf = (entry) => entry.contentType || entry.type;
  const relatedGroups = (item.relatedContent || []).filter((entry) => !alreadyLinked.has(`${kindOf(entry)}:${entry.id}`)).reduce((groups, entry) => {
    (groups[kindOf(entry)] ||= []).push(entry);
    return groups;
  }, {});

  return <>
    <article className={`detail-page detail-page--${type}`}>
      <div className="container detail-page__top"><Link className="back-link" to={type === 'articles' ? '/magazine' : type === 'collections' ? '/collections' : `/discover/${type}`}><ArrowLeft size={15} /> Voltar a {type === 'articles' ? 'Revista' : type === 'collections' ? 'Coleções' : labels[type].toLowerCase()}</Link><span className="eyebrow">{labels[type]}{infoTitle && ` · ${infoTitle}`}</span></div>
      <div className={`container detail-hero ${isLongform ? 'detail-hero--longform' : ''}`}>
        <div className="detail-hero__copy"><div className="detail-badges">{item.isDemo && <span className="demo-badge">Conteúdo de demonstração</span>}{item.status === 'cancelled' && <span className="status-badge status-badge--cancelled">Cancelado</span>}{eventIsPast && item.status !== 'cancelled' && <span className="status-badge">Evento passado</span>}</div>
          <h1>{item.title || item.name}</h1>{item.subtitle && <p className="detail-subtitle">{item.subtitle}</p>}
          {linkedArtists.length > 0 && <p className="detail-artists"><span>{linkedArtists.length > 1 ? 'Artistas' : 'Artista'}</span>{linkedArtists.map((artist) => <Link key={artist.id} to={`/artists/${artist.slug}`}>{artist.name} <ArrowUpRight size={15} /></Link>)}</p>}
          <div className="detail-meta">{item.authorName && <span>Por {item.authorName}</span>}{item.creator && !linkedArtists.some((artist) => artist.name === item.creator) && <span>Por {item.creator}</span>}{item.publishedAt && <span>{formatDate(item.publishedAt)}</span>}{item.releasedAt && <span>{formatDate(item.releasedAt, { month: 'long', year: 'numeric' })}</span>}{item.category && <span>{item.category.name}</span>}</div>
          <p className="detail-lede">{item.excerpt || item.description || item.bio}</p>
          <div className="detail-actions"><SaveButton type={type} item={item} /><button type="button" className="btn btn-outline-dark" onClick={share}><Share2 size={16} /> Partilhar</button>{shareMessage && <span className="form-note" role="status">{shareMessage}</span>}</div>
        </div>
        <div className="detail-hero__visual"><img src={imageFor(item)} alt={item.imageAlt || ''} /><span className="detail-hero__image-caption">{item.isDemo ? 'Imagem gráfica de demonstração' : item.imageAlt || (String(imageFor(item)).startsWith('/images/') ? 'Ilustração gráfica da À Margem' : 'Imagem de destaque')}</span></div>
      </div>

      <div className={`container detail-body ${isLongform ? 'detail-body--longform' : ''}`}>
        <div className="detail-body__main">
          {type === 'events' && <div className="detail-facts"><InfoRow icon={CalendarDays}>{dateText}{item.startsAt && ` · ${new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.startsAt))}`}</InfoRow>{location && <InfoRow icon={MapPin}>{item.venue?.name || item.venueName ? `${item.venue?.name || item.venueName} · ` : ''}{location}</InfoRow>}{item.organizer && <InfoRow icon={Share2}>Organização: {item.organizer}</InfoRow>}</div>}
          {type === 'venues' && <div className="detail-facts">{location && <InfoRow icon={MapPin}>{item.address ? `${item.address}, ` : ''}{location}</InfoRow>}{item.publicEmail && <InfoRow icon={Share2}><a href={`mailto:${item.publicEmail}`}>{item.publicEmail}</a></InfoRow>}</div>}
          {type === 'artists' && location && <div className="detail-facts"><InfoRow icon={MapPin}>{location}</InfoRow></div>}
          <div className="rich-copy">{body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          {type === 'events' && (item.ticketInfo || item.ticketUrl) && <section className="ticket-box" aria-labelledby="ticket-title">
            <h2 id="ticket-title"><Ticket size={18} /> Bilhetes</h2>
            {item.ticketInfo && item.ticketInfo.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {item.ticketUrl && <a className="btn btn-lime" href={item.ticketUrl} target="_blank" rel="noreferrer">Comprar bilhetes <ArrowUpRight size={16} /></a>}
          </section>}
          {type === 'events' && item.officialUrl && <a className="btn btn-dark external-action" href={item.officialUrl} target="_blank" rel="noreferrer">Mais informações oficiais <ArrowUpRight size={16} /></a>}
          {type === 'works' && item.officialUrl && <a className="btn btn-dark external-action" href={item.officialUrl} target="_blank" rel="noreferrer">Visitar página oficial <ArrowUpRight size={16} /></a>}
          {type === 'venues' && item.website && <a className="btn btn-dark external-action" href={item.website} target="_blank" rel="noreferrer">Visitar o espaço <ArrowUpRight size={16} /></a>}
          {type === 'artists' && item.links && Object.entries(item.links).map(([label, url]) => <a key={label} className="detail-social-link" href={url} target="_blank" rel="noreferrer">{label} <ArrowUpRight size={14} /></a>)}
          {type === 'articles' && <div className="article-share"><span>Passa a palavra</span><button className="text-link" onClick={share}><Share2 size={15} /> Partilhar este artigo</button></div>}
          {type === 'collections' && item.items?.length > 0 && <div className="collection-detail-items"><h2>Dentro desta coleção</h2><div className="row g-4">{item.items.map((entry) => <div className="col-12 col-sm-6" key={`${kindOf(entry)}-${entry.id}`}><ContentCard type={kindOf(entry)} item={entry} /></div>)}</div></div>}
        </div>
        <aside className="detail-body__aside"><span className="eyebrow">Na margem</span><p>Uma seleção independente para descobrires ao teu ritmo.</p><Link to="/discover" className="text-link">Ver mais descobertas <ArrowUpRight size={15} /></Link>{item.isDemo && <div className="demo-explainer"><strong>Exemplo editorial</strong><p>Esta ficha é conteúdo fictício de demonstração. Confirma fontes, datas e direitos antes de publicar dados reais.</p></div>}</aside>
      </div>
    </article>
    {type === 'artists' && <><RelatedSection type="works" items={artistWorks} title="Obras e projetos" /><RelatedSection type="events" items={artistEvents} title="Também podes encontrá-los aqui" />{!artistWorks.length && !artistEvents.length && <p className="container quiet-note">Ainda não existem obras ou eventos associados a este perfil.</p>}</>}
    {type === 'works' && <RelatedSection type="artists" items={item.artists} title="Quem está por trás" />}
    {type === 'venues' && <RelatedSection type="events" items={item.events} title="O que acontece por aqui" />}
    {type === 'events' && item.venue?.slug && <section className="detail-venue-link container"><p className="eyebrow">O lugar</p><Link to={`/venues/${item.venue.slug}`}>{item.venue.name} <ArrowUpRight size={16} /></Link><p>{item.venue.city}</p></section>}
    {Object.entries(relatedGroups).map(([relatedType, relatedItems]) => <RelatedSection key={relatedType} type={relatedType} items={relatedItems} title={relatedTitle(type, relatedType)} />)}
  </>;
}
