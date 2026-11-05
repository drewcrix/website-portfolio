/** Light page header with the blueprint grid used across inner pages. */
export default function PageHeader({ children, className = '' }) {
  return (
    <section className={`relative isolate overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-navy-50/70 to-white ${className}`}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-blueprint mask-fade" />
      <div aria-hidden className="absolute -top-32 right-0 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgb(37_99_235/0.12),transparent_65%)]" />
      {children}
    </section>
  )
}
