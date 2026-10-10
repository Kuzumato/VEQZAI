// Game recommendations using cosine similarity
(function() {
  const CATALOG = [
    { title: 'Arcane Odyssey', tags: ['rpg', 'fantasy', 'single-player', 'story-driven', 'challenging'], image: '🎮' },
    { title: 'Nexus', tags: ['action', 'competitive', 'multiplayer', 'team', 'fast-paced'], image: '⚔️' },
    { title: 'Velocity', tags: ['racing', 'competitive', 'multiplayer', 'skill', 'fast-paced'], image: '🏎️' },
    { title: 'Vortex', tags: ['shooter', 'competitive', 'multiplayer', 'team', 'tactical'], image: '👾' },
    { title: 'Champion Pro', tags: ['sports', 'competitive', 'multiplayer', 'team', 'skill'], image: '⚽' },
    { title: 'Mystic Realm', tags: ['rpg', 'fantasy', 'multiplayer', 'cooperative', 'story-driven'], image: '✨' },
    { title: 'Cyber Breach', tags: ['shooter', 'sci-fi', 'competitive', 'single-player', 'strategic'], image: '🤖' },
    { title: 'Puzzle Master', tags: ['puzzle', 'casual', 'single-player', 'relaxing', 'brain-teaser'], image: '🧩' },
  ];

  const MOODS = [
    { name: 'Chill', vector: { casual: 1, relaxing: 1, fast-paced: -1 } },
    { name: 'Competitive', vector: { competitive: 1, skill: 1, casual: -1 } },
    { name: 'Story', vector: { 'story-driven': 1, casual: 1, 'fast-paced': -0.5 } },
    { name: 'Social', vector: { multiplayer: 1, team: 1, 'single-player': -1 } },
  ];

  function buildVector(tags) {
    const v = {};
    tags.forEach(t => v[t] = (v[t] || 0) + 1);
    return v;
  }

  function cosineSimilarity(v1, v2) {
    const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
    let dot = 0, mag1 = 0, mag2 = 0;
    allKeys.forEach(k => {
      const a = v1[k] || 0;
      const b = v2[k] || 0;
      dot += a * b;
      mag1 += a * a;
      mag2 += b * b;
    });
    const denom = Math.sqrt(mag1) * Math.sqrt(mag2);
    return denom === 0 ? 0 : dot / denom;
  }

  function getRecommendations(likedGames, moods, competitive, soloTeam) {
    let queryVector = {};
    
    likedGames.forEach(title => {
      const game = CATALOG.find(g => g.title === title);
      if (game) {
        const gv = buildVector(game.tags);
        Object.keys(gv).forEach(k => queryVector[k] = (queryVector[k] || 0) + gv[k]);
      }
    });
    
    moods.forEach(mood => {
      const m = MOODS.find(x => x.name === mood);
      if (m) {
        Object.keys(m.vector).forEach(k => {
          queryVector[k] = (queryVector[k] || 0) + m.vector[k];
        });
      }
    });
    
    const comp = competitive / 100;
    if (comp > 0.6) queryVector.competitive = (queryVector.competitive || 0) + 1;
    else if (comp < 0.4) queryVector.casual = (queryVector.casual || 0) + 1;
    
    const team = soloTeam / 100;
    if (team > 0.6) queryVector.team = (queryVector.team || 0) + 1;
    else if (team < 0.4) queryVector['single-player'] = (queryVector['single-player'] || 0) + 1;
    
    return CATALOG
      .map(game => ({
        ...game,
        score: cosineSimilarity(queryVector, buildVector(game.tags)),
        reason: likedGames[0] ? `Because you like ${likedGames[0]}` : 'Popular pick',
      }))
      .sort((a, b) => b.score - a.score);
  }

  function renderRecommendation(game) {
    const li = document.createElement('li');
    li.className = 'recommendation-item';
    li.innerHTML = `
      <div class="rec-emoji">${game.image}</div>
      <div class="rec-content">
        <h4>${VeqzaiAI.escapeHtml(game.title)}</h4>
        <p class="rec-tags">${game.tags.join(', ')}</p>
        <p class="rec-reason">${VeqzaiAI.escapeHtml(game.reason)}</p>
      </div>
    `;
    return li;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const gamePicker = document.getElementById('game-picker');
    const moodChips = document.getElementById('mood-chips');
    const compSlider = document.getElementById('competitive-slider');
    const teamSlider = document.getElementById('solo-team-slider');
    const btn = document.getElementById('get-recommendations-btn');
    const recList = document.getElementById('recommendations-list');
    const recTitle = document.getElementById('rec-title');

    if (!gamePicker) return;

    // Build game picker
    CATALOG.slice(0, 5).forEach(game => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.dataset.game = game.title;
      chip.innerHTML = `${game.image} ${VeqzaiAI.escapeHtml(game.title)}`;
      chip.addEventListener('click', function() {
        this.classList.toggle('selected');
        updateRecs();
      });
      gamePicker.appendChild(chip);
    });

    // Build mood chips
    MOODS.forEach(mood => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.dataset.mood = mood.name;
      chip.textContent = mood.name;
      chip.addEventListener('click', function() {
        this.classList.toggle('selected');
        updateRecs();
      });
      moodChips.appendChild(chip);
    });

    function updateRecs() {
      const liked = Array.from(gamePicker.querySelectorAll('.chip.selected'))
        .map(c => c.dataset.game);
      const moods = Array.from(moodChips.querySelectorAll('.chip.selected'))
        .map(c => c.dataset.mood);
      const comp = parseInt(compSlider.value);
      const team = parseInt(teamSlider.value);

      const recs = getRecommendations(liked, moods, comp, team);
      recList.innerHTML = '';
      recs.forEach(r => recList.appendChild(renderRecommendation(r)));

      if (!liked.length) {
        recTitle.textContent = 'Popular Right Now';
      } else {
        recTitle.textContent = `For You`;
      }
    }

    btn.addEventListener('click', updateRecs);
    compSlider.addEventListener('input', updateRecs);
    teamSlider.addEventListener('input', updateRecs);

    updateRecs();
  });

  window.VeqzaiAI.recommendations = { getRecommendations };
})();
