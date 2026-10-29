import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorState, Loading, PageIntro } from '../components/States.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

function FormMessage({ error, message }) {
  return error || message ? <div className={`form-alert ${error ? 'form-alert--error' : 'form-alert--success'}`} role={error ? 'alert' : 'status'}>{message && <CheckCircle2 size={18} />}{error || message}</div> : null;
}

export function SubmitPage() {
  const [categories, setCategories] = useState([]); const [categoryError, setCategoryError] = useState('');
  const [form, setForm] = useState({ type: 'event', title: '', description: '', categoryId: '', city: '', venueName: '', startsAt: '', officialUrl: '', submitterName: '', submitterEmail: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  usePageMeta('Sugerir cultura');
  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data)).catch((err) => setCategoryError(err.response?.data?.message || 'Não foi possível carregar as categorias.')); }, []);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const payload = { ...form, ...(form.startsAt ? { startsAt: new Date(form.startsAt).toISOString() } : {}) };
      const { data } = await api.post('/submissions', payload);
      setMessage(data.message); setForm((current) => ({ ...current, title: '', description: '', startsAt: '', officialUrl: '' }));
    } catch (err) { setError(err.response?.data?.message || 'Não foi possível enviar a sugestão.'); }
    finally { setBusy(false); }
  };
  const needsCategory = ['event', 'work'].includes(form.type);
  return <div className="container inner-page form-page"><PageIntro eyebrow="Uma boa pista faz diferença" title={<>Tens uma<br /><em>descoberta?</em></>} text="Ajuda-nos a encontrar o que ainda não chegou a toda a gente. A equipa revê cada sugestão antes de a publicar." />
    <form className="editorial-form" onSubmit={submit}><FormMessage error={error} message={message} /><div className="form-section-label"><span>01</span><div><strong>O que queres sugerir?</strong><small>Começamos pelo básico.</small></div></div>
      <div className="row g-3"><div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-type">Tipo de conteúdo</label><select id="submission-type" className="form-select" value={form.type} onChange={(event) => set('type', event.target.value)}><option value="event">Evento</option><option value="work">Obra ou projeto</option><option value="artist">Artista</option><option value="venue">Espaço cultural</option></select></div><div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-title">Nome ou título</label><input id="submission-title" className="form-control" value={form.title} onChange={(event) => set('title', event.target.value)} maxLength={180} required /></div>
        {needsCategory && <div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-category">Categoria</label><select id="submission-category" className="form-select" value={form.categoryId} onChange={(event) => set('categoryId', event.target.value)} required><option value="">Escolher categoria</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>{categoryError && <small className="form-note form-note--error">{categoryError}</small>}</div>}
        <div className="col-12"><label className="form-label" htmlFor="submission-description">O que devemos saber?</label><textarea id="submission-description" className="form-control" rows="5" value={form.description} onChange={(event) => set('description', event.target.value)} maxLength={5000} required placeholder="Dá-nos contexto para perceber porque vale a pena descobrir." /></div>
        {form.type === 'event' && <><div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-date">Data e hora</label><input id="submission-date" className="form-control" type="datetime-local" value={form.startsAt} onChange={(event) => set('startsAt', event.target.value)} required /></div><div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-venue">Espaço</label><input id="submission-venue" className="form-control" value={form.venueName} onChange={(event) => set('venueName', event.target.value)} maxLength={180} /></div></>}
        {['event', 'artist', 'venue'].includes(form.type) && <div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-city">Cidade ou região</label><input id="submission-city" className="form-control" value={form.city} onChange={(event) => set('city', event.target.value)} maxLength={100} /></div>}
        <div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-url">Ligação oficial ou fonte</label><input id="submission-url" className="form-control" type="url" value={form.officialUrl} onChange={(event) => set('officialUrl', event.target.value)} maxLength={2000} placeholder="https://" /></div>
      </div>
      <div className="form-section-label mt-5"><span>02</span><div><strong>Como te podemos contactar?</strong><small>Só usamos estes dados se precisarmos de esclarecer algo.</small></div></div>
      <div className="row g-3"><div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-name">O teu nome</label><input id="submission-name" className="form-control" value={form.submitterName} onChange={(event) => set('submitterName', event.target.value)} autoComplete="name" maxLength={120} required /></div><div className="col-12 col-md-6"><label className="form-label" htmlFor="submission-email">O teu email</label><input id="submission-email" className="form-control" type="email" value={form.submitterEmail} onChange={(event) => set('submitterEmail', event.target.value)} autoComplete="email" maxLength={254} required /></div></div>
      <div className="editorial-form__foot"><p>Ao enviar, confirmas que leste a <Link to="/privacy">Política de Privacidade</Link>. A tua sugestão não será publicada sem revisão.</p><button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'A enviar…' : 'Enviar sugestão'} <ArrowRight size={16} /></button></div>
    </form>
  </div>;
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  usePageMeta('Contacto');
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const { data } = await api.post('/contact', form); setMessage(data.message); setForm({ name: '', email: '', subject: '', message: '' }); }
    catch (err) { setError(err.response?.data?.message || 'Não foi possível enviar a mensagem.'); }
    finally { setBusy(false); }
  };
  return <div className="container inner-page contact-page"><div className="contact-page__intro"><PageIntro eyebrow="De pessoa para pessoa" title={<>Diz-nos<br /><em>olá.</em></>} text="Uma pergunta, uma correção ou uma vontade de colaborar? Estamos por aqui." /><div className="contact-side-note"><span className="eyebrow">Preferimos boas conversas</span><p>Se tens uma história, uma proposta editorial ou uma dúvida sobre um conteúdo, este é o lugar.</p><Link to="/submit">Quero sugerir uma descoberta ↗</Link></div></div><form className="editorial-form" onSubmit={submit}><FormMessage error={error} message={message} /><div className="row g-3"><div className="col-12 col-md-6"><label className="form-label" htmlFor="contact-name">Nome</label><input className="form-control" id="contact-name" value={form.name} onChange={(event) => set('name', event.target.value)} autoComplete="name" maxLength={120} required /></div><div className="col-12 col-md-6"><label className="form-label" htmlFor="contact-email">Email</label><input className="form-control" id="contact-email" type="email" value={form.email} onChange={(event) => set('email', event.target.value)} autoComplete="email" maxLength={254} required /></div><div className="col-12"><label className="form-label" htmlFor="contact-subject">Assunto</label><input className="form-control" id="contact-subject" value={form.subject} onChange={(event) => set('subject', event.target.value)} maxLength={180} required /></div><div className="col-12"><label className="form-label" htmlFor="contact-message">Mensagem</label><textarea className="form-control" id="contact-message" rows="6" value={form.message} onChange={(event) => set('message', event.target.value)} maxLength={5000} required /></div></div><div className="editorial-form__foot"><p>Usamos os teus dados apenas para responder a esta mensagem. <Link to="/privacy">Sabe mais.</Link></p><button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'A enviar…' : 'Enviar mensagem'} <ArrowRight size={16} /></button></div></form></div>;
}

export function UnsubscribePage() {
  const [params] = useSearchParams(); const token = params.get('token');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  usePageMeta('Cancelar newsletter');
  const unsubscribe = async () => {
    setBusy(true); setError('');
    try { const { data } = await api.post(`/newsletter/unsubscribe/${encodeURIComponent(token)}`); setMessage(data.message); }
    catch (err) { setError(err.response?.data?.message || 'Não foi possível cancelar a inscrição.'); }
    finally { setBusy(false); }
  };
  return <div className="container inner-page narrow-page"><PageIntro eyebrow="Carta de descoberta" title="A tua caixa, as tuas regras." text="Podes cancelar a inscrição na newsletter quando quiseres." /><FormMessage error={error} message={message} />{!token ? <ErrorState message="O link de cancelamento não contém um token válido." /> : !message && <button className="btn btn-dark" type="button" disabled={busy} onClick={unsubscribe}>{busy ? 'A atualizar…' : 'Cancelar inscrição'} <ArrowRight size={16} /></button>}</div>;
}
