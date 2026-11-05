import { Link } from 'react-router'
import { FileText, Mail, MapPin, RotateCcw } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from './BrandIcons'
import { useIntro } from './intro/introContext'
import { mainNav } from '../data/navigation'
import { site } from '../data/site'

export default function Footer() {
  const { replay } = useIntro()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_auto] md:items-start">
        <div>
          <div className="font-display text-lg font-semibold text-navy-950">{site.name}</div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:text-navy-900">
              <Mail className="h-4 w-4" aria-hidden />
              {site.email}
            </a>
            <span aria-hidden className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {site.location}
            </span>
          </div>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            {mainNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-navy-900">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex items-center gap-2">
            <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition hover:text-navy-900 hover:ring-navy-300" aria-label="LinkedIn">
              <LinkedInIcon className="h-4.5 w-4.5" />
            </a>
            <a href={site.social.github} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition hover:text-navy-900 hover:ring-navy-300" aria-label="GitHub">
              <GitHubIcon className="h-4.5 w-4.5" />
            </a>
            <a href={site.resume} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:text-navy-900 hover:ring-navy-300">
              <FileText className="h-4 w-4" aria-hidden /> Resume
            </a>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>© {year} {site.name}</span>
            <span aria-hidden className="text-slate-300">•</span>
            <button type="button" onClick={replay} className="inline-flex items-center gap-1 hover:text-navy-900">
              <RotateCcw className="h-3 w-3" aria-hidden /> Replay intro
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
