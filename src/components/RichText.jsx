import { Fragment } from 'react'
import { Link } from 'react-router'
import { toHref } from '../lib/projects'

// Renders the tiny subset of Markdown used in projects.json and chatbot replies:
// **bold** and [link text](url). Everything else is plain text.
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g

export default function RichText({ text, linkClassName = 'link' }) {
  const parts = String(text).split(TOKEN)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    if (link) {
      const [, label, href] = link
      if (href.startsWith('/') && !href.endsWith('.pdf')) {
        return <Link key={i} to={href} className={linkClassName}>{label}</Link>
      }
      return (
        <a key={i} href={toHref(href)} target="_blank" rel="noopener noreferrer" className={linkClassName}>
          {label}
        </a>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}
