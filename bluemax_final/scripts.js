
/* BlueMax scripts: theme + settings + games loader + chat hookup (Firebase optional) */

const DEFAULTS = {
  theme: 'dark',
  font: 'medium', // small, medium, large
  accent: 'dark' // 'dark' uses --accent-dark, 'light' uses --accent-light
};

function applySettings(settings){
  document.documentElement.setAttribute('data-theme', settings.theme === 'light' ? 'light' : 'dark');
  document.documentElement.style.fontSize = settings.font === 'small' ? '14px' : settings.font === 'large' ? '18px' : '16px';
  // accent logic (CSS uses variables)
  if(settings.accent === 'light'){
    document.documentElement.style.setProperty('--accent-dark', getComputedStyle(document.documentElement).getPropertyValue('--accent-light'));
  } else {
    document.documentElement.style.setProperty('--accent-dark', '#0a4d8c');
  }
}

function saveSettings(s){ localStorage.setItem('bluemax_settings', JSON.stringify(s)); }
function loadSettings(){ return JSON.parse(localStorage.getItem('bluemax_settings') || JSON.stringify(DEFAULTS)); }

document.addEventListener('DOMContentLoaded', ()=>{
  // load and apply settings
  const settings = loadSettings();
  applySettings(settings);

  // settings controls if present
  const themeToggle = document.getElementById('themeToggle');
  const fontSelect = document.getElementById('fontSelect');
  const accentSelect = document.getElementById('accentSelect');
  if(themeToggle){ themeToggle.value = settings.theme; themeToggle.addEventListener('change', e=>{ settings.theme = e.target.value; applySettings(settings); saveSettings(settings); }); }
  if(fontSelect){ fontSelect.value = settings.font; fontSelect.addEventListener('change', e=>{ settings.font = e.target.value; applySettings(settings); saveSettings(settings); }); }
  if(accentSelect){ accentSelect.value = settings.accent; accentSelect.addEventListener('change', e=>{ settings.accent = e.target.value; applySettings(settings); saveSettings(settings); }); }

  // games loader for games.html
  const gamesListEl = document.getElementById('gamesList');
  if(gamesListEl){
    fetch('games/games.json').then(r=>r.json()).then(list=>{
      gamesListEl.innerHTML = '';
      list.forEach(g=>{
        const c = document.createElement('div'); c.className='game-card';
        c.innerHTML = `<div class="game-cover">${g.title}</div><div class="game-meta"><div style="font-weight:700">${g.title}</div><div class="small">${g.description||''}</div></div>`;
        c.addEventListener('click', ()=> window.open(g.path, '_blank'));
        gamesListEl.appendChild(c);
      });
    }).catch(()=>{ gamesListEl.innerHTML = '<div class="small">No games found.</div>'; });
  }

  // inline announcements on home page
  const annInline = document.getElementById('annInline');
  if(annInline){
    fetch('data/announcements.json').then(r=>r.json()).then(list=>{
      annInline.textContent = list.map(a=>a.title + ': ' + a.message).join(' — ');
    }).catch(()=>{ annInline.textContent = ''; });
  }

  // Chat initialization (if firebase config exists)
  if(window.firebase && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey){
    initFirebaseChat();
  } else {
    // show disabled message on chat page if present
    const chatStatus = document.getElementById('chatStatus');
    if(chatStatus) chatStatus.textContent = 'Public chat disabled — add Firebase config in config/firebase-config.js';
  }
});

/* Firebase chat hookup (Realtime Database) */
function initFirebaseChat(){
  try{
    firebase.initializeApp(window.FIREBASE_CONFIG);
    const db = firebase.database();
    const chatRef = db.ref('bluemax_chat');
    const chatArea = document.getElementById('chatArea');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');

    // load existing messages
    chatRef.limitToLast(200).on('child_added', snap => {
      const v = snap.val();
      if(chatArea){
        const d = document.createElement('div'); d.className='chat-msg';
        d.textContent = (v.name ? v.name + ': ' : '') + v.message;
        chatArea.appendChild(d);
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    });

    if(chatForm){
      chatForm.addEventListener('submit', e=>{
        e.preventDefault();
        const msg = chatInput.value.trim();
        if(!msg) return;
        chatRef.push({ message: msg, name: 'Guest', ts: Date.now() });
        chatInput.value = '';
      });
    }
  }catch(e){
    console.error('Firebase chat init failed', e);
  }
}
