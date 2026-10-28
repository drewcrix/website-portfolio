import { BrowserRouter, Route, Routes } from 'react-router'
import { MotionConfig } from 'motion/react'
import Layout from './components/Layout'
import IntroProvider from './components/intro/IntroProvider'
import ChatProvider from './components/chat/ChatProvider'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <IntroProvider>
          <ChatProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:slug" element={<ProjectDetail />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ChatProvider>
        </IntroProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
