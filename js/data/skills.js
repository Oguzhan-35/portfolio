/* ============================================================
   SKILLS — grouped by category.

   Deliberately no percentage bars or star ratings: they are
   unverifiable, every portfolio has them, and an interviewer will
   test the claim anyway. Categories + honest grouping reads better.

   To add a skill: drop a string into the right `items` array.
   To add a category: copy a whole block. Nothing else to change.
   ============================================================ */

export const skills = [
  {
    id: 'analysis',
    label: 'Business Analysis',
    /* `note` is optional — omit it and nothing is rendered. */
    note: 'Turning an ambiguous ask into something a developer can build.',
    items: [
      'Requirements Analysis',
      'Process Mapping (BPMN)',
      'Functional Documentation',
      'Stakeholder Communication',
      'Gap Analysis',
    ],
  },
  {
    id: 'data',
    label: 'Data & Analytics',
    note: 'Asking the database rather than guessing.',
    items: ['SQL', 'Microsoft Power BI', 'Excel', 'SQLite'],
  },
  {
    id: 'development',
    label: 'Development',
    note: 'Enough to build the thing, not just specify it.',
    items: ['HTML5', 'CSS3', 'JavaScript', 'Python'],
  },
  {
    id: 'tools',
    label: 'Tools & Workflow',
    items: ['Git', 'GitHub', 'Vercel', 'VS Code', 'Draw.io', 'AI-assisted workflows'],
  },
];
