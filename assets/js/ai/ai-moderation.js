// Content moderation with explainable scoring
(function() {
  const SLURS = ['f.u.c.k', 'f_ck', 'f-ck', 'sh1t', 'sh!t', 'damn', 'ass'];
  const THREATS = ['kill you', 'hurt you', 'die', 'kys'];
  const SCAM_PATTERNS = ['click here', 'free money', 'dm me', 'send money', 'wire transfer', 'western union'];
  const PII_PATTERNS = {
    email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
    phone: /\+?1?\s?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g,
    card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  };

  function check(text) {
    const lower = text.toLowerCase();
    const reasons = [];
    let score = 0;
    let sanitized = text;

    // Check for profanity (disguised)
    SLURS.forEach(slur => {
      if (lower.includes(slur)) {
        score += 0.3;
        reasons.push(`Profanity detected: ${slur}`);
        sanitized = sanitized.replace(new RegExp(slur, 'gi'), '***');
      }
    });

    // Check for threats (but allow game banter like "kill that boss")
    THREATS.forEach(threat => {
      if (lower.includes(threat) && !lower.includes('boss') && !lower.includes('enemy')) {
        score += 0.4;
        reasons.push(`Threatening language: "${threat}"`);
      }
    });

    // Check for scams
    SCAM_PATTERNS.forEach(pattern => {
      if (lower.includes(pattern)) {
        score += 0.35;
        reasons.push(`Scam indicator: "${pattern}"`);
      }
    });

    // Check for PII
    const emails = text.match(PII_PATTERNS.email) || [];
    if (emails.length) {
      score += 0.5;
      emails.forEach(e => {
        reasons.push(`Email address detected (redacted)`);
        sanitized = sanitized.replace(e, '[REDACTED_EMAIL]');
      });
    }

    const phones = text.match(PII_PATTERNS.phone) || [];
    if (phones.length) {
      score += 0.45;
      phones.forEach(p => {
        reasons.push(`Phone number detected (redacted)`);
        sanitized = sanitized.replace(p, '[REDACTED_PHONE]');
      });
    }

    const cards = text.match(PII_PATTERNS.card) || [];
    if (cards.length) {
      score += 0.6;
      cards.forEach(c => {
        reasons.push(`Card number detected (redacted)`);
        sanitized = sanitized.replace(c, '[REDACTED_CARD]');
      });
    }

    // Spam (repeated characters or caps)
    if (/(.)\1{4,}/.test(text)) {
      score += 0.15;
      reasons.push('Repeated character spam');
    }

    if (text.split('').filter(c => c === c.toUpperCase() && c !== ' ').length > text.length * 0.6) {
      score += 0.1;
      reasons.push('Excessive capitalization');
    }

    score = Math.min(score, 1);
    const action = score >= 0.7 ? 'Block' : score >= 0.4 ? 'Review' : 'Allow';

    return { action, score, reasons, sanitized };
  }

  const EXAMPLES = {
    normal: 'hey guys, awesome play! gg',
    profanity: 'this is f.u.c.k.ing terrible',
    harassment: 'you suck, go kill yourself',
    scam: 'FREE MONEY click here dm me your card',
  };

  function renderAnalysis(result) {
    const div = document.createElement('div');
    div.className = `mod-result ${result.action.toLowerCase()}`;
    div.innerHTML = `
      <div class="score-bar">
        <div class="score-fill" style="width: ${result.score * 100}%"></div>
      </div>
      <div class="score-text">${result.action} (${(result.score * 100).toFixed(0)}%)</div>
      ${result.reasons.length ? `
        <details class="reasons">
          <summary>${result.reasons.length} item(s) flagged</summary>
          <ul>${result.reasons.map(r => `<li>${VeqzaiAI.escapeHtml(r)}</li>`).join('')}</ul>
        </details>
      ` : '<p style="color: var(--success);">No issues found</p>'}
      ${result.action !== 'Allow' ? `
        <div class="sanitized">
          <strong>Sanitized:</strong> <code>${VeqzaiAI.escapeHtml(result.sanitized)}</code>
        </div>
      ` : ''}
    `;
    return div;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('mod-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const exampleBtns = document.querySelectorAll('.example-buttons .btn-ghost');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-message-input');
    const modView = document.getElementById('moderator-view-toggle');

    if (!input) return;

    analyzeBtn.addEventListener('click', function() {
      const text = input.value.trim();
      if (!text) return;
      
      const result = check(text);
      const results = document.querySelector('.mod-results') || input.parentElement.nextElementSibling;
      if (results) {
        results.innerHTML = '';
        results.appendChild(renderAnalysis(result));
      }
    });

    exampleBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const example = EXAMPLES[this.dataset.example];
        if (example) {
          input.value = example;
          analyzeBtn.click();
        }
      });
    });

    // Chat simulation
    sendBtn.addEventListener('click', function() {
      const msg = chatInput.value.trim();
      if (!msg) return;

      const result = check(msg);
      const li = document.createElement('div');
      li.className = 'chat-message user';
      li.innerHTML = `<span class="chat-text">${VeqzaiAI.escapeHtml(msg)}</span>`;
      chatMessages.appendChild(li);

      setTimeout(() => {
        const modLi = document.createElement('div');
        modLi.className = `chat-message mod ${result.action.toLowerCase()}`;
        const label = result.action === 'Block' ? '🚫 Blocked' : result.action === 'Review' ? '⚠️ Flagged' : '✓ Allowed';
        modLi.innerHTML = `<span class="mod-label">${label}</span>`;
        if (modView.checked) {
          modLi.innerHTML += `<span class="mod-score">${(result.score * 100).toFixed(0)}%</span>`;
        }
        if (result.action !== 'Allow') {
          modLi.appendChild(renderAnalysis(result));
        } else {
          modLi.innerHTML += `<span class="chat-text">${VeqzaiAI.escapeHtml(result.sanitized)}</span>`;
        }
        chatMessages.appendChild(modLi);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 300);

      chatInput.value = '';
    });

    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  });

  window.VeqzaiAI.moderation = { check };
})();
