/* ============================================================
   PROJECTS — software / analysis work that is not a client website.
   (Client websites live in websites.js and render in their own section.)

   This array is EMPTY on purpose. Nothing was invented to fill it —
   the section renders a short "more coming" state until you add real
   entries. Copy the template below, fill it in, done.

   ------------------------------------------------------------
   TEMPLATE — copy everything between the braces:

   {
     id: 'unique-slug',                    // used for the modal anchor
     title: 'Project name',
     category: 'data',                     // must match a key in `categories`
     date: '2026',                         // free text: '2026', 'Mar 2026', 'Ongoing'
     summary: 'One sentence for the card. Keep it under ~140 characters.',
     description: [                        // one string per paragraph, shown in the modal
       'What the problem was and who had it.',
       'What you built and what changed as a result.',
     ],
     highlights: [                         // optional bullet list in the modal
       'A specific thing it does',
       'Another specific thing',
     ],
     technologies: ['Python', 'SQL'],
     image: null,                          // e.g. 'assets/img/projects/slug.webp' — null draws a styled placeholder
     github: null,                         // full URL, or null to hide the button
     demo: null,                           // full URL, or null to hide the button
   }
   ------------------------------------------------------------

   Good candidates you already have (from your CV) — add them when you
   are ready to describe them properly:
     · the Python automations you build
     · any SQL / Power BI analysis from your MIS coursework
   ============================================================ */

/* Filter chips. `all` is added automatically by the renderer.
   Only categories that actually have projects are shown. */
export const categories = {
  data: 'Data & Analysis',
  web: 'Web',
  automation: 'Automation',
  other: 'Other',
};

export const projects = [];

/* Message shown while `projects` is empty. */
export const emptyState = {
  title: 'Projects are being written up.',
  body:
    'I would rather show three projects properly than ten with one line each. ' +
    'The client websites below are live work in the meantime.',
};
