import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, ChevronRight, LayoutDashboard, LogOut, Plus, Save, Trash2, X } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { Loading } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { formatDate } from '../utils/content.js';

const labels = { overview: 'Visão geral', events: 'Eventos', works: 'Obras', artists: 'Artistas', venues: 'Espaços', articles: 'Artigos', collections: 'Coleções', categories: 'Categorias', submissions: 'Sugestões', users: 'Utilizadores', newsletter: 'Newsletter', contact: 'Mensagens' };
const navigation = ['overview', 'events', 'works', 'artists', 'venues', 'articles', 'collections', 'categories', 'submissions', 'users', 'newsletter', 'contact'];
const schemas = {
  categories: [
    ['name', 'Nome'], ['slug', 'Slug'], ['description', 'Descrição'], ['color', 'Cor', 'color'], ['icon', 'Ícone'], ['sortOrder', 'Ordem', 'number']
  ],
  events: [
    ['title', 'Título'], ['slug', 'Slug'], ['subtitle', 'Subtítulo'], ['description', 'Descrição', 'textarea'], ['categoryId', 'Categoria', 'category'], ['venueId', 'Espaço relacionado', 'venue'], ['venueName', 'Nome do espaço'], ['city', 'Cidade'], ['organizer', 'Organização'], ['startsAt', 'Data e hora', 'datetime-local'], ['endsAt', 'Fim', 'datetime-local'], ['officialUrl', 'Ligação oficial', 'url'], ['imageUrl', 'Imagem (URL ou caminho local)'], ['relatedText', 'Outros conteúdos relacionados (tipo:id por linha)', 'textarea'], ['status', 'Estado', 'select', [['upcoming', 'Próximo'], ['past', 'Passado'], ['cancelled', 'Cancelado']]], ['featured', 'Em destaque', 'checkbox'], ['published', 'Publicado', 'checkbox'], ['isDemo', 'Demonstração', 'checkbox']
  ],
  works: [
    ['title', 'Título'], ['slug', 'Slug'], ['subtitle', 'Subtítulo'], ['description', 'Descrição', 'textarea'], ['type', 'Formato'], ['categoryId', 'Categoria', 'category'], ['creator', 'Criador ou artista', 'artist'], ['releasedAt', 'Data de edição', 'date'], ['officialUrl', 'Ligação oficial', 'url'], ['imageUrl', 'Imagem (URL ou caminho local)'], ['relatedText', 'Outros conteúdos relacionados (tipo:id por linha)', 'textarea'], ['featured', 'Em destaque', 'checkbox'], ['published', 'Publicado', 'checkbox'], ['isDemo', 'Demonstração', 'checkbox']
  ],
  artists: [
    ['name', 'Nome'], ['slug', 'Slug'], ['bio', 'Biografia', 'textarea'], ['location', 'Localização'], ['disciplines', 'Disciplinas (separadas por vírgula)'], ['links', 'Ligações em JSON', 'textarea'], ['imageUrl', 'Imagem (URL ou caminho local)'], ['relatedText', 'Outros conteúdos relacionados (tipo:id por linha)', 'textarea'], ['featured', 'Em destaque', 'checkbox'], ['published', 'Publicado', 'checkbox'], ['isDemo', 'Demonstração', 'checkbox']
  ],
  venues: [
    ['name', 'Nome'], ['slug', 'Slug'], ['type', 'Tipo de espaço'], ['description', 'Descrição', 'textarea'], ['address', 'Morada pública'], ['city', 'Cidade'], ['website', 'Site oficial', 'url'], ['publicEmail', 'Email público'], ['imageUrl', 'Imagem (URL ou caminho local)'], ['relatedText', 'Outros conteúdos relacionados (tipo:id por linha)', 'textarea'], ['featured', 'Em destaque', 'checkbox'], ['published', 'Publicado', 'checkbox'], ['isDemo', 'Demonstração', 'checkbox']
  ],
  articles: [
    ['title', 'Título'], ['slug', 'Slug'], ['subtitle', 'Subtítulo'], ['excerpt', 'Introdução', 'textarea'], ['body', 'Corpo do artigo', 'textarea'], ['categoryId', 'Categoria', 'category'], ['authorName', 'Autoria'], ['imageUrl', 'Imagem (URL ou caminho local)'], ['relatedText', 'Conteúdos relacionados (tipo:id por linha)', 'textarea'], ['status', 'Estado editorial', 'select', [['draft', 'Rascunho'], ['published', 'Publicado']]], ['publishedAt', 'Data de publicação', 'datetime-local'], ['featured', 'Em destaque', 'checkbox'], ['isDemo', 'Demonstração', 'checkbox']
  ],
  collections: [
    ['title', 'Título'], ['slug', 'Slug'], ['description', 'Descrição', 'textarea'], ['introduction', 'Introdução editorial', 'textarea'], ['coverImage', 'Capa (URL ou caminho local)'], ['itemsText', 'Itens da coleção: um por linha, ex. works:12'], ['relatedText', 'Outros conteúdos relacionados (tipo:id por linha)', 'textarea'], ['featured', 'Em destaque', 'checkbox'], ['published', 'Publicado', 'checkbox'], ['isDemo', 'Demonstração', 'checkbox']
  ]
};
const requiredFields = {
  categories: ['name'], events: ['title', 'description', 'categoryId', 'city', 'startsAt'],
  works: ['title', 'description', 'type', 'categoryId'], artists: ['name', 'bio'],
  venues: ['name', 'type', 'description', 'city'], articles: ['title', 'excerpt', 'body'],
  collections: ['title', 'description']
};

