// Runs after `vite build` to make the single-page app work well on GitHub Pages:
//
//  1. Writes dist/<route>/index.html for every known route with its own <title>,
//     description, canonical URL and Open Graph tags. GitHub Pages then serves a
//     real page (HTTP 200) on direct visits and refreshes, not a 404.
//  2. Writes dist/404.html (the app shell) so unknown URLs still load the app,
//     which shows its own "not found" page.
//  3. Writes sitemap.xml and robots.txt.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const { site } = await import(pathToFileURL(path.join(root, 'src/data/site.js')))
const { projects } = JSON.parse(readFileSync(path.join(root, 'src/data/projects.json'), 'utf8'))

const shell = readFileSync(path.join(dist, 'index.html'), 'utf8')
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const urlFor = (route) => `${site.url}${route === '/' ? '/' : `${route}/`}`

const routes = [
  { route: '/', title: site.seo.title, description: site.seo.description },
  { route: '/projects', title: `Projects | ${site.name}`, description: 'All engineering, research, and software projects by Drew Crix.' },
  { route: '/about', title: `About | ${site.name}`, description: 'About Drew Crix' },
  { route: '/contact', title: `Contact | ${site.name}`, description: 'Contact Drew Crix.' },
  ...projects.map((p) => ({
    route: `/projects/${p.slug}`,
    title: `${p.seo?.title ?? p.title} | ${site.name}`,
    description: p.seo?.description ?? p.card.description,
  })),
]

function pageFor({ route, title, description }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const u = escapeHtml(urlFor(route))
  return shell
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${u}$2`)
}

function write(file, contents) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

for (const page of routes) {
  const file = page.route === '/' ? path.join(dist, 'index.html') : path.join(dist, page.route, 'index.html')
  write(file, pageFor(page))
}

write(
  path.join(dist, '404.html'),
  pageFor({ route: '/', title: `Page not found | ${site.name}`, description: site.seo.description }).replace(
    '<head>',
    '<head>\n    <meta name="robots" content="noindex" />',
  ),
)

const today = new Date().toISOString().slice(0, 10)
write(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(({ route }) => `  <url><loc>${urlFor(route)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
)
write(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`)

console.log(`postbuild: ${routes.length} routes, 404.html, sitemap.xml, robots.txt`)
