# Personal Portfolio

## Tech stack

- **React 19 + Vite** — single-page app, built to static files
- **Tailwind CSS 4** — styling (theme tokens in `src/index.css`)
- **React Router** — pages and URLs
- **Motion** — animations (intro worker agents, page transitions)
- **Lucide** — icons
- **Formspree** (existing free form) — contact form
- **GitHub Pages** — hosting at www.drewcrix.com

No backend, database, API keys or paid services. The chatbot is rule-based and runs entirely in the browser.

## Running locally

Requires Node.js 22.22 or newer (`.nvmrc` pins Node 22).

```bash
npm install
npm run dev        # http://localhost:5173 — live reload
npm test           # chatbot unit tests
npm run build      # validate project data + production build into dist/
npm run preview    # serve the production build locally
```

Useful URL flags on the homepage: `/?intro` replays the build animation, `/?nointro` skips it.
The footer also has a "Replay intro" link.

## Project structure

```
index.html                 Vite entry (SEO defaults live here)
public/                    Copied as-is: CNAME, favicon, reports/*.pdf, og-image.jpg
src/
  data/
    projects.json          ← every project (cards + detail pages + chatbot keywords)
    profile.js             Home / About / Contact wording
    site.js                Name, email, social links, resume, Formspree endpoint
    navigation.js          Main navigation
    chatbot.js             Chatbot intents and replies
  assets/projects/         Project images (referenced by file name from projects.json)
  assets/images/           Headshot
  components/              Navbar, Footer, ProjectCard, RichText, …
    chat/                  Chatbot UI + state (history kept in sessionStorage)
    intro/                 Worker-agent build animation (BuildSlot, WorkerAgents, timeline)
    agents/Robot.jsx       The robot SVG shared by the intro and the chatbot
  pages/                   Home, Projects, ProjectDetail (shared template), About, Contact, NotFound
  lib/                     chatEngine.js (pure intent matching), projects.js (data loader)
scripts/
  validate-projects.mjs    Checks projects.json (runs before every build)
  postbuild.mjs            GitHub Pages support: per-route HTML, 404.html, sitemap
tests/                     node:test unit tests for the chatbot
docs/ADDING_PROJECTS.md    How to add projects + plan for GitHub automation
```

## Editing content

- **Projects:** edit `src/data/projects.json`. See [docs/ADDING_PROJECTS.md](docs/ADDING_PROJECTS.md).
- **Home / About / Contact text:** `src/data/profile.js`.
- **Email, links, resume, form endpoint:** `src/data/site.js`.
- **Resume:** replace `public/reports/CV.pdf`.

Text fields support two bits of formatting: `**bold**` and `[link text](https://…)`.

## Deploying to GitHub Pages

Deployment is automated by `.github/workflows/deploy.yml`: every push to `master` runs the tests,
builds the site and publishes `dist/`.

**One-time setup (required before merging this branch into `master`):**
in the GitHub repository go to **Settings → Pages → Build and deployment → Source** and choose
**GitHub Actions**. The custom domain (`www.drewcrix.com`) stays configured in the same settings page;
`public/CNAME` is also included in each build.

> If Pages is still set to "Deploy from a branch", GitHub would serve the raw source files and the
> site would show a blank page — switch the source first.

How routing works on GitHub Pages: `scripts/postbuild.mjs` writes a real HTML file for every page
(`/projects/index.html`, `/projects/thesis/index.html`, …), so direct visits and refreshes return
the page with the right title and description. Any unknown URL falls back to `404.html`, which
loads the app's "not found" page.
