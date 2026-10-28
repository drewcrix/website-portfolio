import { Outlet } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollManager from './ScrollManager'
import Chatbot from './chat/Chatbot'
import WorkerAgents from './intro/WorkerAgents'
import { useIntro } from './intro/introContext'

export default function Layout() {
  const { phase } = useIntro()
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <ScrollManager />
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      {phase !== 'done' && <WorkerAgents />}
    </div>
  )
}
