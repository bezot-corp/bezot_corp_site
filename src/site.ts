import { defaultLocale, isLocale, locales, type Locale } from './i18n/locales';
import { pages } from './generated/pages';

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
};

export type RouteMatch =
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

  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
}

function getLang(locale: Locale) {
  return locale.startsWith('fr') ? 'fr' : 'en';
}

export function getPathForLocaleAndSlug(locale: Locale, slug: string) {
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

export function findPageByLocaleAndSlug(locale: Locale, slug = '') {
  const page = pages.find((entry) => entry.locales[locale].slug === slug);

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
    robots: 'index, follow',
    lang: getLang(locale),
    canonicalPath: getPathForLocaleAndSlug(locale, content.slug),
    alternates,
  };
}

export function getNotFoundSeo(locale: Locale): SeoMetadata {
  return {
    title: locale === 'fr-fr' ? 'Page introuvable - Bezot Corp' : 'Page not found - Bezot Corp',
    description:
      locale === 'fr-fr'
        ? 'Cette URL ne correspond a aucune page publiee.'
        : 'This URL does not match any published page.',
    robots: 'noindex, nofollow',
    lang: getLang(locale),
    alternates: [],
  };
}

export function resolveRoute(pathname: string): RouteMatch {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return {
      kind: 'not-found',
      locale: defaultLocale,
      path: normalizedPath,
      seo: getNotFoundSeo(defaultLocale),
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

  return {
    kind: 'page',
    locale,
    path: getPathForLocaleAndSlug(locale, slug),
    page: pageMatch.page,
    content: pageMatch.content,
    seo: getPageSeo(pageMatch.page, locale),
  };
}

export function getPrerenderRoutes() {
  return pages.flatMap((page) =>
    locales.map((locale) => ({
      path: getPathForLocaleAndSlug(locale, page.locales[locale].slug),
      seo: getPageSeo(page, locale),
    })),
  );
}
