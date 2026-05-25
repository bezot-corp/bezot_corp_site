import { pages, site } from './generated/site';
import { defaultLocale, isLocale, locales, type Locale } from './i18n/locales';

export const siteUrl = site.baseUrl;
export const siteName = site.name;
export const defaultOgImage = site.defaultOgImage;

export type SitePage = (typeof pages)[number];
export type SitePageContent = SitePage['locales'][Locale];

export type SeoAlternate = {
  locale: Locale;
  path: string;
};

export type SeoMetadata = {
  title: string;
  description?: string;
  robots: string;
  lang: string;
  canonicalPath?: string;
  alternates: SeoAlternate[];
  ogTitle: string;
  ogDescription?: string;
  ogImage: string;
};

export type RouteMatch =
  | {
      kind: 'root';
      locale: Locale;
      path: '/';
      seo: SeoMetadata;
    }
  | {
      kind: 'page';
      locale: Locale;
      path: string;
      page: SitePage;
      content: SitePageContent;
      seo: SeoMetadata;
    }
  | {
      kind: 'not-found';
      locale: Locale;
      path: string;
      seo: SeoMetadata;
    };

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function getLang(locale: Locale) {
  return locale.split('-')[0];
}

export function getPathForLocaleAndSlug(locale: Locale, slug: string) {
  return normalizePathname(slug ? `/${locale}/${slug}` : `/${locale}`);
}

export function getCanonicalPath(path: string) {
  return normalizePathname(path);
}

export function findPageByLocaleAndSlug(locale: Locale, slug = '') {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');

  const page = pages.find(
    (entry) => entry.status === 'published' && entry.locales[locale].slug === normalizedSlug,
  );

  if (!page) {
    return null;
  }

  return {
    page,
    content: page.locales[locale],
  };
}

export function getPageSeo(page: SitePage, locale: Locale): SeoMetadata {
  const content = page.locales[locale];

  const alternates = locales.map((entryLocale) => ({
    locale: entryLocale,
    path: getPathForLocaleAndSlug(entryLocale, page.locales[entryLocale].slug),
  }));

  return {
    title: content.seo.title,
    description: content.seo.description,
    robots: content.seo.robots ?? 'index, follow',
    lang: getLang(locale),
    canonicalPath: getPathForLocaleAndSlug(locale, content.slug),
    alternates,
    ogTitle: content.seo.ogTitle,
    ogDescription: content.seo.ogDescription,
    ogImage: content.seo.ogImage ?? defaultOgImage,
  };
}

export function getRootSeo(): SeoMetadata {
  return {
    title: siteName,
    description: 'Choose your language to visit Bezot Corp.',
    robots: 'index, follow',
    lang: 'fr',
    canonicalPath: '/',
    alternates: locales.map((locale) => ({
      locale,
      path: getPathForLocaleAndSlug(locale, ''),
    })),
    ogTitle: siteName,
    ogDescription: 'Choose your language to visit Bezot Corp.',
    ogImage: defaultOgImage,
  };
}

export function getNotFoundSeo(locale: Locale): SeoMetadata {
  const title = locale === 'fr-fr' ? `Page introuvable - ${siteName}` : `Page not found - ${siteName}`;

  const description =
    locale === 'fr-fr'
      ? 'Cette URL ne correspond à aucune page publiée.'
      : 'This URL does not match any published page.';

  return {
    title,
    description,
    robots: 'noindex, nofollow',
    lang: getLang(locale),
    alternates: [],
    ogTitle: title,
    ogDescription: description,
    ogImage: defaultOgImage,
  };
}

export function resolveRoute(pathname: string): RouteMatch {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return {
      kind: 'root',
      locale: defaultLocale,
      path: '/',
      seo: getRootSeo(),
    };
  }

  const [localeSegment, ...slugSegments] = segments;

  if (!isLocale(localeSegment)) {
    return {
      kind: 'not-found',
      locale: defaultLocale,
      path: normalizedPath,
      seo: getNotFoundSeo(defaultLocale),
    };
  }

  const locale = localeSegment;
  const slug = slugSegments.join('/');
  const pageMatch = findPageByLocaleAndSlug(locale, slug);

  if (!pageMatch) {
    return {
      kind: 'not-found',
      locale,
      path: normalizedPath,
      seo: getNotFoundSeo(locale),
    };
  }

  const path = getPathForLocaleAndSlug(locale, pageMatch.content.slug);

  return {
    kind: 'page',
    locale,
    path,
    page: pageMatch.page,
    content: pageMatch.content,
    seo: getPageSeo(pageMatch.page, locale),
  };
}

export function getPagePath(pageId: SitePage['id'], locale: Locale) {
  const page = pages.find((entry) => entry.id === pageId && entry.status === 'published');

  if (!page) {
    return null;
  }

  return getPathForLocaleAndSlug(locale, page.locales[locale].slug);
}

export function getPrerenderRoutes() {
  return [
    {
      path: '/',
      seo: getRootSeo(),
    },
    ...pages
      .filter((page) => page.status === 'published')
      .flatMap((page) =>
        locales.map((locale) => ({
          path: getPathForLocaleAndSlug(locale, page.locales[locale].slug),
          seo: getPageSeo(page, locale),
        })),
      ),
  ];
}
