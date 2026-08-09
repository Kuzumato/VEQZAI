document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-href]').forEach(function(element) {
    element.addEventListener('click', function() {
      window.location.href = element.dataset.href;
    });
  });
});
