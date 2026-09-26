/* ============================================================
   PROFILE — identity, contact links and hero copy.

   This is the file to edit for anything about *you*.
   Nothing here is invented: every value is either real or set to
   null with a NOTE explaining what is missing.
   ============================================================ */

export const profile = {
  name: 'Oğuzhan Kul',

  /* Shown under the name in the hero and used in the page <title>. */
  title: 'Business Analyst Candidate',
  subtitle: 'MIS Graduate',

  /* Hero headline. Two lines — keep it short and claim-like. */
  tagline: [
    'I turn messy business processes',
    'into systems that actually run.',
  ],

  /* One-paragraph pitch under the tagline. */
  intro:
    'Management Information Systems graduate working where analysis meets ' +
    'delivery — mapping what a business actually needs, then building it. ' +
    'SQL and Power BI for the questions, code for the answers.',

  location: 'İzmir, Türkiye',

  /* The spec card beside the hero — a structured, scannable read of who
     this is. Add or remove rows freely; the card sizes itself. */
  spec: [
    { key: 'Role',   value: 'Business Analyst Candidate' },
    { key: 'Focus',  value: 'Process analysis · Requirements' },
    { key: 'Data',   value: 'SQL · Power BI · Excel' },
    { key: 'Builds', value: 'HTML · CSS · JavaScript · Python' },
    { key: 'Based',  value: 'İzmir, Türkiye' },
    { key: 'Status', value: 'Open to opportunities', accent: true },
  ],

  /* Availability badge in the hero. Set `available: false` to hide it. */
  availability: {
    available: true,
    label: 'Open to Business Analyst roles',
  },

  /* ---- Contact & social -------------------------------------------------
     Only add a link here if it is real. Anything left as null is simply
     not rendered — no broken links, no dead buttons.
     ---------------------------------------------------------------------- */
  email: 'oguzhankul01@hotmail.com',
  github: 'https://github.com/Oguzhan-35',
  linkedin: 'https://www.linkedin.com/in/oğuzhan-kul-5936a341a',
  /* NOTE: add more if you have them, e.g.
     twitter: 'https://x.com/...',
     medium:  'https://medium.com/@...',              */
  extraLinks: [],

  /* ---- CV file ----------------------------------------------------------
     Generated from assets/cv/oguzhan-kul-cv.html — edit that file, then
     re-print it to PDF (see the instructions at the top of it).
     Set this back to null and the Download CV button disappears everywhere
     rather than pointing at a missing file.
     ---------------------------------------------------------------------- */
  cvFile: 'assets/cv/oguzhan-kul-cv.pdf',

  /* ---- Canonical site URL ----------------------------------------------
     DEĞİŞTİR: replace with your real domain once the site is live.
     Used for canonical, Open Graph, sitemap and JSON-LD.
     ---------------------------------------------------------------------- */
  siteUrl: 'https://oguzhankul.vercel.app',
};

/* ============================================================
   ABOUT — the longer story. Plain strings, one per paragraph.
   ============================================================ */

export const about = {
  paragraphs: [
    'I like problems — specifically the messy, badly-defined kind that ' +
      'start as a vague complaint and end as a working system. Figuring out ' +
      'what someone actually needs, as opposed to what they first asked for, ' +
      'is the part of the work I enjoy most.',

    'Through KoeStudio, my own freelance practice, I have taken local ' +
      'restaurants from “we should probably have a website” to a live, ' +
      'KVKK-compliant site with a working reservation flow — doing the ' +
      'requirements gathering, the process mapping and the code myself.',

    'I work well under pressure. Two summers in high-volume service ' +
      'operations taught me how to stay focused when everything happens at ' +
      'once, and how much of an operation’s daily pain is process rather ' +
      'than people.',

    'I am now looking for a Business Analyst role where the analytical side ' +
      'leads: SQL, Power BI, process modeling, and the habit of asking “but ' +
      'why does it work this way?” until there is a real answer.',
  ],

  /* Short principles shown beside the text. Keep to 4 — they read as a list
     of claims, and a long list of claims convinces nobody. */
  principles: [
    {
      title: 'Why before how',
      body: 'A requirement nobody can justify is a requirement that changes next week.',
    },
    {
      title: 'Write it down',
      body: 'If a decision only exists in someone’s head, it will be re-litigated.',
    },
    {
      title: 'Ship, then refine',
      body: 'A working small thing beats a perfect document about a big thing.',
    },
    {
      title: 'Privacy by default',
      body: 'Zero cookies, self-hosted fonts, consent-gated maps. Compliance is a design decision.',
    },
  ],
};

/* ============================================================
   CONTACT — copy for the closing section.
   ============================================================ */

export const contact = {
  heading: 'Let’s talk.',
  body:
    'Looking for a business analyst, or need a website that does more than ' +
    'sit there? Email is the fastest way to reach me.',
};
