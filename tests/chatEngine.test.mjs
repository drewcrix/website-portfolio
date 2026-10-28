import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createChatEngine, normalize } from '../src/lib/chatEngine.js'
import { intents, fallback, greeting, mainActions } from '../src/data/chatbot.js'
import { site } from '../src/data/site.js'
import { about } from '../src/data/profile.js'

const { projects } = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url), 'utf8'))
const engine = createChatEngine({ projects, intents, fallback, site, profile: about })

const expectations = [
  // [message, expected navigate target (or null), expected text fragment]
  ['projects', '/projects', 'Absolutely!'],
  ['Show me your projects', '/projects', 'Absolutely!'],
  ['what has Drew built?', '/projects', 'Absolutely!'],
  ['about', '/about', 'About page'],
  ['who is Drew?', '/about', 'About page'],
  ['research', null, 'research spans'],
  ['machine learning', null, 'Machine learning'],
  ['EEG', '/projects/brainwaves-ssl', 'self-supervised learning framework for EEG'],
  ['Tell me about his EEG research', '/projects/brainwaves-ssl', 'self-supervised learning framework for EEG'],
  ['thesis', '/projects/thesis', 'schlieren'],
  ['recycling', '/projects/recycling-sorter', 'recycling sorter'],
  ['tell me about the GPR experiment', '/projects/waterborne-gpr', 'ground-penetrating radar'],
  ['Sunnybrook', '/projects/hotspot-tracker', 'Sunnybrook'],
  ['hackathons?', '/projects/competitions', 'hackathons'],
  ['contact', '/contact', 'contact form'],
  ['email', null, site.email],
  ['resume', null, 'resume'],
  ['Can I see his CV?', null, 'resume'],
  ['GitHub', null, 'GitHub'],
  ['hello', null, 'Hi there'],
  ['hi', null, 'Hi there'],
  ['help', null, 'I can help'],
  ['are you an AI?', null, 'rule-based'],
  ['where did he study?', '/about#education', 'education'],
  ['awards', '/about#awards', 'awards'],
]

for (const [message, navigate, fragment] of expectations) {
  test(`"${message}"`, () => {
    const reply = engine.respond(message)
    assert.equal(reply.navigate ?? null, navigate)
    assert.match(reply.text.toLowerCase(), new RegExp(fragment.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  })
}

test('unknown input falls back politely with options', () => {
  const reply = engine.respond('qwerty asdf')
  assert.equal(reply.text, fallback.text)
  assert.deepEqual(reply.actions, mainActions)
})

test('every main action resolves to a real intent', () => {
  for (const action of greeting.actions) {
    const reply = engine.run(action.intent)
    assert.notEqual(reply.text, fallback.text, action.label)
  }
})

test('every project is reachable by its own button and keywords', () => {
  for (const project of projects) {
    assert.equal(engine.run(`project:${project.slug}`).navigate, `/projects/${project.slug}`)
    for (const keyword of project.chatbot.keywords) {
      const match = engine.classify(keyword)
      if (match.type === 'project') assert.equal(match.project.slug, project.slug, keyword)
    }
  }
})

test('research options come from project data', () => {
  const labels = engine.run('research').actions.map((a) => a.intent)
  for (const p of projects.filter((p) => p.categories.includes('Research'))) {
    assert.ok(labels.includes(`project:${p.slug}`))
  }
})

test('github lists repositories found in project data', () => {
  const hrefs = engine.run('github').actions.map((a) => a.href)
  assert.ok(hrefs.includes('https://github.com/drewcrix/stock-prediction-portfolio-optimization'))
  assert.ok(hrefs.includes('https://github.com/drewcrix/Virtual-Communication-Tracker'))
})

test('normalize strips punctuation and accents', () => {
  assert.equal(normalize('  Résumé?! Drew’s  '), "resume drew's")
})
