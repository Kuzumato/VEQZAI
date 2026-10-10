// Matchmaking with Elo rating and ping-aware scoring
(function() {
  const PLAYER_POOL = buildPool();
  let matchHistory = [];

  function buildPool() {
    const roles = ['Tank', 'Damage', 'Support', 'Flex'];
    const regions = ['US', 'EU', 'APAC', 'SA'];
    const pool = [];
    for (let i = 0; i < 60; i++) {
      pool.push({
        id: i + 1,
        name: `Player_${i + 1}`,
        rating: 800 + Math.random() * 2000,
        region: regions[Math.floor(Math.random() * regions.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        wins: Math.floor(Math.random() * 100),
        losses: Math.floor(Math.random() * 100),
      });
    }
    return pool;
  }

  function getBasePing(region1, region2) {
    const pings = {
      'US-US': 20,
      'US-EU': 120,
      'US-APAC': 180,
      'US-SA': 80,
      'EU-EU': 15,
      'EU-APAC': 200,
      'EU-SA': 140,
      'APAC-APAC': 30,
      'APAC-SA': 220,
      'SA-SA': 25,
    };
    const key = [region1, region2].sort().join('-');
    return pings[key] || 100;
  }

  function eloWinProbability(myRating, theirRating) {
    return 1 / (1 + Math.pow(10, (theirRating - myRating) / 400));
  }

  function scoreMatch(player, myRating, myRegion, queueSeconds, matchType) {
    const winProb = eloWinProbability(myRating, player.rating);
    const skillMatch = 1 - Math.abs(winProb - 0.5) * 2;
    
    const basePing = getBasePing(myRegion, player.region);
    const pingPenalty = Math.min(basePing / 300, 1);
    
    const searchWindow = Math.min(queueSeconds / 10, 1);
    
    let score = skillMatch * 0.6 + (1 - pingPenalty) * 0.3 + searchWindow * 0.1;
    
    if (matchType === 'teammate' && player.role !== 'Flex') {
      score *= 1.15;
    }
    
    return { score, winProb, pingEstimate: Math.round(basePing) };
  }

  function findMatches(myRating, region, queueSeconds, matchType) {
    const matches = PLAYER_POOL
      .filter(p => p.id !== parseInt(document.getElementById('player-id')?.textContent || '0'))
      .map(player => {
        const { score, winProb, pingEstimate } = scoreMatch(player, myRating, region, queueSeconds, matchType);
        return { ...player, score, winProb, pingEstimate };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    
    return matches;
  }

  function simulateMatch(myRating, opponent, won) {
    const K = 32;
    const winProb = eloWinProbability(myRating, opponent.rating);
    const actual = won ? 1 : 0;
    const ratingChange = Math.round(K * (actual - winProb));
    return { newRating: myRating + ratingChange, ratingChange };
  }

  function renderMatch(match) {
    const winProb = (match.winProb * 100).toFixed(0);
    const div = document.createElement('div');
    div.className = 'match-card';
    div.innerHTML = `
      <div class="match-header">
        <span class="player-name">${VeqzaiAI.escapeHtml(match.name)}</span>
        <span class="match-rating">${Math.round(match.rating)}</span>
      </div>
      <div class="match-meta">
        <span><i class="fa-solid fa-zap"></i> ${winProb}% win</span>
        <span><i class="fa-solid fa-signal"></i> ${match.pingEstimate}ms</span>
        <span><i class="fa-solid fa-user"></i> ${match.role}</span>
      </div>
      <div class="match-actions">
        <button class="btn-small" data-opponent-id="${match.id}">Play Match</button>
      </div>
    `;
    
    div.querySelector('button').addEventListener('click', function() {
      const won = Math.random() < match.winProb;
      const myRatingEl = document.getElementById('my-rating');
      const oldRating = parseInt(myRatingEl.value);
      const { newRating, ratingChange } = simulateMatch(oldRating, match, won);
      
      myRatingEl.value = newRating;
      document.getElementById('rating-display').textContent = newRating;
      
      matchHistory.push({ opponent: match.name, won, ratingChange, newRating });
      updateStats();
      updateMatches();
      
      const resultMsg = document.createElement('div');
      resultMsg.className = `match-result ${won ? 'win' : 'loss'}`;
      resultMsg.innerHTML = `
        <strong>${won ? '✓ Victory!' : '✗ Defeat'}</strong>
        Rating: ${oldRating} ${won ? '+' : ''}${ratingChange}
      `;
      div.appendChild(resultMsg);
      setTimeout(() => resultMsg.remove(), 3000);
    });
    
    return div;
  }

  function updateMatches() {
    const myRating = parseInt(document.getElementById('my-rating').value);
    const region = document.getElementById('region').value;
    const queueTime = parseInt(document.getElementById('queue-time').value);
    const matchType = document.getElementById('match-type').value;
    
    const matches = findMatches(myRating, region, queueTime, matchType);
    const list = document.getElementById('matches-list');
    list.innerHTML = '';
    matches.forEach(m => list.appendChild(renderMatch(m)));
    
    document.getElementById('matches-count').textContent = matches.length;
  }

  function updateStats() {
    if (!matchHistory.length) {
      document.getElementById('record').textContent = '0W-0L';
      document.getElementById('win-rate').textContent = '—';
      document.getElementById('avg-gain').textContent = '—';
      return;
    }
    
    const wins = matchHistory.filter(m => m.won).length;
    const losses = matchHistory.length - wins;
    const winRate = ((wins / matchHistory.length) * 100).toFixed(0);
    const avgGain = (matchHistory.reduce((s, m) => s + m.ratingChange, 0) / matchHistory.length).toFixed(1);
    
    document.getElementById('record').textContent = `${wins}W-${losses}L`;
    document.getElementById('win-rate').textContent = `${winRate}%`;
    document.getElementById('avg-gain').textContent = `+${avgGain}`;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('find-match-btn');
    const inputs = [
      document.getElementById('my-rating'),
      document.getElementById('region'),
      document.getElementById('queue-time'),
      document.getElementById('match-type')
    ];
    
    if (btn) {
      btn.addEventListener('click', updateMatches);
      inputs.forEach(inp => inp.addEventListener('change', updateMatches));
      
      // Set player ID for filtering
      document.getElementById('player-id') = document.createElement('div');
      document.getElementById('player-id').textContent = '999';
      
      updateMatches();
    }
  });

  window.VeqzaiAI.matchmaking = { findMatches, simulateMatch };
})();
