import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { ErrorState, Loading, PageIntro } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

const doors = [
  { href: '/discover/events', number: '01', title: 'Eventos', text: 'O que está para acontecer, perto de ti.', tone: 'door--orange' },
  { href: '/discover/works', number: '02', title: 'Obras', text: 'Filmes, discos, livros e ideias.', tone: 'door--blue' },
  { href: '/discover/artists', number: '03', title: 'Artistas', text: 'Quem está a fazer cultura agora.', tone: 'door--green' },
  { href: '/discover/venues', number: '04', title: 'Espaços', text: 'Lugares onde as coisas acontecem.', tone: 'door--purple' }
];

export default function DiscoverPage() {
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState('');
  usePageMeta('Descobrir cultura', 'Pesquisa eventos, obras, artistas e espaços culturais em Portugal.');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar as categorias.'));
  }, []);

  return <div className="container inner-page discover-page">
    <PageIntro eyebrow="Segue a curiosidade" title={<>Um bom lugar<br />para <em>começar.</em></>} text="Podes vir à procura de uma coisa. Podes sair a pensar noutra. É essa a ideia." />
    <div className="door-grid">{doors.map((door) => <Link to={door.href} className={`discovery-door ${door.tone}`} key={door.href}><span className="discovery-door__number">{door.number} / explorar</span><span className="discovery-door__title">{door.title}</span><span className="discovery-door__text">{door.text}</span><ArrowUpRight className="discovery-door__arrow" /></Link>)}</div>
    <div className="discover-categories"><div className="section-heading"><div><p className="eyebrow">Por categoria</p><h2>Pequenos grandes mundos</h2></div></div>
      {error ? <ErrorState message={error} /> : !categories ? <Loading /> : <div className="category-list">{categories.map((category, index) => <Link key={category.id} to={`/discover/works?category=${encodeURIComponent(category.slug)}`} className="category-list__item"><span>{String(index + 1).padStart(2, '0')}</span><strong>{category.name}</strong><small>{category.description}</small><ArrowUpRight size={17} /></Link>)}</div>}
    </div>
  </div>;
}
