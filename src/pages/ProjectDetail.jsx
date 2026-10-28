import { Link, useParams } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, ExternalLink, FileText, Hash } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ProjectImage from '../components/ProjectImage'
import RichText from '../components/RichText'
import { GitHubIcon } from '../components/BrandIcons'
import NotFound from './NotFound'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { getAdjacentProjects, getProject, projectPath, toHref } from '../lib/projects'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
}

/** Shared layout for every project page; all content comes from projects.json. */
export default function ProjectDetail() {
  const { slug } = useParams()
  const project = getProject(slug)
  useDocumentMeta({
    title: project?.seo?.title ?? project?.title,
    description: project?.seo?.description,
    path: project ? projectPath(project) : undefined,
  })
  if (!project) return <NotFound />

  const { previous, next } = getAdjacentProjects(project.slug)

  return (
    <article key={project.slug}>
      <PageHeader>
        <div className="container-page max-w-4xl pt-8 pb-12 sm:pt-10 sm:pb-14">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <li>
                <Link to="/projects" className="inline-flex items-center gap-1.5 font-medium hover:text-navy-900">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Projects
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </li>
              <li aria-current="page" className="text-slate-700">
                {project.navLabel}
              </li>
            </ol>
          </nav>

          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <HeroFigure image={project.image} />
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.08 }}>
            <h1 className="mt-8 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{project.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {project.date && (
                <span className="mr-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <Calendar className="h-4 w-4" aria-hidden /> {project.date}
                </span>
              )}
              <ul className="flex flex-wrap gap-2" aria-label="Skills">
                {project.badges?.map((badge) => (
                  <li key={badge} className="badge">
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </PageHeader>

      <div className="container-page max-w-3xl py-12 sm:py-16">
        {project.sections.map((section, i) => (
          <motion.section
            key={section.id ?? i}
            id={section.id}
            className="mb-10 scroll-mt-24 last:mb-0"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ duration: 0.45 }}
          >
            {section.heading && (
              <h2 className="group mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-l-4 border-transparent pl-3 text-2xl font-semibold tracking-tight transition-colors hover:border-accent">
                <a href={`#${section.id}`} className="inline-flex items-center gap-2">
                  {section.heading}
                  <Hash className="h-4 w-4 text-slate-300 opacity-0 transition group-hover:opacity-100" aria-hidden />
                </a>
                {section.date && <span className="text-xs font-medium text-slate-500">{section.date}</span>}
              </h2>
            )}
            <div className="space-y-5">
              {section.paragraphs.map((text, j) => (
                <p key={j} className="prose-lead whitespace-pre-line">
                  <RichText text={text} />
                </p>
              ))}
            </div>
          </motion.section>
        ))}

        {project.links?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={toHref(link.href)}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-lg ${link.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
              >
                {link.kind === 'github' ? <GitHubIcon className="h-4.5 w-4.5" /> : link.kind === 'report' ? <FileText className="h-4.5 w-4.5" aria-hidden /> : <ExternalLink className="h-4.5 w-4.5" aria-hidden />}
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {previous && next && previous.slug !== project.slug && (
        <nav aria-label="More projects" className="border-t border-slate-200 bg-slate-50/80">
          <div className="container-page grid max-w-4xl gap-4 py-10 sm:grid-cols-2">
            <AdjacentLink project={previous} direction="previous" />
            <AdjacentLink project={next} direction="next" />
          </div>
        </nav>
      )}
    </article>
  )
}

function HeroFigure({ image }) {
  if (image.fit === 'contain') {
    return (
      <ProjectImage
        image={image}
        eager
        className="rounded-2xl shadow-[0_24px_50px_-24px_rgb(15_34_64/0.45)] ring-1 ring-slate-200"
        imgClassName="mx-auto max-h-[460px]"
      />
    )
  }
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-navy-950 shadow-[0_24px_50px_-24px_rgb(15_34_64/0.5)] ring-1 ring-slate-200">
      <img src={image.src} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        fetchPriority="high"
        className="mx-auto max-h-[520px] w-auto object-contain"
      />
    </div>
  )
}

function AdjacentLink({ project, direction }) {
  const isNext = direction === 'next'
  return (
    <Link
      to={projectPath(project)}
      className={`group card-surface flex min-w-0 items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${isNext ? 'sm:flex-row-reverse sm:text-right' : ''}`}
    >
      <ProjectImage image={project.image} className="h-16 w-20 shrink-0 rounded-xl bg-slate-100" imgClassName={project.image.fit === 'contain' ? 'p-1.5!' : ''} />
      <span className="min-w-0">
        <span className={`flex items-center gap-1 text-xs font-semibold tracking-wide text-accent uppercase ${isNext ? 'sm:justify-end' : ''}`}>
          {isNext ? (
            <>
              Next <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
            </>
          ) : (
            <>
              <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" aria-hidden /> Previous
            </>
          )}
        </span>
        <span className="mt-1 block truncate font-display font-semibold text-navy-950">{project.navLabel}</span>
      </span>
    </Link>
  )
}
