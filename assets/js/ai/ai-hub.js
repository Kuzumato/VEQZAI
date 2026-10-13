/* AI Hub page: accessible tabs with deep links (#matchmaking, #recommendations, #moderation, #assistant). */
(function () {
  'use strict';
  var AI = window.VeqzaiAI;

  document.addEventListener('DOMContentLoaded', function () {
    var tabs = AI.$$('[role="tab"]');
    var panels = AI.$$('[role="tabpanel"]');
    if (!tabs.length) return;

    function select(name, focus) {
      var found = false;
      tabs.forEach(function (t) {
        var on = t.dataset.tab === name;
        if (on) found = true;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      if (!found) return select(tabs[0].dataset.tab, focus);
      panels.forEach(function (p) { p.hidden = p.id !== 'panel-' + name; });
      try { history.replaceState(null, '', '#' + name); } catch (e) { /* file:// or sandboxed */ }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.dataset.tab, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(tabs[n].dataset.tab, true); }
      });
    });

    window.addEventListener('hashchange', function () { select(location.hash.slice(1), false); });
    select(location.hash.slice(1) || tabs[0].dataset.tab, false);
  });
})();
