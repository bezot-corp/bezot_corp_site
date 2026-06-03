# Bezot Corp Site

Official website for Bezot Corp.

## Stack

- React
- TypeScript
- Vite
- React Router
- Custom prerender pipeline
- JSON-driven content

## Development

Run the development server:

    pnpm install
    pnpm dev

## Build

Create a production build:

    pnpm build

The build generates:

- prerendered static pages
- sitemap.xml
- robots.txt
- .htaccess
- 404.html

## Content

The source content lives in:

    content/pages.json
    content/blog.json

The generated TypeScript content lives in:

    src/generated/site.ts

Generated files must not be edited manually.

## Deployment

Deployment is handled by GitHub Actions.

On every push to main:

1. Dependencies are installed.
2. Content is generated.
3. The site is built and prerendered.
4. The dist folder is uploaded to OVH.
