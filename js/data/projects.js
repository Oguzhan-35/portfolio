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

export const projects = [
  {
    id: 'ba-portfolio-retail-analysis',
    title: 'Anadolu Home — E-Commerce Delivery & Retention Analysis',
    category: 'data',
    date: '2026',
    summary:
      'End-to-end business analyst case study: SQL analysis, BRD, user stories ' +
      'and process maps for a fictional online retailer. Synthetic data.',
    description: [
      'A practice case study built to show how I work a business problem end ' +
        'to end: frame it, analyse it with data, then turn the findings into ' +
        'requirements. Anadolu Home is a fictional online home-goods retailer ' +
        'with three warning signs — only about 27% of customers buy a second ' +
        'time, 57% abandon checkout, and Black Friday revenue came in below ' +
        'October’s despite more orders. The question: where is the money ' +
        'leaking, and what should be fixed first?',
      'The repo covers the business case and BRD-style requirements, ' +
        'stakeholder map and RACI, AS-IS / TO-BE process flows, user stories ' +
        'with Given/When/Then acceptance criteria, eight SQL KPI queries, and ' +
        'a prioritised roadmap with KPI targets. All data is synthetically ' +
        'generated with a fixed seed, so the findings illustrate the method, ' +
        'not real-world truth.',
    ],
    highlights: [
      'Late delivery drives churn: customers whose first order arrives 3+ days late repeat-buy at 7.1%, vs 39.1% for on-time orders',
      'The damage has a threshold: 1–2 days late barely moves ratings, 3+ days drops them to 2.71',
      'Furniture has the highest return rate (13.9%) and the lowest margin (37.5%)',
      'Black Friday discounts cannibalised revenue: orders +19% vs October, net revenue down about 15%',
      'Acquisition channel is not the lever — repeat rate is roughly 25–28% in every channel',
    ],
    technologies: ['SQL', 'SQLite', 'Python', 'BRD', 'User Stories', 'Process Mapping'],
    image: null,
    github: 'https://github.com/Oguzhan-35/ba-portfolio-retail-analysis',
    demo: null,
  },
  {
    id: 'zomato-restaurant-analysis',
    title: 'Zomato Restaurants — Which to Approach First',
    category: 'data',
    date: '2026',
    summary:
      'SQL and Power BI analysis of 9,551 Zomato restaurants: which restaurants ' +
      'and cities a delivery-partnerships team should approach first.',
    description: [
      'I wanted a project that starts from a vague business question and ends ' +
        'with something a team could act on, instead of just charting columns. ' +
        'The question is my own: a food-delivery partnerships team has limited ' +
        'sales capacity — which restaurants and cities should they approach ' +
        'first, and what should they know about the market before they do? ' +
        'Nothing here comes from a real engagement; the data is the public ' +
        'Zomato listing dataset from Kaggle (9,551 restaurants, 15 countries).',
      'Data cleaning and loading run in Python into SQLite, nine analysis ' +
        'queries sit on a view with rating bands and price labels, and a ' +
        'Power BI model with DAX measures sits on top. The write-up documents ' +
        'data-quality decisions, results and recommendations, and is explicit ' +
        'about limits: a one-time snapshot with no dates, and popularity-biased ' +
        'user ratings.',
    ],
    highlights: [
      '430 Indian restaurants rated 4.0+ with 100+ votes offer no online delivery — an obvious pool of leads',
      'Attention is extremely concentrated: the top 10% of restaurants hold 65% of all votes',
      'Delivery does not mean better food (3.37 vs 3.34), but 33% of non-delivery restaurants have no rating at all vs 4% of delivery ones',
      '0.0 ratings treated as “not rated”, not as bad ratings — averaging them in would drag the India average down',
      '91% of the dataset is India, so non-Delhi-NCR cities are treated as samples, not benchmarks',
    ],
    technologies: ['SQL', 'SQLite', 'Power BI', 'DAX', 'Python'],
    image: null,
    github: 'https://github.com/Oguzhan-35/zomato-restaurant-analysis',
    demo: null,
  },
];

/* Message shown while `projects` is empty. */
export const emptyState = {
  title: 'Projects are being written up.',
  body:
    'I would rather show three projects properly than ten with one line each. ' +
    'The client websites below are live work in the meantime.',
};
