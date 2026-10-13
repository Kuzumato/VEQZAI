/* Chat & content moderation.
 * A transparent, rule-based scorer: every decision comes with the reasons behind it.
 *   1. Normalise the text (case, accents, l33t-speak, "f u c k", stretched letters).
 *   2. Look for signals: profanity, harassment, threats, scams, personal info, spam.
 *   3. Combine signals into a 0–100 risk score and pick an action:
 *        allow  – deliver as-is
 *        mask   – deliver with profanity / personal info hidden
 *        flag   – hold for a human moderator
 *        block  – never delivered
 * Word lists below are a small starter set. Keep real lists server-side, maintain them over time,
 * and treat this as a first line of defence that a human team backs up — not a replacement for one.
 * Reuse anywhere: VeqzaiAI.moderation.check('message', { history: [...] })
 */
(function () {
  'use strict';
  var AI = window.VeqzaiAI;

  var PROFANITY = [
    ['fuck', 0.2], ['shit', 0.2], ['bitch', 0.25], ['asshole', 0.25], ['bastard', 0.2],
    ['dick', 0.2], ['cunt', 0.5], ['piss', 0.12], ['crap', 0.08]
  ];
  var HARASSMENT = [
    ['idiot', 0.3], ['stupid', 0.25], ['loser', 0.3], ['worthless', 0.4], ['trash', 0.25],
    ['moron', 0.3], ['no life', 0.3], ['uninstall', 0.3]
  ];

  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i', '|': 'i', '+': 't' };

  // Each letter may be stretched ("fuuuck") or replaced by * ("f*ck", "sh*t").
  function wordRegex(word) {
    var body = word.split('').map(function (ch) {
      if (ch === ' ') return '\\s+';
      return '(?:' + ch + '|\\*)+';
    }).join('');
    // Allow common endings: fucking, losers, idiots, pissed...
    return new RegExp('(?<![a-z0-9])' + body + '(?:ing|in|ed|er|ers|es|s|y)?(?![a-z0-9])', 'g');
  }

  function compile(list) {
    return list.map(function (e) { return { word: e[0], weight: e[1], re: wordRegex(e[0]) }; });
  }
  var PROF = compile(PROFANITY);
  var HARASS = compile(HARASSMENT);

  var THREATS = [
    { re: /\b(?:i|ill|im|ima|i will|i am|im going to|gonna|going to)\s*(?:be\s*)?(?:gonna\s*|going to\s*)?(?:kill|hurt|find|murder|stab|shoot|beat up|doxx?)\s+(?:you|u|ya|your|ur)\b/, label: 'Threat of harm' },
    { re: /\b(?:dox+|swat)(?:ing|ted)?\s+(?:you|u|ya|your|ur)\b/, label: 'Threat of harm' },
    { re: /\bi know where (?:you|u|ya) live\b/, label: 'Threat of harm' },
    { re: /\b(?:kill|hang|shoot)\s+(?:yourself|urself|ur self)\b/, label: 'Encourages self-harm' },
    { re: /(?<![a-z0-9])k+y+s+(?![a-z0-9])/, label: 'Encourages self-harm' }
  ];

  var SCAMS = [
    { re: /(?:free|giving away|giveaway).{0,25}(?:skins?|robux|vbucks|v bucks|gift ?cards?|coins?|crypto|accounts?)/, w: 0.5, label: 'Too-good-to-be-true giveaway' },
    { re: /(?:send|give|tell|share|dm).{0,20}(?:password|passcode|login|2fa|otp|verification code|seed phrase|recovery phrase)/, w: 0.9, label: 'Asks for account credentials' },
    { re: /(?:verify|confirm|secure|unlock).{0,15}your account/, w: 0.45, label: 'Fake account-verification pitch' },
    { re: /double your (?:crypto|coins|money|btc|eth)/, w: 0.6, label: 'Crypto doubling scam' },
    { re: /\b(?:i am|im|this is)\s+(?:an?\s+)?(?:admin|moderator|staff|support)\b/, w: 0.3, label: 'Claims to be staff' },
    { re: /(?:dm|message|pm|text) me.{0,20}(?:for|to get)/, w: 0.15, label: 'Pushes conversation to DMs' }
  ];

  var EMAIL = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi;
  var PHONE = /(?<![\w])\+?\d[\d\s().\-]{8,16}\d(?![\w])/g;
  var CARD = /\b\d(?:[ -]?\d){12,18}\b/g;
  var LINK = /(?:https?:\/\/|www\.)\S+|\b[a-z0-9\-]+\.(?:com|net|org|gg|io|ly|tv|me|co|xyz|ru|top|tk)\b(?:\/\S*)?/gi;
  var SHORTENER = /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|cutt\.ly|is\.gd|rb\.gy|shorturl\.at)\b/i;
  var OWN_DOMAINS = /(?:^|\.)veqzai\.com$|github\.io\/veqzai/i;

  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = +num[i];
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function lightNormalise(text) {
    return text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’`]/g, '');
  }

  function deepNormalise(text) {
    var t = lightNormalise(text);
    // "f u c k", "f.u.c.k", "f*u*c*k" -> "fuck" (needs 3+ single characters in a row).
    t = t.replace(/(?<![a-z0-9@$!])(?:[a-z0-9@$!][\s.\-_*]+){2,}[a-z0-9@$!](?![a-z0-9@$!])/g, function (m) {
      var joined = m.replace(/[\s.\-_*]+/g, '');
      // "such a l o s e r": keep a leading one-letter word (a / i / u) apart from the spelled-out word.
      if (joined.length >= 5 && /^[aiu][\s.\-_*]/.test(m)) return m.charAt(0) + ' ' + joined.slice(1);
      return joined;
    });
    // l33t-speak, only when touching a letter, so "10 kills" is left alone.
    t = t.replace(/(?<=[a-z])[0134578@$!|+]|[0134578@$!|+](?=[a-z])/g, function (c) { return LEET[c]; });
    // Collapse long runs: "fuuuuuck" -> "fuuck" (the word regexes allow stretched letters).
    t = t.replace(/(.)\1{2,}/g, '$1$1');
    return t;
  }

  function matches(list, text) {
    var found = [];
    list.forEach(function (e) {
      e.re.lastIndex = 0;
      var m;
      while ((m = e.re.exec(text))) {
        found.push({ word: e.word, weight: e.weight, index: m.index, length: m[0].length });
        if (m[0].length === 0) e.re.lastIndex++;
      }
    });
    return found;
  }

  function maskWord(s) {
    return s.length <= 2 ? '*'.repeat(s.length) : s[0] + '*'.repeat(s.length - 1);
  }

  /**
   * Analyse one message.
   * @param {string} text
   * @param {{history?: string[]}} [opts] previous messages from the same author (for repeat detection)
   * @returns {{action:'allow'|'mask'|'flag'|'block', score:number, reasons:Array, sanitized:string}}
   */
  function check(text, opts) {
    opts = opts || {};
    var raw = String(text || '');
    var light = lightNormalise(raw);
    var deep = deepNormalise(raw);
    var reasons = [];
    var weights = [];
    function signal(cat, label, w, detail) {
      reasons.push({ cat: cat, label: label, weight: w, detail: detail || '' });
      weights.push(w);
    }

    // --- Profanity & harassment (on the deeply-normalised text) ---
    var profHits = matches(PROF, deep);
    var profRaw = matches(PROF, light);
    var harHits = matches(HARASS, deep);
    var harRaw = matches(HARASS, light);

    var secondPerson = /(?<![a-z])(?:you|u|ur|your|youre|ya|yourself)(?![a-z])/.test(deep);

    if (profHits.length) {
      var uniq = {};
      profHits.forEach(function (h) { uniq[h.word] = Math.max(uniq[h.word] || 0, h.weight); });
      Object.keys(uniq).forEach(function (w) {
        signal('profanity', 'Profanity', uniq[w], '“' + maskWord(w) + '”');
      });
      if (secondPerson) signal('harassment', 'Aimed at another player', 0.3, 'profanity near “you/your”');
    }
    if (harHits.length) {
      var seenH = {};
      harHits.forEach(function (h) {
        if (seenH[h.word]) return;
        seenH[h.word] = true;
        signal('harassment', 'Insult / harassment', h.weight, '“' + maskWord(h.word) + '”');
      });
    }
    if ((profHits.length > profRaw.length) || (harHits.length > harRaw.length)) {
      signal('evasion', 'Filter-evasion attempt', 0.25, 'disguised letters, spacing or numbers');
    }

    // --- Threats ---
    THREATS.some(function (t) {
      if (t.re.test(deep)) { signal('threat', t.label, 0.9, 'directed at another person'); return true; }
      return false;
    });

    // --- Scams ---
    SCAMS.forEach(function (s) {
      if (s.re.test(deep)) signal('scam', s.label, s.w);
    });

    // --- Links ---
    var links = raw.replace(EMAIL, ' ').match(LINK) || [];
    var external = links.filter(function (l) { return !OWN_DOMAINS.test(l.replace(/^https?:\/\//i, '').replace(/^www\./i, '')); });
    if (SHORTENER.test(raw.replace(EMAIL, ' '))) signal('link', 'Shortened link hides the destination', 0.35);
    else if (external.length) signal('link', 'Contains a link', 0.1, external.length + ' external');
    if (external.length >= 3) signal('spam', 'Many links in one message', 0.4);

    // --- Personal info (redacted, never blocked on its own) ---
    var sanitized = raw;
    var piiFound = [];
    sanitized = sanitized.replace(EMAIL, function () { piiFound.push('email'); return '[email hidden]'; });
    sanitized = sanitized.replace(CARD, function (m) {
      var digits = m.replace(/\D/g, '');
      if (digits.length >= 13 && luhn(digits)) { piiFound.push('card number'); return '[card number hidden]'; }
      return m;
    });
    sanitized = sanitized.replace(PHONE, function (m) {
      var digits = m.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 15) { piiFound.push('phone number'); return '[phone hidden]'; }
      return m;
    });
    if (piiFound.length) {
      signal('pii', 'Personal information', 0.2, Array.from(new Set(piiFound)).join(', ') + ' hidden');
    }

    // --- Spam shape ---
    var letters = raw.replace(/[^A-Za-z]/g, '');
    if (letters.length >= 12 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) {
      signal('spam', 'Shouting (mostly capitals)', 0.2);
    }
    if (/(.)\1{9,}/.test(raw)) signal('spam', 'Long run of repeated characters', 0.2);
    var words = light.split(/\s+/).filter(Boolean);
    if (words.length >= 8 && new Set(words).size / words.length < 0.4) signal('spam', 'Repetitive wording', 0.25);
    var dupes = (opts.history || []).filter(function (h) { return lightNormalise(h).trim() === light.trim(); }).length;
    if (light.trim() && dupes >= 2) signal('spam', 'Same message sent repeatedly', 0.5, dupes + ' times already');

    // --- Combine: independent signals, so risk = 1 - Π(1 - w) ---
    var survive = weights.reduce(function (p, w) { return p * (1 - w); }, 1);
    var score = Math.round((1 - survive) * 100);

    // Mask profanity in the original text so the rest of the message can still be delivered.
    var maskable = matches(PROF, lightNormalise(sanitized));
    var masked = false;
    if (maskable.length) {
      var lower = lightNormalise(sanitized);
      // lightNormalise can change string length (accents), so only mask when positions line up.
      if (lower.length === sanitized.length) {
        masked = true;
        maskable.sort(function (a, b) { return b.index - a.index; });
        maskable.forEach(function (h) {
          sanitized = sanitized.slice(0, h.index) + maskWord(sanitized.slice(h.index, h.index + h.length)) + sanitized.slice(h.index + h.length);
        });
      }
    }

    var hard = reasons.some(function (r) { return r.cat === 'threat'; });
    var action;
    if (hard || score >= 60) action = 'block';
    else if (score >= 30) action = 'flag';
    else if (profHits.length || piiFound.length || sanitized !== raw) action = 'mask';
    else action = 'allow';

    // If the profanity could not be masked in the original (disguised), hold it instead.
    if (action === 'mask' && profHits.length && !masked) action = 'flag';

    return { action: action, score: score, reasons: reasons, sanitized: sanitized };
  }

  var EXAMPLES = [
    { label: 'Friendly', text: 'gg everyone, that last round was close! Rematch?' },
    { label: 'Game banter', text: "I'm gonna kill that boss on the next run, who's in?" },
    { label: 'Swearing', text: 'ugh that was such shit luck' },
    { label: 'Insult', text: 'you are a worthless idiot, uninstall the game' },
    { label: 'Disguised', text: 'y0u are such a l o s e r and a f.u.c.k.i.n.g trash player' },
    { label: 'Threat', text: "i will find you and hurt you after this match" },
    { label: 'Scam', text: 'FREE SKINS giveaway!! send me your password to verify your account bit.ly/free-skins' },
    { label: 'Personal info', text: 'add me, my email is sam.player@example.com and my number is 555 123 4567' },
    { label: 'Spam', text: 'BUY CHEAP COINS BUY CHEAP COINS BUY CHEAP COINS BUY CHEAP COINS visit coins4u.xyz' }
  ];

  var BADGE = { allow: 'Allowed', mask: 'Masked', flag: 'Held for review', block: 'Blocked' };

  function init() {
    var root = AI.$('#panel-moderation');
    if (!root) return;

    var input = AI.$('#mod-input', root);
    var form = AI.$('#mod-form', root);
    var analysis = AI.$('#mod-analysis', root);
    var feed = AI.$('#mod-feed', root);
    var modView = AI.$('#mod-modview', root);
    var exWrap = AI.$('#mod-examples', root);
    var history = [];

    exWrap.innerHTML = EXAMPLES.map(function (e, i) {
      return '<button type="button" class="chip" data-ex="' + i + '">' + AI.escapeHtml(e.label) + '</button>';
    }).join('');

    function renderAnalysis(res, empty) {
      if (empty) {
        analysis.innerHTML = '<p class="sub">Type a message or try an example. You will see the risk score and exactly why.</p>';
        return;
      }
      var reasons = res.reasons.length
        ? '<ul class="reasons">' + res.reasons.map(function (r) {
            return '<li><span class="r-w">+' + Math.round(r.weight * 100) + '</span><span><strong>' + AI.escapeHtml(r.label) + '</strong>' +
              (r.detail ? ' <em>' + AI.escapeHtml(r.detail) + '</em>' : '') + '</span></li>';
          }).join('') + '</ul>'
        : '<p class="sub">No risk signals found.</p>';
      analysis.innerHTML =
        '<div class="score-row"><span class="badge b-' + res.action + '">' + BADGE[res.action] + '</span>' +
        '<div class="meter risk" role="img" aria-label="Risk score ' + res.score + ' out of 100"><span style="width:' + res.score + '%"></span></div>' +
        '<strong class="score-num">' + res.score + '</strong></div>' + reasons +
        (res.action === 'mask' ? '<p class="sub">Delivered as: <q>' + AI.escapeHtml(res.sanitized) + '</q></p>' : '');
    }

    function addToFeed(text, res) {
      var li = document.createElement('li');
      li.className = 'msg msg-' + res.action;
      var shown, note = '';
      if (modView.checked) {
        shown = AI.escapeHtml(text);
        note = '<span class="badge b-' + res.action + '">' + BADGE[res.action] + ' · ' + res.score + '</span>';
      } else if (res.action === 'block') {
        shown = '<em>Message removed by moderation.</em>';
      } else if (res.action === 'flag') {
        shown = '<em>Message held for moderator review.</em>';
      } else {
        shown = AI.escapeHtml(res.action === 'mask' ? res.sanitized : text);
        if (res.action === 'mask') note = '<span class="badge b-mask">Masked</span>';
      }
      li.innerHTML = '<span class="who">You</span><span class="what">' + shown + '</span>' + note;
      feed.appendChild(li);
      feed.scrollTop = feed.scrollHeight;
    }

    input.addEventListener('input', function () {
      var v = input.value;
      if (!v.trim()) return renderAnalysis(null, true);
      renderAnalysis(check(v, { history: history }));
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      var res = check(v, { history: history });
      history.push(v);
      if (history.length > 10) history.shift();
      addToFeed(v, res);
      renderAnalysis(res);
      input.value = '';
      input.focus();
    });
    exWrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ex]');
      if (!b) return;
      input.value = EXAMPLES[+b.dataset.ex].text;
      renderAnalysis(check(input.value, { history: history }));
      input.focus();
    });
    modView.addEventListener('change', function () {
      // Re-render the feed from stored messages is not needed for a demo; apply to new messages.
      feed.dataset.mod = modView.checked ? '1' : '0';
    });
    AI.$('#mod-clear', root).addEventListener('click', function () {
      feed.innerHTML = '';
      history = [];
    });

    renderAnalysis(null, true);
  }

  AI.moderation = { check: check, normalise: deepNormalise };
  document.addEventListener('DOMContentLoaded', init);
})();
