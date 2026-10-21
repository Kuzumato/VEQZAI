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

  // ── game story modal ─────────────────────────────────────
  var modal      = document.getElementById('gameModal');
  var modalClose = document.getElementById('modalClose');
  var backdrop   = modal && modal.querySelector('.game-modal-backdrop');

  function openModal(card) {
    document.getElementById('modalIcon').textContent  = card.dataset.icon  || '🎮';
    document.getElementById('modalBadge').textContent = card.dataset.badge || 'New';
    document.getElementById('modalGenre').textContent = card.dataset.genre || '';
    document.getElementById('modalTitle').textContent = card.dataset.title || '';
    document.getElementById('modalStory').textContent = card.dataset.story || '';

    var meta = document.getElementById('modalMeta');
    meta.innerHTML = '';
    [card.dataset.meta1, card.dataset.meta2].forEach(function(m) {
      if (!m) return;
      var s = document.createElement('span'); s.textContent = m;
      meta.appendChild(s);
    });

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.game-card[data-game]').forEach(function(card) {
    card.addEventListener('click', function() { openModal(card); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (backdrop)   backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

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
