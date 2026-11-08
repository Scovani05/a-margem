import { useEffect, useState } from 'react';
import { ArrowUpRight, Lock, Plus, Search, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { Loading } from '../../components/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate } from '../../utils/content.js';

export const roleLabels = { cliente: 'Cliente', admin: 'Administrador' };
const errorText = (err, fallback) => err.response?.data?.message || fallback;
const when = (date) => (date ? formatDate(date, { hour: '2-digit', minute: '2-digit' }) : '—');

export const actionLabels = {
  'auth.login': 'Início de sessão', 'auth.login_failed': 'Tentativa de login falhada', 'auth.register': 'Nova conta',
  'auth.password_changed': 'Palavra-passe alterada', 'auth.password_reset': 'Palavra-passe reposta', 'auth.logout_all': 'Sessões terminadas',
  'auth.account_deleted': 'Conta eliminada', 'content.create': 'Conteúdo criado', 'content.update': 'Conteúdo editado', 'content.delete': 'Conteúdo apagado',
  'submission.status': 'Sugestão moderada', 'submission.publish': 'Sugestão publicada', 'user.create': 'Utilizador criado', 'user.role': 'Perfil alterado',
  'user.delete': 'Utilizador apagado', 'user.unlock': 'Conta desbloqueada', 'database.update': 'BD: registo editado', 'database.delete': 'BD: registo apagado',
  'database.export': 'BD: exportação CSV', 'database.query': 'BD: consulta SQL', 'newsletter.delete': 'Inscrição removida', 'contact.status': 'Mensagem atualizada'
};

function ActivityList({ rows }) {
  if (!rows.length) return <p className="admin-empty">Ainda não há atividade registada.</p>;
  return <ul className="activity-list">{rows.map((row) => <li key={row.id} className={row.action.endsWith('failed') ? 'is-warning' : row.action.startsWith('database') ? 'is-db' : ''}>
    <div><strong>{actionLabels[row.action] || row.action}</strong><span>{row.userEmail || 'Anónimo'}{row.entity ? ` · ${row.entity}${row.entityId ? ` #${row.entityId}` : ''}` : ''}</span></div>
    <small>{when(row.createdAt)}{row.ip ? ` · ${row.ip}` : ''}</small>
  </li>)}</ul>;
}

export function Dashboard({ labels }) {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/dashboard').then(({ data: result }) => setData(result)).catch((err) => setError(errorText(err, 'Não foi possível carregar o painel.'))); }, []);
  if (error) return <div className="admin-content"><p className="admin-error" role="alert">{error}</p></div>;
  if (!data) return <div className="admin-content"><Loading /></div>;
  const people = [
    ['Clientes', data.people.clients, '/admin/users'], ['Administradores', data.people.admins, '/admin/users'],
    ['Novas contas (7 dias)', data.people.newUsers, '/admin/users'], ['Mensagens por ler', data.people.newMessages, '/admin/contact'],
    ['Itens guardados', data.people.saved, '/admin/database'], ['Artigos em rascunho', data.people.drafts, '/admin/articles']
  ];
  return <div className="admin-content">
    <div className="admin-welcome"><div><p className="eyebrow">Bom trabalho começa com atenção</p><h2>O que está a acontecer?</h2><p>Conteúdos, comunidade, base de dados e segurança num só lugar.</p></div><div className="d-flex gap-2 flex-wrap"><Link className="btn btn-outline-dark" to="/admin/database">Base de dados</Link><Link className="btn btn-dark" to="/admin/articles"><Plus size={16} /> Novo artigo</Link></div></div>
    <h3 className="admin-subheading">Catálogo</h3>
    <div className="admin-stats">{Object.entries(data.counts).map(([key, value]) => <article className={key === 'pendingSubmissions' && value > 0 ? 'admin-stat admin-stat--lime' : 'admin-stat'} key={key}><span>{labels[key] || (key === 'pendingSubmissions' ? 'Sugestões por rever' : key === 'subscribers' ? 'Inscritos ativos' : key)}</span><strong>{value}</strong></article>)}</div>
    <h3 className="admin-subheading">Comunidade</h3>
    <div className="admin-stats admin-stats--six">{people.map(([label, value, href]) => <Link to={href} className={`admin-stat ${label.includes('ler') && value > 0 ? 'admin-stat--lime' : ''}`} key={label}><span>{label}</span><strong>{value}</strong></Link>)}</div>
    <div className="admin-columns">
      <section className="admin-panel"><div className="admin-panel__head"><h2>Atividade recente</h2><Link className="text-link" to="/admin/activity">Ver tudo <ArrowUpRight size={14} /></Link></div><ActivityList rows={data.recentActivity} /></section>
      <section className="admin-panel"><div className="admin-panel__head"><h2>Novas contas</h2><Link className="text-link" to="/admin/users">Gerir <ArrowUpRight size={14} /></Link></div>
        {data.recentUsers.length ? <ul className="activity-list">{data.recentUsers.map((user) => <li key={user.id}><div><strong>{user.name}</strong><span>{user.email}</span></div><span className={`role-badge role-badge--${user.role}`}>{roleLabels[user.role] || user.role}</span></li>)}</ul> : <p className="admin-empty">Sem contas.</p>}
        <div className="admin-panel__head mt-4"><h2>Últimas sugestões</h2><Link className="text-link" to="/admin/submissions">Moderar <ArrowUpRight size={14} /></Link></div>
        {data.recentSubmissions.length ? <ul className="activity-list">{data.recentSubmissions.map((item) => <li key={item.id}><div><strong>{item.title}</strong><span>{item.type} · {formatDate(item.createdAt)}</span></div><span className="admin-status">{item.status}</span></li>)}</ul> : <p className="admin-empty">Sem sugestões.</p>}
      </section>
    </div>
  </div>;
}

export function UsersPanel() {
  const { user: me } = useAuth();
  const [items, setItems] = useState(null); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ q: '', role: '' }); const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false); const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cliente' }); const [busy, setBusy] = useState(false);

  const load = () => api.get('/admin/users', { params: filters }).then(({ data }) => setItems(data)).catch((err) => setError(errorText(err, 'Não foi possível carregar os utilizadores.')));
  useEffect(() => { load(); }, [filters]);

  const patch = async (item, body, done) => {
    setError(''); setMessage('');
    try { await api.patch(`/admin/users/${item.id}`, body); setMessage(done); await load(); } catch (err) { setError(errorText(err, 'Não foi possível atualizar.')); }
  };
  const remove = async (item) => {
    if (!window.confirm(`Apagar a conta de ${item.name} (${item.email})? Esta ação não pode ser anulada.`)) return;
    setError(''); setMessage('');
    try { await api.delete(`/admin/users/${item.id}`); setMessage('Conta apagada.'); await load(); } catch (err) { setError(errorText(err, 'Não foi possível apagar a conta.')); }
  };
  const create = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { await api.post('/admin/users', form); setMessage(`Conta ${roleLabels[form.role].toLowerCase()} criada.`); setForm({ name: '', email: '', password: '', role: 'cliente' }); setCreating(false); await load(); }
    catch (err) { setError(errorText(err, 'Não foi possível criar a conta.')); } finally { setBusy(false); }
  };

  return <div className="admin-content">
    <div className="admin-list-toolbar admin-list-toolbar--wrap">
      <form className="db-search" onSubmit={(event) => { event.preventDefault(); setFilters({ ...filters, q: search }); }}><Search size={15} /><input className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou email" aria-label="Pesquisar utilizadores" /><button className="btn btn-dark btn-sm" type="submit">Pesquisar</button></form>
      <div className="d-flex gap-2 align-items-center">
        <select className="form-select form-select-sm" value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })} aria-label="Filtrar por perfil"><option value="">Todos os perfis</option><option value="cliente">Clientes</option><option value="admin">Administradores</option></select>
        <button className="btn btn-dark" type="button" onClick={() => setCreating(!creating)}>{creating ? <X size={16} /> : <Plus size={16} />} Nova conta</button>
      </div>
    </div>
    {(error || message) && <div className={`form-alert ${error ? 'form-alert--error' : 'form-alert--success'}`} role={error ? 'alert' : 'status'}>{error || message}</div>}
    {creating && <form className="admin-editor" onSubmit={create}>
      <div className="admin-editor__heading"><div><p className="eyebrow">Gestão de acessos</p><h2>Criar conta</h2></div></div>
      <div className="admin-editor__grid">
        <div className="admin-field"><label className="form-label" htmlFor="new-name">Nome</label><input id="new-name" className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={120} required /></div>
        <div className="admin-field"><label className="form-label" htmlFor="new-email">Email</label><input id="new-email" type="email" className="form-control" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
        <div className="admin-field"><label className="form-label" htmlFor="new-password">Palavra-passe temporária</label><input id="new-password" type="password" autoComplete="new-password" className="form-control" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={10} required /><small className="form-text">Mínimo 10 caracteres, com letras e números.</small></div>
        <div className="admin-field"><label className="form-label" htmlFor="new-role">Perfil</label><select id="new-role" className="form-select" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="cliente">Cliente</option><option value="admin">Administrador</option></select></div>
      </div>
      <div className="admin-editor__actions"><button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'A criar…' : 'Criar conta'}</button></div>
    </form>}
    {!items ? <Loading /> : <div className="admin-table-wrap"><table className="table admin-table"><thead><tr><th scope="col">Utilizador</th><th scope="col">Perfil</th><th scope="col">Último acesso</th><th scope="col">Criada</th><th scope="col"><span className="visually-hidden">Ações</span></th></tr></thead><tbody>
      {items.map((item) => {
        const locked = item.lockedUntil && new Date(item.lockedUntil) > new Date();
        const isMe = item.id === me?.id;
        return <tr key={item.id}>
          <td><strong>{item.role === 'admin' ? <ShieldCheck size={13} /> : <UserRound size={13} />} {item.name}{isMe ? ' (tu)' : ''}</strong><small>#{item.id} · {item.email}{item.failedLoginAttempts ? ` · ${item.failedLoginAttempts} tentativas falhadas` : ''}</small></td>
          <td><select className="form-select form-select-sm role-select" value={item.role} disabled={isMe} onChange={(event) => patch(item, { role: event.target.value }, 'Perfil atualizado. As sessões dessa conta foram terminadas.')} aria-label={`Perfil de ${item.name}`}><option value="cliente">Cliente</option><option value="admin">Administrador</option></select></td>
          <td>{when(item.lastLoginAt)}{locked && <span className="admin-status admin-status--danger d-block mt-1"><Lock size={10} /> Bloqueada</span>}</td>
          <td>{formatDate(item.createdAt)}</td>
          <td className="admin-table__actions">{locked && <button className="btn btn-sm btn-outline-dark" onClick={() => patch(item, { unlock: true }, 'Conta desbloqueada.')}>Desbloquear</button>}{!isMe && <button className="admin-icon-button admin-icon-button--danger" onClick={() => remove(item)} aria-label={`Apagar ${item.name}`}><Trash2 size={16} /></button>}</td>
        </tr>;
      })}
    </tbody></table>{items.length === 0 && <p className="admin-empty">Nenhum utilizador encontrado.</p>}</div>}
  </div>;
}

export function ActivityPanel() {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [page, setPage] = useState(1); const [action, setAction] = useState('');
  useEffect(() => { setData(null); api.get('/admin/audit', { params: { page, action } }).then(({ data: result }) => setData(result)).catch((err) => setError(errorText(err, 'Não foi possível carregar a atividade.'))); }, [page, action]);
  return <div className="admin-content">
    <div className="admin-list-toolbar"><p>{data ? `${data.total} eventos registados` : 'A carregar…'}</p>
      <select className="form-select form-select-sm w-auto" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} aria-label="Filtrar atividade"><option value="">Toda a atividade</option><option value="auth.">Autenticação</option><option value="auth.login_failed">Logins falhados</option><option value="content.">Conteúdos</option><option value="user.">Utilizadores</option><option value="database.">Base de dados</option><option value="submission.">Sugestões</option></select>
    </div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {!data ? <Loading /> : <section className="admin-panel"><ActivityList rows={data.rows} />
      <div className="db-pagination"><span>Página {data.page} de {data.pages}</span><div><button className="btn btn-sm btn-outline-dark" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button><button className="btn btn-sm btn-outline-dark" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Seguinte</button></div></div>
    </section>}
  </div>;
}
