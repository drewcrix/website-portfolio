// Written content for the Home, About and Contact pages, copied verbatim from the
// original static site. Edit the wording here; the page components only handle layout.

export const home = {
  heading: 'Building The Future: Engineering, Innovation, and Sustainability',
  intro:
    'I am an Engineering Physics graduate driven to contribute to solving difficult, high-impact problems that address global challenges. I am looking to contribute to society through my service, innovation, and work. Here, I discuss some of my favorite projects I am working on and have completed.',
  featuredTitle: 'Featured Projects',
  // Short focus labels shown under the hero buttons. Each one is an existing
  // project skill badge and links to that project.
  focus: [
    { label: 'Signal Integrity', project: 'thesis' },
    { label: 'Graph Neural Networks', project: 'brainwaves-ssl' },
    { label: 'Computer Vision', project: 'recycling-sorter' },
    { label: 'Geophysics', project: 'waterborne-gpr' },
  ],
  // Floating highlight cards around the headshot. Wording is taken from the
  // project pages (see the linked project for the full context).
  highlights: [
    { label: 'Spotlight Paper Award', sub: 'CUCAI 2026', icon: 'award', project: 'brainwaves-ssl' },
    { label: 'Most Implementable Award', sub: 'How to Change the World', icon: 'idea', project: 'competitions', hash: 'HtCtW' },
    { label: 'Four-layer PCB', sub: 'Thesis', icon: 'pcb', project: 'thesis' },
  ],
}

export const about = {
  name: 'Drew Crix',
  title: 'Engineering Physics (Mechanical)',
  heading: 'About Me',
  bio: "Hi I'm Drew! — I am an Engineering Physics student at Queen's University. I strive to contribute to society in a meaningful way through my service, innovation, and work. I am a quick learner with a positive outlook, enthusiastic, and hard working. I am excited and passionate about the current developments leading towards a sustainable future and I am eager to apply scientific and engineering principles to contribute towards these goals. I am always looking for great opportunities! Feel free to reach out anytime.",
  education: {
    heading: 'Education',
    entries: [
      {
        title: 'BASc — Engineering Physics (Mechanical Option)',
        detail: 'Queen’s University • 2020–Present',
      },
      {
        title: 'Robert Tyre Jones Jr Scholar Exchange Student — Physics',
        detail: 'University of St. Andrews • 2022–2023',
      },
    ],
  },
  awards: {
    heading: 'Accomplishments & Awards',
    groups: [
      {
        title: 'University',
        items: [
          "Dean's Scholar",
          'OUA Academic All Star',
          'NSERC USRA Recipient',
          'Support Our Troops National Scholarhip',
          'R.H Clark Applied Science Centennial Scholarship',
          'Albert H. Ruddel Award',
          'Most Improved Athlete (rowing)',
        ],
      },
      {
        title: 'High School',
        items: [
          'Paul and Helene Demarais Family Scholarship',
          'Loran Scholar Semi Finalist',
          'Morehead-Cain Semi Finalist',
          'LCS Community Service Award',
        ],
      },
    ],
  },
}

export const contact = {
  heading: 'Contact Me',
  intro:
    'If you’re interested in my work, know of any job openings I’d be a good fit for, or just want to say hello, feel free to reach out by this form!',
}
