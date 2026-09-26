/* ============================================================
   Runs before first paint, synchronously, so the page never flashes
   the wrong theme. Kept as its own file rather than an inline script
   so the Content-Security-Policy can stay at script-src 'self' with
   no 'unsafe-inline'.
   ============================================================ */
(function () {
  /* Marks that scripting is alive. Reveal animations are scoped to .js in
     the stylesheet, so a module failure can never leave the page blank. */
  document.documentElement.classList.add('js');

  try {
    var stored = localStorage.getItem('theme');
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    document.documentElement.dataset.theme = stored || (prefersLight ? 'light' : 'dark');
  } catch (e) {
    /* Private browsing blocks localStorage — the dark default stays. */
  }
})();
