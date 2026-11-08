import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Database, Download, Play, RefreshCw, Save, Search, Table2, Trash2, X } from 'lucide-react';
import api from '../../api/client.js';
import { Loading } from '../../components/States.jsx';
import { formatDate } from '../../utils/content.js';

const errorText = (err, fallback) => err.response?.data?.message || fallback;

function display(value) {
  if (value === null || value === undefined) return <span className="db-null">NULL</span>;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return formatDate(text, { hour: '2-digit', minute: '2-digit' });
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

function toInput(column, value) {
  if (value === null || value === undefined) return '';
  if (column.type === 'JSONB' || column.type === 'JSON') return JSON.stringify(value, null, 2);
  if (column.type.startsWith('ARRAY')) return (value || []).join(', ');
  if (column.type === 'DATE') return new Date(value).toISOString().slice(0, 16);
  return value;
}

function fromInput(column, value) {
  if (column.type === 'DATE') return value ? new Date(value).toISOString() : null;
  return value;
}

// Editor de um registo: só mostra controlos para colunas editáveis.
function RowEditor({ table, columns, row, onClose, onSaved }) {
  const editable = columns.filter((column) => column.editable);
  const [form, setForm] = useState(() => Object.fromEntries(editable.map((column) => [column.name, toInput(column, row[column.name])])));
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = Object.fromEntries(editable.map((column) => [column.name, fromInput(column, form[column.name])]));
      await api.put(`/admin/database/${table}/${row.id}`, payload);
      onSaved();
    } catch (err) { setError(errorText(err, 'Não foi possível guardar o registo.')); } finally { setBusy(false); }
  };
  return <form className="admin-editor" onSubmit={save}>
    <div className="admin-editor__heading"><div><p className="eyebrow">{table} · registo #{row.id}</p><h2>Editar registo</h2></div><button type="button" className="admin-icon-button" onClick={onClose} aria-label="Fechar"><X size={18} /></button></div>
    {error && <div className="form-alert form-alert--error" role="alert">{error}</div>}
    {!editable.length && <p className="admin-empty">Esta tabela não tem campos editáveis.</p>}
    <div className="admin-editor__grid">{editable.map((column) => {
      const id = `db-${column.name}`;
      const wide = ['TEXT', 'JSONB', 'JSON'].includes(column.type);
      let control;
      if (column.type === 'BOOLEAN') control = <select id={id} className="form-select" value={String(form[column.name])} onChange={(event) => setForm({ ...form, [column.name]: event.target.value === 'true' })}><option value="true">true</option><option value="false">false</option></select>;
      else if (wide) control = <textarea id={id} className="form-control db-mono" rows={column.type === 'TEXT' ? 4 : 5} value={form[column.name]} onChange={(event) => setForm({ ...form, [column.name]: event.target.value })} />;
      else control = <input id={id} className="form-control" type={column.type === 'INTEGER' ? 'number' : column.type === 'DATE' ? 'datetime-local' : column.type === 'DATEONLY' ? 'date' : 'text'} value={form[column.name]} onChange={(event) => setForm({ ...form, [column.name]: event.target.value })} required={!column.allowNull && column.type !== 'BOOLEAN'} />;
      return <div key={column.name} className={`admin-field ${wide ? 'admin-field--wide' : ''}`}><label className="form-label" htmlFor={id}>{column.name} <small className="db-type">{column.type}</small></label>{control}</div>;
    })}</div>
    {editable.length > 0 && <div className="admin-editor__actions"><button className="btn btn-dark" type="submit" disabled={busy}><Save size={16} /> {busy ? 'A guardar…' : 'Guardar'}</button><button className="btn btn-outline-dark" type="button" onClick={onClose}>Cancelar</button></div>}
  </form>;
}

