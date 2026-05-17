import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const inputPath = 'content/pages.json';
const outputPath = 'src/generated/pages.ts';

const pages = JSON.parse(readFileSync(inputPath, 'utf-8'));

mkdirSync('src/generated', { recursive: true });

const output = `// This file is generated. Do not edit manually.\n\nexport const pages = ${JSON.stringify(pages, null, 2)} as const;\n\nexport type GeneratedPage = (typeof pages)[number];\nexport type GeneratedLocale = keyof GeneratedPage["locales"];\nexport type GeneratedBlock = GeneratedPage["locales"][GeneratedLocale]["blocks"][number];\n`;

writeFileSync(outputPath, output);
console.log(`Generated ${outputPath}`);