const routeFor = (type, item) => {
  const route = type === 'articles' ? 'magazine' : type;
  return `/${route}/${item.slug}`;
};

function AdminGate({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="container page-loading"><Loading label="A verificar permissões…" /></div>;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (user.role !== 'admin') return <div className="container inner-page"><h1>Esta área é reservada à equipa editorial.</h1><Link to="/">Voltar à À Margem</Link></div>;
  return children;
}

function AdminShell({ children, section }) {
  const { logout, user } = useAuth(); const navigate = useNavigate();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" to="/admin"><span>à</span> margem <small>EDITORIAL</small></Link><p className="admin-sidebar__caption">GESTÃO DA PLATAFORMA</p><nav aria-label="Navegação administrativa">{navigation.map((key) => <Link to={key === 'overview' ? '/admin' : `/admin/${key}`} key={key} className={`admin-nav-link ${section === key ? 'is-active' : ''}`}>{key === 'overview' && <LayoutDashboard size={16} />}{labels[key]}{section === key && <ChevronRight size={15} />}</Link>)}</nav><div className="admin-sidebar__bottom"><div className="admin-user"><span>{user.name.slice(0, 1)}</span><div><strong>{user.name}</strong><small>Administrador</small></div></div><button type="button" onClick={() => { logout(); navigate('/'); }}><LogOut size={15} /> Terminar sessão</button><Link to="/" className="admin-return"><ArrowDownLeft size={15} /> Ver site público</Link></div></aside><main className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">À Margem / Administração</span><h1>{labels[section]}</h1></div><Link className="text-link" to="/">Abrir site <ArrowUpRight size={15} /></Link></header>{children}</main></div>;
}

function Dashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/dashboard').then(({ data: result }) => setData(result)).catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar o painel.')); }, []);
  if (error) return <p className="admin-error" role="alert">{error}</p>;
  if (!data) return <Loading />;
  return <div className="admin-content"><div className="admin-welcome"><div><p className="eyebrow">Bom trabalho começa com atenção</p><h2>O que está a acontecer?</h2><p>Conteúdos, comunidade e moderação num só lugar.</p></div><Link className="btn btn-dark" to="/admin/articles"><Plus size={16} /> Novo artigo</Link></div><div className="admin-stats">{Object.entries(data.counts).map(([key, value]) => <article className={key === 'pendingSubmissions' ? 'admin-stat admin-stat--lime' : 'admin-stat'} key={key}><span>{labels[key] || (key === 'pendingSubmissions' ? 'Sugestões por rever' : key === 'subscribers' ? 'Inscritos ativos' : key)}</span><strong>{value}</strong></article>)}</div><div className="admin-shortcuts"><h2>Atalhos editoriais</h2><div>{['events', 'works', 'artists', 'venues', 'articles', 'collections', 'categories'].map((key) => <Link to={`/admin/${key}`} key={key}>{labels[key]} <ArrowUpRight size={15} /></Link>)}</div></div></div>;
}

