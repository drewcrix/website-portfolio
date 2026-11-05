import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import BuildSlot from './intro/BuildSlot'
import { BUILD_AT } from './intro/timeline'
import { mainNav } from '../data/navigation'
import { site } from '../data/site'
import { projectPath, projects } from '../lib/projects'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || mobileOpen
          ? 'border-slate-200/80 bg-white/85 shadow-[0_6px_20px_-12px_rgb(15_34_64/0.18)]'
          : 'border-transparent bg-white/60'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <BuildSlot at={BUILD_AT.navBrand} target="nav-brand" label="<Brand />">
          <Link to="/" className="group flex items-center gap-2.5 rounded-lg" aria-label={`${site.name} — home`}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 font-display text-sm font-bold tracking-tight text-white shadow-sm transition group-hover:rotate-[-4deg]">
              DC
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-navy-950">{site.name}</span>
          </Link>
        </BuildSlot>

        <BuildSlot at={BUILD_AT.navLinks} target="nav-links" label="<NavLinks />">
          <ul className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => (
              <li key={item.to}>
                {item.cta ? (
                  <NavLink to={item.to} className="btn btn-primary ml-2 px-4 py-2">
                    {item.label}
                  </NavLink>
                ) : item.showProjectMenu ? (
                  <ProjectsMenu item={item} />
                ) : (
                  <DesktopLink item={item} />
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-navy-900 transition hover:bg-navy-50 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </BuildSlot>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className="overflow-hidden border-t border-slate-200/80 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <MobileMenu />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

const linkBase = 'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors'

function DesktopLink({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => `${linkBase} ${isActive ? 'text-navy-950' : 'text-slate-600 hover:text-navy-950'}`}
    >
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-navy-50 ring-1 ring-navy-100" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          {item.label}
        </>
      )}
    </NavLink>
  )
}

function ProjectsMenu({ item }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const wrapRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DesktopLink item={item} />
      <button
        type="button"
        className="-ml-2 grid h-8 w-6 place-items-center rounded-full text-slate-500 hover:text-navy-950"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Show project list"
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            className="absolute top-full left-1/2 w-80 -translate-x-1/2 pt-3"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            <div className="card-surface overflow-hidden p-2">
              <ul>
                {projects.map((p) => (
                  <li key={p.slug}>
                    <NavLink
                      to={projectPath(p)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-navy-50 text-navy-950' : 'text-slate-700 hover:bg-slate-50 hover:text-navy-950'}`
                      }
                    >
                      <img src={p.image.src} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" style={{ background: p.image.background, objectFit: p.image.fit === 'contain' ? 'contain' : 'cover' }} loading="lazy" />
                      <span className="font-medium">{p.navLabel}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              <Link to="/projects" className="mt-1 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-navy-50">
                View all projects <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileMenu() {
  return (
    <div className="container-page max-h-[calc(100dvh-4rem)] overflow-y-auto py-4">
      <ul className="space-y-1">
        {mainNav
          .filter((item) => !item.cta)
          .map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-3 text-base font-medium ${isActive ? 'bg-navy-50 text-navy-950' : 'text-slate-700'}`
                }
              >
                {item.label}
              </NavLink>
              {item.showProjectMenu && (
                <ul className="mt-1 mb-2 ml-3 space-y-0.5 border-l border-slate-200 pl-3">
                  {projects.map((p) => (
                    <li key={p.slug}>
                      <NavLink
                        to={projectPath(p)}
                        className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'font-semibold text-navy-950' : 'text-slate-600'}`}
                      >
                        {p.navLabel}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
      {mainNav
        .filter((item) => item.cta)
        .map((item) => (
          <Link key={item.to} to={item.to} className="btn btn-primary mt-3 w-full">
            {item.label}
          </Link>
        ))}
    </div>
  )
}
