import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverEntryPath = path.join(distDir, 'server', 'entry-server.js');
const templatePath = path.join(distDir, 'index.html');

const template = readFileSync(templatePath, 'utf-8');
const serverEntry = await import(pathToFileURL(serverEntryPath).href);
const { render, getPrerenderRoutes } = serverEntry;

const siteUrl = 'https://bezotcorp.com';

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function absoluteUrl(routePath) {
  return new URL(routePath, siteUrl).toString();
}

function buildHeadTags(seo) {
  const tags = [
    `<meta name="description" content="${escapeHtml(seo.description ?? '')}">`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}">`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.description ?? '')}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ];

  if (seo.canonicalPath) {
    tags.push(`<link rel="canonical" href="${escapeHtml(absoluteUrl(seo.canonicalPath))}">`);
  }

  seo.alternates.forEach((alternate) => {
    tags.push(
      `<link rel="alternate" hreflang="${alternate.locale}" href="${escapeHtml(absoluteUrl(alternate.path))}">`,
    );
  });

  return tags.join('\n    ');
}

function renderDocument(routePath) {
  const { appHtml, seo } = render(routePath);

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${seo.lang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(seo.title)}</title>`)
    .replace('<div id="root"></div>', `<div id=\"root\">${appHtml}</div>`)
    .replace('</head>', `    ${buildHeadTags(seo)}\n  </head>`);
}

function writeRoute(routePath, html) {
  const trimmedPath = routePath.replace(/^\//, '');
  const routeDir = path.join(distDir, trimmedPath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(path.join(routeDir, 'index.html'), html);
}

for (const route of getPrerenderRoutes()) {
  writeRoute(route.path, renderDocument(route.path));
}

writeFileSync(path.join(distDir, '404.html'), renderDocument('/404'));

const sitemapEntries = getPrerenderRoutes()
  .map((route) => {
    const alternateLinks = route.seo.alternates
      .map(
        (alternate) =>
          `    <xhtml:link rel="alternate" hreflang="${alternate.locale}" href="${absoluteUrl(alternate.path)}" />`,
      )
      .join('\n');

    return `  <url>\n    <loc>${absoluteUrl(route.path)}</loc>\n${alternateLinks}\n  </url>`;
  })
  .join('\n');

writeFileSync(
  path.join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapEntries}\n</urlset>\n`,
);

writeFileSync(path.join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

rmSync(path.join(distDir, 'server'), { recursive: true, force: true });

console.log('Prerender complete');
