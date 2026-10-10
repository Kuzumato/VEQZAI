// AI Hub tab switching
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');

    if (!tabs.length) return;

    // Handle URL hash
    function showTab(tabName) {
      tabs.forEach(tab => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
      });

      panels.forEach(panel => {
        const isActive = panel.id === `${tabName}-panel`;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
    }

    // Click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        showTab(tabName);
        window.location.hash = `#${tabName}`;
      });
    });

    // Load from hash or default
    const hash = window.location.hash.slice(1) || 'matchmaking';
    showTab(hash);
  });
})();
