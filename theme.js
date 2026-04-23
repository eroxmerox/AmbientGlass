// AmbientGlass — theme.js (v10.42) ✦ FINAL BUILD
// • Branding: "AmbientGlass" added to Startup
// • Entrance: Soft Drop & Zoom
// • Layout: 50/50 Split
// • Safety: 60px Margin
// • NavFix: Colon to Slash conversion added by Antigravity

(function AmbientGlass() {
  'use strict';
  console.log("AmbientGlass v10.42: FINAL BUILD. Created by EROX");

  if (!Spicetify?.Player || !Spicetify?.Platform) {
    setTimeout(AmbientGlass, 300);
    return;
  }

  const ICONS = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    album: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
    playlist: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    artist: '<path d="M12 12.25c2.899 0 5.25-2.351 5.25-5.25S14.899 1.75 12 1.75 6.75 4.101 6.75 7 9.101 12.25 12 12.25zm0-1.5c-2.071 0-3.75-1.679-3.75-3.75S9.929 3.25 12 3.25s3.75 1.679 3.75 3.75S14.071 10.75 12 10.75zM22.25 21.75H1.75v-1.5c0-3.314 2.686-6 6-6h8.5c3.314 0 6 2.686 6 6v1.5zm-1.5-1.5c0-2.485-2.015-4.5-4.5-4.5H7.75c-2.485 0-4.5 2.015-4.5 4.5v.15h17.5v-.15z"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    stats: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
  };

  function svg(pathContent, opts = {}) {
    const stroke = opts.stroke ?? 2.5; const size = opts.size ?? 24;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${pathContent}</svg>`;
  }

  // ── NAVIGATOR FIX ──
  function safeNavigate(input) {
    if (!input) return;
    let path = input;
    if (path.startsWith('spotify:')) {
      path = '/' + path.split(':').slice(1).join('/');
    }
    try { Spicetify.Platform.History.push(path); }
    catch { window.location.hash = '#' + path; }
  }

  function killTopbar() {
    const selectors = [
      '.main-topBar-background',
      '.main-topBar-overlay',
      '.main-topBar-container',
      '.main-topBar-header',
      '.Root__top-bar',
      '[class*="topBar-background"]',
      '[class*="topBar-overlay"]'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.setProperty('background', 'transparent', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('box-shadow', 'none', 'important');
        el.style.setProperty('opacity', '0', 'important');
      });
    });
  }

  function killResidues() {
    const targets = ['.main-entityHeader-backgroundColor', '.main-entityHeader-overlay', '.main-actionBar-ActionBarBackground', '.main-actionBarBackground-background', '.main-home-filterChipsSection', '.main-home-filterChipsSectionActive', '[class*="filterChipsSection"]', '[class*="actionBarBackground"]'];
    targets.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => { 
        const style = el.getAttribute('style') || '';
        // Nur löschen, wenn KEIN Bild (url) im Style ist
        if (!style.includes('url(')) {
          el.style.setProperty('background', 'transparent', 'important');
          el.style.setProperty('background-color', 'transparent', 'important');
          el.style.setProperty('background-image', 'none', 'important');
        }
        el.style.setProperty('box-shadow', 'none', 'important');
      });
    });
  }

  function createHomeCluster() {
    if (document.getElementById('ag-home-cluster')) return;
    const cluster = document.createElement('div'); cluster.id = 'ag-home-cluster';
    const createBtn = (cls, icon, title, action, id) => {
      const btn = document.createElement('button'); btn.className = 'ag-cluster-btn ' + cls; if (id) btn.id = id;
      btn.title = title; btn.innerHTML = icon; btn.addEventListener('click', e => { e.stopPropagation(); action(); });
      return btn;
    };
    const liked = createBtn('ag-cluster-liked ag-cluster-lib', svg(ICONS.heart, { stroke: 0, size: 20 }), 'Liked Songs', () => safeNavigate('/collection/tracks'));
    const albums = createBtn('ag-cluster-albums ag-cluster-lib', svg(ICONS.album, { size: 20 }), 'Albums', () => openLibraryPanel('albums'));
    const home = createBtn('ag-home-main', svg(ICONS.home, { size: 20 }), 'Home', () => safeNavigate('/'), 'ag-home-button');
    const playlists = createBtn('ag-cluster-playlists ag-cluster-lib', svg(ICONS.playlist, { size: 20 }), 'Playlists', () => openLibraryPanel('playlists'));
    const artists = createBtn('ag-cluster-artists ag-cluster-lib', svg(ICONS.artist, { size: 20 }), 'Artists', () => openLibraryPanel('artists'));
    [liked, albums, home, playlists, artists].forEach(b => cluster.appendChild(b));
    document.body.appendChild(cluster);
  }

  function createHeroGlow() { if (!document.getElementById('ag-hero-glow')) { const g = document.createElement('div'); g.id = 'ag-hero-glow'; document.body.prepend(g); } }
  function createBlobs() {
    if (document.getElementById('ag-blobs')) return;
    const w = document.createElement('div'); w.id = 'ag-blobs';
    w.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
    [
      {t:'-15%', l:'-10%', w:'80vw'}, 
      {t:'35%', l:'50%', w:'65vw'}, 
      {t:'-10%', l:'60%', w:'75vw'},
      {t:'-5%', l:'-5%', w:'50vw'}, // Top Left Blob
      {t:'-15%', l:'35%', w:'65vw'} // Top Center/Right Blob
    ].forEach(d => {
      const b = document.createElement('div'); 
      b.className = 'ag-blob';
      b.style.cssText = `position:absolute;top:${d.t};left:${d.l};width:${d.w};height:${d.w};border-radius:50%;filter:blur(115px);`;
      w.appendChild(b);
    });
    document.body.prepend(w);
  }

  function createSearchOverlay() {
    if (document.getElementById('ag-centered-search')) return;
    const d = document.createElement('div'); d.id = 'ag-centered-search';
    d.innerHTML = `<div class="ag-ring"></div><div class="ag-pill-search">${svg(ICONS.search, { size: 18 })}<input id="ag-input" placeholder="Search..."/></div>`;
    const inp = d.querySelector('input');
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') safeNavigate('/search/' + encodeURIComponent(inp.value)); });
    document.body.appendChild(d);
    setTimeout(() => setupAnimatedPlaceholder(inp), 2000);
  }

  // ── LIBRARY ──
  let _allLibraryItems = []; let _currentType = ''; let _filterText = ''; let _sortOrder = 'recent';
  function createLibraryPanel() {
    if (document.getElementById('ag-lib-panel')) return;
    const backdrop = document.createElement('div'); backdrop.id = 'ag-lib-panel-backdrop';
    backdrop.addEventListener('click', closeLibraryPanel);
    const panel = document.createElement('div'); panel.id = 'ag-lib-panel';
    panel.innerHTML = `<div id="ag-lib-panel-header"><div class="ag-lib-header-row"><h2 id="ag-lib-panel-title">Library</h2><button id="ag-lib-panel-close">${svg(ICONS.close)}</button></div><div class="ag-lib-controls"><div class="ag-lib-search">${svg(ICONS.search, { size: 16 })}<input id="ag-lib-search-input" placeholder="Filter..."/></div><select id="ag-lib-sort"><option value="recent">Most Recent</option><option value="az">Name (A-Z)</option></select></div></div><div id="ag-lib-panel-grid"></div>`;
    panel.querySelector('#ag-lib-panel-close').addEventListener('click', closeLibraryPanel);
    panel.querySelector('#ag-lib-search-input').addEventListener('input', e => { _filterText = e.target.value.toLowerCase(); renderLibraryGrid(); });
    panel.querySelector('#ag-lib-sort').addEventListener('change', e => { _sortOrder = e.target.value; renderLibraryGrid(); });
    document.body.appendChild(backdrop); document.body.appendChild(panel);
  }
  function closeLibraryPanel() { document.getElementById('ag-lib-panel')?.classList.remove('ag-panel-visible'); document.getElementById('ag-lib-panel-backdrop')?.classList.remove('ag-panel-visible'); }
  async function openLibraryPanel(type) {
    _currentType = type; _filterText = ''; _sortOrder = 'recent';
    const p = document.getElementById('ag-lib-panel'); const b = document.getElementById('ag-lib-panel-backdrop');
    const g = document.getElementById('ag-lib-panel-grid'); const title = document.getElementById('ag-lib-panel-title');
    if (!p || !g) return;
    title.textContent = type.toUpperCase();
    p.classList.add('ag-panel-visible'); b.classList.add('ag-panel-visible');
    g.innerHTML = '<div class="ag-lib-empty">Loading...</div>';
    const res = await Spicetify.Platform.LibraryAPI.getContents({ limit: 400 });
    const raw = res.items || [];
    if (type === 'albums') _allLibraryItems = raw.filter(i => i.uri.includes(':album:'));
    else if (type === 'playlists') _allLibraryItems = raw.filter(i => i.uri.includes(':playlist:'));
    else if (type === 'artists') _allLibraryItems = raw.filter(i => i.uri.includes(':artist:'));
    renderLibraryGrid();
  }
  function renderLibraryGrid() {
    const grid = document.getElementById('ag-lib-panel-grid'); if (!grid) return;
    let items = [..._allLibraryItems];
    if (_filterText) items = items.filter(i => i.name?.toLowerCase().includes(_filterText));
    if (_sortOrder === 'az') items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    grid.innerHTML = items.map(i => `<div class="ag-lib-item" onclick="AmbientGlass.safeNavigate('${i.uri}'); AmbientGlass.closeLibraryPanel();"><div class="ag-lib-item-cover" style="background-image:url('${i.images?.[0]?.url || i.image?.url || ''}')"></div><div class="ag-lib-item-name">${i.name || 'Untitled'}</div></div>`).join('') || `<div class="ag-lib-empty">No ${_currentType} found</div>`;
  }

  let _lastScrollY = 0;
  function handleScroll(e) {
    const target = e.target;
    if (!target || !target.closest) return;
    // Nur auf Main-View Scrolling reagieren — Sidebar, Menüs etc. ignorieren
    if (target.closest('.Root__right-sidebar') ||
        target.closest('.Root__nav-bar') ||
        target.closest('.main-contextMenu-menu') ||
        target.closest('#ag-lib-panel') ||
        target.closest('#ag-settings-panel') ||
        target.closest('.main-buddyFeed-buddyFeed')) return;
    if (!target.closest('.Root__main-view')) return;
    const y = target.scrollTop || 0;
    _lastScrollY = y;
    const o = Math.max(0, 1 - y / 400);
    const s = document.getElementById('ag-centered-search'); const c = document.getElementById('ag-home-cluster');
    if (s && !s.classList.contains('ag-entrance-search')) { 
      const translateY = Math.min(y*0.3, 120);
      s.style.opacity = o; 
      s.style.visibility = o < 0.05 ? 'hidden' : 'visible';
      s.style.pointerEvents = o < 0.1 ? 'none' : 'auto';
      s.style.setProperty('--ag-search-y', `-${translateY}px`);
    }
    if (c && !c.classList.contains('ag-entrance-home')) { const vhStart = window.innerHeight * 0.32; const safetyMargin = 60; c.style.top = (safetyMargin + (o * (vhStart - safetyMargin))) + 'px'; }
  }

  function triggerStartupAnimation() {
    if (document.getElementById('ag-startup-splash')) return;
    const s = document.createElement('div'); s.id = 'ag-startup-splash';
    const l = `<svg viewBox="0 0 24 24" width="80" height="80" fill="#1DB954"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.305c-.218.358-.684.474-1.042.256-2.848-1.74-6.433-2.133-10.655-1.17-.41.094-.813-.164-.906-.574-.094-.41.163-.813.573-.906 4.622-1.057 8.583-.605 11.774 1.345.358.218.474.685.256 1.043zm1.468-3.26c-.275.446-.86.59-1.306.314-3.258-2-8.226-2.583-12.08-1.413-.502.152-1.03-.134-1.182-.636-.152-.503.134-1.03.636-1.182 4.4-1.335 9.876-.683 13.618 1.618.447.275.59.86.314 1.306zm.128-3.41c-3.905-2.32-10.334-2.533-14.075-1.398-.6.182-1.24-.163-1.422-.763-.182-.6.163-1.24.763-1.422 4.29-1.302 11.393-1.04 15.894 1.63.54.32.715 1.014.395 1.554-.32.54-1.014.715-1.555.395z"/></svg>`;
    s.innerHTML = `
      <style>
        #ag-startup-splash { position: fixed; inset: 0; background: #040408; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 99999; transition: opacity 1s; }
        #ag-startup-splash.fade-out { opacity: 0; pointer-events: none; }
        .ag-splash-glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(123,95,219,0.4) 0%, rgba(79,142,235,0.1) 40%, transparent 70%); filter: blur(60px); animation: ag-glow-cinematic 8s infinite alternate ease-in-out; pointer-events: none; }
        .ag-splash-content { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .ag-splash-title { color: #fff; font-size: 24px; font-weight: 200; letter-spacing: 8px; text-transform: uppercase; opacity: 0.8; margin-top: 10px; background: linear-gradient(to right, #fff, #b4a0ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ag-splash-footer { position: absolute; bottom: 40px; color: rgba(255,255,255,0.25); font-size: 10px; letter-spacing: 4px; text-transform: uppercase; }
        @keyframes ag-glow-cinematic { 0% { transform: scale(0.8) translate(-40px, -20px); opacity: 0.3; } 50% { transform: scale(1.1) translate(40px, 40px); opacity: 0.6; } 100% { transform: scale(0.9) translate(-20px, 60px); opacity: 0.2; } }
      </style>
      <div class="ag-splash-glow"></div>
      <div class="ag-splash-content">
        ${l}
        <div class="ag-splash-title">AmbientGlass</div>
      </div>
      <div class="ag-splash-footer">made by EROX</div>
      <div style="position: absolute; bottom: 20px; left: 20px; color: rgba(255,255,255,0.15); font-size: 10px; letter-spacing: 1px; font-family: monospace;">BUILD 10.42.FINAL</div>
    `;
    document.body.appendChild(s);
    
    let soundPlayed = false;
    async function playStartupSound() {
      if (soundPlayed) return;
      
      const sources = [
        'xpui://theme/assets/startup.mp3',
        '/theme/assets/startup.mp3',
        'https://xpui.app.spotify.com/theme/assets/startup.mp3',
        'https://raw.githubusercontent.com/itshe/AmbientGlass/main/assets/startup.mp3'
      ];

      for (const url of sources) {
        if (soundPlayed) break;
        try {
          // Versuche per Fetch (umgeht oft Pfad-Sperren)
          const response = await fetch(url);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio(blobUrl);
          audio.volume = 0.6;
          await audio.play();
          soundPlayed = true;
          Spicetify.showNotification("AmbientGlass: Sound OK 🔊");
          break;
        } catch (e) {
          // Wenn Fetch fehlschlägt, direkt probieren
          try {
            const audio = new Audio(url);
            audio.volume = 0.6;
            await audio.play();
            soundPlayed = true;
            Spicetify.showNotification("AmbientGlass: Sound OK 🔊");
            break;
          } catch (err) {
            console.log(`Quelle fehlgeschlagen: ${url}`);
          }
        }
      }
    }

    // Erster Klick Trigger für Sound (Autoplay-Bypass)
    window.addEventListener('click', () => playStartupSound(), { once: true });
    setTimeout(() => playStartupSound(), 300);
    setTimeout(() => s.classList.add('fade-out'), 2500);
    setTimeout(() => { s.remove(); triggerEntrance(); }, 3000);
  }

  function triggerEntrance() {
    const c = document.getElementById('ag-home-cluster'); const s = document.getElementById('ag-centered-search');
    if (c) c.classList.add('ag-entrance-home');
    setTimeout(() => { if (s) s.classList.add('ag-entrance-search'); }, 150);
    setTimeout(() => { 
      if (c) { c.classList.remove('ag-entrance-home'); c.style.visibility = 'visible'; }
      if (s) { s.classList.remove('ag-entrance-search'); s.style.visibility = 'visible'; }
    }, 1200);
  }

  const _artistImageCache = new Map();

  async function healArtistImage() {
    const path = Spicetify.Platform.History.location.pathname;
    if (!path.includes('/artist/')) return;

    const artistId = path.split('/').pop();
    const artistUri = `spotify:artist:${artistId}`;
    const header = document.querySelector('.main-entityHeader-headerText');
    
    // ANTI-DOPPEL: Nur heilen, wenn KEIN Bild da ist und wir nicht schon geheilt haben
    const existingImg = document.querySelector('.main-entityHeader-imageContainer:not(.ag-healed-image)');
    if (!header || existingImg || document.querySelector('.ag-healed-image')) return;

    if (_artistImageCache.has(artistId)) {
      injectHealedImage(header, _artistImageCache.get(artistId));
      return;
    }

    try {
      // 2. In der Library nachschauen (da sind die "echten" Bilder)
      const library = await Spicetify.Platform.LibraryAPI.getContents({ limit: 500 });
      const savedArtist = library.items?.find(i => i.uri === artistUri);
      
      let imgUrl = savedArtist?.images?.[0]?.url || savedArtist?.image?.url;

      // 3. Falls nicht in Library, Cosmos fragen aber Avatar PRIORISIEREN
      if (!imgUrl) {
        const data = await Spicetify.CosmosAsync.get(`hm://artist/v1/artist/${artistId}/desktop`);
        imgUrl = data.visuals?.avatar?.sources?.[0]?.url || data.header_image?.url;
      }
      
      if (imgUrl) {
        _artistImageCache.set(artistId, imgUrl);
        injectHealedImage(header, imgUrl);
      }
    } catch (e) {
      // Letzter Fallback
      const banner = document.querySelector('[class*="jX9OuHoZE8EC2SYi"]');
      if (banner) {
        const match = (banner.getAttribute('style') || '').match(/url\("?(.+?)"?\)/);
        if (match) {
          _artistImageCache.set(artistId, match[1]);
          injectHealedImage(header, match[1]);
        }
      }
    }
  }

  function injectHealedImage(header, imgUrl) {
    if (document.querySelector('.ag-healed-image')) return;
    const container = header.closest('.main-entityHeader-container') || header.parentElement;
    const newDiv = document.createElement('div');
    newDiv.className = 'main-entityHeader-imageContainer ag-healed-image';
    newDiv.style.cssText = 'margin-right: 32px; flex-shrink: 0; z-index: 10; display: flex; align-items: center; background: none !important;';
    newDiv.innerHTML = `
      <div class="main-entityHeader-image" style="background:none!important; border-radius: 12px; overflow: hidden; width: 232px; height: 232px; box-shadow: 0 12px 48px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);">
        <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `;
    if (container.classList.contains('main-entityHeader-container')) {
      const content = container.querySelector('.main-entityHeader-contentWrapper');
      if (content) content.insertBefore(newDiv, content.firstChild);
      else container.insertBefore(newDiv, container.firstChild);
    } else {
      header.parentElement.insertBefore(newDiv, header);
    }
  }

  function enforceProfileHitbox() {
    const isBlocking = document.getElementById('ag-startup-splash') || document.getElementById('ag-settings-panel');
    ['ag-profile-hitbox', 'ag-market-hitbox', 'ag-stats-hitbox'].forEach(id => {
      const h = document.getElementById(id);
      if (h) h.style.opacity = isBlocking ? '0' : '1';
    });
    if (isBlocking) return;

    const profileBox = document.querySelector('.main-userWidget-box');
    if (!profileBox) return;

    const realBtn = profileBox.closest('button') || profileBox.closest('a') || profileBox;

    if (!document.getElementById('ag-hitbox-style')) {
      const style = document.createElement('style');
      style.id = 'ag-hitbox-style';
      style.textContent = `
        .ag-fixed-hitbox {
          position: fixed;
          z-index: 2147483647;
          cursor: pointer;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .ag-fixed-hitbox:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 0 20px rgba(123, 95, 219, 0.3);
          transform: scale(1.05);
        }
        .ag-fixed-hitbox svg { width: 20px; height: 20px; color: #fff; opacity: 0.8; }
      `;
      document.head.appendChild(style);
    }

    let hitbox = document.getElementById('ag-profile-hitbox');
    if (!hitbox) {
      hitbox = document.createElement('div');
      hitbox.id = 'ag-profile-hitbox';
      hitbox.className = 'ag-fixed-hitbox';
      hitbox.addEventListener('click', () => realBtn.click());
      document.body.appendChild(hitbox);
      if (!hitboxNotified) {
        setTimeout(() => Spicetify.showNotification("AmbientGlass: Hitbox OK ✓"), 1000);
        hitboxNotified = true;
      }
    }

    const rect = profileBox.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const size = 44;
      hitbox.style.width = size + 'px';
      hitbox.style.height = size + 'px';
      hitbox.style.top = (rect.top + (rect.height / 2) - (size / 2)) + 'px';
      hitbox.style.left = (rect.left + (rect.width / 2) - (size / 2)) + 'px';
      
      // Marketplace & Stats Hitboxes synchronisieren
      enforceExtensionHitboxes(rect, size);
    }
  }

  function enforceExtensionHitboxes(profileRect, size) {
    const marketBtn = document.getElementById('marketplace-extension-button') || 
                      document.querySelector('button[aria-label*="Marketplace"]') || 
                      document.querySelector('button[title*="Marketplace"]');
    const statsBtn = document.getElementById('stats-extension-button') || 
                     document.querySelector('.stats-button') ||
                     document.querySelector('button[aria-label*="Stat"]') || 
                     document.querySelector('button[title*="Stat"]');

    const createOrUpdate = (id, iconSvg, originalBtn, offsetIndex) => {
      if (!originalBtn) return;
      
      // Original verstecken
      originalBtn.style.setProperty('opacity', '0', 'important');
      originalBtn.style.setProperty('pointer-events', 'none', 'important');
      originalBtn.style.setProperty('visibility', 'hidden', 'important');
      originalBtn.style.setProperty('display', 'none', 'important');

      let h = document.getElementById(id);
      if (!h) {
        h = document.createElement('div'); h.id = id; h.className = 'ag-fixed-hitbox';
        h.innerHTML = iconSvg;
        h.addEventListener('click', () => originalBtn?.click());
        document.body.appendChild(h);
      }
      h.style.width = size + 'px';
      h.style.height = size + 'px';
      h.style.left = profileRect.left + 'px';
      h.style.top = (profileRect.top + (offsetIndex * 52)) + 'px';
    };

    createOrUpdate('ag-market-hitbox', svg(ICONS.cart, { size: 18 }), marketBtn, 1);
    createOrUpdate('ag-stats-hitbox', svg(ICONS.stats, { size: 18 }), statsBtn, 2);
  }

  function fixYouLiked() {
    const artistImg = document.querySelector('.main-entityHeader-image')?.src || 
                      document.querySelector('.main-entityHeader-imageContainer img')?.src ||
                      document.querySelector('img[class*="image"]')?.src;

    if (!document.getElementById('ag-yl-fix-style')) {
      const style = document.createElement('style');
      style.id = 'ag-yl-fix-style';
      style.textContent = `
        .ag-yl-node { position: relative !important; width: 100% !important; background: transparent !important; }
        .ag-yl-node h2 { margin: 0 0 12px 0 !important; font-size: 24px !important; font-weight: 700 !important; background: transparent !important; }
        .ag-yl-main-row { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 24px !important; width: 100% !important; height: 80px !important; background: transparent !important; }
        .ag-yl-text-row { display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 0 !important; background: transparent !important; }
        .ag-yl-text-line1 { display: block !important; white-space: nowrap !important; color: white !important; font-size: 14px !important; font-weight: 600 !important; }
        .ag-yl-text-line1 * { display: inline !important; margin: 0 !important; padding: 0 !important; white-space: nowrap !important; background: none !important; }
        .ag-yl-text-line2 { font-size: 12px !important; color: rgba(255,255,255,0.5) !important; margin: 0 !important; display: block !important; }
        .ag-yl-text-line2 * { display: inline !important; background: none !important; color: inherit !important; }
        
        /* RADIKAL ALLES ALTE VERSTECKEN */
        .ag-yl-node > *:not(h2):not(.ag-yl-main-row) {
          display: none !important; width: 0 !important; height: 0 !important; visibility: hidden !important; opacity: 0 !important;
        }
        .ag-yl-node img, .ag-yl-node [class*="Avatar"], .ag-yl-node [class*="imageContainer"] {
          display: none !important; width: 0 !important; height: 0 !important; visibility: hidden !important; opacity: 0 !important;
        }
        #ag-custom-yl-avatar-container { display: block !important; width: 80px !important; height: 80px !important; visibility: visible !important; opacity: 1 !important; }
        .ag-yl-main-row { display: flex !important; visibility: visible !important; opacity: 1 !important; }
      `;
      document.head.appendChild(style);
    }

    document.querySelectorAll('h2').forEach(h2 => {
      const text = h2.innerText.trim();
      if ((text.includes('You Liked') || text.includes('Gefällt dir')) && 
          !text.includes('Artist pick') && !text.includes('Auswahl des Künstlers')) {
        
        const node = h2.parentElement;
        if (!node || node.querySelector('.ag-yl-main-row')) return;
        node.classList.add('ag-yl-node');

        const imgSrc = node.querySelector('img')?.src || artistImg;
        if (!imgSrc) return;

        const mainRow = document.createElement('div');
        mainRow.className = 'ag-yl-main-row';
        const avContainer = document.createElement('div');
        avContainer.id = 'ag-custom-yl-avatar-container';
        avContainer.style.cssText = `position: relative !important; width: 80px !important; height: 80px !important; min-width: 80px !important; border-radius: 50% !important; background-image: url(${imgSrc}) !important; background-size: cover !important; background-position: center !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important; border: 2px solid rgba(255,255,255,0.1) !important; z-index: 100 !important;`;
        const textRow = document.createElement('div');
        textRow.className = 'ag-yl-text-row';
        
        // Text-Extraktion (Manuell für maximale Stabilität)
        let songsCount = "";
        let releasesCount = "";
        let artistName = "";

        node.querySelectorAll('span, div, a').forEach(el => {
          const t = el.innerText.trim();
          if (!t || t.includes('You Liked') || t.includes('Gefällt dir')) return;
          if (t.toLowerCase().includes('song')) songsCount = t;
          else if (t.toLowerCase().includes('release')) releasesCount = t;
          else if (t.length > 1 && !t.includes('•')) artistName = t;
        });

        const line1 = document.createElement('div');
        line1.className = 'ag-yl-text-line1';
        line1.innerText = `${songsCount}${songsCount && releasesCount ? ' • ' : ''}${releasesCount}`;
        
        const line2 = document.createElement('div');
        line2.className = 'ag-yl-text-line2';
        line2.innerText = artistName;

        if (line1.innerText.trim()) textRow.appendChild(line1);
        if (line2.innerText.trim()) textRow.appendChild(line2);

        // Klickbarkeit wiederherstellen (Internes Routing)
        const originalLink = node.querySelector('a')?.href;
        if (originalLink) {
          mainRow.style.cursor = 'pointer';
          mainRow.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              // Extrahiere Pfad (z.B. /artist/...)
              const path = originalLink.replace('https://xpui.app.spotify.com', '');
              Spicetify.Platform.History.push(path);
            } catch (err) {
              window.location.href = originalLink;
            }
          };
        }

        // Herz finden (als einziges klonen)
        const originalHeart = node.querySelector('svg')?.parentElement?.parentElement || node.querySelector('.main-likedSongsButton-likedSongsIcon');
        if (originalHeart) {
          const heartClone = originalHeart.cloneNode(true);
          heartClone.style.cssText = 'position: absolute !important; bottom: -2px !important; right: -2px !important; width: 30px !important; height: 30px !important; z-index: 110 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: none !important; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) !important;';
          avContainer.appendChild(heartClone);
        }
        
        mainRow.appendChild(avContainer);
        mainRow.appendChild(textRow);
        node.appendChild(mainRow);
      }
    });
  }

  function isFullscreen() {
    try {
      const path = Spicetify.Platform.History.location.pathname || '';
      const fulls = ['/lyrics', '/queue', '/preferences'];
      if (fulls.some(r => path.startsWith(r))) return true;
      return !!(document.fullscreenElement || document.querySelector('.npv-main-container'));
    } catch { return false; }
  }

  function isModalOpen() {
    return !!(
      document.querySelector('[data-testid="dialog"]') ||
      document.querySelector('[class*="GenericModal"]') ||
      document.querySelector('[class*="modal-overlay"]') ||
      document.querySelector('.main-embedWidgetGenerator-container') ||
      document.querySelector('[class*="Backdrop"]')
    );
  }

  function updateVisibility() {
    const search = document.getElementById('ag-centered-search');
    const cluster = document.getElementById('ag-home-cluster');
    if (!search || !cluster) return;

    const path = Spicetify.Platform.History.location.pathname || '';
    const isNarrow = window.innerWidth < 750;
    const isFull = isFullscreen() || 
                   path.includes('marketplace') || 
                   path.includes('stats') || 
                   path.includes('statistics') ||
                   !!document.querySelector('.marketplace-header') ||
                   !!document.querySelector('.stats-header');
    const isModal = isModalOpen();
    const shouldHide = isFull || isNarrow || isModal;

    if (shouldHide) {
      search.style.opacity = '0';
      search.style.pointerEvents = 'none';
      cluster.style.opacity = isModal ? '0' : '1';
      cluster.style.pointerEvents = isModal ? 'none' : 'auto';
      cluster.style.top = '60px';
    } else {
      search.style.pointerEvents = 'auto';
      cluster.style.opacity = '1';
      cluster.style.pointerEvents = 'auto';
      // Restores correct state based on scroll
      handleScroll({ target: { scrollTop: _lastScrollY } });
    }
  }
  async function setupAnimatedPlaceholder(input) {
    const baseLabels = ['Search...', 'Songs...', 'Artists...', 'Albums...', 'Playlists...'];
    let items = [...baseLabels];
    try {
      const lib = await Spicetify.Platform.LibraryAPI.getContents({ limit: 15 });
      const recent = (lib.items || []).slice(0, 5).map(i => i.name).filter(Boolean).map(n => n + '...');
      if (recent.length > 0) items = ['Search...', ...recent, ...baseLabels.slice(1)];
    } catch {}
    let idx = 0;
    setInterval(() => {
      if (document.activeElement === input) return;
      input.placeholder = items[idx % items.length];
      idx++;
    }, 2000);
  }

  // ── FRIENDS PANEL OVERLAP FIX ──
  function fixFriendsPanel() {
    if (!document.getElementById('ag-friends-fix-style')) {
      const style = document.createElement('style');
      style.id = 'ag-friends-fix-style';
      style.textContent = `
        /* Verhindert, dass der "Jetzt läuft"-Track im Freunde-Panel überlappt */
        .main-buddyFeed-buddyFeed {
          padding-bottom: 0 !important;
          overflow-y: auto !important;
        }
        /* Now-playing bar UNTER dem Freundes-Panel fixieren */
        .Root__now-playing-bar {
          z-index: 100 !important;
        }
        /* Wenn Friends-Panel offen: Now-playing nicht über dem Panel */
        .main-globalNav-globalNav ~ .Root__right-sidebar .main-buddyFeed-buddyFeed {
          margin-bottom: 0 !important;
        }
        /* Verhindern, dass der aktuelle Track den Freunde-Feed überlagert */
        [data-testid="buddy-feed-container"],
        .main-buddyFeed-buddyFeedHeader {
          z-index: 10 !important;
          position: relative !important;
        }
        /* Now-playing-Bar und andere Ansichten komplett ausblenden wenn Freunde offen sind */
        .Root__right-sidebar:has([class*="buddyFeed"]) [data-testid="now-playing-view"],
        .Root__right-sidebar:has([class*="buddyFeed"]) .main-nowPlayingView-section {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        .Root__right-sidebar {
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function setupSidebarObserver() {
    const sidebar = document.querySelector('.Root__right-sidebar');
    if (!sidebar) { setTimeout(setupSidebarObserver, 500); return; }
    const observer = new MutationObserver(() => {
      const isBuddy = sidebar.querySelector('[class*="buddyFeed"]');
      const nowPlaying = sidebar.querySelector('[class*="nowPlayingView"], [data-testid="now-playing-view"]');
      if (isBuddy && nowPlaying) { nowPlaying.style.display = 'none'; }
    });
    observer.observe(sidebar, { childList: true, subtree: true });
  }

  function fixMarketplaceDropdown() {
    const path = Spicetify.Platform.History.location.pathname;
    if (!path.includes('marketplace')) return;

    const select = document.querySelector('.marketplace-header select, .marketplace-header__dropdown');
    if (!select || document.getElementById('ag-marketplace-tabs')) return;

    const container = select.parentElement;
    if (!container) return;

    select.style.setProperty('display', 'none', 'important');

    const tabs = document.createElement('div');
    tabs.id = 'ag-marketplace-tabs';
    
    // Sort options to have Themes and Extensions first
    const options = Array.from(select.options);
    
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'ag-market-tab-btn';
      if (select.value === opt.value) btn.classList.add('active');
      btn.innerText = opt.text;
      
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Visual feedback
        setTimeout(() => {
            const newTabs = document.getElementById('ag-marketplace-tabs');
            if (newTabs) {
                newTabs.querySelectorAll('.ag-market-tab-btn').forEach(b => {
                    b.classList.remove('active');
                    if (b.innerText === opt.text) b.classList.add('active');
                });
            }
        }, 50);
      };
      tabs.appendChild(btn);
    });

    const header = document.querySelector('.marketplace-header');
    if (header) {
        // Try to insert after the search bar or title
        const search = header.querySelector('.marketplace-header__search-container');
        if (search) header.insertBefore(tabs, search.nextSibling);
        else header.appendChild(tabs);
    }
  }

  // ── SETTINGS & PRIVACY ──
  const DEFAULTS = {
    glow: '#7b5fdb', s1: '#7b5fdb', s2: '#4f8edb', accent: '#7b5fdb',
    home: '#1DB954', liked: '#ff4b4b', albums: '#4b9eff', playlists: '#b34bff', artists: '#ffcc4b',
    btn_bg: 'rgba(20, 18, 38, 0.65)', btn_icon: '#f0f0ff', blobs: '#7b5fdb',
    glow_opacity: '0.8', blobs_opacity: '0.25',
    glass_reflection: 'true', glass_blur: '24'
  };

  function getSetting(key) { 
    const saved = localStorage.getItem('ag-setting-' + key);
    if (saved) return saved;
    return DEFAULTS[key];
  }

  function openSettingsPanel() {
    if (document.getElementById('ag-settings-panel')) return;
    const d = document.createElement('div'); d.id = 'ag-settings-panel';
    const isPrivacy = localStorage.getItem('ag-privacy') === 'true';
    
    d.innerHTML = `
      <div class="ag-settings-wrapper">
        <div class="ag-settings-content">
          <div class="ag-settings-header">
            <h3>Theme Settings</h3>
            <button onclick="this.closest('#ag-settings-panel').remove()">${svg(ICONS.close, {size:16})}</button>
          </div>
          
          <div class="ag-settings-tabs">
            <button class="ag-tab-btn active" data-tab="general">General</button>
            <button class="ag-tab-btn" data-tab="cluster">Cluster</button>
            <button class="ag-tab-btn" data-tab="search">Search</button>
            <button class="ag-tab-btn" data-tab="ui">UI & Accent</button>
          </div>

          <div class="ag-settings-body">
            <div class="ag-tab-content active" id="tab-general">
              <div class="ag-setting-item"><label>Privacy Mode</label><input type="checkbox" id="ag-check-privacy" ${isPrivacy ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><label>Hero Glow Color</label><input type="color" id="ag-col-glow" value="${getSetting('glow')}"/></div>
              <div class="ag-setting-item"><label>Hero Glow Intensity</label><input type="range" id="ag-range-glow_opacity" min="0" max="1" step="0.05" value="${getSetting('glow_opacity')}"/></div>
              <div class="ag-setting-item"><label>Background Blobs Color</label><input type="color" id="ag-col-blobs" value="${getSetting('blobs')}"/></div>
              <div class="ag-setting-item"><label>Blobs Intensity</label><input type="range" id="ag-range-blobs_opacity" min="0" max="1" step="0.05" value="${getSetting('blobs_opacity')}"/></div>
              <div class="ag-setting-item"><label>FrostedGlass/Glass</label><input type="checkbox" id="ag-check-glass_reflection" ${getSetting('glass_reflection') === 'true' ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><label>Frosted Glass Blur</label><input type="range" id="ag-range-glass_blur" min="0" max="80" step="2" value="${getSetting('glass_blur')}"/></div>
            </div>

            <div class="ag-tab-content" id="tab-cluster">
              <div class="ag-setting-item"><label>Home Button (Glow)</label><input type="color" id="ag-col-home" value="${getSetting('home')}"/></div>
              <div class="ag-setting-item"><label>Liked Songs (Glow)</label><input type="color" id="ag-col-liked" value="${getSetting('liked')}"/></div>
              <div class="ag-setting-item"><label>Albums (Glow)</label><input type="color" id="ag-col-albums" value="${getSetting('albums')}"/></div>
              <div class="ag-setting-item"><label>Playlists (Glow)</label><input type="color" id="ag-col-playlists" value="${getSetting('playlists')}"/></div>
              <div class="ag-setting-item"><label>Artists (Glow)</label><input type="color" id="ag-col-artists" value="${getSetting('artists')}"/></div>
            </div>

            <div class="ag-tab-content" id="tab-search">
              <div class="ag-setting-item"><label>Search Color 1</label><input type="color" id="ag-col-s1" value="${getSetting('s1')}"/></div>
              <div class="ag-setting-item"><label>Search Color 2</label><input type="color" id="ag-col-s2" value="${getSetting('s2')}"/></div>
            </div>

            <div class="ag-tab-content" id="tab-ui">
               <div class="ag-setting-item"><label>Accent Color (Like/UI)</label><input type="color" id="ag-col-accent" value="${getSetting('accent')}"/></div>
               <p style="font-size: 11px; opacity: 0.6; margin-top: 10px;">This skins native Spotify elements like the Like button and progress bar.</p>
            </div>
          </div>

          <div class="ag-settings-footer">
            <button id="ag-save-settings">Save & Apply</button>
            <button id="ag-reset-settings" style="background:rgba(255,255,255,0.05);color:#fff;margin-top:10px;">Reset to Defaults</button>
          </div>
        </div>
        <div class="ag-settings-preview-container">
          <div class="ag-preview-glow"></div>
          <div class="ag-settings-preview">
            <span>Glass Preview</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(d);

    // Tab Logic
    const tabs = d.querySelectorAll('.ag-tab-btn');
    const contents = d.querySelectorAll('.ag-tab-content');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active'));
        contents.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        d.querySelector('#tab-' + t.dataset.tab).classList.add('active');
      });
    });
    
    // Live Change Logic
    const inputs = d.querySelectorAll('input, select');
    inputs.forEach(input => {
      const eventType = input.type === 'range' || input.type === 'color' ? 'input' : 'change';
      input.addEventListener(eventType, () => {
        const k = input.id.replace('ag-col-', '').replace('ag-range-', '').replace('ag-check-', '');
        if (input.id === 'ag-check-privacy') {
            const wasTrue = localStorage.getItem('ag-privacy') === 'true';
            localStorage.setItem('ag-privacy', input.checked);
            if (input.checked) {
                applyPrivacy();
            } else if (wasTrue) {
                Spicetify.showNotification("Privacy Off: Reloading to restore text... ↺");
                setTimeout(() => location.reload(), 1200);
            }
        } else {
            const val = input.type === 'checkbox' ? input.checked.toString() : input.value;
            localStorage.setItem('ag-setting-' + k, val);
            applyCustomColors();
        }
      });
    });

    d.querySelector('#ag-save-settings').addEventListener('click', () => {
      localStorage.setItem('ag-privacy', d.querySelector('#ag-check-privacy').checked);
      Object.keys(DEFAULTS).forEach(k => {
        const el = d.querySelector('#ag-col-' + k) || d.querySelector('#ag-range-' + k) || d.querySelector('#ag-check-' + k);
        if (el) {
          const val = el.type === 'checkbox' ? el.checked.toString() : el.value;
          localStorage.setItem('ag-setting-' + k, val);
        }
      });
      
      // Live Apply!
      try {
        applyCustomColors();
        if (localStorage.getItem('ag-privacy') === 'true') {
            applyPrivacy();
        }
      } catch(e) {}
      
      d.remove();
      Spicetify.showNotification("AmbientGlass: Applied! ✨");
    });
    d.querySelector('#ag-reset-settings').addEventListener('click', () => {
      localStorage.removeItem('ag-privacy');
      Object.keys(DEFAULTS).forEach(k => localStorage.removeItem('ag-setting-' + k));
      
      applyCustomColors();
      document.getElementById('ag-privacy-logic')?.remove();
      
      d.remove();
      Spicetify.showNotification("AmbientGlass: Reset to Defaults! ↺");
    });
  }

  function applyCustomColors() {
    const glow = getSetting('glow');
    const s1 = getSetting('s1');
    const s2 = getSetting('s2');
    const bg = getSetting('bg');
    const home = getSetting('home');
    const liked = getSetting('liked');
    const albums = getSetting('albums');
    const playlists = getSetting('playlists');
    const artists = getSetting('artists');
    const accent = getSetting('accent');
    const btn_bg = getSetting('btn_bg');
    const btn_icon = getSetting('btn_icon');
    const blobs = getSetting('blobs');
    const glowOpacity = getSetting('glow_opacity');
    const blobsOpacity = getSetting('blobs_opacity');

    // Root Variables for Cluster & Glow
    const root = document.documentElement;
    root.style.setProperty('--ag-s1', s1);
    root.style.setProperty('--ag-s2', s2);
    root.style.setProperty('--ag-s3', s2);
    root.style.setProperty('--ag-accent-main', accent);
    
    root.style.setProperty('--ag-col-home', home);
    root.style.setProperty('--ag-col-liked', liked);
    root.style.setProperty('--ag-col-albums', albums);
    root.style.setProperty('--ag-col-playlists', playlists);
    root.style.setProperty('--ag-col-artists', artists);
    root.style.setProperty('--ag-col-btn_bg', btn_bg);
    
    root.style.setProperty('--ag-ambient-color', glow);
    root.style.setProperty('--ag-glow-opacity', glowOpacity);
    root.style.setProperty('--ag-blobs-opacity', blobsOpacity);
    root.style.setProperty('--ag-col-blobs', blobs);
    
    const reflection = getSetting('glass_reflection') === 'true';
    const blur = getSetting('glass_blur');
    root.style.setProperty('--ag-glass-blur', blur + 'px');

    let s = document.getElementById('ag-dynamic-colors');
    if (!s) { s = document.createElement('style'); s.id = 'ag-dynamic-colors'; document.head.appendChild(s); }
    
    s.textContent = `
      :root { 
        --spice-button: ${accent} !important;
        --spice-button-active: ${accent} !important;
        --spice-accent: ${accent} !important;
      }
      html, body, .Root__top-container, .under-main-view { background: #040408 !important; }
      #ag-startup-splash { background: #040408 !important; }

      .ag-blob { background: ${blobs} !important; opacity: var(--ag-blobs-opacity) !important; }
      .ag-cluster-btn { background: ${btn_bg} !important; border: 1px solid rgba(255,255,255,0.05) !important; }

      /* CLUSTER COLORS - DEFAULT (WHITE) */
      .ag-cluster-btn svg { color: #fff !important; stroke: #fff !important; filter: none !important; opacity: 0.6; transition: all 0.3s ease !important; }
      .ag-cluster-btn.ag-cluster-liked svg { fill: #fff !important; stroke: none !important; }
      .ag-cluster-btn.ag-cluster-liked svg path { fill: #fff !important; }

      /* CLUSTER COLORS - HOVER INJECTION */
      html body .ag-cluster-btn.ag-home-main:hover { color: ${home} !important; }
      html body .ag-cluster-btn.ag-home-main:hover svg { stroke: ${home} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${home}cc) !important; }
      html body .ag-cluster-btn.ag-home-main:hover { box-shadow: 0 0 25px ${home}66 !important; border-color: ${home}88 !important; }

      html body .ag-cluster-btn.ag-cluster-liked:hover { color: ${liked} !important; }
      html body .ag-cluster-btn.ag-cluster-liked:hover svg { fill: ${liked} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${liked}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-liked:hover svg path { fill: ${liked} !important; }
      html body .ag-cluster-btn.ag-cluster-liked:hover { box-shadow: 0 0 25px ${liked}66 !important; border-color: ${liked}88 !important; }

      html body .ag-cluster-btn.ag-cluster-albums:hover { color: ${albums} !important; }
      html body .ag-cluster-btn.ag-cluster-albums:hover svg { stroke: ${albums} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${albums}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-albums:hover { box-shadow: 0 0 25px ${albums}66 !important; border-color: ${albums}88 !important; }

      html body .ag-cluster-btn.ag-cluster-playlists:hover { color: ${playlists} !important; }
      html body .ag-cluster-btn.ag-cluster-playlists:hover svg { stroke: ${playlists} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${playlists}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-playlists:hover { box-shadow: 0 0 25px ${playlists}66 !important; border-color: ${playlists}88 !important; }

      html body .ag-cluster-btn.ag-cluster-artists:hover { color: ${artists} !important; }
      html body .ag-cluster-btn.ag-cluster-artists:hover svg { stroke: ${artists} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${artists}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-artists:hover { box-shadow: 0 0 25px ${artists}66 !important; border-color: ${artists}88 !important; }




      #ag-centered-search { transform: translateX(-50%) translateY(var(--ag-search-y, 0)) scale(1) !important; }
      #ag-centered-search:hover { transform: translateX(-50%) translateY(var(--ag-search-y, 0)) scale(1.05) !important; }
      
      #ag-centered-search:hover .ag-ring { opacity: 0.8 !important; border-color: rgba(255, 255, 255, 0.2) !important; }
      #ag-centered-search:hover .ag-pill-search { border-color: rgba(255, 255, 255, 0.15) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important; }
      
      .ag-albums:hover { box-shadow: 0 0 25px ${albums}44 !important; border-color: ${albums}66 !important; }
      .ag-albums:hover svg { stroke: ${albums} !important; }
      .ag-playlists:hover { box-shadow: 0 0 25px ${playlists}44 !important; border-color: ${playlists}66 !important; }
      .ag-playlists:hover svg { stroke: ${playlists} !important; }
      .ag-artists:hover { box-shadow: 0 0 25px ${artists}44 !important; border-color: ${artists}66 !important; }
      .ag-artists:hover svg { stroke: ${artists} !important; }

      /* Spotify Native UI Skining */
      .main-addButton-button[aria-checked="true"], 
      .main-addButton-active,
      .main-playButton-PlayButton,
      .epS_o7V0M0_As_9V_970,
      button[aria-checked="true"] svg {
        color: ${accent} !important;
        fill: ${accent} !important;
      }
      .x-progressBar-fillColor { background-color: ${accent} !important; }

      /* Glass Settings Injection — High Specificity Overrides */
      html body .ag-pill-search, 
      html body .ag-cluster-btn, 
      html body #ag-lib-panel, 
      html body .view-homeShortcutsGrid-shortcut, 
      html body .main-contextMenu-menu, 
      html body [data-testid="context-menu"],
      html body .ag-settings-preview {
        backdrop-filter: blur(${blur}px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(${blur}px) saturate(180%) !important;
        ${reflection ? `
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 10px 40px rgba(0,0,0,0.4) !important;
        ` : `
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        `}
      }
    `;
  }

  function applyPrivacy() {
    if (localStorage.getItem('ag-privacy') !== 'true') return;
    const s = document.createElement('style'); s.id = 'ag-privacy-logic';
    s.textContent = `img, [style*="background-image"], .main-image-image, .main-entityHeader-image, .main-avatar-image { filter: brightness(0) !important; background: #000 !important; background-image: none !important; }`;
    document.head.appendChild(s);
    const replace = (n) => {
      if (n.nodeType === 3) {
        const t = n.textContent.trim();
        if (t.length > 1 && !['Your Music','AmbientGlass','Apply','Reset','Settings'].some(w => t.includes(w))) n.textContent = "Your Music";
      } else if (n.nodeType === 1 && !['STYLE','SCRIPT','INPUT','TEXTAREA'].includes(n.tagName) && !n.closest('#ag-settings-panel')) n.childNodes.forEach(replace);
    };
    new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(replace))).observe(document.body, { childList:true, subtree:true });
    replace(document.body);
  }

  function injectSettingsToMenu() {
    const menu = document.querySelector('ul.main-contextMenu-menu');
    if (menu && !document.getElementById('ag-menu-item')) {
      menu.classList.add('ag-user-menu');
      const item = document.createElement('li'); item.id = 'ag-menu-item'; item.className = 'main-contextMenu-menuItem';
      item.innerHTML = `<button class="main-contextMenu-menuItemButton"><span class="main-contextMenu-listItemText">AmbientGlass Settings</span>${svg(ICONS.home, {size:16})}</button>`;
      item.addEventListener('click', () => { const b = document.querySelector('.main-contextMenu-backdrop'); if (b) b.click(); openSettingsPanel(); });
      menu.insertBefore(item, menu.firstChild);
    }
  }

  function init() {
    console.log("%c AmbientGlass ✦ EROX %c", "background:#7b5fdb;color:#fff;padding:5px;border-radius:5px;", "");
    try { applyCustomColors(); } catch(e) {}
    try { applyPrivacy(); } catch(e) {}
    
    triggerStartupAnimation(); createBlobs(); createHeroGlow();
    createHomeCluster(); createSearchOverlay(); createLibraryPanel();
    killTopbar(); killResidues();
    setupSidebarObserver();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updateVisibility);
    try { Spicetify.Platform.History.listen(() => setTimeout(updateVisibility, 100)); } catch {}
    fixFriendsPanel();
    
    setInterval(() => { 
      try {
        killTopbar(); killResidues(); healArtistImage(); enforceProfileHitbox();
        updateVisibility(); fixFriendsPanel(); injectSettingsToMenu();
        fixYouLiked(); fixMarketplaceDropdown();
      } catch(e) {}
    }, 500);
  }
  
  window.AmbientGlass = { safeNavigate, closeLibraryPanel };
  init();
})();
