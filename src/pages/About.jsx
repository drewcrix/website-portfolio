import { motion } from 'motion/react'
import { Award, FileText, GraduationCap } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '../components/BrandIcons'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { about } from '../data/profile'
import { site } from '../data/site'
import headshot from '../assets/images/headshot.jpg'

// Layout mirrors the original about_me.html: light gradient page, centred
// translucent hero card with the headshot, then Education + Awards cards.

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function About() {
  useDocumentMeta({ title: 'About', description: 'About Drew Crix', path: '/about' })

  return (
    <div className="relative isolate bg-[linear-gradient(135deg,#ffffff_0%,#f7f7fb_45%,#f1f3f7_100%)]">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-blueprint mask-fade opacity-70" />
      <div className="mx-auto max-w-[980px] px-4 py-12 sm:px-6 sm:py-16">
        <motion.section
          {...rise()}
          className="mb-10 rounded-[22px] border border-black/[0.06] bg-white/75 p-6 text-center shadow-[0_20px_60px_-30px_rgb(15_34_64/0.25)] backdrop-blur-md sm:mb-12 sm:p-12"
        >
          <div className="relative mx-auto mb-6 h-[200px] w-[200px]">
            <span aria-hidden className="absolute -inset-3 rounded-full bg-[conic-gradient(from_120deg,rgb(57_57_245/0.25),rgb(56_189_248/0.25),transparent,rgb(57_57_245/0.25))] blur-md" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-white/90 bg-gradient-to-br from-slate-100 to-white shadow-[0_18px_50px_rgb(0_0_0/0.12)]">
              <img src={headshot} alt="Drew Crix headshot" width="800" height="800" className="h-full w-full object-cover" fetchPriority="high" />
            </div>
          </div>

          <h1 className="mb-1 text-4xl font-bold tracking-tight sm:text-5xl">{about.name}</h1>
          <div className="mb-1 pb-3 text-xl font-bold text-about-green sm:text-2xl">{about.title}</div>

          <h2 className="group relative mb-5 inline-block text-3xl font-bold tracking-tight transition-transform hover:-translate-y-0.5 sm:text-[2.2rem]">
            {about.heading}
            <span aria-hidden className="mt-1.5 block h-1 w-full origin-left rounded-sm bg-about-blue transition-transform duration-300 group-hover:scale-x-110" />
          </h2>

          <p className="mx-auto max-w-[720px] text-lg leading-[1.6] text-slate-700 sm:text-xl">{about.bio}</p>
        </motion.section>

        <section className="mb-12 grid gap-6 md:grid-cols-2">
          <motion.div {...rise(0.1)} id="education" className="scroll-mt-24 rounded-[18px] border border-black/[0.06] bg-white/70 p-6 shadow-[0_10px_30px_rgb(0_0_0/0.06)] backdrop-blur-md sm:p-7">
            <h3 className="mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-[2rem]">
              <IconBadge><GraduationCap className="h-5 w-5" aria-hidden /></IconBadge>
              {about.education.heading}
            </h3>
            <ul className="space-y-5">
              {about.education.entries.map((entry) => (
                <li key={entry.title} className="relative border-l-2 border-navy-100 pl-4">
                  <span aria-hidden className="absolute top-2 -left-[5px] h-2 w-2 rounded-full bg-about-blue" />
                  <div className="text-lg font-bold text-slate-900">{entry.title}</div>
                  <div className="text-slate-500">{entry.detail}</div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...rise(0.18)} id="awards" className="scroll-mt-24 rounded-[18px] border border-black/[0.06] bg-white/70 p-6 shadow-[0_10px_30px_rgb(0_0_0/0.06)] backdrop-blur-md sm:p-7">
            <h3 className="mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-[2rem]">
              <IconBadge><Award className="h-5 w-5" aria-hidden /></IconBadge>
              {about.awards.heading}
            </h3>
            <div className="space-y-5">
              {about.awards.groups.map((group) => (
                <div key={group.title}>
                  <div className="text-lg font-bold text-slate-900">{group.title}</div>
                  <p className="text-slate-500">
                    {group.items.map((item, i) => (
                      <span key={item}>
                        {i > 0 && <span aria-hidden className="text-navy-300"> • </span>}
                        {item}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <motion.section {...rise(0.26)} className="flex flex-wrap justify-center gap-3 pb-4">
          <SocialLink href={site.social.linkedin} icon={<LinkedInIcon className="h-4 w-4" />}>LinkedIn</SocialLink>
          <SocialLink href={site.social.github} icon={<GitHubIcon className="h-4 w-4" />}>GitHub</SocialLink>
          <SocialLink href={site.resume} icon={<FileText className="h-4 w-4" aria-hidden />}>Resume</SocialLink>
        </motion.section>
      </div>
    </div>
  )
}

function IconBadge({ children }) {
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-about-blue ring-1 ring-navy-100">{children}</span>
}

function SocialLink({ href, icon, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold text-accent ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-0.5 hover:ring-accent/40 hover:shadow-md"
    >
      {icon}
      {children}
    </a>
  )
}
