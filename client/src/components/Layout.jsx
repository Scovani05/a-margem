import { useState } from 'react';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [unsubscribeUrl, setUnsubscribeUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setMessage(''); setError('');
    try {
      const { data } = await api.post('/newsletter', { email, consent });
      setMessage(data.message);
      setUnsubscribeUrl(data.developmentUnsubscribeUrl || '');
      setEmail('');
      setConsent(false);
    } catch (err) { setError(err.response?.data?.message || 'Não foi possível guardar a inscrição.'); }
    finally { setBusy(false); }
  };

  return <form className="newsletter-form" onSubmit={submit}>
    <label className="visually-hidden" htmlFor="newsletter-email">O teu email</label>
    <div className="newsletter-form__row"><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="O teu email" required maxLength={254} /><button className="btn btn-dark" type="submit" disabled={busy} aria-label="Subscrever a newsletter"><ArrowRight size={17} /></button></div>
    <label className="form-check newsletter-consent"><input className="form-check-input" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>Concordo em receber notícias da À Margem. Posso cancelar a inscrição a qualquer momento.</span></label>
    {(message || error) && <p className={`form-note ${error ? 'form-note--error' : ''}`} role={error ? 'alert' : 'status'}>{error || message}{unsubscribeUrl && <> <a href={unsubscribeUrl}>Cancelar inscrição</a></>}</p>}
  </form>;
}

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navClass = ({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`;

  const search = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`);
    setMenuOpen(false);
  };
  const follow = () => setMenuOpen(false);

  return <div className="site-shell">
    <div className="topline"><span>Uma revista e um mapa cultural para quem gosta de sair do caminho.</span><span>Portugal · Porto · Braga</span></div>
    <header className="site-header navbar navbar-expand-lg">
      <div className="container-fluid site-header__inner">
        <Link to="/" className="brand" aria-label="À Margem, página inicial" onClick={follow}><span className="brand__mark">à</span><span className="brand__name">margem<span className="brand__period">.</span></span><span className="brand__descriptor">cultura que<br />merece atenção</span></Link>
        <button className="site-menu-toggle navbar-toggler" type="button" aria-label={menuOpen ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <div className={`site-header__nav ${menuOpen ? 'is-open' : ''}`}>
          <nav className="site-nav navbar-nav" aria-label="Navegação principal">
            <NavLink to="/discover" className={navClass} onClick={follow}>Descobrir</NavLink>
            <NavLink to="/magazine" className={navClass} onClick={follow}>Revista</NavLink>
            <NavLink to="/collections" className={navClass} onClick={follow}>Coleções</NavLink>
            <NavLink to="/about" className={navClass} onClick={follow}>Sobre</NavLink>
          </nav>
          <form className="header-search" role="search" onSubmit={search}><label className="visually-hidden" htmlFor="header-search">Pesquisar cultura</label><input id="header-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar" /><button type="submit" aria-label="Pesquisar"><Search size={17} /></button></form>
          <div className="account-links">
            {user ? <><Link to="/saved" className="account-links__saved" onClick={follow}>Guardados</Link><Link to="/profile" className="account-links__profile" onClick={follow}>{user.name.split(' ')[0]}</Link>{user.role === 'admin' && <Link className="account-links__admin" to="/admin" onClick={follow}>Admin</Link>}<button className="btn btn-sm btn-quiet" type="button" onClick={() => { logout(); follow(); navigate('/'); }}>Sair</button></> : <><Link to="/login" className="account-links__login" onClick={follow}>Entrar</Link><Link to="/register" className="btn btn-sm btn-dark" onClick={follow}>Criar conta</Link></>}
          </div>
        </div>
      </div>
      {menuOpen && <button className="mobile-nav-scrim" aria-label="Fechar navegação" onClick={follow} />}
    </header>

    <main id="main-content" key={location.pathname}>{children}</main>

    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="footer-brand"><Link to="/" className="brand brand--footer"><span className="brand__mark">à</span><span className="brand__name">margem<span className="brand__period">.</span></span></Link><p>Menos ruído.<br />Mais descoberta.</p></div>
        <div className="footer-column"><p className="eyebrow">Explorar</p><Link to="/discover/events">Eventos</Link><Link to="/discover/works">Obras</Link><Link to="/discover/artists">Artistas</Link><Link to="/discover/venues">Espaços</Link></div>
        <div className="footer-column"><p className="eyebrow">À Margem</p><Link to="/magazine">Revista</Link><Link to="/collections">Coleções</Link><Link to="/about">Sobre</Link><Link to="/contact">Contacto</Link><Link to="/submit">Sugerir cultura</Link></div>
        <div className="footer-newsletter"><p className="eyebrow">Carta de descoberta</p><h2>Boas coisas não<br />precisam de algoritmo.</h2><p>Uma seleção cultural, de vez em quando, na tua caixa de entrada.</p><NewsletterSignup /></div>
      </div>
      <div className="container site-footer__bottom"><span>© {new Date().getFullYear()} À Margem. Um projeto editorial independente.</span><div><Link to="/privacy">Privacidade</Link><Link to="/terms">Termos</Link><span>Feito com curiosidade em Portugal.</span></div></div>
    </footer>
  </div>;
}
