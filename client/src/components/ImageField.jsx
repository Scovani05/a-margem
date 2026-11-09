import { useRef, useState } from 'react';
import { ImageUp, LoaderCircle, X } from 'lucide-react';
import api from '../api/client.js';

const MAX_BYTES = 2.5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

// Lê o ficheiro escolhido no computador como Data URL (base64).
const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Não foi possível ler o ficheiro.'));
  reader.readAsDataURL(file);
});

// Campo de imagem do backoffice: aceita um URL/caminho escrito à mão OU um ficheiro do computador,
// que é enviado para a API (POST /admin/media) e substituído pelo URL público devolvido.
export default function ImageField({ id, label, value, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    setError('');
    if (!file) return;
    if (!ACCEPT.split(',').includes(file.type)) { setError('Escolhe uma imagem JPG, PNG, WebP ou GIF.'); return; }
    if (file.size > MAX_BYTES) { setError('A imagem pode ter no máximo 2,5 MB.'); return; }
    setBusy(true);
    try {
      const data = await readAsDataUrl(file);
      const { data: result } = await api.post('/admin/media', { name: file.name, data }, { timeout: 60000 });
      onChange(result.url);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Não foi possível carregar a imagem.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return <div className="image-field">
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className="image-field__row">
      {value ? <img className="image-field__preview" src={value} alt="Pré-visualização" /> : <span className="image-field__preview image-field__preview--empty">Sem imagem</span>}
      <div className="image-field__controls">
        <input id={id} className="form-control" value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder="https://… ou /images/…" />
        <div className="image-field__actions">
          <input ref={fileRef} type="file" accept={ACCEPT} className="visually-hidden" id={`${id}-file`} onChange={(event) => upload(event.target.files?.[0])} />
          <label htmlFor={`${id}-file`} className={`btn btn-sm btn-outline-dark ${busy ? 'disabled' : ''}`}>{busy ? <><LoaderCircle size={14} className="spin" /> A carregar…</> : <><ImageUp size={14} /> Escolher do computador</>}</label>
          {value && <button type="button" className="btn btn-sm btn-link" onClick={() => onChange('')}><X size={14} /> Remover</button>}
        </div>
        <small className="form-text">JPG, PNG, WebP ou GIF até 2,5 MB. A imagem fica guardada na base de dados.</small>
        {error && <small className="image-field__error" role="alert">{error}</small>}
      </div>
    </div>
  </div>;
}
