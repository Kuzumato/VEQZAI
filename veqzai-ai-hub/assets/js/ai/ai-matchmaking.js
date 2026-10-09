/* Smart matchmaking + skill rating.
 * - Skill model: Elo (expected score + adaptive K-factor).
 * - Match quality blends skill gap, estimated ping, and (for teammates) role fit.
 * - The search window widens the longer you wait, like a real queue.
 * The player pool is simulated; swap `buildPool()` for a call to your real player service.
 */
(function () {
  'use strict';
  var AI = window.VeqzaiAI;

  var REGIONS = {
    NA: 'North America',
    EU: 'Europe',
    ASIA: 'Asia',
    SA: 'South America',
    OCE: 'Oceania'
  };
  // Typical round-trip ms between regions.
  var PING = {
    NA: { NA: 25, EU: 95, ASIA: 170, SA: 130, OCE: 190 },
    EU: { NA: 95, EU: 25, ASIA: 150, SA: 200, OCE: 270 },
    ASIA: { NA: 170, EU: 150, ASIA: 30, SA: 290, OCE: 110 },
    SA: { NA: 130, EU: 200, ASIA: 290, SA: 30, OCE: 260 },
    OCE: { NA: 190, EU: 270, ASIA: 110, SA: 260, OCE: 25 }
  };
  var ROLES = ['Tank', 'Damage', 'Support', 'Flex'];

  var PREFIX = ['Nova', 'Kairo', 'Vex', 'Astra', 'Rune', 'Zeph', 'Onyx', 'Lyra', 'Echo', 'Drift', 'Pyro', 'Sable', 'Quill', 'Jinx', 'Mako', 'Ember'];
  var SUFFIX = ['Strike', 'Wolf', 'Byte', 'Fox', 'Blade', 'Shade', 'Pulse', 'Hawk', 'Storm', 'Flux', 'Rift', 'Spark'];

  /** Elo expected score for player A against B (probability A wins). */
  function expected(a, b) {
    return 1 / (1 + Math.pow(10, (b - a) / 400));
  }

  /** New players move fast; veterans move slowly. */
  function kFactor(games) {
    if (games < 10) return 48;
    if (games < 30) return 32;
    return 20;
  }

  function pingBetween(a, b, jitter) {
    return Math.round(PING[a][b] + jitter);
  }

  function buildPool() {
    var rnd = AI.mulberry32(7);
    var regionKeys = Object.keys(REGIONS);
    var seen = {};
    var pool = [];
    while (pool.length < 60) {
      var name = PREFIX[Math.floor(rnd() * PREFIX.length)] + SUFFIX[Math.floor(rnd() * SUFFIX.length)];
      if (seen[name]) continue;
      seen[name] = true;
      // Box–Muller for a bell-shaped rating distribution around 1500.
      var u = Math.max(rnd(), 1e-9);
      var v = rnd();
      var gauss = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      pool.push({
        name: name,
        rating: Math.round(AI.clamp(1500 + gauss * 320, 700, 2700)),
        region: regionKeys[Math.floor(rnd() * regionKeys.length)],
        role: ROLES[Math.floor(rnd() * ROLES.length)],
        jitter: Math.round(rnd() * 24 - 6)
      });
    }
    return pool;
  }

  function roleFit(mine, theirs) {
    if (theirs === 'Flex') return 0.85;
    if (mine === 'Flex') return 0.85;
    return mine === theirs ? 0.3 : 1; // complementary roles make better squads
  }

  /**
   * Rank candidates for a player. Pure function, so it is easy to unit test or move server-side.
   * @param {{rating:number, region:string, role:string}} me
   * @param {Array} pool
   * @param {{mode:'opponent'|'teammate', waitSeconds:number}} opts
   */
  function findMatches(me, pool, opts) {
    var windowSize = Math.min(100 + 12 * opts.waitSeconds, 900);
    var results = [];
    pool.forEach(function (p) {
      var diff = Math.abs(p.rating - me.rating);
      if (diff > windowSize) return;
      var ping = pingBetween(me.region, p.region, p.jitter);
      var skillScore = Math.exp(-Math.pow(diff / 300, 2));
      var pingScore = AI.clamp(1 - (ping - 30) / 220, 0, 1);
      var quality;
      if (opts.mode === 'teammate') {
        quality = 0.55 * skillScore + 0.25 * pingScore + 0.2 * roleFit(me.role, p.role);
      } else {
        quality = 0.7 * skillScore + 0.3 * pingScore;
      }
      var win = expected(me.rating, p.rating);
      results.push({
        player: p,
        diff: diff,
        ping: ping,
        quality: Math.round(quality * 100),
        winChance: win,
        fairness: Math.round(100 - Math.abs(win - 0.5) * 200)
      });
    });
    results.sort(function (a, b) {
      return b.quality - a.quality;
    });
    return { windowSize: windowSize, matches: results };
  }

  function tier(rating) {
    if (rating >= 2300) return 'Grandmaster';
    if (rating >= 2000) return 'Diamond';
    if (rating >= 1700) return 'Platinum';
    if (rating >= 1450) return 'Gold';
    if (rating >= 1200) return 'Silver';
    return 'Bronze';
  }

  function sparkline(history) {
    var w = 260,
      h = 56,
      pad = 4;
    if (history.length < 2) return '';
    var min = Math.min.apply(null, history) - 10;
    var max = Math.max.apply(null, history) + 10;
    var pts = history
      .map(function (v, i) {
        var x = pad + (i * (w - pad * 2)) / (history.length - 1);
        var y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
        return x.toFixed(1) + ',' + y.toFixed(1);
      })
      .join(' ');
    return (
      '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Your rating over recent matches" class="spark">' +
      '<polyline fill="none" stroke="var(--accent2)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="' + pts + '"/>' +
      '</svg>'
    );
  }

  function init() {
    var root = AI.$('#panel-matchmaking');
    if (!root) return;

    var pool = buildPool();
    var me = { rating: 1500, region: 'NA', role: 'Damage', games: 0, history: [1500] };
    var state = { mode: 'opponent', wait: 10, current: [] };

    var ratingEl = AI.$('#mm-rating', root);
    var ratingOut = AI.$('#mm-rating-out', root);
    var regionEl = AI.$('#mm-region', root);
    var roleEl = AI.$('#mm-role', root);
    var waitEl = AI.$('#mm-wait', root);
    var waitOut = AI.$('#mm-wait-out', root);
    var listEl = AI.$('#mm-results', root);
    var summaryEl = AI.$('#mm-summary', root);
    var resultEl = AI.$('#mm-outcome', root);
    var profileEl = AI.$('#mm-profile', root);
    var roleField = AI.$('#mm-role-field', root);
    var modeBtns = AI.$$('[data-mm-mode]', root);

    function renderProfile() {
      profileEl.innerHTML =
        '<div class="profile-rating">' + me.rating + '</div>' +
        '<div class="profile-meta"><strong>' + tier(me.rating) + '</strong><span>' + me.games + ' ranked games</span></div>' +
        sparkline(me.history);
    }

    function render() {
      var out = findMatches(me, pool, { mode: state.mode, waitSeconds: state.wait });
      state.current = out.matches.slice(0, 6);
      summaryEl.textContent =
        'Search window ±' + out.windowSize + ' rating · ' + out.matches.length + ' candidate' + (out.matches.length === 1 ? '' : 's') + ' in range';

      if (!state.current.length) {
        listEl.innerHTML =
          '<li class="empty">No players inside the search window yet. Drag <strong>Time in queue</strong> up and the window widens.</li>';
        return;
      }

      listEl.innerHTML = state.current
        .map(function (m, i) {
          var p = m.player;
          var role = state.mode === 'teammate' ? '<span class="tag">' + AI.escapeHtml(p.role) + '</span>' : '';
          return (
            '<li class="match-row">' +
            '<div class="match-main">' +
            '<span class="rank">' + (i + 1) + '</span>' +
            '<div><strong>' + AI.escapeHtml(p.name) + '</strong>' +
            '<div class="sub">' + p.rating + ' · ' + AI.escapeHtml(REGIONS[p.region]) + ' · ' + m.ping + ' ms</div></div>' +
            role +
            '</div>' +
            '<div class="match-stats">' +
            '<div class="meter" role="img" aria-label="Match quality ' + m.quality + ' percent"><span style="width:' + m.quality + '%"></span></div>' +
            '<div class="sub">Quality <strong>' + m.quality + '%</strong> · Your win chance <strong>' + Math.round(m.winChance * 100) + '%</strong></div>' +
            '</div>' +
            '<button type="button" class="btn-mini" data-play="' + i + '">' + (state.mode === 'teammate' ? 'Squad up' : 'Play match') + '</button>' +
            '</li>'
          );
        })
        .join('');
    }

    function play(i) {
      var m = state.current[i];
      if (!m) return;
      var won = Math.random() < m.winChance;
      var k = kFactor(me.games);
      var delta = Math.round(k * ((won ? 1 : 0) - m.winChance));
      me.rating = AI.clamp(me.rating + delta, 600, 3000);
      me.games += 1;
      me.history.push(me.rating);
      if (me.history.length > 20) me.history.shift();
      ratingEl.value = AI.clamp(me.rating, +ratingEl.min, +ratingEl.max);
      ratingOut.textContent = me.rating;
      resultEl.className = 'outcome ' + (won ? 'win' : 'loss');
      resultEl.innerHTML =
        (won ? 'Victory' : 'Defeat') + ' vs <strong>' + AI.escapeHtml(m.player.name) + '</strong> — rating ' +
        (delta >= 0 ? '+' : '') + delta + ' (K=' + k + '). You were a ' + Math.round(m.winChance * 100) + '% favourite' +
        (won === m.winChance >= 0.5 ? '.' : ' — an upset!');
      renderProfile();
      render();
    }

    ratingEl.addEventListener('input', function () {
      me.rating = +ratingEl.value;
      me.history = [me.rating];
      me.games = 0;
      ratingOut.textContent = me.rating;
      resultEl.className = 'outcome';
      resultEl.textContent = '';
      renderProfile();
      render();
    });
    regionEl.addEventListener('change', function () {
      me.region = regionEl.value;
      render();
    });
    roleEl.addEventListener('change', function () {
      me.role = roleEl.value;
      render();
    });
    waitEl.addEventListener('input', function () {
      state.wait = +waitEl.value;
      waitOut.textContent = state.wait + 's';
      render();
    });
    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.mode = btn.dataset.mmMode;
        modeBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        roleField.hidden = state.mode !== 'teammate';
        render();
      });
    });
    listEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-play]');
      if (btn) play(+btn.dataset.play);
    });
    AI.$('#mm-reset', root).addEventListener('click', function () {
      me.rating = +ratingEl.value;
      me.history = [me.rating];
      me.games = 0;
      resultEl.className = 'outcome';
      resultEl.textContent = '';
      renderProfile();
      render();
    });

    renderProfile();
    render();
  }

  AI.matchmaking = { expected: expected, kFactor: kFactor, findMatches: findMatches, buildPool: buildPool, tier: tier };
  document.addEventListener('DOMContentLoaded', init);
})();
