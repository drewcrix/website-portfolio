import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Loader2, Mail, MapPin, Send } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { LinkedInIcon } from '../components/BrandIcons'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { contact } from '../data/profile'
import { site } from '../data/site'

const FIELDS = [
  { name: 'firstName', label: 'First Name', error: 'Enter your first name.', autoComplete: 'given-name', half: true },
  { name: 'lastName', label: 'Last Name', error: 'Enter your last name.', autoComplete: 'family-name', half: true },
  { name: 'email', label: 'Email', error: 'Enter a valid email.', type: 'email', autoComplete: 'email' },
  { name: 'message', label: 'Message', error: 'Enter a message.', multiline: true },
]

/** Same subject logic as the original page: "New message from <name>". */
function emailSubject(first, last) {
  const name = `${first} ${last}`.trim()
  return name ? `New message from ${name}` : 'New website message'
}

export default function Contact() {
  useDocumentMeta({ title: 'Contact', description: 'Contact Drew Crix.', path: '/contact' })
  const formRef = useRef(null)
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', message: '' })
  const [validated, setValidated] = useState(false)
  const [invalid, setInvalid] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Reset the button if the visitor comes back from Formspree with the back button.
  useEffect(() => {
    const onShow = (e) => e.persisted && setSubmitting(false)
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  const readValidity = (form) =>
    Object.fromEntries(FIELDS.map((f) => [f.name, !form.elements[f.name].validity.valid]))

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
    if (validated) setInvalid(readValidity(e.target.form))
  }

  // The form posts natively to Formspree (exactly like the original page);
  // we only intercept it when validation fails.
  const onSubmit = (e) => {
    const form = e.currentTarget
    if (!form.checkValidity()) {
      e.preventDefault()
      setValidated(true)
      const next = readValidity(form)
      setInvalid(next)
      const firstInvalid = FIELDS.find((f) => next[f.name])
      if (firstInvalid) form.elements[firstInvalid.name].focus()
      return
    }
    setSubmitting(true)
  }

  return (
    <>
      <PageHeader className="border-b-0">
        <div className="container-page grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:pt-6">
            <h1 className="text-5xl font-bold tracking-[-0.02em] text-about-blue">{contact.heading}</h1>
            <p className="mt-5 max-w-[520px] text-lg leading-normal font-medium text-[#2c2c2c]">{contact.intro}</p>

            <ul className="mt-8 space-y-3 text-sm">
              <li>
                <a href={`mailto:${site.email}`} className="group inline-flex items-center gap-3 text-slate-700 hover:text-navy-950">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-accent shadow-sm ring-1 ring-slate-200 transition group-hover:ring-navy-300">
                    <Mail className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-slate-700 hover:text-navy-950">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-accent shadow-sm ring-1 ring-slate-200 transition group-hover:ring-navy-300">
                    <LinkedInIcon className="h-4.5 w-4.5" />
                  </span>
                  LinkedIn
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-slate-700">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-accent shadow-sm ring-1 ring-slate-200">
                  <MapPin className="h-4.5 w-4.5" aria-hidden />
                </span>
                {site.location}
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card-surface p-6 sm:p-8"
          >
            <form ref={formRef} noValidate method="POST" action={site.formspreeEndpoint} onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
              {/* Honeypot (bots fill this, humans don't) */}
              <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden />
              <input type="hidden" name="_subject" value={emailSubject(values.firstName, values.lastName)} />

              {FIELDS.map((field) => {
                const id = `contact-${field.name}`
                const showError = validated && invalid[field.name]
                const common = {
                  id,
                  name: field.name,
                  required: true,
                  value: values[field.name],
                  onChange,
                  autoComplete: field.autoComplete,
                  'aria-invalid': showError || undefined,
                  'aria-describedby': showError ? `${id}-error` : undefined,
                  className: `w-full rounded-[10px] border bg-white px-4 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:ring-4 focus:outline-none ${
                    showError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : validated
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                        : 'border-slate-300 focus:border-accent focus:ring-accent/15'
                  }`,
                }
                return (
                  <div key={field.name} className={field.half ? '' : 'sm:col-span-2'}>
                    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {field.label}
                    </label>
                    {field.multiline ? <textarea rows={5} {...common} /> : <input type={field.type ?? 'text'} {...common} />}
                    {showError && (
                      <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
                        {field.error}
                      </p>
                    )}
                  </div>
                )
              })}

              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </PageHeader>
    </>
  )
}