function TableBrowser({ table, meta, onChanged }) {
  const [params, setParams] = useState({ page: 1, pageSize: 25, q: '', sort: '', dir: 'desc' });
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [editing, setEditing] = useState(null);

  const load = () => {
    setError('');
    api.get(`/admin/database/${table}`, { params }).then(({ data: result }) => setData(result)).catch((err) => setError(errorText(err, 'Não foi possível ler a tabela.')));
  };
  useEffect(() => { setParams({ page: 1, pageSize: 25, q: '', sort: '', dir: 'desc' }); setSearch(''); setEditing(null); setData(null); }, [table]);
  useEffect(load, [table, params]);

  const sortBy = (name) => setParams((current) => ({ ...current, sort: name, dir: current.sort === name && current.dir === 'desc' ? 'asc' : 'desc', page: 1 }));
  const remove = async (row) => {
    if (!window.confirm(`Apagar o registo #${row.id} da tabela ${table}? Esta ação não pode ser anulada.`)) return;
    try { await api.delete(`/admin/database/${table}/${row.id}`); load(); onChanged(); } catch (err) { setError(errorText(err, 'Não foi possível apagar o registo.')); }
  };
  const exportCsv = async () => {
    try {
      const response = await api.get(`/admin/database/${table}/export`, { params: { q: params.q }, responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url; link.download = `${table}.csv`; link.click();
      URL.revokeObjectURL(url);
    } catch (err) { setError('Não foi possível exportar a tabela.'); }
  };

  const columns = data?.columns || meta.columns;
  return <section className="db-browser">
    <div className="db-browser__toolbar">
      <div><p className="eyebrow">Tabela</p><h2><Table2 size={18} /> {table}</h2><small>{meta.model} · {meta.rows} registos{meta.readOnly ? ' · só de leitura' : ''}</small></div>
      <form className="db-search" onSubmit={(event) => { event.preventDefault(); setParams({ ...params, q: search, page: 1 }); }}>
        <Search size={15} /><input className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar em colunas de texto" aria-label="Pesquisar na tabela" />
        <button className="btn btn-dark btn-sm" type="submit">Filtrar</button>
      </form>
      <div className="db-browser__actions"><button className="btn btn-outline-dark btn-sm" type="button" onClick={load}><RefreshCw size={14} /> Atualizar</button><button className="btn btn-outline-dark btn-sm" type="button" onClick={exportCsv}><Download size={14} /> CSV</button></div>
    </div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {editing && <RowEditor table={table} columns={columns} row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    {!data ? <Loading /> : <>
      <div className="admin-table-wrap"><table className="table admin-table db-table"><thead><tr>
        {columns.map((column) => <th scope="col" key={column.name}><button type="button" className="db-sort" onClick={() => sortBy(column.name)}>{column.name}{data.sort === column.name && (data.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}</button><small>{column.type}</small></th>)}
        {!meta.readOnly && <th scope="col"><span className="visually-hidden">Ações</span></th>}
      </tr></thead><tbody>{data.rows.map((row) => <tr key={row.id ?? JSON.stringify(row)}>
        {columns.map((column) => <td key={column.name} title={typeof row[column.name] === 'string' ? row[column.name] : undefined}>{display(row[column.name])}</td>)}
        {!meta.readOnly && <td className="admin-table__actions"><button className="btn btn-sm btn-outline-dark" onClick={() => setEditing(row)}>Editar</button><button className="admin-icon-button admin-icon-button--danger" onClick={() => remove(row)} aria-label={`Apagar registo ${row.id}`}><Trash2 size={15} /></button></td>}
      </tr>)}</tbody></table>{data.rows.length === 0 && <p className="admin-empty">Sem registos{params.q ? ' para esta pesquisa' : ''}.</p>}</div>
      <div className="db-pagination"><span>{data.total} registos · página {data.page} de {data.pages}</span><div>
        <select className="form-select form-select-sm" value={params.pageSize} onChange={(event) => setParams({ ...params, pageSize: Number(event.target.value), page: 1 })} aria-label="Registos por página">{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} / página</option>)}</select>
        <button className="btn btn-sm btn-outline-dark" disabled={data.page <= 1} onClick={() => setParams({ ...params, page: data.page - 1 })}>Anterior</button>
        <button className="btn btn-sm btn-outline-dark" disabled={data.page >= data.pages} onClick={() => setParams({ ...params, page: data.page + 1 })}>Seguinte</button>
      </div></div>
    </>}
  </section>;
}

function SqlConsole() {
  const [sql, setSql] = useState('SELECT role, COUNT(*) AS total FROM users GROUP BY role');
  const [result, setResult] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setResult(null);
    try { const { data } = await api.post('/admin/database/query', { sql }); setResult(data); } catch (err) { setError(errorText(err, 'Não foi possível executar a consulta.')); } finally { setBusy(false); }
  };
  return <section className="db-console">
    <div className="db-browser__toolbar"><div><p className="eyebrow">Consola SQL</p><h2><Database size={18} /> Consultas só de leitura</h2><small>SELECT, WITH ou EXPLAIN · transação READ ONLY · máx. 500 linhas · 5 s</small></div></div>
    <form onSubmit={run}><textarea className="form-control db-mono" rows={4} value={sql} onChange={(event) => setSql(event.target.value)} aria-label="Consulta SQL" spellCheck={false} />
      <button className="btn btn-dark btn-sm mt-2" type="submit" disabled={busy}><Play size={14} /> {busy ? 'A executar…' : 'Executar'}</button></form>
    {error && <p className="admin-error mt-3" role="alert">{error}</p>}
    {result && <><p className="db-result-meta">{result.rowCount} linha(s) em {result.ms} ms{result.truncated ? ' · resultado limitado a 500 linhas' : ''}</p>
      <div className="admin-table-wrap"><table className="table admin-table db-table"><thead><tr>{result.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={index}>{result.columns.map((column) => <td key={column}>{display(row[column])}</td>)}</tr>)}</tbody></table></div></>}
  </section>;
}

