import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateProjects } from '../scripts/validate-projects.mjs'

const data = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url), 'utf8'))

test('projects.json is valid', () => {
  assert.deepEqual(validateProjects(data), [])
})

test('validator rejects broken entries', () => {
  const broken = structuredClone(data)
  broken.projects.push({ ...structuredClone(data.projects[0]), image: { file: 'missing.jpg', alt: 'x' } })
  broken.projects.push({ slug: 'Bad Slug', sections: [] })
  const errors = validateProjects(broken).join('\n')
  assert.match(errors, /duplicate slug/)
  assert.match(errors, /missing\.jpg not found/)
  assert.match(errors, /lowercase-kebab-case/)
  assert.match(errors, /card\.title is required/)
})
