// FAQ-based support assistant
(function() {
  const KB = [
    { q: 'How do I create an account?', a: 'Click Sign Up on the home page, enter your email and create a password. You\'ll receive a confirmation email.' },
    { q: 'How do I reset my password?', a: 'Click "Forgot password" on the login page, enter your email, and we\'ll send you a reset link.' },
    { q: 'What games are available?', a: 'Check the Games section on the home page or browse the Dashboard. Over 500 titles from indie to AAA studios.' },
    { q: 'How does matchmaking work?', a: 'We use Elo-style rating and match you by skill, ping, and role. The longer you queue, the wider we search.' },
    { q: 'Is my data safe?', a: 'Yes. We encrypt your account, use HTTPS, and protect personal info. Read our Privacy Policy for details.' },
    { q: 'How do I report a player?', a: 'Click the player\'s profile, select Report, and choose a reason. Our team reviews all reports within 24 hours.' },
    { q: 'Can I delete my account?', a: 'Yes. Go to Account Settings > Delete Account. Your data will be erased within 30 days.' },
    { q: 'What payment methods do you accept?', a: 'We accept credit cards, debit cards, and PayPal. All payments are encrypted and secure.' },
    { q: 'How do I mute or block a player?', a: 'Right-click their name in chat or on their profile and select Mute or Block. You won\'t see their messages.' },
    { q: 'Can I stream from VEQZAI?', a: 'Yes! Click the Stream button in the Watch section, link your Twitch or YouTube, and go live.' },
  ];

  function cosineSimilarity(q, a) {
    const qWords = q.toLowerCase().split(/\s+/);
    const aWords = a.toLowerCase().split(/\s+/);
    const common = qWords.filter(w => aWords.includes(w)).length;
    return common / Math.max(qWords.length, aWords.length);
  }

  function search(query) {
    if (!query.trim()) return null;

    const scores = KB.map(item => ({
      ...item,
      score: cosineSimilarity(query, item.q),
    }));

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];

    return best.score >= 0.3 ? { answer: best.a, confidence: best.score } : null;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('assistant-input');
    const btn = document.getElementById('ask-btn');
    const response = document.getElementById('assistant-response');
    const responseText = document.getElementById('response-text');
    const confidence = document.getElementById('response-confidence');
    const faqSection = document.getElementById('faq-section');
    const faqList = document.getElementById('faq-list');

    if (!input) return;

    // Build FAQ list
    KB.forEach(item => {
      const div = document.createElement('div');
      div.className = 'faq-item';
      div.innerHTML = `
        <strong>${VeqzaiAI.escapeHtml(item.q)}</strong>
        <p>${VeqzaiAI.escapeHtml(item.a)}</p>
      `;
      div.addEventListener('click', function() {
        input.value = item.q;
        search_and_display();
      });
      faqList.appendChild(div);
    });

    function search_and_display() {
      const query = input.value.trim();
      if (!query) return;

      const result = search(query);

      if (result) {
        responseText.innerHTML = `<p>${VeqzaiAI.escapeHtml(result.answer)}</p>`;
        const conf = Math.round(result.confidence * 100);
        confidence.innerHTML = `<small>Confidence: ${conf}%</small>`;
        response.style.display = 'block';
        faqSection.style.display = 'none';
      } else {
        responseText.innerHTML = `<p>I'm not sure about that. Please email <a href="mailto:support@veqzai.com">support@veqzai.com</a> for help.</p>`;
        confidence.innerHTML = '';
        response.style.display = 'block';
        faqSection.style.display = 'none';
      }
    }

    btn.addEventListener('click', search_and_display);
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        search_and_display();
      }
    });
  });

  window.VeqzaiAI.assistant = { search };
})();
