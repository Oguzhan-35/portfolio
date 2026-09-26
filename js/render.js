/* ============================================================================
   RENDER — turns the data files into DOM.

   Every section reads from js/data/*.js. To change content, edit those
   files; nothing in here should need touching.

   Rules kept throughout:
     · a link is only rendered when its URL actually exists (no dead buttons)
     · a missing image draws a styled placeholder (no broken <img>)
     · an empty list renders an empty state (no bare headings)
   ========================================================================== */

import { profile, about, contact } from './data/profile.js';
import { skills } from './data/skills.js';
import { projects, categories, emptyState as projectsEmpty } from './data/projects.js';
import { websites, emptyState as websitesEmpty } from './data/websites.js';
import { resume } from './data/resume.js';


/* ============================================================
   Helpers
   ============================================================ */

/* Data is authored by the site owner, but escaping costs nothing and
   removes the whole class of problem if content is ever pasted in. */
const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));

const icon = (name, cls = 'ic') =>
  `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

const initials = (text) =>
  text.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

/* A deliberate stand-in for a screenshot that does not exist yet. */
const placeholder = (name, label) => `
  <div class="ph" aria-hidden="true">
    <span class="ph__mark">${esc(initials(name))}</span>
    <span class="ph__label">${esc(label)}</span>
  </div>`;

const media = (item, label = 'Preview coming') =>
  item.image
    ? `<img src="${esc(item.image)}" alt="${esc(item.name || item.title)} — preview"
            loading="lazy" decoding="async" width="1400" height="726">`
    : placeholder(item.name || item.title, label);

const tags = (list) =>
  `<ul class="tags">${list.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}</ul>`;

const mount = (id, html) => {
  const node = document.getElementById(id);
  if (node) node.innerHTML = html;
  return node;
};


/* ============================================================
   Social links — reused in the hero, the mobile menu and contact
   ============================================================ */

export function socialLinks({ style = 'icon' } = {}) {
  const links = [
    profile.github   && { href: profile.github,   icon: 'github',   label: 'GitHub' },
    profile.linkedin && { href: profile.linkedin, icon: 'linkedin', label: 'LinkedIn' },
    profile.email    && { href: `mailto:${profile.email}`, icon: 'mail', label: 'Email' },
    ...(profile.extraLinks || []).map((l) => ({ href: l.url, icon: l.icon || 'external', label: l.label })),
  ].filter(Boolean);

  return links
    .map(({ href, icon: ic, label }) =>
      style === 'icon'
        ? `<a class="icon-btn" href="${esc(href)}" aria-label="${esc(label)}"
              ${href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'}>
             ${icon(ic)}
           </a>`
        : `<a class="btn btn--ghost btn--sm" href="${esc(href)}"
              ${href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'}>
             ${icon(ic)} ${esc(label)}
           </a>`)
    .join('');
}

/* Rendered only when a CV file is actually configured. */
function cvButton(extraClass = '') {
  if (!profile.cvFile) return '';
  return `<a class="btn btn--ghost ${extraClass}" href="${esc(profile.cvFile)}" download>
            ${icon('download')} Download CV
          </a>`;
}


/* ============================================================
   Hero
   ============================================================ */

export function renderHero() {
  const [line1, line2] = profile.tagline;

  mount('hero-content', `
    ${profile.availability?.available ? `
      <p class="hero__eyebrow mono">
        <span class="dot dot--pulse" aria-hidden="true"></span>
        ${esc(profile.availability.label)}
      </p>` : ''}

    <h1>
      <strong>${esc(profile.name)}</strong>
      ${esc(profile.title)} · ${esc(profile.subtitle)}
    </h1>

    <p class="hero__tagline">
      ${esc(line1)}<br><em>${esc(line2)}</em>
    </p>

    <p class="hero__intro">${esc(profile.intro)}</p>

    <div class="hero__actions">
      <a class="btn btn--primary" href="#websites">See my work ${icon('arrow-right')}</a>
      ${cvButton()}
      <a class="btn btn--ghost" href="#contact">Get in touch</a>
    </div>

    <div class="hero__socials">${socialLinks()}</div>
  `);

  mount('hero-spec', `
    <div class="spec__head">
      <span class="spec__dots" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="mono">profile</span>
    </div>
    <div class="spec__body">
      ${profile.spec.map((row) => `
        <div class="spec__row">
          <span class="spec__key">${esc(row.key)}</span>
          <span class="spec__val ${row.accent ? 'spec__val--accent' : ''}">${esc(row.value)}</span>
        </div>`).join('')}
    </div>
  `);

  const cta = document.getElementById('header-cta');
  if (cta) cta.innerHTML = cvButton('btn--sm');

  mount('mobile-socials', socialLinks());
}


/* ============================================================
   About
   ============================================================ */

export function renderAbout() {
  mount('about-text', about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join(''));

  mount('about-principles', about.principles.map((item) => `
    <li class="principle">
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.body)}</p>
    </li>`).join(''));
}


/* ============================================================
   Skills
   ============================================================ */

export function renderSkills() {
  mount('skills-grid', skills.map((group) => `
    <article class="skillcard reveal">
      <div class="skillcard__head">
        <h3>${esc(group.label)}</h3>
        <span class="skillcard__count">${String(group.items.length).padStart(2, '0')}</span>
      </div>
      ${group.note ? `<p class="skillcard__note">${esc(group.note)}</p>` : ''}
      ${tags(group.items)}
    </article>`).join(''));
}


/* ============================================================
   Projects
   ============================================================ */

function projectCard(project) {
  return `
    <button class="card reveal" type="button"
            data-detail="project" data-id="${esc(project.id)}"
            data-category="${esc(project.category)}"
            aria-haspopup="dialog">
      <div class="card__media">${media(project)}</div>
      <div class="card__body">
        <div class="card__meta">
          <span class="badge">${esc(categories[project.category] || 'Project')}</span>
          <span class="skillcard__count">${esc(project.date)}</span>
        </div>
        <h3 class="card__title">${esc(project.title)}</h3>
        <p class="card__summary">${esc(project.summary)}</p>
        ${tags(project.technologies.slice(0, 4))}
        <div class="card__foot">
          <span class="card__more">View details ${icon('arrow-right')}</span>
        </div>
      </div>
    </button>`;
}

export function renderProjects() {
  const filters = document.getElementById('projects-filters');
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (!projects.length) {
    if (filters) filters.innerHTML = '';
    grid.className = '';
    grid.innerHTML = `
      <div class="empty reveal">
        <h3>${esc(projectsEmpty.title)}</h3>
        <p>${esc(projectsEmpty.body)}</p>
      </div>`;
    return;
  }

  /* Only offer a filter for categories that actually have entries. */
  const used = [...new Set(projects.map((p) => p.category))];
  if (filters && used.length > 1) {
    filters.className = 'chips';
    filters.innerHTML = [
      `<button class="chip" role="tab" aria-selected="true" data-filter="all">All</button>`,
      ...used.map((key) =>
        `<button class="chip" role="tab" aria-selected="false" data-filter="${esc(key)}">${esc(categories[key] || key)}</button>`),
    ].join('');
  }

  grid.className = 'cards';
  grid.innerHTML = projects.map(projectCard).join('');
}


/* ============================================================
   Websites
   ============================================================ */

function websiteCard(site) {
  const badge = site.type === 'client'
    ? '<span class="badge badge--client">Client project</span>'
    : '<span class="badge">Concept work</span>';

  /* The screenshot is only a link when there is somewhere to go. */
  const shot = site.url
    ? `<a class="site__shot" href="${esc(site.url)}" target="_blank" rel="noopener noreferrer"
          aria-label="Visit ${esc(site.name)} (opens in a new tab)">
         ${media(site, 'Screenshot coming')}
         <span class="site__cta" aria-hidden="true"><span>Visit website ${icon('arrow-right')}</span></span>
       </a>`
    : `<div class="site__shot">${media(site, 'Screenshot coming')}</div>`;

  return `
    <article class="site reveal">
      ${shot}
      <div class="site__body">
        <div class="site__meta">
          ${badge}
          <span class="site__year">${esc(site.year)}</span>
        </div>
        <h3>${esc(site.name)}</h3>
        <p class="site__summary">${esc(site.summary)}</p>
        ${tags(site.technologies)}
        <div class="site__actions">
          ${site.url ? `<a class="btn btn--primary btn--sm" href="${esc(site.url)}" target="_blank" rel="noopener noreferrer">${icon('external')} Visit website</a>` : ''}
          ${site.github ? `<a class="btn btn--ghost btn--sm" href="${esc(site.github)}" target="_blank" rel="noopener noreferrer">${icon('github')} Source</a>` : ''}
          <button class="btn btn--ghost btn--sm" type="button"
                  data-detail="website" data-id="${esc(site.id)}" aria-haspopup="dialog">
            Case study
          </button>
        </div>
      </div>
    </article>`;
}

export function renderWebsites() {
  const list = document.getElementById('sites-list');
  if (!list) return;

  if (!websites.length) {
    list.className = '';
    list.innerHTML = `
      <div class="empty reveal">
        <h3>${esc(websitesEmpty.title)}</h3>
        <p>${esc(websitesEmpty.body)}</p>
      </div>`;
    return;
  }

  list.className = 'sites';
  list.innerHTML = websites.map(websiteCard).join('');
}


/* ============================================================
   Resume
   ============================================================ */

function resumeEntry(entry) {
  return `
    <li class="rentry">
      <div class="rentry__head">
        <h4 class="rentry__role">${esc(entry.role || entry.degree)}</h4>
        <span class="rentry__period">${esc(entry.period)}</span>
      </div>
      <p class="rentry__org">
        ${esc(entry.org)}${entry.location ? ` <span>· ${esc(entry.location)}</span>` : ''}
      </p>
      ${entry.details?.length
        ? `<ul class="rentry__details">${entry.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
        : ''}
    </li>`;
}