function initialValue(field, item) {
  if (field === 'itemsText') return (item?.items || []).map((entry) => `${entry.contentType}:${entry.contentId}`).join('\n');
  if (field === 'relatedText') return (item?.relatedContent || []).map((entry) => `${entry.targetType}:${entry.targetId}`).join('\n');
  const value = item?.[field];
  if (field === 'links') return JSON.stringify(value || {}, null, 2);
  if (['startsAt', 'endsAt', 'publishedAt'].includes(field) && value) return new Date(value).toISOString().slice(0, 16);
  if (field === 'releasedAt' && value) return String(value).slice(0, 10);
  if (field === 'disciplines') return (value || []).join(', ');
  return value ?? (['featured', 'published', 'isDemo'].includes(field) ? false : '');
}

function ResourceEditor({ resource }) {
  const config = schemas[resource]; const [items, setItems] = useState(null); const [categories, setCategories] = useState([]); const [venues, setVenues] = useState([]); const [artists, setArtists] = useState([]); const [editing, setEditing] = useState(null); const [form, setForm] = useState({}); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const load = async () => { setItems(null); try { const { data } = await api.get(`/admin/resources/${resource}`); setItems(data); } catch (err) { setError(err.response?.data?.message || 'Não foi possível carregar os registos.'); } };
  useEffect(() => { setEditing(null); setForm({}); setError(''); load(); }, [resource]);
  useEffect(() => { if (['events', 'works', 'articles'].includes(resource)) api.get('/categories').then(({ data }) => setCategories(data)).catch(() => setCategories([])); }, [resource]);
  useEffect(() => { if (resource === 'events') api.get('/admin/resources/venues').then(({ data }) => setVenues(data)).catch(() => setVenues([])); }, [resource]);
  useEffect(() => { if (resource === 'works') api.get('/admin/resources/artists').then(({ data }) => setArtists(data)).catch(() => setArtists([])); }, [resource]);
  const startCreate = () => {
    setEditing(null);
    setForm(Object.fromEntries(config.map(([key]) => {
      let value = initialValue(key, null);
      if (key === 'status') value = resource === 'articles' ? 'draft' : 'upcoming';
      if (key === 'type' && resource === 'works') value = 'creative-project';
      if (key === 'type' && resource === 'venues') value = 'Espaço cultural';
      if (key === 'color') value = '#d7e977';
      if (key === 'authorName') value = 'Redação À Margem';
      if (key === 'sortOrder') value = items?.length || 0;
      if (key === 'imageUrl') value = '/images/cover-default.svg';
      if (key === 'coverImage') value = '/images/cover-collection.svg';
      return [key, value];
    })));
    setError(''); setMessage('');
  };
  const startEdit = (item) => { setEditing(item); setForm(Object.fromEntries(config.map(([key]) => [key, initialValue(key, item)]))); setError(''); setMessage(''); };
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const payload = () => {
    const result = { ...form };
    if (!result.slug) delete result.slug;
    for (const key of ['categoryId', 'venueId', 'sortOrder']) if (result[key] !== undefined && result[key] !== '') result[key] = Number(result[key]);
    for (const key of ['categoryId', 'venueId', 'sortOrder']) if (result[key] === '') result[key] = null;
    for (const key of ['startsAt', 'endsAt', 'publishedAt']) result[key] = result[key] ? new Date(result[key]).toISOString() : null;
    if (result.releasedAt === '') result.releasedAt = null;
    if (typeof result.disciplines === 'string') result.disciplines = result.disciplines.split(',').map((entry) => entry.trim()).filter(Boolean);
    if (typeof result.links === 'string') result.links = result.links.trim() ? JSON.parse(result.links) : {};
    if (resource === 'collections') result.items = String(result.itemsText || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => { const [type, id] = line.split(':'); return { type, id: Number(id) }; });
    delete result.itemsText;
    return result;
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const data = payload(); if (editing) await api.put(`/admin/resources/${resource}/${editing.id}`, data); else await api.post(`/admin/resources/${resource}`, data); setMessage(editing ? 'Alterações guardadas.' : 'Conteúdo criado.'); setEditing(null); setForm({}); await load(); }
    catch (err) { setError(err.response?.data?.message || (err instanceof SyntaxError ? 'Verifica o formato do JSON.' : 'Não foi possível guardar o conteúdo.')); }
    finally { setBusy(false); }
  };
  const remove = async (item) => { if (!window.confirm(`Apagar “${item.title || item.name}”?`)) return; try { await api.delete(`/admin/resources/${resource}/${item.id}`); await load(); } catch (err) { setError(err.response?.data?.message || 'Não foi possível apagar o registo.'); } };
  const titleFor = (item) => item.title || item.name;

  return <div className="admin-content"><div className="admin-list-toolbar"><p>{items ? `${items.length} registos` : 'A carregar…'}</p><button className="btn btn-dark" type="button" onClick={startCreate}><Plus size={16} /> Criar {labels[resource]?.replace(/s$/, '')}</button></div>
    {(error || message) && <div className={`form-alert ${error ? 'form-alert--error' : 'form-alert--success'}`} role={error ? 'alert' : 'status'}>{error || message}</div>}
    {form && Object.keys(form).length > 0 && <form className="admin-editor" onSubmit={save}>
      <div className="admin-editor__heading"><div><p className="eyebrow">{editing ? 'Editar conteúdo' : 'Novo conteúdo'}</p><h2>{editing ? titleFor(editing) : `Criar ${labels[resource]?.toLowerCase()}`}</h2></div><button type="button" className="admin-icon-button" onClick={() => { setForm({}); setEditing(null); }} aria-label="Fechar formulário"><X size={18} /></button></div>
      <div className="admin-editor__grid">{config.map(([key, label, kind, options]) => {
        const wide = kind === 'textarea' || key === 'itemsText' || key === 'relatedText';
        let control;
        if (kind === 'checkbox') {
          control = <label className="form-check"><input className="form-check-input" type="checkbox" checked={Boolean(form[key])} onChange={(event) => update(key, event.target.checked)} /><span>{label}</span></label>;
        } else if (kind === 'textarea' || key === 'itemsText') {
          control = <textarea id={`admin-${key}`} className="form-control" rows={key === 'body' ? 9 : 4} value={form[key] || ''} onChange={(event) => update(key, event.target.value)} required={requiredFields[resource]?.includes(key)} />;
        } else if (kind === 'select') {
          control = <select id={`admin-${key}`} className="form-select" value={form[key] || ''} onChange={(event) => update(key, event.target.value)} required={requiredFields[resource]?.includes(key)}>{options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}</select>;
        } else if (kind === 'category') {
          control = <select id={`admin-${key}`} className="form-select" value={form[key] || ''} onChange={(event) => update(key, event.target.value)} required><option value="">Escolher categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>;
        } else if (kind === 'venue') {
          control = <select id={`admin-${key}`} className="form-select" value={form[key] || ''} onChange={(event) => update(key, event.target.value)}><option value="">Sem ficha de espaço ligada</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} · {venue.city}</option>)}</select>;
        } else if (kind === 'artist') {
          control = <><input id={`admin-${key}`} className="form-control" list="admin-artist-options" value={form[key] ?? ''} onChange={(event) => update(key, event.target.value)} required={requiredFields[resource]?.includes(key)} /><datalist id="admin-artist-options">{artists.map((artist) => <option key={artist.id} value={artist.name} />)}</datalist></>;
        } else {
          control = <input id={`admin-${key}`} className="form-control" type={kind || 'text'} value={form[key] ?? ''} onChange={(event) => update(key, event.target.value)} required={requiredFields[resource]?.includes(key)} />;
        }
        return <div key={key} className={`admin-field ${wide ? 'admin-field--wide' : ''} ${kind === 'checkbox' ? 'admin-field--check' : ''}`}>
          {kind !== 'checkbox' && <label className="form-label" htmlFor={`admin-${key}`}>{label}</label>}{control}
          {key === 'relatedText' && <small className="form-text">Usa o tipo e o número apresentados na lista, por exemplo <code>works:12</code>.</small>}
        </div>;
      })}</div>
      <div className="admin-editor__actions"><button className="btn btn-dark" type="submit" disabled={busy}><Save size={16} /> {busy ? 'A guardar…' : 'Guardar'}</button><button className="btn btn-outline-dark" type="button" onClick={() => { setForm({}); setEditing(null); }}>Cancelar</button></div>
    </form>}
    {!items ? <Loading /> : <div className="admin-table-wrap"><table className="table admin-table"><thead><tr><th scope="col">Conteúdo</th><th scope="col">Estado</th><th scope="col">Atualizado</th><th scope="col"><span className="visually-hidden">Ações</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{titleFor(item)}</strong><small>#{item.id}{item.slug ? ` · ${item.slug}` : item.email ? ` · ${item.email}` : ''}</small></td><td><span className={`admin-status ${item.published || item.status === 'published' ? 'is-published' : ''}`}>{item.status || (item.published ? 'Publicado' : 'Rascunho')}{item.isDemo ? ' · Demonstração' : ''}</span></td><td>{formatDate(item.updatedAt)}</td><td className="admin-table__actions"><button className="btn btn-sm btn-outline-dark" onClick={() => startEdit(item)}>Editar</button>{(item.published || item.status === 'published') && item.slug && <Link className="admin-icon-button" to={routeFor(resource, item)} target="_blank" aria-label={`Ver ${titleFor(item)}`}><ArrowUpRight size={16} /></Link>}<button className="admin-icon-button admin-icon-button--danger" onClick={() => remove(item)} aria-label={`Apagar ${titleFor(item)}`}><Trash2 size={16} /></button></td></tr>)}</tbody></table>{items.length === 0 && <p className="admin-empty">Ainda não há {labels[resource]?.toLowerCase()}.</p>}</div>}
  </div>;
}

