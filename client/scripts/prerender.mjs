// Corre depois do `vite build`.
// 1. Cria uma página HTML por cada conteúdo publicado (eventos, artigos, artistas...), com título,
//    descrição e imagem já no HTML. Assim o Google e as pré-visualizações de links (Instagram,
//    WhatsApp, Facebook) veem a informação certa, e essas páginas respondem com 200 em vez de 404.
// 2. Põe robots.txt e sitemap.xml no endereço do site.
// Se a API não responder, o build continua: o site funciona na mesma, só sem estas páginas.
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
const API = (process.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const API_ROOT = API.replace(/\/api$/, '');
// Endereço público do site: VITE_PUBLIC_URL (muda-o quando tiveres domínio próprio).
const SITE = (process.env.VITE_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL
  || (process.env.RENDER ? 'https://a-margem-web.onrender.com' : 'http://localhost:5173')).replace(/\/$/, '');
const DEFAULT_DESCRIPTION = 'Descobre cultura, artistas e espaços independentes em Portugal.';

const STATIC_PAGES = {
  '/': ['', DEFAULT_DESCRIPTION],
  '/discover': ['Descobrir', 'Eventos, obras, artistas e espaços da cultura portuguesa.'],
  '/discover/events': ['Eventos', 'Concertos, exposições, teatro e cinema em Portugal, com data, sala e bilhetes.'],
  '/discover/works': ['Discos e obras', 'Discos, filmes e livros de artistas portugueses.'],
  '/discover/artists': ['Artistas', 'Artistas da cultura portuguesa.'],
  '/discover/venues': ['Espaços', 'Salas, teatros e museus em Portugal.'],
  '/magazine': ['Revista: últimas notícias', 'Tudo o que se passa na cultura portuguesa, da notícia mais recente para a mais antiga.'],
  '/collections': ['Coleções', 'Seleções editoriais da À Margem.'],
  '/about': ['Sobre', 'O que é a À Margem.']
};
const TYPES = { events: 'events', artists: 'artists', venues: 'venues', works: 'works', collections: 'collections', magazine: 'articles' };

const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (text, max = 200) => { const t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t; };

async function getJson(url, timeoutMs) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function metaFor(item, type) {
  const title = item.title || item.name;
  const description = item.description || item.excerpt || item.bio || item.introduction || DEFAULT_DESCRIPTION;
  const image = item.imageUrl || item.coverImage || '';
  return { title, description, image, type: type === 'articles' ? 'article' : 'website' };
}

function render(template, pagePath, { title, description, image, type = 'website' }) {
  const fullTitle = title ? `${title} - À Margem` : 'À Margem - cultura para descobrir';
  const url = `${SITE}${pagePath === '/' ? '/' : pagePath}`;
  // As pré-visualizações não aceitam SVG; nesses casos fica só o título e a descrição.
  const absImage = image && !/\.svg($|\?)/i.test(image) ? new URL(image, SITE).toString() : '';
  const desc = clip(description);
  const tags = [
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:site_name" content="À Margem" />`,
    `<meta property="og:locale" content="pt_PT" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    absImage ? `<meta property="og:image" content="${esc(absImage)}" />` : '',
    `<meta name="twitter:card" content="${absImage ? 'summary_large_image' : 'summary'}" />`
  ].filter(Boolean).join('\n    ');
  return template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, '')
    .replace('</head>', `    ${tags}\n  </head>`);
}

async function write(pagePath, html) {
  const dir = pagePath === '/' ? DIST : path.join(DIST, ...pagePath.split('/').filter(Boolean).map(decodeURIComponent));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html);
}

async function main() {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  await copyFile(path.join(DIST, 'index.html'), path.join(DIST, '404.html'));
  await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${SITE}/sitemap.xml\n`);

  let sitemap;
  try {
    // A API gratuita pode estar a "dormir": a primeira chamada tem tempo para acordar.
    const res = await fetch(`${API_ROOT}/sitemap.xml`, { signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`sitemap ${res.status}`);
    sitemap = await res.text();
  } catch (error) {
    console.warn(`[prerender] API indisponível (${error.message}). O site é publicado sem páginas pré-geradas.`);
    return;
  }
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap.replace(/<loc>https?:\/\/[^/<]+/g, `<loc>${SITE}`));

  let done = 0; const failed = [];
  const queue = [...new Set(paths)];
  async function worker() {
    while (queue.length) {
      const pagePath = queue.shift();
      try {
        if (STATIC_PAGES[pagePath]) {
          const [title, description] = STATIC_PAGES[pagePath];
          await write(pagePath, render(template, pagePath, { title, description }));
        } else {
          const [, section, slug] = pagePath.split('/');
          const type = TYPES[section];
          if (!type || !slug) continue;
          const item = await getJson(`${API}/${type}/${slug}`, 30000);
          await write(pagePath, render(template, pagePath, metaFor(item, type)));
        }
        done += 1;
      } catch (error) { failed.push(`${pagePath} (${error.message})`); }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  for (const [pagePath, [title, description]] of Object.entries(STATIC_PAGES)) {
    if (!paths.includes(pagePath)) { await write(pagePath, render(template, pagePath, { title, description })); done += 1; }
  }
  console.log(`[prerender] ${done} páginas geradas para ${SITE}.${failed.length ? ` Falharam ${failed.length}: ${failed.slice(0, 5).join(', ')}` : ''}`);
}

main().catch((error) => { console.warn(`[prerender] ${error.message}`); });
