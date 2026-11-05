// Site-wide settings. Everything that identifies Drew or links off-site lives here
// so it only ever needs to be changed in one place.

export const site = {
  name: 'Drew Crix',
  url: 'https://www.drewcrix.com',
  // REVIEW: the original homepage footer used drewcrix@gmail.com while every other
  // page (and footer.html) used d.crix@queensu.ca. Change this line to switch the
  // address used in the footer, contact page and chatbot.
  email: 'drewcrix@gmail.com',
  location: 'Toronto, ON',
  resume: '/reports/CV.pdf',
  social: {
    linkedin: 'https://www.linkedin.com/in/drewcrix/',
    github: 'https://github.com/drewcrix',
  },
  // Existing Formspree form (free tier) used by the contact page.
  formspreeEndpoint: 'https://formspree.io/f/mdaelweb',
  seo: {
    title: 'A Personal Website, by Drew Crix',
    description:
      'A personal website created by Drew Crix to showcase engineering design projects, personal newsletters, and contact information.',
  },
}
