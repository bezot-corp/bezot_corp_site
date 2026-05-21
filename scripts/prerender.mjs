import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverEntryPath = path.join(distDir, 'server', 'entry-server.js');
const templatePath = path.join(distDir, 'index.html');
const contentPath = path.join(rootDir, 'content', 'pages.json');

const source = JSON.parse(readFileSync(contentPath, 'utf-8'));
const template = readFileSync(templatePath, 'utf-8');

const serverEntry = await import(pathToFileURL(serverEntryPath).href);
const { render, getPrerenderRoutes } = serverEntry;

const siteUrl = source.site.baseUrl;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeXml(value = '') {
  return escapeHtml(value).replaceAll("'", '&apos;');
}

function normalizePath(routePath) {
  if (!routePath || routePath === '/') return '/';
  return routePath.endsWith('/') ? routePath : `${routePath}/`;
}

function absoluteUrl(routePath) {
  return new URL(normalizePath(routePath), siteUrl).toString();
}

function absoluteAssetUrl(assetPath) {
  return new URL(assetPath, siteUrl).toString();
}

function toHrefLang(locale) {
  return locale === 'fr-fr' ? 'fr-FR' : locale === 'en-us' ? 'en-US' : locale;
}

function buildHeadTags(seo) {
  const tags = [
    `<meta name="description" content="${escapeHtml(seo.description ?? '')}">`,
    `<meta name="robots" content="${escapeHtml(seo.robots ?? 'index, follow')}">`,
  ];

  if (seo.canonicalPath) {
    const canonicalUrl = absoluteUrl(seo.canonicalPath);
    tags.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`);
    tags.push(`<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`);
  }

  seo.alternates.forEach((alternate) => {
    tags.push(
      `<link rel="alternate" hreflang="${toHrefLang(alternate.locale)}" href="${escapeHtml(
        absoluteUrl(alternate.path),
      )}">`,
    );
  });

  tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl('/'))}">`);

  tags.push(`<meta property="og:title" content="${escapeHtml(seo.ogTitle ?? seo.title)}">`);

  if (seo.ogDescription ?? seo.description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(seo.ogDescription ?? seo.description)}">`);
  }

  tags.push(`<meta property="og:type" content="website">`);

  if (seo.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(absoluteAssetUrl(seo.ogImage))}">`);
  }

  tags.push(`<meta name="twitter:card" content="summary_large_image">`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(seo.ogTitle ?? seo.title)}">`);

  if (seo.ogDescription ?? seo.description) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(seo.ogDescription ?? seo.description)}">`);
  }

  if (seo.ogImage) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(absoluteAssetUrl(seo.ogImage))}">`);
  }

  return tags.map((tag) => `    ${tag}`).join('\n');
}

function renderDocument(routePath) {
  const { appHtml, seo } = render(routePath);

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${escapeHtml(seo.lang)}">`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(seo.title)}</title>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace('</head>', `${buildHeadTags(seo)}\n  </head>`);
}

function writeRoute(routePath, html) {
  const trimmedPath = normalizePath(routePath).replace(/^\//, '').replace(/\/$/, '');
  const routeDir = trimmedPath ? path.join(distDir, trimmedPath) : distDir;

  mkdirSync(routeDir, { recursive: true });
  writeFileSync(path.join(routeDir, 'index.html'), html);
}

function findUpdatedAt(routePath) {
  for (const page of source.pages) {
    for (const locale of source.site.locales) {
      const content = page.locales[locale];
      const pagePath = content.slug ? `/${locale}/${content.slug}` : `/${locale}`;

      if (normalizePath(pagePath) === normalizePath(routePath)) {
        return page.updatedAt;
      }
    }
  }

  return undefined;
}

function buildSitemapAlternateLinks(route) {
  const links = route.seo.alternates.map(
    (alternate) =>
      `    <xhtml:link rel="alternate" hreflang="${toHrefLang(alternate.locale)}" href="${escapeXml(
        absoluteUrl(alternate.path),
      )}" />`,
  );

  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl('/'))}" />`);

  return links.join('\n');
}

function buildSitemap(routes) {
  const entries = routes
    .map((route) => {
      const alternateLinks = buildSitemapAlternateLinks(route);
      const lastmod = findUpdatedAt(route.path);
      const lastmodLine = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : '';

      return `  <url>
    <loc>${escapeXml(absoluteUrl(route.path))}</loc>${lastmodLine}
${alternateLinks}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

function escapeRewritePath(routePath) {
  return normalizePath(routePath)
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildHtaccess(routes) {
  const lines = [
    'RewriteEngine On',
    '',
    '# Existing files and directories',
    'RewriteCond %{REQUEST_FILENAME} -f [OR]',
    'RewriteCond %{REQUEST_FILENAME} -d',
    'RewriteRule ^ - [L]',
    '',
    '# Explicit redirects',
  ];

  for (const redirect of source.redirects ?? []) {
    if (redirect.from === '/') continue;

    const from = escapeRewritePath(redirect.from);
    const to = normalizePath(redirect.to);
    const status = redirect.status ?? 301;

    lines.push(`RewriteRule ^${from}/?$ ${to} [R=${status},L]`);
  }

  lines.push('', '# Gone URLs');

  for (const gonePath of source.gone ?? []) {
    const from = escapeRewritePath(gonePath);
    lines.push(`RewriteRule ^${from}/?$ - [G,L]`);
  }

  lines.push('', '# Known prerendered routes');

  for (const route of routes) {
    const routePattern = escapeRewritePath(route.path);

    if (!routePattern) {
      lines.push('RewriteRule ^$ /index.html [L]');
      continue;
    }

    lines.push(`RewriteRule ^${routePattern}/?$ /${routePattern}/index.html [L]`);
  }

  lines.push('', '# Real 404 for unknown URLs', 'ErrorDocument 404 /404.html', 'RewriteRule ^ - [R=404,L]', '');

  return `${lines.join('\n')}\n`;
}

const routes = getPrerenderRoutes();

for (const route of routes) {
  writeRoute(route.path, renderDocument(route.path));
}

writeFileSync(path.join(distDir, '404.html'), renderDocument('/404'));
writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemap(routes));
writeFileSync(
  path.join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', siteUrl).toString()}\n`,
);
writeFileSync(path.join(distDir, '.htaccess'), buildHtaccess(routes));

rmSync(path.join(distDir, 'server'), { recursive: true, force: true });

console.log('Prerender complete');
