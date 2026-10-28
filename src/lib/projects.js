// Loads src/data/projects.json and resolves each project's image file to the
// bundled asset URL. Components import project data from here only.

import data from '../data/projects.json'

const imageModules = import.meta.glob('../assets/projects/*.{jpg,jpeg,png,webp,avif,gif,svg}', {
  eager: true,
  import: 'default',
})

const imagesByFile = Object.fromEntries(
  Object.entries(imageModules).map(([modulePath, url]) => [modulePath.split('/').pop(), url]),
)

export const projects = data.projects.map((project) => ({
  ...project,
  image: { ...project.image, src: imagesByFile[project.image.file] },
}))

export const featuredProjects = projects.filter((p) => p.featured)

export const projectCategories = [...new Set(projects.flatMap((p) => p.categories))]

export const projectPath = (project) => `/projects/${project.slug}`

export const getProject = (slug) => projects.find((p) => p.slug === slug)

export function getAdjacentProjects(slug) {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i === -1) return {}
  return {
    previous: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  }
}

/** Encodes local file paths (e.g. reports with spaces in their names) for use in href. */
export const toHref = (href) => (href.startsWith('/') ? encodeURI(href) : href)

export const isExternal = (href) => /^(https?:)?\/\//.test(href) || href.endsWith('.pdf')
