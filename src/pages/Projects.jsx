import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LayoutGrid } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ProjectCard from '../components/ProjectCard'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { projectCategories, projects } from '../lib/projects'
import { home } from '../data/profile'

// "Here, I discuss some of my favorite projects I am working on and have completed."
const SUBTITLE = home.intro.slice(home.intro.indexOf('Here, I discuss'))
const ALL = 'All'

export default function Projects() { 
  useDocumentMeta({
    title: 'Projects',
    description: `All engineering, research, and software projects by Drew Crix.`,
    path: '/projects',
  })
  const [category, setCategory] = useState(ALL)
  const visible = useMemo(
    () => (category === ALL ? projects : projects.filter((p) => p.categories.includes(category))),
    [category],
  )
  const filters = [ALL, ...projectCategories]

  return (
    <>
      <PageHeader>
        <div className="container-page py-14 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow">
              <LayoutGrid className="h-4 w-4" aria-hidden /> Portfolio
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Projects</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{SUBTITLE}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-navy-800 ring-1 ring-navy-100">
              <span className="font-display text-base font-bold text-accent">{projects.length}</span> projects
            </p>
          </motion.div>
        </div>
      </PageHeader>

      <section className="container-page py-10 sm:py-14" aria-label="All projects">
        <div className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter projects by category">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            {filters.map((f) => {
              const count = f === ALL ? projects.length : projects.filter((p) => p.categories.includes(f)).length
              const active = f === category
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(f)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                    active ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-navy-950 hover:ring-navy-300'
                  }`}
                >
                  {active && (
                    <motion.span layoutId="filter-active" className="absolute inset-0 -z-10 rounded-full bg-navy-900" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                  {f} <span className={active ? 'text-navy-200' : 'text-slate-400'}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} headingLevel="h2" />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  )
}
