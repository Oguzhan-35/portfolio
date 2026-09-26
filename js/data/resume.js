/* ============================================================
   RESUME — the on-page CV.

   Everything here is real, taken from your existing CV. Two sections
   are empty arrays because I do not have the information: add your
   certificates and achievements and they appear automatically. While
   an array is empty, its whole block is skipped — no empty headings.

   The "Download CV" button comes from `profile.cvFile`, not from here.
   ============================================================ */

export const resume = {
  /* ---- Profile ---------------------------------------------------- */
  summary:
    'Management Information Systems graduate focused on analyzing business ' +
    'processes and turning them into data-driven solutions. Experienced with ' +
    'SQL and Power BI for data analysis and Draw.io for process modeling. ' +
    'Through KoeStudio, delivered end-to-end digital solutions for local ' +
    'restaurants — analyzing operational needs and translating them into ' +
    'technical requirements. Looking to bring this analytical, ' +
    'process-driven approach to a business analyst role.',

  /* ---- Education --------------------------------------------------- */
  education: [
    {
      degree: 'Management Information Systems (B.Sc.)',
      org: 'Aydın Adnan Menderes University',
      period: 'Sep 2023 – Jun 2026',
      location: 'Aydın, Türkiye',
      details: [],
      /* NOTE: add your GPA here if you want it shown, e.g.
         details: ['GPA: 3.2 / 4.0'] */
    },
  ],

  /* ---- Experience -------------------------------------------------- */
  experience: [
    {
      role: 'Freelance Web Developer',
      org: 'KoeStudio',
      period: 'Ongoing',
      location: 'İzmir, Türkiye',
      details: [
        'Analyze business needs for local restaurant brands and deliver ' +
          'end-to-end digital solutions: responsive sites built with ' +
          'HTML5/CSS3/JavaScript, deployed and hosted on Vercel.',
        'Translated an informal reservation process into a WhatsApp-based ' +
          'flow; defined and implemented KVKK-compliant data handling from ' +
          'the design stage onward.',
        'Brand identity work: logo design and a QR menu system.',
      ],
    },
    {
      role: 'Sales Consultant',
      org: 'Desa Deri',
      period: 'Aug 2026 – Present',
      location: 'İzmir, Türkiye',
      details: [
        'Conduct customer needs analysis to provide product consulting, ' +
          'contributing to monthly store sales performance.',
        'Coordinate inventory tracking, visual merchandising and store ' +
          'operational processes.',
      ],
    },
    {
      role: 'Crew Member',
      org: 'McDonald’s',
      period: 'Jun 2025 – Sep 2025',
      location: 'İzmir, Türkiye',
      details: [
        'Maintained process standards — speed, hygiene and service quality — ' +
          'in a high-volume operational environment.',
      ],
    },
    {
      role: 'Store Staff',
      org: 'Shell',
      period: 'Jun 2023 – Sep 2023',
      location: 'İzmir, Türkiye',
      details: [
        'Ran daily store operational processes including POS transactions, ' +
          'inventory management and customer service.',
      ],
    },
  ],

  /* ---- Languages --------------------------------------------------- */
  languages: [
    { name: 'Turkish', level: 'Native' },
    { name: 'English', level: 'Fluent in speaking and writing' },
  ],

  /* ---- Certificates ------------------------------------------------
     EMPTY — I do not have this information, so nothing was invented.
     Add entries and the section appears on the page automatically:

     { name: 'Certificate name', org: 'Issuer', year: '2026', url: null }
     ------------------------------------------------------------------ */
  certificates: [],

  /* ---- Achievements ------------------------------------------------
     EMPTY — same reason. Shape:

     { title: 'What it was', year: '2026', description: 'One line.' }
     ------------------------------------------------------------------ */
  achievements: [],
};
