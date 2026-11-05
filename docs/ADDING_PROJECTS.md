# Adding projects

Every project lives in one place: **`src/data/projects.json`**. The Projects page, homepage
featured grid, navigation menu, detail page, previous/next links, sitemap, page titles and the
chatbot are all generated from it. Adding a project never requires touching a React component.

## Steps

1. Put the image in `src/assets/projects/` (JPEG/PNG/WebP, ideally ≤ 1600px wide and < 300 KB).
2. Put any PDF report in `public/reports/`.
3. Add an entry to the `projects` array in `src/data/projects.json` (array order = display order).
4. Run `npm run validate` (or `npm run build`, which validates first).

## Entry format

```jsonc
{
  "slug": "my-new-project",            // URL: /projects/my-new-project (lowercase-kebab-case, unique)
  "navLabel": "My New Project",        // short name for menus, chatbot buttons, breadcrumbs
  "featured": false,                   // true = also shown on the homepage
  "categories": ["Machine Learning"],  // filter chips on the Projects page (first one is shown on the card)

  "card": {                            // what the project cards show
    "title": "My New Project",
    "description": "One or two sentences."
  },

  "title": "Full Title Shown on the Project Page",
  "date": "Jan 2026 - Current",        // optional
  "badges": ["Python", "PyTorch"],     // skill badges

  "image": {
    "file": "my-new-project.jpg",      // file name inside src/assets/projects/
    "alt": "Describe the image",
    "width": 1600, "height": 1000,     // optional, avoids layout shift
    "fit": "contain",                  // optional: for logos/plots (default "cover")
    "background": "#ffffff",           // optional: backdrop when fit is "contain"
    "position": "center 40%"           // optional: crop focus for cards
  },

  "sections": [                        // body of the project page
    {
      "id": "overview",                // needed when there is a heading (used for #anchor links)
      "heading": "Overview",           // optional
      "date": "Jan 2026",              // optional, shown next to the heading
      "paragraphs": ["Text… supports **bold** and [links](https://example.com)."]
    }
  ],

  "links": [                           // buttons under the text
    { "label": "View Code (GitHub)", "href": "https://github.com/drewcrix/repo", "kind": "github" },
    { "label": "View Report (PDF)", "href": "/reports/My_Report.pdf", "kind": "report", "variant": "secondary" }
  ],
  "repository": "https://github.com/drewcrix/repo",   // optional, used for automation (see below)

  "seo": { "title": "Browser tab title", "description": "Search/link-preview description" },

  "chatbot": {
    "keywords": ["pytorch", "my project"],   // words that make the chatbot open this project
    "intro": "Optional custom chatbot reply. Defaults to the card title + description."
  }
}
```

`kind` is one of `report`, `github`, `external` (controls the button icon).

## Future: automatic projects from GitHub (not implemented yet)

The data-only design means an automation agent only has to produce **one JSON object and
optionally one image**, then open a pull request. Suggested pipeline:

1. **Detect** — a scheduled GitHub Action in this repo (e.g. daily `cron`) calls the GitHub REST API
   (`GET /users/drewcrix/repos?sort=created`, using the built-in `GITHUB_TOKEN`) and lists public,
   non-fork repositories whose URL is not already present as `repository` (or a `links[].href`)
   in `projects.json`. A topic such as `portfolio` can be used as an opt-in filter.
2. **Analyse** — for each new repo, fetch the README, description, topics and language stats
   (`GET /repos/{owner}/{repo}/readme`, `/languages`, `/topics`).
3. **Draft** — generate an entry in the format above:
   `slug` from the repo name, `badges` from languages/topics, `repository` + a `github` link,
   `featured: false`, `date` from the first commit, and `card`/`sections` text drafted from the
   README by an AI model of your choice. The image can be the first image in the README or a
   generated placeholder saved to `src/assets/projects/`.
4. **Validate** — run `npm run validate` and `npm test`; the validator rejects malformed entries,
   duplicate slugs and missing images/PDFs.
5. **Propose** — commit to a new branch and open a pull request (e.g. with
   `peter-evans/create-pull-request`) so you review and edit the wording before it goes live.
   Merging to `master` deploys automatically.

Because the AI-drafting step is the only part that may need a paid API, keep it optional: without
it the workflow can still open a PR with the factual fields filled in and the description left for
you to write.
