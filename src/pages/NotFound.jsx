import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Robot from '../components/agents/Robot'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

export default function NotFound() {
  useDocumentMeta({ title: 'Page not found' })
  return (
    <PageHeader className="border-b-0">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Robot variant="structure" size={88} beam />
        <p className="mt-10 font-mono text-sm text-accent">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">This page hasn’t been built yet</h1>
        <p className="mt-3 max-w-md text-slate-600">The page you’re looking for doesn’t exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            Home
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            Projects <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </PageHeader>
  )
}
