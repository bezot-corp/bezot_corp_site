import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const pagesInputPath = 'content/pages.json';
const postsInputDir = 'content/posts';
const outputPath = 'src/generated/site.ts';

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function collectJsonFiles(dirPath) {
  if (!existsSync(dirPath)) return [];

  return readdirSync(dirPath)
    .flatMap((entry) => {
      const entryPath = path.join(dirPath, entry);
      return statSync(entryPath).isDirectory()
        ? collectJsonFiles(entryPath)
        : entryPath.endsWith('.json')
          ? [entryPath]
          : [];
    })
    .sort();
}

const source = readJson(pagesInputPath);

const posts = collectJsonFiles(postsInputDir)
  .map(readJson)
  .sort((a, b) => String(b.publishedAt ?? '').localeCompare(String(a.publishedAt ?? '')));

mkdirSync('src/generated', { recursive: true });

const output = `// This file is generated. Do not edit manually.

export const site = ${JSON.stringify(source.site, null, 2)} as const;

export const redirects = ${JSON.stringify(source.redirects ?? [], null, 2)} as const;

export const gone = ${JSON.stringify(source.gone ?? [], null, 2)} as const;

export const pages = ${JSON.stringify(source.pages, null, 2)} as const;

export const posts = ${JSON.stringify(posts, null, 2)} as const;

export type GeneratedSite = typeof site;
export type GeneratedPage = (typeof pages)[number];
export type GeneratedPost = (typeof posts)[number];
export type GeneratedLocale = (typeof site.locales)[number];
export type GeneratedEntry = GeneratedPage | GeneratedPost;
export type GeneratedBlock =
  GeneratedEntry["locales"][GeneratedLocale]["blocks"][number];
`;

writeFileSync(outputPath, output);
console.log(`Generated ${outputPath}`);
