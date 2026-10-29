/* ============================================================
   PAGES — what is printed on every page of the 3D book.

   Each page is painted onto a 2D canvas from the same data files the
   classic site uses (js/data/*.js), so nothing is written twice and
   nothing is invented here.

   A painter draws in a fixed "logical" size (1024 × 640 for a page,
   1024 × 670 for the cover) and returns the clickable regions it
   drew, in those same coordinates:
     { x, y, w, h, go: <spread number> }   jump to a spread
     { x, y, w, h, href: '…' }             open a link
   ============================================================ */

import { profile, about } from '../js/data/profile.js';
import { websites } from '../js/data/websites.js';
import { projects, categories } from '../js/data/projects.js';
import { skills } from '../js/data/skills.js';
import { resume } from '../js/data/resume.js';

export const PAGE_W = 1024;
export const PAGE_H = 640;
export const COVER_W = 1024;
export const COVER_H = 640;

const PAPER = '#F3F2EE';
const INK = '#111111';
const INK2 = '#4a4843';
const INK3 = '#8a867d';
const ACCENT = '#9A6A14';
const GOLD = '#c79a45';

/* Websites and analysis projects share one page layout, so normalise them here. */
export const cases = [
  ...websites.map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.type === 'client' ? 'CLIENT PROJECT' : 'CONCEPT WORK',
    year: s.year,
    summary: s.summary,
    highlights: s.highlights,
    technologies: s.technologies,
    image: s.image,
    primary: s.url ? { label: 'Visit live site ↗', href: s.url } : null,
    secondary: s.github ? { label: 'Source ↗', href: s.github } : null,
  })),
  ...projects.map((p) => ({
    id: p.id,
    name: p.title,
    kind: (categories[p.category] || 'Project').toUpperCase(),
    year: p.date,
    summary: p.summary,
    highlights: p.highlights,
    technologies: p.technologies,
    image: p.image,
    primary: p.github ? { label: 'View on GitHub ↗', href: p.github } : null,
    secondary: p.demo ? { label: 'Demo ↗', href: p.demo } : null,
  })),
];

const font = (weight, size) => `${weight} ${size}px Manrope, system-ui, sans-serif`;
const MONO = (size) => `500 ${size}px ui-monospace, Consolas, monospace`;

/* ---------- drawing helpers ---------- */

function wrap(ctx, text, maxW) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* Draw a paragraph, shrinking the type until it fits `maxH`. Returns the y below it. */
function para(ctx, text, x, y, w, maxH, o = {}) {
  const { max = 26, min = 14, lh = 1.5, weight = 400, color = INK2 } = o;
  let size = max;
  for (; size > min; size--) {
    ctx.font = font(weight, size);
    if (wrap(ctx, text, w).length * size * lh <= maxH) break;
  }
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  const lines = wrap(ctx, text, w);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * lh));
  return y + lines.length * size * lh;
}

function text(ctx, str, x, y, f, color, align = 'left') {
  ctx.font = f;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}

function spaced(ctx, on, px = 3) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = on ? `${px}px` : '0px';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* Warm paper with a faint grain and the shadow where it curves into the spine. */
function paper(ctx, w, h, spine) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(80,60,30,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  gutter(ctx, w, h, spine, 0.2);
}

function gutter(ctx, w, h, spine, a) {
  /* The hinge runs along the top edge of a front face and the bottom edge of a back face. */
  const top = spine === 'left';
  const g = top ? ctx.createLinearGradient(0, 0, 0, 80) : ctx.createLinearGradient(0, h, 0, h - 80);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top ? 0 : h - 80, w, 80);
}

function heading(ctx, label, n, x = 64, y = 56) {
  spaced(ctx, true, 3);
  text(ctx, n, x, y, MONO(15), ACCENT);
  spaced(ctx, false);
  text(ctx, label, x, y + 26, font(800, 52), INK);
}

