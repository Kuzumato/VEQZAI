document.addEventListener('DOMContentLoaded', function() {
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
});
