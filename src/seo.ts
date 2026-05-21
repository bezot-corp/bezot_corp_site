import type { SeoMetadata } from './site';
import { siteConfig } from './site-config';

function toAbsoluteUrl(path: string) {
  return new URL(path, siteConfig.siteUrl).toString();
}

function upsertMeta(selector: string, attributes: Record<string, string>, content?: string) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });

  if (content !== undefined) {
    element.setAttribute('content', content);
  }
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

export function applySeo(seo: SeoMetadata) {
  document.title = seo.title;
  document.documentElement.lang = seo.lang;

  upsertMeta('meta[name="description"]', { name: 'description' }, seo.description ?? '');
  upsertMeta('meta[name="robots"]', { name: 'robots' }, seo.robots);
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, seo.title);
  upsertMeta('meta[property="og:description"]', { property: 'og:description' }, seo.description ?? '');
  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');

  if (seo.canonicalPath) {
    upsertLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: toAbsoluteUrl(seo.canonicalPath),
    });
  }

  document.head.querySelectorAll('link[rel="alternate"][data-managed="true"]').forEach((element) => element.remove());

  seo.alternates.forEach((alternate) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', alternate.locale);
    link.setAttribute('href', toAbsoluteUrl(alternate.path));
    link.setAttribute('data-managed', 'true');
    document.head.appendChild(link);
  });
}