function button(ctx, label, x, y, w, rects, action) {
  roundRect(ctx, x, y, w, 46, 23);
  ctx.fillStyle = INK;
  ctx.fill();
  text(ctx, label, x + 24, y + 13, font(700, 18), PAPER);
  rects.push({ x, y, w, h: 46, ...action });
}

function chip(ctx, label, x, y) {
  ctx.font = font(600, 15);
  const w = ctx.measureText(label).width + 22;
  roundRect(ctx, x, y, w, 30, 15);
  ctx.strokeStyle = 'rgba(17,17,17,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, label, x + 11, y + 7, font(600, 15), INK2);
  return x + w + 8;
}

/* ---------- the pages ---------- */

function paintCover(ctx, w, h) {
  ctx.fillStyle = '#5b3520';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '190,130,80' : '30,12,4'},0.07)`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 40 + Math.random() * 120, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.25)';
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
  }
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
  v.addColorStop(0, 'rgba(255,255,255,0.04)');
  v.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  coverFoil(ctx, w, h);
  return [];
}

/* The gold-foil lettering on its own, so it can also be laid over the photographed book. */
export function coverFoil(ctx, w, h) {
  const foil = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
  foil.addColorStop(0, '#ecd08d');
  foil.addColorStop(0.5, '#b88a36');
  foil.addColorStop(1, '#8a6422');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  spaced(ctx, true, 10);
  ctx.font = font(800, 68);
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillText(profile.name.toUpperCase(), w / 2 + 2, h / 2 - 28 + 2);
  ctx.fillStyle = foil;
  ctx.fillText(profile.name.toUpperCase(), w / 2, h / 2 - 28);
  spaced(ctx, true, 6);
  ctx.font = font(600, 22);
  ctx.fillStyle = GOLD;
  ctx.fillText(profile.title.toUpperCase(), w / 2, h / 2 + 46);
  spaced(ctx, false);
  ctx.strokeStyle = 'rgba(199,154,69,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 70, h / 2 + 14);
  ctx.lineTo(w / 2 + 70, h / 2 + 14);
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

/* Inside front cover — the dark endpaper carries the introduction. */
function paintIntro(ctx, w, h) {
  ctx.fillStyle = '#14110d';
  ctx.fillRect(0, 0, w, h);
  const v = ctx.createRadialGradient(w * 0.35, h * 0.4, 40, w * 0.35, h * 0.4, h);
  v.addColorStop(0, 'rgba(199,154,69,0.10)');
  v.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  gutter(ctx, w, h, 'right', 0.35);

  spaced(ctx, true, 3);
  text(ctx, 'HELLO', 86, 84, MONO(15), GOLD);
  spaced(ctx, false);
  text(ctx, profile.name, 86, 112, font(800, 66), PAPER);
  text(ctx, `${profile.title} · ${profile.subtitle}`, 86, 196, font(600, 22), GOLD);
  para(ctx, profile.intro, 86, 252, 760, 190, { max: 25, min: 16, color: '#cfc9bd' });

  text(ctx, profile.location, 86, 520, font(500, 18), '#8f897c');
  if (profile.availability && profile.availability.available) {
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.arc(94, 576, 6, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, profile.availability.label, 112, 565, font(600, 18), '#cfc9bd');
  }
  return [];
}

function paintContents(ctx, w, h, env) {
  paper(ctx, w, h, 'left');
  heading(ctx, 'Contents', '— INDEX');
  const rects = [];
  const rows = env.contents;
  const y0 = 150;
  const rh = Math.min(60, Math.floor((h - y0 - 22) / rows.length));
  rows.forEach((r, i) => {
    const y = y0 + i * rh;
    text(ctx, String(i + 1).padStart(2, '0'), 64, y + 16, MONO(16), ACCENT);
    const big = rh >= 56;
    ctx.font = font(700, big ? 28 : 22);
    let title = r.title;
    while (ctx.measureText(title).width > w - 112 - 150 && title.length > 8) title = title.slice(0, -2);
    if (title !== r.title) title = `${title.trimEnd()}…`;
    text(ctx, title, 112, y + (big ? 6 : 3), font(700, big ? 28 : 22), INK);
    if (r.note) text(ctx, r.note, 112, y + (big ? 38 : 28), font(500, 13), INK3);
    text(ctx, `→ ${r.page}`, w - 64, y + 14, MONO(16), INK3, 'right');
    ctx.strokeStyle = 'rgba(17,17,17,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(64, y + rh - 4);
    ctx.lineTo(w - 64, y + rh - 4);
    ctx.stroke();
    rects.push({ x: 56, y, w: w - 112, h: rh - 4, go: r.go });
  });
  return rects;
}

function paintCaseImage(site) {
  return (ctx, w, h, env) => {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    const img = env.images[site.id];
    if (img) {
      const s = Math.max(w / img.width, h / img.height);
      const iw = img.width * s;
      const ih = img.height * s;
      ctx.drawImage(img, (w - iw) / 2, 0, iw, ih);
    } else {
      /* No screenshot (analysis projects): a title card with the lead finding. */
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#1b1610');
      bg.addColorStop(1, '#0d0b08');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(199,154,69,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, w - 72, h - 72);
      spaced(ctx, true, 3);
      text(ctx, 'LEAD FINDING', 72, 78, MONO(14), GOLD);
      spaced(ctx, false);
      const lead = (site.highlights && site.highlights[0]) || site.summary;
      para(ctx, lead, 72, 112, w - 144, 250, { max: 34, min: 20, weight: 700, color: '#f3f2ee', lh: 1.35 });
      let tx = 72;
      (site.technologies || []).slice(0, 5).forEach((t) => {
        ctx.font = font(600, 15);
        const cw2 = ctx.measureText(t).width + 22;
        roundRect(ctx, tx, 400, cw2, 30, 15);
        ctx.strokeStyle = 'rgba(243,242,238,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        text(ctx, t, tx + 11, 407, font(600, 15), '#cfc9bd');
        tx += cw2 + 8;
      });
    }
    const g = ctx.createLinearGradient(0, h * 0.62, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.78)');
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.5, w, h * 0.5);
    spaced(ctx, true, 3);
    text(ctx, site.kind, 56, h - 118, MONO(14), GOLD);
    spaced(ctx, false);
    let title = site.name;
    ctx.font = font(800, 40);
    if (ctx.measureText(title).width > w - 190) ctx.font = font(800, 28);
    const tf = ctx.font;
    text(ctx, title, 56, h - 92, tf, '#fff');
    text(ctx, site.year, w - 56, h - 80, MONO(18), '#d8d4ca', 'right');
    gutter(ctx, w, h, 'left', 0.3);
    /* No page-wide link: a click anywhere here turns the page. The link lives on the facing text page. */
    return [];
  };
}

function paintCaseText(site) {
  return (ctx, w, h) => {
    paper(ctx, w, h, 'right');
    const rects = [];
    const x = 56;
    const cw = w - 56 - 70;
    spaced(ctx, true, 3);
    text(ctx, site.kind, x, 52, MONO(14), ACCENT);
    spaced(ctx, false);
    /* Long titles drop to two lines. */
    ctx.font = font(800, 40);
    const long = ctx.measureText(site.name).width > cw;
    const titleSize = long ? 30 : 40;
    ctx.font = font(800, titleSize);
    const tLines = wrap(ctx, site.name, cw).slice(0, 2);
    tLines.forEach((l, i) => text(ctx, l, x, 78 + i * titleSize * 1.15, font(800, titleSize), INK));
    const ty = 78 + tLines.length * titleSize * 1.15 + 10;
    let y = para(ctx, site.summary, x, ty, cw, 96, { max: 22, min: 15, color: INK2 });

    y += 10;
    (site.highlights || []).slice(0, 3).forEach((hl) => {
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.arc(x + 5, y + 10, 4, 0, Math.PI * 2);
      ctx.fill();
      y = para(ctx, hl, x + 22, y, cw - 22, 62, { max: 18, min: 14, color: INK2, lh: 1.35 }) + 8;
    });

    /* Technology chips wrap onto extra rows rather than running off the page. */
    const techs = site.technologies || [];
    let rowsUsed = 1;
    let probe = x;
    techs.forEach((t) => {
      ctx.font = font(600, 15);
      const cwid = ctx.measureText(t).width + 30;
      if (probe + cwid > x + cw) {
        rowsUsed++;
        probe = x;
      }
      probe += cwid;
    });
    let cx = x;
    let cy = h - 98 - rowsUsed * 36;
    techs.forEach((t) => {
      ctx.font = font(600, 15);
      const cwid = ctx.measureText(t).width + 30;
      if (cx + cwid > x + cw) {
        cx = x;
        cy += 36;
      }
      cx = chip(ctx, t, cx, cy);
    });
    if (site.primary) {
      ctx.font = font(700, 18);
      const bw = Math.ceil(ctx.measureText(site.primary.label).width) + 48;
      button(ctx, site.primary.label, x, h - 90, bw, rects, { href: site.primary.href });
      if (site.secondary) {
        text(ctx, site.secondary.label, x + bw + 20, h - 76, font(700, 17), ACCENT);
        rects.push({ x: x + bw + 10, y: h - 90, w: 120, h: 46, href: site.secondary.href });
      }
    }
    return rects;
  };
}

function paintAbout(ctx, w, h) {
  paper(ctx, w, h, 'right');
  heading(ctx, 'About', '— WHO');
  const cw = w - 64 - 76;
  const y = para(ctx, about.paragraphs[0], 64, 150, cw, 150, { max: 24, min: 16 });
  para(ctx, about.paragraphs[1], 64, y + 14, cw, 150, { max: 24, min: 16 });
  let px = 64;
  (about.principles || []).forEach((p) => {
    px = chip(ctx, p.title, px, h - 70);
  });
  return [];
}

function paintSkills(ctx, w, h) {
  paper(ctx, w, h, 'left');
  heading(ctx, 'Skills', '— TOOLKIT');
  const colW = (w - 64 - 64 - 36) / 2;
  skills.slice(0, 4).forEach((cat, i) => {
    const x = 64 + (i % 2) * (colW + 36);
    const y = 168 + Math.floor(i / 2) * 210;
    text(ctx, cat.label, x, y, font(800, 22), INK);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(x, y + 34, 36, 3);
    para(ctx, cat.items.join(' · '), x, y + 52, colW, 130, { max: 19, min: 14, lh: 1.55 });
  });
  return [];
}

function paintExperience(ctx, w, h) {
  paper(ctx, w, h, 'right');
  heading(ctx, 'Experience', '— PATH');
  const cw = w - 64 - 76;
  let y = 160;
  resume.experience.slice(0, 4).forEach((e) => {
    text(ctx, e.role, 64, y, font(700, 23), INK);
    text(ctx, e.period, 64 + cw, y + 4, MONO(15), INK3, 'right');
    text(ctx, e.org, 64, y + 30, font(600, 17), ACCENT);
    y += 72;
  });
  const ed = resume.education[0];
  if (ed) {
    ctx.strokeStyle = 'rgba(17,17,17,0.15)';
    ctx.beginPath();
    ctx.moveTo(64, y + 4);
    ctx.lineTo(64 + cw, y + 4);
    ctx.stroke();
    text(ctx, ed.degree, 64, y + 22, font(700, 19), INK);
    text(ctx, `${ed.org} · ${ed.period}`, 64, y + 48, font(500, 16), INK2);
  }
  return [];
}

function paintContact(ctx, w, h, env) {
  paper(ctx, w, h, 'left');
  heading(ctx, 'Contact', '— SAY HELLO');
  const rects = [];
  const rows = [];
  if (profile.email) rows.push(['Email', profile.email, `mailto:${profile.email}`]);
  if (profile.linkedin) rows.push(['LinkedIn', 'Open profile ↗', profile.linkedin]);
  if (profile.github) rows.push(['GitHub', 'Oguzhan-35 ↗', profile.github]);
  if (profile.cvFile) rows.push(['CV', 'Download PDF ↓', env.base + profile.cvFile]);
  rows.forEach(([k, v, href], i) => {
    const y = 168 + i * 72;
    roundRect(ctx, 64, y, w - 64 - 64, 58, 14);
    ctx.fillStyle = 'rgba(17,17,17,0.05)';
    ctx.fill();
    text(ctx, k, 86, y + 19, MONO(15), INK3);
    text(ctx, v, w - 86, y + 15, font(700, 22), INK, 'right');
    rects.push({ x: 64, y, w: w - 128, h: 58, href });
  });
  text(ctx, profile.location, 64, h - 54, font(500, 17), INK3);
  return rects;
}

/* ---------- assembling the book ---------- */

/* Returns { leaves, base, contents, spreadNames }.
   Leaf k has a `front` (visible on the right) and a `back` (visible on the left
   after the leaf is turned). Spread n shows backs[n-1] | fronts[n]. */
export function buildPages(env) {
  const w = cases.length;
  const aboutSpread = w + 2;
  const expSpread = w + 3;

  env.contents = [
    ...cases.map((s, i) => ({
      title: s.name,
      note: `${s.kind[0]}${s.kind.slice(1).toLowerCase()} · ${s.year}`,
      page: i + 2,
      go: i + 2,
    })),
    { title: 'About', note: 'Who is behind the work', page: aboutSpread, go: aboutSpread },
    { title: 'Skills', note: 'Analysis · data · development', page: aboutSpread, go: aboutSpread },
    { title: 'Experience', note: 'Work and education', page: expSpread, go: expSpread },
    { title: 'Contact & CV', note: 'Get in touch', page: expSpread, go: expSpread },
  ];

  const cover = { paint: paintCover, w: COVER_W, h: COVER_H, face: 'front', round: 34 };
  const intro = { paint: paintIntro, w: COVER_W, h: COVER_H, face: 'back', round: 34 };
  const pg = (paint, face = 'front') => ({ paint, w: PAGE_W, h: PAGE_H, face, round: 8 });

  const fronts = [
    cover,
    pg(paintContents),
    ...cases.map((s) => pg(paintCaseImage(s))),
    pg(paintSkills),
  ];
  const backs = [
    intro,
    ...cases.map((s) => pg(paintCaseText(s), 'back')),
    pg(paintAbout, 'back'),
    pg(paintExperience, 'back'),
  ];

  const names = [
    'Cover',
    'Contents',
    ...cases.map((s) => s.name),
    'About and skills',
    'Experience and contact',
  ];

  return {
    leaves: fronts.map((f, i) => ({ front: f, back: backs[i] })),
    base: pg(paintContact),
    spreadNames: names,
  };
}

/* Paint one page to a canvas (2× oversampled) and remember its click regions. */
export function paintPage(page, env, scale = 1.25) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(page.w * scale);
  canvas.height = Math.round(page.h * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  /* Round the two outer corners (the spine side stays square) by clipping; the
     transparent corners are cut away with alphaTest on the material. */
  const r = page.round || 0;
  if (r) {
    const { w, h } = page;
    const front = page.face !== 'back';
    ctx.beginPath();
    if (front) {
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
    } else {
      ctx.moveTo(0, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, r);
      ctx.quadraticCurveTo(w, 0, w - r, 0);
      ctx.lineTo(r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
    }
    ctx.closePath();
    ctx.clip();
  }
  const rects = page.paint(ctx, page.w, page.h, env) || [];
  return { canvas, rects, w: page.w, h: page.h };
}
