export const resourceLabels = {
  events: 'Eventos', works: 'Obras', artists: 'Artistas', venues: 'Espaços', articles: 'Revista', collections: 'Coleções'
};

export function getContentTitle(type, item) {
  return item?.title || item?.name || 'Conteúdo';
}

export function getContentHref(type, item) {
  const resource = type === 'article' ? 'articles' : type;
  const path = resource === 'articles' ? 'magazine' : resource;
  return `/${path}/${item.slug}`;
}

export function imageFor(item) {
  return item?.imageUrl || item?.coverImage || '/images/cover-default.svg';
}

export function formatDate(date, options = {}) {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', year: 'numeric', ...options }).format(new Date(date));
}
