import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SaveButton({ type, item }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(Boolean(item.isSaved));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { setSaved(false); return; }
    const resource = type === 'article' ? 'articles' : type;
    let active = true;
    api.get('/saved').then(({ data }) => {
      if (active) setSaved(data.some((entry) => entry.type === resource && entry.content.id === item.id));
    }).catch(() => {});
    return () => { active = false; };
  }, [user?.id, type, item.id]);

  const toggle = async () => {
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    setBusy(true);
    setError('');
    try {
      const resource = type === 'article' ? 'articles' : type;
      if (saved) await api.delete(`/saved/${resource}/${item.id}`);
      else await api.post('/saved', { type: resource, id: item.id });
      setSaved(!saved);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível atualizar os guardados.');
    } finally { setBusy(false); }
  };

  return <div className="save-control"><button className={`btn save-button ${saved ? 'is-saved' : ''}`} type="button" onClick={toggle} disabled={busy} aria-pressed={saved}>
    {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{saved ? 'Guardado' : 'Guardar'}
  </button>{error && <span className="form-note form-note--error" role="alert">{error}</span>}</div>;
}
