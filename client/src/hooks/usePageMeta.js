import { useEffect } from 'react';

export default function usePageMeta(title, description = 'Descobre cultura, artistas e espaços independentes em Portugal.', metadata = {}) {
  const { image, type = 'website' } = metadata;
  useEffect(() => {
    const fullTitle = title ? `${title} - À Margem` : 'À Margem - cultura para descobrir';
    const pageUrl = new URL(window.location.pathname, import.meta.env.VITE_PUBLIC_URL || window.location.origin).toString();
    document.title = fullTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
    const setMeta = (selector, property, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:')) element.setAttribute('property', property);
        else element.name = property;
        document.head.appendChild(element);
      }
      if (content) element.content = content;
      else element.remove();
    };
    setMeta('meta[property="og:title"]', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'og:description', description);
    setMeta('meta[property="og:type"]', 'og:type', type);
    setMeta('meta[property="og:url"]', 'og:url', pageUrl);
    setMeta('meta[property="og:image"]', 'og:image', image ? new URL(image, window.location.origin).toString() : '');
    setMeta('meta[name="twitter:card"]', 'twitter:card', image ? 'summary_large_image' : 'summary');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = pageUrl;
  }, [title, description, image, type]);
}