function Submissions() {
  const [items, setItems] = useState(null); const [error, setError] = useState(''); const [busyId, setBusyId] = useState(null);
  const load = () => api.get('/admin/submissions').then(({ data }) => setItems(data)).catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar as sugestões.'));
  useEffect(() => { load(); }, []);
  const change = async (item, status) => { setBusyId(item.id); try { await api.patch(`/admin/submissions/${item.id}`, { status, adminNotes: item.adminNotes || '' }); await load(); } catch (err) { setError(err.response?.data?.message || 'Não foi possível atualizar a sugestão.'); } finally { setBusyId(null); } };
  const publish = async (item) => { setBusyId(item.id); try { const { data } = await api.post(`/admin/submissions/${item.id}/publish`); await load(); setError(''); window.open(routeFor(data.contentType, data.content), '_blank', 'noopener,noreferrer'); } catch (err) { setError(err.response?.data?.message || 'Não foi possível publicar esta sugestão.'); } finally { setBusyId(null); } };
  return <div className="admin-content"><div className="admin-list-toolbar"><p>{items ? `${items.length} sugestões` : 'A carregar…'}</p><span className="eyebrow">Apenas sugestões revistas podem ser publicadas</span></div>{error && <p className="admin-error" role="alert">{error}</p>}{!items ? <Loading /> : <div className="admin-record-list">{items.map((item) => <article className="submission-card" key={item.id}><div className="submission-card__top"><span className="admin-status">{item.status}</span><span>{labels[item.type] || item.type} · {formatDate(item.createdAt)}</span></div><h2>{item.title}</h2><p>{item.description}</p><div className="submission-card__meta">{item.city && <span>{item.city}</span>}{item.venueName && <span>{item.venueName}</span>}{item.startsAt && <span>{formatDate(item.startsAt)}</span>}<a href={`mailto:${item.submitterEmail}`}>{item.submitterName} · {item.submitterEmail}</a>{item.officialUrl && <a href={item.officialUrl} target="_blank" rel="noreferrer">Fonte oficial ↗</a>}{item.publishedSlug && <Link to={routeFor(item.publishedContentType, { slug: item.publishedSlug })} target="_blank">Ver conteúdo publicado ↗</Link>}</div><div className="submission-card__actions"><select className="form-select" value={item.status} onChange={(event) => change(item, event.target.value)} disabled={busyId === item.id}><option value="pending">Pendente</option><option value="reviewing">Em revisão</option><option value="approved">Aprovada</option><option value="rejected">Rejeitada</option></select>{!item.publishedContentId && <button className="btn btn-dark" onClick={() => publish(item)} disabled={busyId === item.id || item.status === 'rejected'}><Check size={15} /> Rever e publicar</button>}</div></article>)}</div>}</div>;
}