/* Blocks with nothing in them are skipped entirely — no empty headings. */
function resumeBlock(title, inner) {
  if (!inner) return '';
  return `
    <section class="rblock reveal">
      <h3 class="rblock__title">${esc(title)}</h3>
      ${inner}
    </section>`;
}

export function renderResume() {
  const experience = resumeBlock('Experience',
    resume.experience.length
      ? `<ul>${resume.experience.map(resumeEntry).join('')}</ul>`
      : '');

  const education = resumeBlock('Education',
    resume.education.length
      ? `<ul>${resume.education.map(resumeEntry).join('')}</ul>`
      : '');

  const languages = resumeBlock('Languages',
    resume.languages.length
      ? `<div class="rgrid">${resume.languages.map((l) => `
          <div class="rgrid__item"><strong>${esc(l.name)}</strong><span>${esc(l.level)}</span></div>`).join('')}</div>`
      : '');

  const certificates = resumeBlock('Certificates',
    resume.certificates.length
      ? `<div class="rgrid">${resume.certificates.map((c) => `
          <div class="rgrid__item">
            <strong>${c.url
              ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.name)}</a>`
              : esc(c.name)}</strong>
            <span>${esc(c.org)}${c.year ? ` · ${esc(c.year)}` : ''}</span>
          </div>`).join('')}</div>`
      : '');

  const achievements = resumeBlock('Achievements',
    resume.achievements.length
      ? `<ul class="bullets">${resume.achievements.map((a) => `
          <li><strong>${esc(a.title)}</strong>${a.year ? ` (${esc(a.year)})` : ''} — ${esc(a.description)}</li>`).join('')}</ul>`
      : '');

  const skillsBlock = resumeBlock('Technical skills',
    `<div class="rgrid">${skills.map((g) => `
        <div class="rgrid__item rgrid__item--stack">
          <strong>${esc(g.label)}</strong>
          <span class="rgrid__list">${esc(g.items.join(' · '))}</span>
        </div>`).join('')}</div>`);

  mount('resume-body', `
    <div class="resume__top reveal">
      <p class="mono muted">${esc(profile.name)} · ${esc(profile.location)}</p>
      ${profile.cvFile
        ? cvButton()
        : `<p class="mono muted">PDF version on request</p>`}
    </div>

    <p class="resume__summary reveal">${esc(resume.summary)}</p>

    <div class="resume__cols">
      <div>${experience}${education}</div>
      <div>${skillsBlock}${languages}${certificates}${achievements}</div>
    </div>
  `);
}


/* ============================================================
   Contact + footer
   ============================================================ */

export function renderContact() {
  mount('contact-body', `
    <h2 id="contact-h">${esc(contact.heading)}</h2>
    <p>${esc(contact.body)}</p>
    <a class="contact__mail" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
    <div class="contact__links">${socialLinks({ style: 'text' })}</div>
  `);

  mount('footer', `
    <p>© ${new Date().getFullYear()} ${esc(profile.name)} · ${esc(profile.location)}</p>
    <p class="footer__built">No cookies · No trackers · Self-hosted fonts</p>
  `);
}


/* ============================================================
   Detail modal — shared by projects and websites
   ============================================================ */

export function detailMarkup(kind, id) {
  const item = kind === 'project'
    ? projects.find((p) => p.id === id)
    : websites.find((w) => w.id === id);
  if (!item) return null;

  const name = item.name || item.title;
  const badge = kind === 'website'
    ? (item.type === 'client'
        ? '<span class="badge badge--client">Client project</span>'
        : '<span class="badge">Concept work</span>')
    : `<span class="badge">${esc(categories[item.category] || 'Project')}</span>`;

  const links = [
    item.url    && `<a class="btn btn--primary btn--sm" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${icon('external')} Visit website</a>`,
    item.demo   && `<a class="btn btn--primary btn--sm" href="${esc(item.demo)}" target="_blank" rel="noopener noreferrer">${icon('external')} Live demo</a>`,
    item.github && `<a class="btn btn--ghost btn--sm" href="${esc(item.github)}" target="_blank" rel="noopener noreferrer">${icon('github')} Source</a>`,
  ].filter(Boolean).join('');

  return `
    <div class="modal__media">${media(item, 'Screenshot coming')}</div>
    <div class="modal__body">
      <div class="modal__meta">
        ${badge}
        <span class="skillcard__count">${esc(item.year || item.date || '')}</span>
      </div>
      <h3 id="modal-title">${esc(name)}</h3>
      ${(item.description || []).map((p) => `<p>${esc(p)}</p>`).join('')}

      ${item.highlights?.length ? `
        <p class="modal__sub">Highlights</p>
        <ul class="bullets">${item.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}

      <p class="modal__sub">Built with</p>
      ${tags(item.technologies)}

      ${links ? `<div class="modal__actions">${links}</div>` : ''}
      ${kind === 'website' && !item.github
        ? '<p class="modal__note">The repository for this one is private, so there is no public source link.</p>'
        : ''}
    </div>`;
}
