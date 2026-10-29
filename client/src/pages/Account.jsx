import { useEffect, useState } from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import ContentCard from '../components/ContentCard.jsx';
import { EmptyState, ErrorState, Loading, PageIntro } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || ''); const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  usePageMeta('O meu perfil');

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const { data } = await api.patch('/auth/profile', { name, bio }); updateUser(data.user); setMessage('Perfil atualizado.'); }
    catch (err) { setError(err.response?.data?.message || 'Não foi possível guardar as alterações.'); }
    finally { setBusy(false); }
  };

  const deleteAccount = async () => {
    if (!password) { setError('Escreve a tua palavra-passe para confirmares a eliminação.'); return; }
    setBusy(true); setError('');
    try { await api.delete('/auth/account', { data: { password } }); logout(); navigate('/', { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'Não foi possível eliminar a conta.'); }
    finally { setBusy(false); }
  };

  return <div className="container inner-page account-page"><PageIntro eyebrow="O teu canto" title="O meu perfil" text="Gere os teus dados e volta às descobertas que guardaste." />
    <div className="account-layout"><aside className="account-menu"><div className="account-avatar">{user?.name?.slice(0, 1).toUpperCase()}</div><strong>{user?.name}</strong><small>{user?.email}</small><Link to="/saved">Ver guardados <ArrowRight size={15} /></Link></aside><div className="account-content"><form onSubmit={save} className="account-form"><h2>Os teus dados</h2>{error && <div className="form-alert form-alert--error" role="alert">{error}</div>}{message && <div className="form-alert form-alert--success" role="status">{message}</div>}<div className="mb-3"><label className="form-label" htmlFor="profile-name">Nome</label><input className="form-control" id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></div><div className="mb-3"><label className="form-label" htmlFor="profile-email">Email</label><input className="form-control" id="profile-email" value={user?.email || ''} disabled /><div className="form-text">Para alterar o email, contacta a equipa editorial.</div></div><div className="mb-3"><label className="form-label" htmlFor="profile-bio">Sobre ti (opcional)</label><textarea className="form-control" id="profile-bio" rows="4" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={1000} /></div><button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'A guardar…' : 'Guardar alterações'} <ArrowRight size={16} /></button></form><div className="account-danger"><div><p className="eyebrow">Zona de atenção</p><h2>Apagar a conta</h2><p>Esta ação remove o perfil e os conteúdos guardados. As sugestões enviadas podem ser mantidas sem associação à tua conta.</p></div><label className="form-label" htmlFor="delete-password">Confirma com a tua palavra-passe</label><input className="form-control" id="delete-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="btn btn-outline-danger mt-3" type="button" disabled={busy} onClick={deleteAccount}><Trash2 size={16} /> Eliminar conta</button></div></div></div>
  </div>;
}

export function SavedPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState('');
  usePageMeta('O que guardei');
  const load = () => { setItems(null); setError(''); api.get('/saved').then(({ data }) => setItems(data)).catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os teus guardados.')); };
  useEffect(load, []);
  return <div className="container inner-page"><PageIntro eyebrow="Voltar quando quiseres" title="O que guardei" text="Um lugar para tudo o que não queres perder de vista." />
    {error ? <ErrorState message={error} onRetry={load} /> : !items ? <Loading /> : items.length ? <div className="row g-4">{items.map(({ type, content }) => <div className="col-12 col-sm-6 col-lg-4" key={`${type}-${content.id}`}><ContentCard type={type} item={content} /></div>)}</div> : <EmptyState title="Ainda não guardaste nada" text="Quando encontrares algo que te interessa, usa o botão Guardar para voltar aqui mais tarde." />}
  </div>;
}
