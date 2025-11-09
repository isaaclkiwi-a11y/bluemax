
/* BlueMax v3 - minimal scripts: settings, loaders, sidebar navigation */

const DEFAULTS = { theme: 'dark', font: 'medium', accent: 'dark' };

function applySettings(s){
  document.documentElement.setAttribute('data-theme', s.theme === 'light' ? 'light' : 'dark');
  document.documentElement.style.fontSize = s.font === 'small' ? '14px' : s.font === 'large' ? '18px' : '16px';
  if(s.accent === 'light'){
    document.documentElement.style.setProperty('--accent-dark', getComputedStyle(document.documentElement).getPropertyValue('--accent-light'));
  } else {
    document.documentElement.style.setProperty('--accent-dark', '#0a4d8c');
  }
}

function saveSettings(s){ localStorage.setItem('bluemax_settings', JSON.stringify(s)); }
function loadSettings(){ return JSON.parse(localStorage.getItem('bluemax_settings') || JSON.stringify(DEFAULTS)); }

document.addEventListener('DOMContentLoaded', ()=>{
  // apply saved settings
  const settings = loadSettings();
  applySettings(settings);

  // wire settings controls if on settings page
  const themeEl = document.getElementById('themeToggle');
  const fontEl = document.getElementById('fontSelect');
  const accentEl = document.getElementById('accentSelect');
  if(themeEl){ themeEl.value = settings.theme; themeEl.addEventListener('change', e=>{ settings.theme = e.target.value; applySettings(settings); saveSettings(settings); }); }
  if(fontEl){ fontEl.value = settings.font; fontEl.addEventListener('change', e=>{ settings.font = e.target.value; applySettings(settings); saveSettings(settings); }); }
  if(accentEl){ accentEl.value = settings.accent; accentEl.addEventListener('change', e=>{ settings.accent = e.target.value; applySettings(settings); saveSettings(settings); }); }

  // sidebar buttons - direct links to pages
  const map = { homeBtn: 'index.html', gamesBtn: 'games.html', aboutBtn: 'about.html', settingsBtn: 'settings.html', chatBtn: 'chat.html' };
  Object.keys(map).forEach(id=>{ const el = document.getElementById(id); if(el) el.addEventListener('click', ()=> window.location.href = map[id]); });

  // load announcements inline on home
  const annInline = document.getElementById('annInline');
  if(annInline){
    fetch('data/announcements.json').then(r=>r.json()).then(list=>{
      annInline.textContent = list.length ? list.map(a=>a.title + ': ' + a.message).join(' — ') : '';
    }).catch(()=> annInline.textContent = '');
  }

  // games list rendering on games page
  const gamesList = document.getElementById('gamesList');
  if(gamesList){
    fetch('games/games.json').then(r=>r.json()).then(list=>{
      gamesList.innerHTML = '';
      list.forEach(g=>{
        const card = document.createElement('div'); card.className = 'game-card';
        card.innerHTML = `<div class="game-cover">${g.title}</div><div class="game-meta"><div style="font-weight:700">${g.title}</div><div class="small">${g.description||''}</div></div>`;
        card.addEventListener('click', ()=> window.open(g.path, '_blank'));
        gamesList.appendChild(card);
      });
    }).catch(()=>{ gamesList.innerHTML = '<div class="small">No games added yet.</div>'; });
  }
});
