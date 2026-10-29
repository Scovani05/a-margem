import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

function AuthFrame({ eyebrow, title, text, children, footer }) {
  return <div className="auth-page"><div className="auth-art"><span className="auth-art__word">DESCOBRIR</span><div className="auth-art__shape auth-art__shape--one" /><div className="auth-art__shape auth-art__shape--two" /><p>Há sempre<br /><em>mais por ver.</em></p><span className="auth-art__note">À MARGEM · CULTURA EM PORTUGAL</span></div><div className="auth-panel"><Link className="back-link" to="/"><ArrowLeft size={15} /> Voltar à página inicial</Link><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p className="auth-panel__text">{text}</p>}{children}{footer && <div className="auth-panel__footer">{footer}</div>}</div></div>;
}

function PasswordInput({ id, label, value, onChange, autoComplete, minLength = 1 }) {
  const [visible, setVisible] = useState(false);
  return <div className="mb-3"><label className="form-label" htmlFor={id}>{label}</label><div className="password-input"><input className="form-control" id={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} minLength={minLength} required /><button type="button" aria-label={visible ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>;
}

function Notice({ error, message }) {
  return error || message ? <div className={`form-alert ${error ? 'form-alert--error' : 'form-alert--success'}`} role={error ? 'alert' : 'status'}>{error || message}</div> : null;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  usePageMeta('Entrar');
  if (user) return <Navigate to={searchParams.get('redirect') || '/profile'} replace />;
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await login({ email, password }); navigate(searchParams.get('redirect') || '/profile', { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'Não foi possível iniciar sessão.'); }
    finally { setBusy(false); }
  };
  return <AuthFrame eyebrow="Bem-vinda de volta" title="Entra na tua margem." text="Inicia sessão para guardar descobertas e gerir o teu perfil." footer={<>Ainda não tens conta? <Link to="/register">Criar conta</Link></>}>
    <form onSubmit={submit}><Notice error={error} /><div className="mb-3"><label className="form-label" htmlFor="login-email">Email</label><input className="form-control" id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div><PasswordInput id="login-password" label="Palavra-passe" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /><div className="form-row-between"><span /> <Link to="/forgot-password">Esqueceste a palavra-passe?</Link></div><button className="btn btn-dark w-100 mt-4" type="submit" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'} <ArrowRight size={16} /></button></form>
  </AuthFrame>;
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  usePageMeta('Criar conta');
  if (user) return <Navigate to="/profile" replace />;
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await register({ name, email, password }); navigate('/profile'); }
    catch (err) { setError(err.response?.data?.message || 'Não foi possível criar a conta.'); }
    finally { setBusy(false); }
  };
  return <AuthFrame eyebrow="A tua próxima descoberta" title="Guarda o que te toca." text="Cria uma conta para guardar eventos, artistas, obras, espaços e histórias." footer={<>Já tens conta? <Link to="/login">Entrar</Link></>}>
    <form onSubmit={submit}><Notice error={error} /><div className="mb-3"><label className="form-label" htmlFor="register-name">Nome</label><input className="form-control" id="register-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} required /></div><div className="mb-3"><label className="form-label" htmlFor="register-email">Email</label><input className="form-control" id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} required /></div><PasswordInput id="register-password" label="Palavra-passe (mínimo 10 caracteres)" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={10} /><p className="auth-legal">Ao criar uma conta, aceitas os <Link to="/terms">Termos de Utilização</Link> e confirmas que leste a <Link to="/privacy">Política de Privacidade</Link>.</p><button className="btn btn-dark w-100 mt-3" type="submit" disabled={busy}>{busy ? 'A criar conta…' : 'Criar conta'} <ArrowRight size={16} /></button></form>
  </AuthFrame>;
}

export function ForgotPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [resetUrl, setResetUrl] = useState('');
  usePageMeta(token ? 'Repor palavra-passe' : 'Recuperar conta');
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (token) {
        const { data } = await api.post('/auth/reset-password', { token, password });
        setMessage(data.message); setSearchParams({}); setPassword('');
      } else {
        const { data } = await api.post('/auth/forgot-password', { email });
        setMessage(data.message); setResetUrl(data.developmentResetUrl || '');
      }
    } catch (err) { setError(err.response?.data?.message || 'Não foi possível concluir o pedido.'); }
    finally { setBusy(false); }
  };
  return <AuthFrame eyebrow="Acesso à conta" title={token ? 'Escolhe uma nova palavra-passe.' : 'Voltamos a encontrar o caminho.'} text={token ? 'O link de reposição tem validade limitada.' : 'Introduz o email da tua conta. Se existir uma conta, mostramos-te as instruções disponíveis.'} footer={<>Lembraste-te? <Link to="/login">Entrar</Link></>}>
    <form onSubmit={submit}><Notice error={error} message={message} />{token ? <PasswordInput id="reset-password" label="Nova palavra-passe" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={10} /> : <div className="mb-3"><label className="form-label" htmlFor="forgot-email">Email</label><input className="form-control" id="forgot-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>}{resetUrl && <p className="dev-link-note">Modo de desenvolvimento: <a href={resetUrl}>abrir link de reposição</a>.</p>}<button className="btn btn-dark w-100 mt-3" type="submit" disabled={busy}>{busy ? 'A processar…' : token ? 'Atualizar palavra-passe' : 'Pedir instruções'} <ArrowRight size={16} /></button></form>
  </AuthFrame>;
}
