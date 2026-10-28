import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowUpRight, Calendar } from 'lucide-react'
import ProjectImage from './ProjectImage'
import { projectPath } from '../lib/projects'

/** Card used by both the homepage featured grid and the Projects page. */
export default function ProjectCard({ project, index = 0, headingLevel = 'h3' }) {
  const Heading = headingLevel
  const to = projectPath(project)
  return (
    <motion.article
      layout
      className="group card-surface flex h-full flex-col overflow-hidden transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgb(15_34_64/0.04),0_24px_48px_-16px_rgb(15_34_64/0.28)]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={to} tabIndex={-1} aria-hidden className="relative block">
        <ProjectImage
          image={project.image}
          className="aspect-[16/10] bg-slate-100"
          imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {project.categories?.[0] && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-navy-800 shadow-sm backdrop-blur">
            {project.categories[0]}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {project.date && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Calendar className="h-3.5 w-3.5" aria-hidden /> {project.date}
          </p>
        )}
        <Heading className="font-display text-lg leading-snug font-semibold text-navy-950">
          <Link to={to} className="transition-colors hover:text-accent">
            {project.card.title}
          </Link>
        </Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{project.card.description}</p>

        {project.badges?.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
            {project.badges.slice(0, 2).map((b) => (
              <li key={b} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {b}
              </li>
            ))}
            {project.badges.length > 2 && (
              <li className="rounded-md px-1 py-0.5 text-[11px] font-medium text-slate-400">+{project.badges.length - 2}</li>
            )}
          </ul>
        )}

        <Link
          to={to}
          className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
          aria-label={`View Project: ${project.card.title}`}
        >
          View Project
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </Link>
      </div>
    </motion.article>
  )
}
