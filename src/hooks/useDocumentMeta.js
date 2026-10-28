import { useEffect } from 'react'
import { site } from '../data/site'

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el && value) el.setAttribute(attr, value)
}

/**
 * Updates the document title, description and canonical URL for client-side
 * navigation. scripts/postbuild.mjs writes the same values into each route's
 * static HTML so crawlers and link previews see them without JavaScript.
 */
export function useDocumentMeta({ title, description, path }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : site.seo.title
    const desc = description ?? site.seo.description
    const url = `${site.url}${path && path !== '/' ? `${path}/` : '/'}`
    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('link[rel="canonical"]', 'href', url)
  }, [title, description, path])
}
