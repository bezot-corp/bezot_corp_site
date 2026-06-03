import type { SeoMetadata } from './site';
import { siteConfig } from './site-config';

function toAbsoluteUrl(path: string) {
  return new URL(path, siteConfig.siteUrl).toString();
}

function toHrefLang(locale: string) {
  return locale === 'fr-fr' ? 'fr-FR' : locale === 'en-us' ? 'en-US' : locale;
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
  const description = seo.description ?? '';
  const ogTitle = seo.ogTitle ?? seo.title;
  const ogDescription = seo.ogDescription ?? description;

  document.title = seo.title;
  document.documentElement.lang = seo.lang;

  upsertMeta('meta[name="description"]', { name: 'description' }, description);
  upsertMeta('meta[name="robots"]', { name: 'robots' }, seo.robots);

  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, ogTitle);
  upsertMeta('meta[property="og:description"]', { property: 'og:description' }, ogDescription);
  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');

  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, ogTitle);
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, ogDescription);

  if (seo.canonicalPath) {
    const canonicalUrl = toAbsoluteUrl(seo.canonicalPath);

    upsertLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: canonicalUrl,
    });

    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
  }

  if (seo.ogImage) {
    const imageUrl = toAbsoluteUrl(seo.ogImage);

    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl);
  }

  document.head.querySelectorAll('link[rel="alternate"][data-managed="true"]').forEach((element) => element.remove());

  seo.alternates.forEach((alternate) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', toHrefLang(alternate.locale));
    link.setAttribute('href', toAbsoluteUrl(alternate.path));
    link.setAttribute('data-managed', 'true');
    document.head.appendChild(link);
  });

  const xDefault = document.createElement('link');
  xDefault.setAttribute('rel', 'alternate');
  xDefault.setAttribute('hreflang', 'x-default');
  xDefault.setAttribute('href', toAbsoluteUrl('/'));
  xDefault.setAttribute('data-managed', 'true');
  document.head.appendChild(xDefault);
}
