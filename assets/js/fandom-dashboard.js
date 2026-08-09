// Fandom dashboard static data renderer

const samplePosts = [
  {
    id: 1,
    title: 'The lore behind Arcane Odyssey\'s moon ritual',
    body: 'A short deep-dive into the moon ritual and what it means for the protagonist. Fans speculate this ties to the ancient guilds.',
    author: 'LunaFan',
    time: '2 days ago'
  },
  {
    id: 2,
    title: 'Fan art: Nexus duel scene',
    body: 'Shared a quick sketch of the Nexus duel. Would love feedback and color suggestions!',
    author: 'SketchKnight',
    time: '4 days ago'
  },
  {
    id: 3,
    title: 'Character theory: Velocity origin',
    body: 'Theory about Velocity\'s mysterious sponsor and possible corporate ties. Contains spoilers.',
    author: 'TheorySmith',
    time: '1 week ago'
  }
];

const featuredCharacters = [
  { name: 'Aeris Nightfall', role: 'Mage', blurb: 'Master of lunar rites' },
  { name: 'Kai Stormedge', role: 'Rogue', blurb: 'Sly mercenary from Nexus' },
  { name: 'Rin Velocity', role: 'Pilot', blurb: 'Champion racer with a secret' }
];

function renderPosts() {
  const container = document.getElementById('posts');
  if (!container) return;
  container.innerHTML = '';
  samplePosts.forEach(p => {
    const el = document.createElement('div');
    el.className = 'post';
    el.innerHTML = `
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.body)}</p>
      <div class="meta">By ${escapeHtml(p.author)} · ${escapeHtml(p.time)}</div>
    `;
    container.appendChild(el);
  });
}

function renderFeatured() {
  const container = document.getElementById('featured');
  if (!container) return;
  container.innerHTML = '';
  featuredCharacters.forEach(c => {
    const el = document.createElement('div');
    el.className = 'char-card';
    el.innerHTML = `
      <h4>${escapeHtml(c.name)}</h4>
      <div class="char-role">${escapeHtml(c.role)}</div>
      <div class="char-blurb">${escapeHtml(c.blurb)}</div>
    `;
    container.appendChild(el);
  });
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  renderPosts();
  renderFeatured();
});
