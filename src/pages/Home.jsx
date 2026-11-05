import { Link } from 'react-router'
import { ArrowRight, Award, BrainCircuit, CircuitBoard, Cpu, FileText, Lightbulb, MapPin, Radar, Recycle, Sparkles } from 'lucide-react'
import BuildSlot from '../components/intro/BuildSlot'
import { BUILD_AT } from '../components/intro/timeline'
import ProjectCard from '../components/ProjectCard'
import { GitHubIcon, LinkedInIcon } from '../components/BrandIcons'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { featuredProjects, getProject, projectPath } from '../lib/projects'
import { about, home } from '../data/profile'
import { site } from '../data/site'
import headshot from '../assets/images/headshot.jpg'

const FOCUS_ICONS = {
  thesis: Cpu,
  'brainwaves-ssl': BrainCircuit,
  'recycling-sorter': Recycle,
  'waterborne-gpr': Radar,
}

// "I am always looking for great opportunities! Feel free to reach out anytime."
const CONTACT_LINE = about.bio.slice(about.bio.indexOf('I am always looking'))

export default function Home() {
  useDocumentMeta({ path: '/' })
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <ContactBand />
    </>
  )
}

function Hero() {
  const [titleLead, titleRest] = splitHeading(home.heading)
  const focus = home.focus.map((f) => ({ ...f, project: getProject(f.project) })).filter((f) => f.project)

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-heading">
      <div aria-hidden className="absolute inset-0 -z-10 bg-blueprint mask-fade" />
      <div aria-hidden className="absolute -top-40 -right-32 -z-10 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgb(37_99_235/0.16),transparent_65%)]" />
      <div aria-hidden className="absolute -bottom-48 -left-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgb(56_189_248/0.14),transparent_65%)]" />

      <div className="container-page grid items-center gap-12 pt-10 pb-16 sm:pt-14 md:pb-20 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="order-2 lg:order-1">
          <BuildSlot at={BUILD_AT.heroEyebrow} target="hero-eyebrow" label="<Eyebrow />" className="inline-block">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pr-3.5 pl-2 text-xs font-medium whitespace-nowrap sm:gap-2.5 sm:pr-4 sm:text-sm text-navy-800 shadow-sm ring-1 ring-navy-100 backdrop-blur">
              <span className="relative grid h-5 w-5 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/40" />
                <span className="h-2 w-2 rounded-full bg-sky-500" />
              </span>
              <span className="font-semibold">{site.name}</span>
              <span aria-hidden className="text-navy-200">/</span>
              <span className="text-slate-600">{about.title}</span>
            </p>
          </BuildSlot>

          <BuildSlot at={BUILD_AT.heroTitle} target="hero-title" label="<Hero.Title />" className="mt-6">
            <h1 id="hero-heading" className="text-[2.35rem] leading-[1.06] font-bold tracking-tight sm:text-5xl lg:text-[3.5rem]">
              {titleLead}{' '}
              <span className="bg-gradient-to-r from-navy-800 via-accent to-sky-500 bg-clip-text text-transparent">{titleRest}</span>
            </h1>
          </BuildSlot>

          <BuildSlot at={BUILD_AT.heroText} target="hero-text" label="<Hero.Intro />" className="mt-6">
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">{home.intro}</p>
          </BuildSlot>

          <BuildSlot at={BUILD_AT.heroActions} target="hero-actions" label="<Actions />" className="mt-9" contentClassName="flex flex-wrap items-center gap-3">
            <Link to="/projects" className="btn btn-primary btn-lg">
              Projects <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg">
              About Me
            </Link>
            <span className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" aria-hidden />
            <div className="flex items-center gap-1">
              <a href={site.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid h-11 w-11 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-navy-900 hover:shadow-sm">
                <GitHubIcon />
              </a>
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid h-11 w-11 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-navy-900 hover:shadow-sm">
                <LinkedInIcon />
              </a>
              <a href={site.resume} target="_blank" rel="noopener noreferrer" aria-label="Resume (PDF)" className="grid h-11 w-11 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-navy-900 hover:shadow-sm">
                <FileText className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </BuildSlot>

          <BuildSlot at={BUILD_AT.heroFocus} target="hero-focus" label="<Focus />" className="mt-9">
            <ul className="flex flex-wrap gap-2" aria-label="Project focus areas">
              {focus.map(({ label, project }) => {
                const Icon = FOCUS_ICONS[project.slug] ?? Sparkles
                return (
                  <li key={label}>
                    <Link
                      to={projectPath(project)}
                      className="group inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-0.5 hover:text-navy-950 hover:ring-navy-300"
                    >
                      <Icon className="h-4 w-4 text-accent" aria-hidden />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </BuildSlot>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[13.5rem] sm:max-w-xs lg:order-2 lg:max-w-md">
          <BuildSlot at={BUILD_AT.heroDecor} target="hero-decor" className="absolute! -inset-[14%] -z-10" contentClassName="h-full w-full">
            <OrbitDecor />
          </BuildSlot>

          <BuildSlot at={BUILD_AT.heroPhoto} target="hero-photo" label="<Headshot />">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-navy-100 shadow-[0_30px_60px_-20px_rgb(15_34_64/0.45)] ring-1 ring-navy-900/10">
              <img src={headshot} alt="Drew Crix headshot" width="800" height="800" fetchPriority="high" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/45 to-transparent" />
              <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-navy-900 shadow backdrop-blur">
                <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden /> {site.location}
              </span>
            </div>
          </BuildSlot>

          <BuildSlot at={BUILD_AT.heroChips} target="hero-chips" variant="fade" className="absolute! inset-0 hidden sm:block" contentClassName="relative h-full w-full">
            <FloatingChips />
          </BuildSlot>
        </div>
      </div>
    </section>
  )
}

/** "Building The Future: Engineering, ..." → ["Building The Future:", "Engineering, ..."] */
function splitHeading(text) {
  const i = text.indexOf(':')
  return i === -1 ? [text, ''] : [text.slice(0, i + 1), text.slice(i + 2)]
}

function OrbitDecor() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <g className="origin-center animate-spin-slow" style={{ transformBox: 'fill-box' }}>
        <circle cx="200" cy="200" r="190" fill="none" stroke="rgb(15 34 64 / 0.12)" strokeDasharray="2 7" strokeWidth="1.5" />
        <circle cx="200" cy="10" r="5" fill="#2563eb" />
        <circle cx="390" cy="200" r="3.5" fill="#38bdf8" />
      </g>
      <g className="origin-center animate-spin-slower" style={{ transformBox: 'fill-box' }}>
        <circle cx="200" cy="200" r="165" fill="none" stroke="rgb(37 99 235 / 0.18)" strokeWidth="1" />
        <circle cx="35" cy="200" r="4" fill="#0f2240" />
        <rect x="290" y="330" width="8" height="8" rx="2" fill="#38bdf8" transform="rotate(20 294 334)" />
      </g>
    </svg>
  )
}

const CHIP_POSITIONS = [
  'top-[8%] -left-[18%] animate-float',
  'top-[44%] -right-[16%] animate-float-slow [animation-delay:-2s]',
  'bottom-[6%] -left-[10%] animate-float [animation-delay:-4s]',
]

const HIGHLIGHT_ICONS = { award: Award, idea: Lightbulb, pcb: CircuitBoard }

function FloatingChips() {
  return home.highlights.slice(0, 3).map(({ label, sub, icon, project, hash }, i) => {
    const Icon = HIGHLIGHT_ICONS[icon] ?? Sparkles
    const target = getProject(project)
    if (!target) return null
    return (
      <Link
        key={label}
        to={`${projectPath(target)}${hash ? `#${hash}` : ''}`}
        className={`absolute flex items-center gap-2.5 rounded-2xl bg-white/95 py-2 pr-3.5 pl-2 shadow-[0_14px_30px_-12px_rgb(15_34_64/0.35)] ring-1 ring-navy-100 backdrop-blur transition hover:ring-navy-300 ${CHIP_POSITIONS[i]}`}
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-50 text-accent">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="leading-tight">
          <span className="block text-xs font-semibold text-navy-950">{label}</span>
          <span className="block text-[11px] text-slate-500">{sub}</span>
        </span>
      </Link>
    )
  })
}

function FeaturedProjects() {
  return (
    <section className="relative border-t border-slate-200/70 bg-slate-50/80 py-16 sm:py-20" aria-labelledby="featured-heading" id="features">
      <div className="container-page">
        <BuildSlot at={BUILD_AT.featured} target="featured" label="<FeaturedProjects />">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-navy-800 to-navy-700 text-white">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                </span>
                Selected work
              </p>
              <h2 id="featured-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {home.featuredTitle}
              </h2>
            </div>
            <Link to="/projects" className="btn btn-secondary hidden sm:inline-flex">
              View All Projects <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </BuildSlot>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProjects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/projects" className="btn btn-primary btn-lg">
            View All Projects <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ContactBand() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 px-6 py-12 text-white shadow-[0_30px_60px_-30px_rgb(15_34_64/0.6)] sm:px-12 sm:py-14">
          <div aria-hidden className="absolute inset-0 -z-10 bg-blueprint opacity-60 invert" />
          <div aria-hidden className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(56_189_248/0.35),transparent_65%)]" />
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Contact Me</h2>
              <p className="mt-3 text-lg text-navy-100">{CONTACT_LINE}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn btn-lg bg-white text-navy-950 hover:-translate-y-0.5 hover:bg-navy-50">
                Contact <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a href={site.resume} target="_blank" rel="noopener noreferrer" className="btn btn-lg text-white ring-1 ring-white/30 hover:-translate-y-0.5 hover:bg-white/10">
                <FileText className="h-4 w-4" aria-hidden /> Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
