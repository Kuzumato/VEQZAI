document.addEventListener('DOMContentLoaded', function() {

  // ── data-href buttons ─────────────────────────────────────
  document.querySelectorAll('[data-href]').forEach(function(element) {
    element.addEventListener('click', function() {
      const href = element.dataset.href;
      const isLoginTarget = href === 'pages/auth/login/login.html';
      const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';

      if (isLoginTarget && isLoggedIn) {
        window.location.href = 'pages/dashboard/dashboard.html';
        return;
      }

      window.location.href = href;
    });
  });

  // ── copyright year ────────────────────────────────────────
  var yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── mobile hamburger ─────────────────────────────────────
  var hamburger = document.getElementById('navHamburger');
  var navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      var open = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

});
