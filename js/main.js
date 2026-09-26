/* ============================================================================
   MAIN — renders the page, then wires up behaviour.

   Contents
   01. Render
   02. Theme toggle
   03. Header: stuck state + reading progress
   04. Mobile menu
   05. Active section in nav
   06. Scroll reveal
   07. Project filters
   08. Detail modal
   ========================================================================== */

import {
  renderHero, renderAbout, renderSkills, renderProjects,
  renderWebsites, renderResume, renderContact, detailMarkup,
} from './render.js';


/* ============================================================
   01. RENDER
   ============================================================ */
renderHero();
renderAbout();
renderSkills();
renderProjects();
renderWebsites();
renderResume();
renderContact();


/* ============================================================
   02. THEME TOGGLE
   The initial value is set by the inline script in <head> so the page
   never flashes the wrong colours. This only handles the switch.
   ============================================================ */
const themeToggle = document.getElementById('theme-toggle');

themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch (e) {
    /* Private browsing — the choice just will not survive a reload. */
  }
});


/* ============================================================
   03. HEADER — border once scrolled, plus a reading-progress line
   ============================================================ */
const header = document.getElementById('header');
const progress = document.getElementById('progress');

let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('is-stuck', y > 8);

  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });
onScroll();


/* ============================================================
   04. MOBILE MENU
   ============================================================ */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

function setMenu(open) {
  if (!burger || !mobileMenu) return;
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = false;           // must be visible for the transition
  mobileMenu.classList.toggle('is-open', open);
  document.body.classList.toggle('is-locked', open);

  if (!open) {
    /* Hide it from assistive tech again once the fade has finished. */
    setTimeout(() => {
      if (!mobileMenu.classList.contains('is-open')) mobileMenu.hidden = true;
    }, 240);
  }
}

setMenu(false);

burger?.addEventListener('click', () => {
  setMenu(burger.getAttribute('aria-expanded') !== 'true');
});

mobileMenu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    burger.focus();
  }
});

/* Leaving mobile width with the menu open would otherwise lock scrolling. */
window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});


/* ============================================================
   05. ACTIVE SECTION IN NAV
   ============================================================ */
const navLinks = [...document.querySelectorAll('.nav__link')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (sections.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => spy.observe(section));
}


/* ============================================================
   06. SCROLL REVEAL
   ============================================================ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-in'));
} else {
  const revealer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  document.querySelectorAll('.reveal').forEach((node) => revealer.observe(node));
}


/* ============================================================
   07. PROJECT FILTERS
   ============================================================ */
const filters = document.getElementById('projects-filters');

filters?.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;

  filters.querySelectorAll('.chip').forEach((node) => {
    node.setAttribute('aria-selected', String(node === chip));
  });

  const wanted = chip.dataset.filter;
  document.querySelectorAll('#projects-grid .card').forEach((card) => {
    card.hidden = wanted !== 'all' && card.dataset.category !== wanted;
  });
});


/* ============================================================
   08. DETAIL MODAL
   <dialog> handles the focus trap and Escape natively; this adds
   content, backdrop-click closing and focus restoration.
   ============================================================ */
const modal = document.getElementById('modal');
const modalPanel = document.getElementById('modal-panel');
let lastTrigger = null;

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-detail]');
  if (!trigger || !modal || !modalPanel) return;

  const markup = detailMarkup(trigger.dataset.detail, trigger.dataset.id);
  if (!markup) return;

  lastTrigger = trigger;
  modalPanel.innerHTML = markup;
  modalPanel.scrollTop = 0;
  modal.showModal();
  document.body.classList.add('is-locked');
});

modal?.addEventListener('click', (event) => {
  /* Anywhere outside the panel — including the backdrop — closes it. */
  if (event.target.closest('[data-close]') || !event.target.closest('.modal__panel')) {
    modal.close();
  }
});

modal?.addEventListener('close', () => {
  document.body.classList.remove('is-locked');
  if (modalPanel) modalPanel.innerHTML = '';
  lastTrigger?.focus();
  lastTrigger = null;
});
