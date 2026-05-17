import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const inputPath = 'content/pages.json';
const outputPath = 'src/generated/site.ts';

const source = JSON.parse(readFileSync(inputPath, 'utf-8'));

mkdirSync('src/generated', { recursive: true });

const output = `// This file is generated. Do not edit manually.

export const site = ${JSON.stringify(source.site, null, 2)} as const;

export const redirects = ${JSON.stringify(source.redirects ?? [], null, 2)} as const;

export const gone = ${JSON.stringify(source.gone ?? [], null, 2)} as const;

export const pages = ${JSON.stringify(source.pages, null, 2)} as const;

export type GeneratedSite = typeof site;
export type GeneratedPage = (typeof pages)[number];
export type GeneratedLocale = (typeof site.locales)[number];
export type GeneratedBlock =
  GeneratedPage["locales"][GeneratedLocale]["blocks"][number];
`;

writeFileSync(outputPath, output);
console.log(`Generated ${outputPath}`);
