import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, getContentHref, getContentTitle, imageFor, resourceLabels } from '../utils/content.js';

export default function ContentCard({ type, item, variant = '' }) {
  const title = getContentTitle(type, item);
  const category = item.category?.name || item.type || item.disciplines?.[0] || item.kind || resourceLabels[type];
  const meta = type === 'events'
    ? [item.city, formatDate(item.startsAt)].filter(Boolean).join(' · ')
    : type === 'artists' ? [item.location, item.disciplines?.slice(0, 2).join(' · ')].filter(Boolean).join(' · ')
      : type === 'venues' ? [item.city, item.type].filter(Boolean).join(' · ')
        : type === 'works' ? [item.creator, item.releasedAt ? formatDate(item.releasedAt, { month: 'short', year: 'numeric' }) : ''].filter(Boolean).join(' · ')
          : type === 'articles' ? [item.authorName, formatDate(item.publishedAt)].filter(Boolean).join(' · ')
        : `${item.itemsCount ?? item.items?.length ?? 0} recomendações`;

  return (
    <article className={`content-card ${variant}`}>
      <Link className="content-card__image-wrap" to={getContentHref(type, item)} aria-label={`Abrir ${title}`}>
        <img className="content-card__image" src={imageFor(item)} alt={item.imageAlt || ''} loading="lazy" />
        <span className="content-card__category">{category}</span>
        {item.isDemo && <span className="demo-badge">Demonstração</span>}
      </Link>
      <div className="content-card__body">
        <p className="content-card__meta">{meta || 'À Margem seleciona'}</p>
        <h3><Link to={getContentHref(type, item)}>{title}</Link></h3>
        <p>{item.excerpt || item.subtitle || item.description || item.bio || ''}</p>
        <Link className="text-link" to={getContentHref(type, item)} aria-label={`Ler mais sobre ${title}`}>
          Descobrir <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