export default function DatabaseExplorer() {
  const [overview, setOverview] = useState(null); const [error, setError] = useState(''); const [selected, setSelected] = useState('');
  const load = () => api.get('/admin/database').then(({ data }) => { setOverview(data); setSelected((current) => current || data.tables[0]?.table || ''); }).catch((err) => setError(errorText(err, 'Não foi possível ligar à base de dados.')));
  useEffect(() => { load(); }, []);
  if (error) return <div className="admin-content"><p className="admin-error" role="alert">{error}</p></div>;
  if (!overview) return <div className="admin-content"><Loading label="A ligar ao PostgreSQL…" /></div>;
  const meta = overview.tables.find((entry) => entry.table === selected);
  return <div className="admin-content">
    <div className="db-info">
      <article><span>Base de dados</span><strong>{overview.info.database}</strong></article>
      <article><span>PostgreSQL</span><strong>{overview.info.version}</strong></article>
      <article><span>Tamanho</span><strong>{overview.info.size}</strong></article>
      <article><span>Tabelas</span><strong>{overview.tables.length}</strong></article>
      <article><span>Migrações</span><strong>{overview.migrations.length}</strong></article>
    </div>
    <p className="db-note">Palavras-passe, tokens de sessão e tokens de newsletter nunca são mostrados. Todas as alterações ficam registadas na Atividade.</p>
    <div className="db-layout">
      <nav className="db-tables" aria-label="Tabelas">{overview.tables.map((entry) => <button type="button" key={entry.table} className={entry.table === selected ? 'is-active' : ''} onClick={() => setSelected(entry.table)}><span>{entry.table}</span><small>{entry.rows}</small></button>)}<button type="button" className={selected === '__sql' ? 'is-active' : ''} onClick={() => setSelected('__sql')}><span>Consola SQL</span><small>SQL</small></button></nav>
      <div className="db-main">{selected === '__sql' ? <SqlConsole /> : meta ? <TableBrowser table={selected} meta={meta} onChanged={load} /> : null}</div>
    </div>
  </div>;
}
