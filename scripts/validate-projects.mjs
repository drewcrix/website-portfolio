// Validates src/data/projects.json before every build.
// Run manually with `npm run validate`. Exits non-zero with a list of problems.
// A future GitHub automation agent should run this after adding a project entry.

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LINK_KINDS = new Set(['report', 'github', 'external'])

export function validateProjects(data, { checkFiles = true } = {}) {
  const errors = []
  const err = (where, msg) => errors.push(`${where}: ${msg}`)
  const isText = (v) => typeof v === 'string' && v.trim().length > 0

  if (!Array.isArray(data?.projects)) return ['projects.json must contain a "projects" array']

  const slugs = new Set()
  data.projects.forEach((p, i) => {
    const where = `projects[${i}]${p?.slug ? ` (${p.slug})` : ''}`
    if (!SLUG.test(p.slug ?? '')) err(where, 'slug must be lowercase-kebab-case')
    if (slugs.has(p.slug)) err(where, 'duplicate slug')
    slugs.add(p.slug)

    if (!isText(p.navLabel)) err(where, 'navLabel is required')
    if (!isText(p.title)) err(where, 'title is required')
    if (!isText(p.card?.title)) err(where, 'card.title is required')
    if (!isText(p.card?.description)) err(where, 'card.description is required')
    if (typeof p.featured !== 'boolean') err(where, 'featured must be true or false')
    if (!Array.isArray(p.categories) || !p.categories.length) err(where, 'categories must be a non-empty array')
    if (p.badges && !Array.isArray(p.badges)) err(where, 'badges must be an array')
    if (p.date !== undefined && !isText(p.date)) err(where, 'date must be a non-empty string when present')

    if (!isText(p.image?.file)) err(where, 'image.file is required')
    else if (checkFiles && !existsSync(path.join(root, 'src/assets/projects', p.image.file)))
      err(where, `image file src/assets/projects/${p.image.file} not found`)
    if (!isText(p.image?.alt)) err(where, 'image.alt is required')

    if (!Array.isArray(p.sections) || !p.sections.length) err(where, 'at least one section is required')
    p.sections?.forEach((s, j) => {
      if (!Array.isArray(s.paragraphs) || !s.paragraphs.every(isText))
        err(`${where}.sections[${j}]`, 'paragraphs must be an array of non-empty strings')
      if (s.heading && !isText(s.id)) err(`${where}.sections[${j}]`, 'sections with a heading need an id')
    })

    p.links?.forEach((l, j) => {
      if (!isText(l.label) || !isText(l.href)) err(`${where}.links[${j}]`, 'label and href are required')
      if (l.kind && !LINK_KINDS.has(l.kind)) err(`${where}.links[${j}]`, `kind must be one of ${[...LINK_KINDS]}`)
      if (checkFiles && l.href?.startsWith('/') && !existsSync(path.join(root, 'public', l.href)))
        err(`${where}.links[${j}]`, `public${l.href} not found`)
    })

    if (p.chatbot?.keywords && !Array.isArray(p.chatbot.keywords)) err(where, 'chatbot.keywords must be an array')
  })

  if (!data.projects.some((p) => p.featured)) errors.push('at least one project should be featured')
  return errors
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(readFileSync(path.join(root, 'src/data/projects.json'), 'utf8'))
  const errors = validateProjects(data)
  if (errors.length) {
    console.error(`projects.json has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`)
    process.exit(1)
  }
  console.log(`projects.json OK (${data.projects.length} projects)`)
}
