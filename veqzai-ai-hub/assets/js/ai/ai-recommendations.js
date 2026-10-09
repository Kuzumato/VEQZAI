/* Game recommendations — content-based filtering.
 * Each game is a weighted tag vector. We build a taste vector from the games you pick, the moods
 * you select and the two sliders, then rank the catalog by cosine similarity, lightly blended
 * with rating and popularity. Every result explains itself ("because you like…").
 * Replace CATALOG with your real library (or fetch it) and the rest keeps working.
 */
(function () {
  'use strict';
  var AI = window.VeqzaiAI;

  var TAGS = [
    ['rpg', 'RPG'], ['action', 'Action'], ['racing', 'Racing'], ['shooter', 'Shooter'],
    ['sports', 'Sports'], ['strategy', 'Strategy'], ['creative', 'Creative'], ['story', 'Story-driven'],
    ['coop', 'Co-op'], ['solo', 'Solo'], ['competitive', 'Competitive'], ['relaxed', 'Relaxed'],
    ['fastpaced', 'Fast-paced'], ['esports', 'Esports'], ['openworld', 'Open world']
  ];
  var TAG_LABEL = {};
  TAGS.forEach(function (t) { TAG_LABEL[t[0]] = t[1]; });

  // First five are the titles featured on the home page; the rest are sample entries.
  var CATALOG = [
    { id: 'arcane', title: 'Arcane Odyssey', icon: '🎮', genre: 'RPG', rating: 4.8, players: 2.4, tags: { rpg: 1, story: 0.9, openworld: 0.7, solo: 0.6, coop: 0.4, relaxed: 0.5 } },
    { id: 'nexus', title: 'Nexus', icon: '⚔️', genre: 'Action', rating: 4.9, players: 5.2, tags: { action: 1, competitive: 0.8, fastpaced: 0.9, coop: 0.3, esports: 0.6 } },
    { id: 'velocity', title: 'Velocity', icon: '🏎️', genre: 'Racing', rating: 4.6, players: 1.8, tags: { racing: 1, competitive: 0.7, fastpaced: 1, esports: 0.5, solo: 0.5 } },
    { id: 'vortex', title: 'Vortex', icon: '👾', genre: 'Shooter', rating: 4.7, players: 3.1, tags: { shooter: 1, competitive: 0.9, fastpaced: 0.9, esports: 0.9, coop: 0.6 } },
    { id: 'champion', title: 'Champion Pro', icon: '⚽', genre: 'Sports', rating: 4.5, players: 2.9, tags: { sports: 1, competitive: 0.8, coop: 0.6, esports: 0.7 } },
    { id: 'hollow', title: 'Hollow Realms', icon: '🗡️', genre: 'RPG', rating: 4.4, players: 1.1, tags: { rpg: 1, coop: 0.8, story: 0.7, openworld: 0.8 } },
    { id: 'pixel', title: 'Pixel Forge', icon: '🧱', genre: 'Creative', rating: 4.3, players: 0.9, tags: { creative: 1, relaxed: 1, solo: 0.7, coop: 0.5 } },
    { id: 'skyline', title: 'Skyline Tactics', icon: '♟️', genre: 'Strategy', rating: 4.5, players: 1.4, tags: { strategy: 1, competitive: 0.8, esports: 0.6, solo: 0.4 } },
    { id: 'drift', title: 'Drift Kings', icon: '🏁', genre: 'Racing', rating: 4.2, players: 0.8, tags: { racing: 1, fastpaced: 0.8, competitive: 0.6, relaxed: 0.2 } },
    { id: 'signal', title: 'Last Signal', icon: '🔦', genre: 'Shooter', rating: 4.6, players: 2.0, tags: { shooter: 0.8, story: 0.9, solo: 0.8, action: 0.5 } },
    { id: 'harbor', title: 'Cozy Harbor', icon: '🌊', genre: 'Sim', rating: 4.1, players: 0.6, tags: { relaxed: 1, creative: 0.6, solo: 0.8, openworld: 0.4 } },
    { id: 'arena', title: 'Iron Arena', icon: '🥊', genre: 'Action', rating: 4.5, players: 1.7, tags: { action: 1, competitive: 1, fastpaced: 0.8, esports: 0.8 } }
  ];

  function cosine(a, b) {
    var dot = 0, na = 0, nb = 0, k;
    for (k in a) {
      na += a[k] * a[k];
      if (b[k]) dot += a[k] * b[k];
    }
    for (k in b) nb += b[k] * b[k];
    return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
  }

  function add(vec, tag, w) {
    vec[tag] = (vec[tag] || 0) + w;
  }

  /**
   * @param {{liked:string[], moods:string[], competitive:number|null, team:number|null}} prefs
   *   competitive/team are 0..1 or null when the slider is untouched.
   */
  function tasteVector(prefs) {
    var v = {};
    prefs.liked.forEach(function (id) {
      var g = CATALOG.filter(function (c) { return c.id === id; })[0];
      if (g) for (var t in g.tags) add(v, t, g.tags[t]);
    });
    prefs.moods.forEach(function (t) { add(v, t, 1.5); });
    if (prefs.competitive !== null) {
      add(v, 'competitive', prefs.competitive * 1.5);
      add(v, 'relaxed', (1 - prefs.competitive) * 1.5);
    }
    if (prefs.team !== null) {
      add(v, 'coop', prefs.team * 1.5);
      add(v, 'solo', (1 - prefs.team) * 1.5);
    }
    return v;
  }

  function recommend(prefs, limit) {
    var taste = tasteVector(prefs);
    var empty = Object.keys(taste).length === 0;
    var maxPlayers = Math.max.apply(null, CATALOG.map(function (c) { return c.players; }));

    var scored = CATALOG.filter(function (g) {
      return prefs.liked.indexOf(g.id) === -1;
    }).map(function (g) {
      var sim = cosine(taste, g.tags);
      var rating = AI.clamp(g.rating - 4, 0, 1);
      var pop = Math.log(1 + g.players) / Math.log(1 + maxPlayers);
      var score = empty ? 0.6 * rating + 0.4 * pop : 0.75 * sim + 0.15 * rating + 0.1 * pop;

      // Explain: tags that contributed most, and the liked game that overlaps most.
      var why = Object.keys(g.tags)
        .filter(function (t) { return taste[t]; })
        .sort(function (a, b) { return taste[b] * g.tags[b] - taste[a] * g.tags[a]; })
        .slice(0, 2)
        .map(function (t) { return TAG_LABEL[t]; });
      var likedMatch = null, best = 0;
      prefs.liked.forEach(function (id) {
        var other = CATALOG.filter(function (c) { return c.id === id; })[0];
        var s = other ? cosine(other.tags, g.tags) : 0;
        if (s > best) { best = s; likedMatch = other; }
      });
      return { game: g, score: score, match: Math.round(AI.clamp(score, 0, 1) * 100), why: why, because: best > 0.35 ? likedMatch : null };
    });

    scored.sort(function (a, b) { return b.score - a.score; });
    return { trending: empty, items: scored.slice(0, limit || 5) };
  }

  function init() {
    var root = AI.$('#panel-recommendations');
    if (!root) return;

    var likedWrap = AI.$('#rec-liked', root);
    var moodWrap = AI.$('#rec-moods', root);
    var compEl = AI.$('#rec-competitive', root);
    var teamEl = AI.$('#rec-team', root);
    var outEl = AI.$('#rec-results', root);
    var headEl = AI.$('#rec-heading', root);
    var state = { liked: [], moods: [], competitive: null, team: null };

    likedWrap.innerHTML = CATALOG.map(function (g) {
      return '<button type="button" class="pick" data-id="' + g.id + '" aria-pressed="false"><span class="pick-icon" aria-hidden="true">' +
        g.icon + '</span><span>' + AI.escapeHtml(g.title) + '</span></button>';
    }).join('');
    moodWrap.innerHTML = TAGS.map(function (t) {
      return '<button type="button" class="chip" data-tag="' + t[0] + '" aria-pressed="false">' + t[1] + '</button>';
    }).join('');

    function toggle(list, value, btn) {
      var i = list.indexOf(value);
      if (i === -1) list.push(value); else list.splice(i, 1);
      btn.setAttribute('aria-pressed', String(i === -1));
    }

    function render() {
      var r = recommend(state, 5);
      headEl.textContent = r.trending ? 'Trending right now — pick a few things on the left to personalise' : 'Picked for you';
      outEl.innerHTML = r.items.map(function (it, i) {
        var reasons = '';
        if (it.because) reasons += 'Because you like <strong>' + AI.escapeHtml(it.because.title) + '</strong>. ';
        if (it.why.length && !r.trending) reasons += 'Matches: ' + it.why.join(', ') + '.';
        if (r.trending) reasons = 'Popular and highly rated on the platform.';
        return '<li class="rec-row">' +
          '<span class="rank">' + (i + 1) + '</span>' +
          '<span class="rec-icon" aria-hidden="true">' + it.game.icon + '</span>' +
          '<div class="rec-body"><strong>' + AI.escapeHtml(it.game.title) + '</strong>' +
          '<div class="sub">' + AI.escapeHtml(it.game.genre) + ' · ★ ' + it.game.rating.toFixed(1) + ' · ' + it.game.players + 'M active</div>' +
          '<div class="why">' + reasons + '</div></div>' +
          (r.trending ? '' : '<div class="match-pct"><strong>' + it.match + '%</strong><span>match</span></div>') +
          '</li>';
      }).join('');
    }

    likedWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.pick');
      if (!b) return;
      toggle(state.liked, b.dataset.id, b);
      render();
    });
    moodWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      toggle(state.moods, b.dataset.tag, b);
      render();
    });
    compEl.addEventListener('input', function () { state.competitive = +compEl.value / 100; render(); });
    teamEl.addEventListener('input', function () { state.team = +teamEl.value / 100; render(); });
    AI.$('#rec-clear', root).addEventListener('click', function () {
      state = { liked: [], moods: [], competitive: null, team: null };
      AI.$$('[aria-pressed="true"]', root).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      compEl.value = 50;
      teamEl.value = 50;
      render();
    });

    render();
  }

  AI.recommendations = { recommend: recommend, catalog: CATALOG, cosine: cosine };
  document.addEventListener('DOMContentLoaded', init);
})();
