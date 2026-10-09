/* VEQZAI support assistant.
 * Default mode: retrieval over the knowledge base below (TF-IDF cosine + synonym folding). It only
 * answers from the KB, says so when it is unsure, and points to support@veqzai.com instead of guessing.
 * Optional mode: set window.VEQZAI_AI_CONFIG.assistantEndpoint to a server-side proxy that calls an LLM.
 *   Request:  POST { question: string, context: [{ title, answer }] }
 *   Response: { answer: string }
 * Keep API keys on that server — never in this front-end code. If the endpoint fails, the local answer is used.
 *
 * Edit KB to match what is really live on the platform. Statuses here reflect the current build.
 */
(function () {
  'use strict';
  var AI = window.VeqzaiAI;

  var KB = [
    {
      id: 'about', title: 'What is VEQZAI?',
      keywords: 'about platform what overview gaming esports',
      answer: 'VEQZAI is a gaming and esports platform. You can browse featured games, build a character, and use dashboards for Heroes, Armory, Watch, Learn, Arcade and Fandom. Some parts of the platform are still in development.',
      links: [{ label: 'About VEQZAI', href: '../../VEQZAI.html' }]
    },
    {
      id: 'signup', title: 'How do I create an account?',
      keywords: 'sign up signup register join create account new player start',
      answer: 'Press Sign Up. The form has two parts: identity verification details, then your game account (username, email and a password of at least 6 characters). Accept the Terms and Privacy Policy and you will be taken to the character creator. In the current build the form is handled in your browser; there is no live account server yet.',
      links: [{ label: 'Sign up', href: '../../signup.html' }]
    },
    {
      id: 'login', title: 'How do I log in?',
      keywords: 'login log in sign in signin access dashboard redirected session logout',
      answer: 'Press Login on the home page and enter your username and password. Dashboard pages send you to the login screen if you are not signed in. Your session lasts until you close the browser, so you will need to log in again next time.',
      links: [{ label: 'Login', href: '../auth/login/login.html' }]
    },
    {
      id: 'password', title: 'I forgot my password',
      keywords: 'forgot password reset recover lost locked out change',
      answer: 'A password-reset flow exists in the development backend but is not connected to the public site yet. For now, email support@veqzai.com from the address on your account and the team can help.',
      links: [{ label: 'Email support', href: 'mailto:support@veqzai.com' }]
    },
    {
      id: 'dashboard', title: 'What is in the dashboard?',
      keywords: 'dashboard sections heroes armory watch learn arcade fandom menu navigation',
      answer: 'The dashboard has seven areas: Heroes, Character, Armory, Watch, Learn, Arcade and Fandom, plus a coin balance in the top bar that opens the crypto dashboard. You must be logged in to open them.',
      links: [{ label: 'Open dashboard', href: '../dashboard/dashboard.html' }]
    },
    {
      id: 'character', title: 'Can I create a character?',
      keywords: 'character creator customise customize avatar hero design make',
      answer: 'Yes. The Character page is a character creator. After signing up you land there automatically, and you can return to it from the dashboard menu.',
      links: [{ label: 'Character creator', href: '../dashboard/character%20making.html' }]
    },
    {
      id: 'tournaments', title: 'Are there tournaments and prizes?',
      keywords: 'tournament compete prize pool leaderboard esports competition event',
      answer: 'Tournaments and prize pools are part of the platform vision but are not live in this build, so there are no entries or payouts yet. The Arcade dashboard previews how challenges and events will look.',
      links: [{ label: 'Arcade dashboard', href: '../dashboard/arcade-dashboard.html' }]
    },
    {
      id: 'streaming', title: 'Can I watch or stream?',
      keywords: 'stream streaming watch live broadcast creator twitch video',
      answer: 'There is a Watch dashboard that previews followed streamers and reminders. Live streaming itself is not active yet.',
      links: [{ label: 'Watch dashboard', href: '../dashboard/watch-dashboard.html' }]
    },
    {
      id: 'games', title: 'Which games are available?',
      keywords: 'games library catalog catalogue titles play featured trending download',
      answer: 'The home page features Arcane Odyssey, Nexus, Velocity, Vortex and Champion Pro. The game library is still growing. The Recommendations tool in this hub shows how personalised suggestions will work.',
      links: [{ label: 'Featured games', href: '../../index.html#games' }]
    },
    {
      id: 'matchmaking', title: 'How does matchmaking work?',
      keywords: 'matchmaking match rating elo rank ranked ranking level skill fair opponent teammate queue ping latency works',
      answer: 'Matchmaking uses an Elo-style skill rating. It pairs you with players close to your rating and region (lower ping), and the search window widens the longer you wait. For squads it also prefers complementary roles. Try it in the Matchmaking tab.',
      links: []
    },
    {
      id: 'report', title: 'How do I report a player or message?',
      keywords: 'report abuse harassment toxic cheating cheater ban block moderation safety bully',
      answer: 'Chat moderation filters harassment, threats, scams and personal information automatically, and holds uncertain messages for a human moderator. To report a player, email support@veqzai.com with their username and what happened.',
      links: [{ label: 'Email support', href: 'mailto:support@veqzai.com' }]
    },
    {
      id: 'scam', title: 'Someone asked for my password',
      keywords: 'scam phishing password hacked stolen account fraud suspicious free giveaway link',
      answer: 'Never share your password, verification codes or recovery phrases, and ignore "free skins/coins" offers. VEQZAI staff will never ask for them. If you already shared something, change your password and email support@veqzai.com right away.',
      links: [{ label: 'Email support', href: 'mailto:support@veqzai.com' }]
    },
    {
      id: 'coins', title: 'What are the coins?',
      keywords: 'coins coin balance currency crypto wallet money credits',
      answer: 'The coin counter in the dashboard top bar opens the crypto dashboard. In the current build it is a preview of the in-platform wallet, not real money.',
      links: [{ label: 'Crypto dashboard', href: '../dashboard/crypto-dashboard.html' }]
    },
    {
      id: 'privacy', title: 'How is my data handled?',
      keywords: 'privacy data personal information terms policy gdpr delete storage cookies',
      answer: 'Read the Privacy Policy and Terms for the full details. The tools in this AI Hub run entirely in your browser; what you type here is not sent anywhere.',
      links: [{ label: 'Privacy', href: '../../privacy.html' }, { label: 'Terms', href: '../../terms.html' }]
    },
    {
      id: 'contact', title: 'How do I contact support?',
      keywords: 'contact support help email team reach human agent talk',
      answer: 'Email support@veqzai.com, or see the team page linked from the footer.',
      links: [{ label: 'Email support', href: 'mailto:support@veqzai.com' }, { label: 'Team page', href: '../team.html' }]
    }
  ];

  // Fold common wording onto one canonical term so "register" finds "sign up".
  var SYNONYMS = {
    register: 'signup', join: 'signup', registration: 'signup', create: 'signup', sign: 'signup', signin: 'login', logon: 'login',
    username: 'login', authenticate: 'login', locked: 'password', forgot: 'password', reset: 'password', pass: 'password', passwd: 'password',
    cheater: 'cheat', hacker: 'hack', toxic: 'harassment', abuse: 'harassment', bully: 'harassment', bullying: 'harassment',
    elo: 'rating', rank: 'rating', mmr: 'rating', lag: 'ping', latency: 'ping',
    refund: 'money', pay: 'money', payment: 'money', price: 'money', cost: 'money', free: 'free',
    twitch: 'stream', broadcast: 'stream', streamer: 'stream', recommend: 'recommendation', suggest: 'recommendation',
    avatar: 'character', hero: 'character', heroes: 'character'
  };
  var STOP = new Set('a an the i me my we our you your is are was were be been am do does did can could would should will to of in on for with at by from and or but if so it its this that these those what how why when where who which there here about into any some just please hi hello hey thanks thank want need get have has had not no yes also very much more'.split(' '));

  function stem(w) {
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
    if (w.length > 4 && /es$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }

  function tokens(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
      .filter(function (w) { return !STOP.has(w); })
      .map(function (w) { return stem(SYNONYMS[w] || w); })
      .map(function (w) { return SYNONYMS[w] || w; });
  }

  // Build the index once. Title and keywords count more than the answer body.
  var docs = KB.map(function (e) {
    var tf = {};
    function add(text, weight) {
      tokens(text).forEach(function (t) { tf[t] = (tf[t] || 0) + weight; });
    }
    add(e.title, 3);
    add(e.keywords, 2);
    add(e.answer, 1);
    return { entry: e, tf: tf };
  });
  var df = {};
  docs.forEach(function (d) { Object.keys(d.tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; }); });
  function idf(t) { return Math.log(1 + docs.length / (df[t] || 0.5)); }
  docs.forEach(function (d) {
    var norm = 0;
    d.vec = {};
    Object.keys(d.tf).forEach(function (t) {
      var w = (1 + Math.log(d.tf[t])) * idf(t);
      d.vec[t] = w;
      norm += w * w;
    });
    d.norm = Math.sqrt(norm);
  });

  /** Returns KB entries ranked by relevance to the question. */
  function search(question) {
    var q = {};
    tokens(question).forEach(function (t) { q[t] = (q[t] || 0) + 1; });
    var qn = 0;
    Object.keys(q).forEach(function (t) { q[t] = (1 + Math.log(q[t])) * idf(t); qn += q[t] * q[t]; });
    qn = Math.sqrt(qn);
    if (!qn) return [];
    return docs.map(function (d) {
      var dot = 0;
      Object.keys(q).forEach(function (t) { if (d.vec[t]) dot += q[t] * d.vec[t]; });
      return { entry: d.entry, score: dot / (qn * d.norm) };
    }).sort(function (a, b) { return b.score - a.score; });
  }

  var CONFIDENT = 0.22; // below this we admit we are unsure

  function answerLocal(question) {
    var ranked = search(question);
    var top = ranked[0];
    if (!top || top.score < CONFIDENT) {
      return {
        confident: false,
        text: "I'm not sure about that one, and I'd rather not guess. You could try rewording it, pick a topic below, or email support@veqzai.com and the team will help.",
        links: [{ label: 'Email support', href: 'mailto:support@veqzai.com' }],
        related: ranked.slice(0, 3).map(function (r) { return r.entry; }),
        context: []
      };
    }
    return {
      confident: true,
      text: top.entry.answer,
      links: top.entry.links,
      related: [],
      title: top.entry.title,
      context: ranked.slice(0, 3).filter(function (r) { return r.score >= CONFIDENT * 0.6; }).map(function (r) {
        return { title: r.entry.title, answer: r.entry.answer };
      })
    };
  }

  function askEndpoint(question, context, endpoint) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, context: context }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('Bad response');
      return data.answer.trim();
    });
  }

  function init() {
    var root = AI.$('#panel-assistant');
    if (!root) return;

    var log = AI.$('#asst-log', root);
    var form = AI.$('#asst-form', root);
    var input = AI.$('#asst-input', root);
    var chipsWrap = AI.$('#asst-chips', root);

    var SUGGESTIONS = ['How do I create an account?', 'I forgot my password', 'Are there tournaments?', 'How does matchmaking work?', 'How do I report a player?'];
    chipsWrap.innerHTML = SUGGESTIONS.map(function (s) {
      return '<button type="button" class="chip" data-q="' + AI.escapeHtml(s) + '">' + AI.escapeHtml(s) + '</button>';
    }).join('');

    function bubble(who, html) {
      var li = document.createElement('li');
      li.className = 'bubble ' + who;
      li.innerHTML = html;
      log.appendChild(li);
      log.scrollTop = log.scrollHeight;
      return li;
    }

    function linksHtml(links) {
      if (!links || !links.length) return '';
      return '<div class="bubble-links">' + links.map(function (l) {
        return '<a href="' + AI.escapeHtml(l.href) + '">' + AI.escapeHtml(l.label) + '</a>';
      }).join('') + '</div>';
    }

    function relatedHtml(items) {
      if (!items || !items.length) return '';
      return '<div class="bubble-links">' + items.map(function (e) {
        return '<button type="button" class="chip" data-q="' + AI.escapeHtml(e.title) + '">' + AI.escapeHtml(e.title) + '</button>';
      }).join('') + '</div>';
    }

    function ask(question) {
      question = question.trim();
      if (!question) return;
      bubble('user', AI.escapeHtml(question));
      var local = answerLocal(question);
      var endpoint = window.VEQZAI_AI_CONFIG.assistantEndpoint;
      var pending = bubble('bot', '<span class="typing" aria-label="Assistant is typing"><i></i><i></i><i></i></span>');

      function show(text, viaModel) {
        pending.innerHTML =
          '<p>' + AI.escapeHtml(text) + '</p>' +
          (local.confident && !viaModel ? '<div class="src">From: ' + AI.escapeHtml(local.title) + '</div>' : '') +
          linksHtml(local.links) + relatedHtml(local.related);
        log.scrollTop = log.scrollHeight;
      }

      if (endpoint) {
        askEndpoint(question, local.context, endpoint).then(function (a) { show(a, true); }, function () { show(local.text, false); });
      } else {
        setTimeout(function () { show(local.text, false); }, 280);
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = '';
      ask(v);
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-q]');
      if (b) ask(b.dataset.q);
    });

    bubble('bot', "<p>Hi! I'm the VEQZAI help assistant. Ask me about accounts, the dashboard, matchmaking or safety — or pick a topic below.</p>");
  }

  AI.assistant = { search: search, answer: answerLocal, KB: KB };
  document.addEventListener('DOMContentLoaded', init);
})();
