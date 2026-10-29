import { AlertCircle, LoaderCircle, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Loading({ label = 'A carregar conteúdo…' }) {
  return <div className="state-message" role="status"><LoaderCircle className="spin" size={22} aria-hidden="true" />{label}</div>;
}

export function ErrorState({ message = 'Não foi possível carregar os dados.', onRetry }) {
  return <div className="state-box" role="alert"><AlertCircle size={22} aria-hidden="true" /><div><strong>Algo não correu como esperado.</strong><p>{message}</p>{onRetry && <button className="btn btn-outline-dark btn-sm" onClick={onRetry}>Tentar novamente</button>}</div></div>;
}

export function EmptyState({ title = 'Ainda não há resultados', text = 'Experimenta alterar a pesquisa ou os filtros.' }) {
  return <div className="empty-state"><SearchX size={24} aria-hidden="true" /><h2>{title}</h2><p>{text}</p></div>;
}

export function PageIntro({ eyebrow, title, text, action }) {
  return <div className="page-intro"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{text && <p className="page-intro__text">{text}</p>}</div>{action}</div>;
}

export function SectionHeading({ eyebrow, title, href, linkText = 'Ver tudo' }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{href && <Link className="text-link" to={href}>{linkText} <span aria-hidden="true">↗</span></Link>}</div>;
}
