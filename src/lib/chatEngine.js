// Rule-based intent matching for the portfolio guide. Pure JavaScript with no
// browser or bundler dependencies so it can be unit tested with `node --test`.

const PROJECT_WEIGHT = 3

export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function toMatcher(pattern) {
  if (pattern instanceof RegExp) return (text) => pattern.test(text)
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalize(pattern))}($|[^a-z0-9])`)
  return (text) => re.test(text)
}

const projectPath = (project) => `/projects/${project.slug}`

export function createChatEngine({ projects, intents, fallback, site, profile }) {
  const compiledIntents = intents.map((intent) => ({
    ...intent,
    matchers: intent.patterns.map(toMatcher),
  }))

  const compiledProjects = projects.map((project) => {
    const terms = new Set(
      [
        ...(project.chatbot?.keywords ?? []),
        project.slug.replace(/-/g, ' '),
        project.navLabel,
        project.card?.title,
      ]
        .filter(Boolean)
        .map(normalize),
    )
    return { project, matchers: [...terms].map(toMatcher) }
  })

  const projectActions = (list, limit = 8) =>
    list.slice(0, limit).map((p) => ({ label: p.navLabel ?? p.card.title, intent: `project:${p.slug}` }))

  const ctx = {
    site,
    profile,
    projects,
    projectActions,
    projectsIn: (category) => projects.filter((p) => p.categories?.includes(category)),
    repositories: () => {
      const seen = new Set()
      const repos = []
      for (const p of projects) {
        const hrefs = [
          ...(p.links ?? []).filter((l) => l.kind === 'github').map((l) => l.href),
          ...(p.sections ?? [])
            .flatMap((s) => s.paragraphs ?? [])
            .flatMap((text) => [...text.matchAll(/\]\((https:\/\/github\.com\/[^)]+)\)/g)].map((m) => m[1])),
        ]
        for (const href of hrefs) {
          if (seen.has(href)) continue
          seen.add(href)
          repos.push({ label: `${p.navLabel} code`, href })
        }
      }
      return repos
    },
  }

  function projectReply(project) {
    const intro =
      project.chatbot?.intro ?? `Here's ${project.card.title}: ${project.card.description} Let me take you there!`
    return {
      text: intro,
      navigate: projectPath(project),
      actions: [
        ...(project.links ?? []).map((l) => ({
          label: l.label,
          href: l.href,
          external: true,
        })),
        { label: 'All projects', intent: 'projects' },
      ],
    }
  }

  /** Runs a specific intent id, e.g. 'projects' or 'project:thesis'. */
  function run(intentId) {
    if (intentId?.startsWith('project:')) {
      const project = projects.find((p) => p.slug === intentId.slice('project:'.length))
      return project ? projectReply(project) : { ...fallback }
    }
    const intent = compiledIntents.find((i) => i.id === intentId)
    return intent ? intent.reply(ctx) : { ...fallback }
  }

  /** Scores every intent and project against free text. Exposed for tests. */
  function classify(input) {
    const text = normalize(input)
    if (!text) return { type: 'fallback' }

    let best = { type: 'fallback', score: 0 }
    for (const intent of compiledIntents) {
      const hits = intent.matchers.filter((m) => m(text)).length
      if (!hits) continue
      const score = intent.weight + (hits - 1) * 0.1
      if (score > best.score) best = { type: 'intent', id: intent.id, score }
    }

    const projectHits = compiledProjects
      .map(({ project, matchers }) => ({ project, hits: matchers.filter((m) => m(text)).length }))
      .filter((p) => p.hits > 0)
      .sort((a, b) => b.hits - a.hits)

    if (projectHits.length) {
      const topHits = projectHits[0].hits
      const score = PROJECT_WEIGHT + (topHits - 1) * 0.5
      if (score >= best.score) {
        const tied = projectHits.filter((p) => p.hits === topHits).map((p) => p.project)
        return tied.length > 1
          ? { type: 'projects', projects: tied, score }
          : { type: 'project', project: tied[0], score }
      }
    }
    return best
  }

  /** Returns the guide's reply to free text typed by the visitor. */
  function respond(input) {
    const match = classify(input)
    switch (match.type) {
      case 'project':
        return projectReply(match.project)
      case 'projects':
        return {
          text: 'I found a few projects that match — which one would you like to see?',
          actions: projectActions(match.projects),
        }
      case 'intent':
        return run(match.id)
      default:
        return { ...fallback }
    }
  }

  return { respond, run, classify }
}