function AdminSimpleList({ resource }) {
  const [items, setItems] = useState(null); const [error, setError] = useState('');
  const load = () => api.get(`/admin/${resource}`).then(({ data }) => setItems(data)).catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os registos.'));
  useEffect(() => { load(); }, [resource]);
  const update = async (item, data) => { try { await api.patch(`/admin/${resource}/${item.id}`, data); await load(); } catch (err) { setError(err.response?.data?.message || 'Não foi possível atualizar.'); } };
  const remove = async (item) => { if (!window.confirm(`Remover ${item.email || item.subject || item.name}?`)) return; try { await api.delete(`/admin/newsletter/${item.id}`); await load(); } catch (err) { setError(err.response?.data?.message || 'Não foi possível remover.'); } };
  return <div className="admin-content"><div className="admin-list-toolbar"><p>{items ? `${items.length} registos` : 'A carregar…'}</p></div>{error && <p role="alert" className="admin-error">{error}</p>}{!items ? <Loading /> : <div className="admin-record-list">{items.map((item) => <article className="submission-card admin-simple-card" key={item.id}><div><strong>{resource === 'contact' ? `${item.subject} — ${item.name}` : item.name || item.email}</strong><p>{resource === 'contact' ? item.message : item.email || ''}</p><small>{formatDate(item.createdAt || item.consentAt)}{item.unsubscribedAt ? ' · Inscrição cancelada' : ''}</small>{resource === 'contact' && <a href={`mailto:${item.email}`}>{item.email}</a>}</div>{resource === 'users' ? <select aria-label={`Perfil de ${item.name}`} className="form-select" value={item.role} onChange={(event) => update(item, { role: event.target.value })}><option value="user">Utilizador</option><option value="admin">Administrador</option></select> : resource === 'contact' ? <select aria-label="Estado da mensagem" className="form-select" value={item.status} onChange={(event) => update(item, { status: event.target.value })}><option value="new">Nova</option><option value="read">Lida</option><option value="closed">Fechada</option></select> : <button className="admin-icon-button admin-icon-button--danger" onClick={() => remove(item)} aria-label="Remover email"><Trash2 size={16} /></button>}</article>)}</div>}</div>;
}

export default function AdminPage() {
  const location = useLocation();
  const section = useMemo(() => location.pathname.split('/')[2] || 'overview', [location.pathname]);
  usePageMeta(`Administração · ${labels[section] || 'Conteúdo'}`);
  if (!labels[section]) return <AdminGate><AdminShell section="overview"><div className="admin-content"><h2>Página não encontrada</h2></div></AdminShell></AdminGate>;
  let content;
  if (section === 'overview') content = <Dashboard />;
  else if (schemas[section]) content = <ResourceEditor resource={section} />;
  else if (section === 'submissions') content = <Submissions />;
  else if (['users', 'newsletter', 'contact'].includes(section)) content = <AdminSimpleList resource={section} />;
  return <AdminGate><AdminShell section={section}>{content}</AdminShell></AdminGate>;
}
