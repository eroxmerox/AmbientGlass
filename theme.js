// AmbientGlass: native Spotify behavior with floating glass controls.

(function AmbientGlass() {
  'use strict';
  const THEME_VERSION = '2.0.0';
  if (window.__ambientGlassInitialized) return;
  if (!window.Spicetify?.Player?.addEventListener || !window.Spicetify?.Platform?.History?.listen || !document.body) {
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
    stats: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.1-.4H2.8a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1.1V2.8a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15.4 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.39.37.72.69.96.3.23.67.35 1.05.34h.06a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z"/>'
  };

  function svg(pathContent, opts = {}) {
    const stroke = opts.stroke ?? 2.5; const size = opts.size ?? 24;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${pathContent}</svg>`;
  }

  const DEFAULT_LAYOUT = {
    "dock": {
      "x": 16,
      "y": 48
    },
    "homeCluster": {
      "x": 50,
      "y": 34
    },
    "search": {
      "x": 50,
      "y": 45.61315280464217
    },
    "nowPlaying": {
      "x": 50,
      "y": 96,
      "w": 58
    }
  };
  let _layoutEditMode = false;
  let _layoutDraft = null;
  let _layoutFrame = 0;
  let _layoutDragging = false;
  let _visibilityFrame = 0;
  let _dockButtonsCache = [];
  let _dockButtonsDirty = true;
  let _lastAppliedLayoutSignature = '';
  let _lastVisibilitySignature = '';
  let _nativeDockSignature = '';
  let _nativeDockButtons = [];
  let _upNextRequest = null;
  let _upNextGeneration = 0;
  let _lastUpNextUpdate = 0;
  let _libraryRequestId = 0;
  let _sidebarObserver = null;
  let _observedSidebar = null;


  function cloneLayout(layout = DEFAULT_LAYOUT) {
    return JSON.parse(JSON.stringify(layout));
  }

  function getLayout() {
    try {
      const saved = JSON.parse(localStorage.getItem('ag-layout') || 'null');
      const base = cloneLayout(DEFAULT_LAYOUT);
      Object.keys(saved || {}).forEach(key => {
        base[key] = { ...(base[key] || {}), ...(saved[key] || {}) };
      });
      delete base.sidebar;
      base.homeCluster.x = clamp(Number(base.homeCluster.x) || DEFAULT_LAYOUT.homeCluster.x, 8, 92);
      base.homeCluster.y = clamp(Number(base.homeCluster.y) || DEFAULT_LAYOUT.homeCluster.y, 6, 92);
      base.search.x = clamp(Number(base.search.x) || DEFAULT_LAYOUT.search.x, 8, 92);
      base.search.y = clamp(Number(base.search.y) || DEFAULT_LAYOUT.search.y, 8, 92);
      base.dock.x = clamp(Number(base.dock.x) || DEFAULT_LAYOUT.dock.x, 8, 90);
      base.dock.y = clamp(Number(base.dock.y) || DEFAULT_LAYOUT.dock.y, 38, 96);
      base.nowPlaying.x = clamp(Number(base.nowPlaying.x) || DEFAULT_LAYOUT.nowPlaying.x, 12, 88);
      base.nowPlaying.y = clamp(Number(base.nowPlaying.y) || DEFAULT_LAYOUT.nowPlaying.y, 72, 96);
      return base;
    } catch {
      return cloneLayout(DEFAULT_LAYOUT);
    }
  }

  function saveLayout(layout) {
    localStorage.setItem('ag-layout', JSON.stringify(layout));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clampPx(value, size, viewportSize, margin = 8) {
    return clamp(value, margin, Math.max(margin, viewportSize - size - margin));
  }

  function snapPercent(value, snap = 50, threshold = 1.4) {
    return Math.abs(value - snap) <= threshold ? snap : value;
  }

  function snapPxCenter(left, size, viewportSize, threshold = 16) {
    const centeredLeft = (viewportSize - size) / 2;
    return Math.abs(left - centeredLeft) <= threshold ? centeredLeft : left;
  }

  function setStyleIfChanged(el, prop, value, priority = '') {
    if (!el) return;
    value = value == null ? '' : String(value);
    if (el.style.getPropertyValue(prop) === value && el.style.getPropertyPriority(prop) === priority) return;
    if (priority) el.style.setProperty(prop, value, priority);
    else el.style.setProperty(prop, value);
  }

  function layoutLeft(percent) {
    return _layoutEditMode ? `${percent}%` : `calc(var(--ag-layout-viewport, 100vw) * ${percent / 100})`;
  }

  function queueVisibilityUpdate() {
    if (_visibilityFrame || document.hidden) return;
    _visibilityFrame = requestAnimationFrame(() => {
      _visibilityFrame = 0;
      updateVisibility();
      moveArtistBanner();
    });
  }




  function markDockDirty() {
    _dockButtonsDirty = true;
  }

  function syncPageClasses() {
    const path = Spicetify.Platform?.History?.location?.pathname || '';
    const isMarketplacePage = path.includes('marketplace') || !!document.querySelector('.marketplace-header');
    document.body?.classList.toggle('ag-marketplace-page', isMarketplacePage);
    const isSearchPage = /^\/search(?:\/|$)/.test(path);
    const isEntityPage = /^\/(playlist|album|artist|collection)\//.test(path) ||
      !!document.querySelector('.main-entityHeader-container');
    const hasHomeContent = !!document.querySelector('.view-homeShortcutsGrid-shortcut, [data-testid="home-card"]');
    const isHomePage = !isMarketplacePage && !isSearchPage && (
      path === '/' ||
      path === '/home' ||
      hasHomeContent
    );
    document.body?.classList.toggle('ag-home-page', isHomePage);
    document.body?.classList.toggle('ag-entity-page', isEntityPage && !isHomePage && !isMarketplacePage && !isSearchPage);
    return { path, isMarketplacePage, isSearchPage, isHomePage, isEntityPage };
  }

  function applyLayout(layout = getLayout()) {
    document.body?.classList.add('ag-layout-custom');
    const pinHomeTop = !_layoutEditMode && getMainScrollY() > 12;
    const cluster = document.getElementById('ag-home-cluster');
    const search = document.getElementById('ag-centered-search');
    const nowPlaying = document.querySelector('.Root__now-playing-bar');
    const jamPill = document.getElementById('ag-jam-floating-pill');
    const signature = [
      _layoutEditMode ? 'edit' : 'live',
      pinHomeTop ? 'pinned' : 'free',
      layout.homeCluster.x, layout.homeCluster.y,
      layout.search.x, layout.search.y,
      layout.nowPlaying.x, layout.nowPlaying.y,
      cluster ? 1 : 0,
      search ? 1 : 0,
      nowPlaying ? 1 : 0,
      jamPill ? 1 : 0
    ].join('|');
    if (signature === _lastAppliedLayoutSignature) return;
    _lastAppliedLayoutSignature = signature;
    if (cluster) {
      setStyleIfChanged(cluster, 'left', layoutLeft(pinHomeTop ? 50 : layout.homeCluster.x), 'important');
      setStyleIfChanged(cluster, 'top', pinHomeTop ? '60px' : `${layout.homeCluster.y}%`, 'important');
      setStyleIfChanged(cluster, 'right', 'auto', 'important');
      setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
      setStyleIfChanged(cluster, 'width', '340px', 'important');
      setStyleIfChanged(cluster, 'height', '92px', 'important');
      setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
    }

    if (search) {
      setStyleIfChanged(search, 'left', `clamp(calc(var(--ag-search-width) / 2 + 8px), ${layoutLeft(layout.search.x)}, calc(var(--ag-layout-viewport, 100vw) - var(--ag-search-width) / 2 - 8px))`);
      setStyleIfChanged(search, 'top', `${layout.search.y}%`);
      setStyleIfChanged(search, 'transform', 'translate(-50%, -50%) scale(1)');
    }

    if (nowPlaying) {
      setStyleIfChanged(nowPlaying, '--ag-now-x', layout.nowPlaying.x + '%');
      setStyleIfChanged(nowPlaying, '--ag-now-y', layout.nowPlaying.y + '%');
    }

    if (jamPill) {
      positionJamPill(jamPill);
    }

    positionUpNextCard();

  }

  function getMainScrollY() {
    if (typeof _lastScrollY === 'number') return _lastScrollY;
    const scrollers = Array.from(document.querySelectorAll('.Root__main-view [data-overlayscrollbars-viewport], .Root__main-view .os-viewport, .Root__main-view'));
    if (!scrollers.length) return 0;
    return scrollers.reduce((max, el) => Math.max(max, Number(el?.scrollTop) || 0), 0);
  }

  // Navigator fix.
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
    const el = document.querySelector(".main-topBar-container");
    if (!el) return;

    // Marketplace is a special case: keep the native top bar visible.
    const path = Spicetify.Platform?.History?.location?.pathname || '';
    const isMarketplace = path.includes("marketplace") || !!document.querySelector('.marketplace-header');

    if (isMarketplace) {
        setStyleIfChanged(el, "opacity", "1", "important");
        setStyleIfChanged(el, "visibility", "visible", "important");
        setStyleIfChanged(el, "display", "flex", "important");
        setStyleIfChanged(el, "pointer-events", "auto", "important");
        return;
    }

    setStyleIfChanged(el, "background", "transparent", "important");
    setStyleIfChanged(el, "box-shadow", "none", "important");
    setStyleIfChanged(el, "opacity", "0", "important");
    setStyleIfChanged(el, "pointer-events", "none", "important");
  }

  function killResidues() {
    const targets = ['.main-entityHeader-backgroundColor', '.main-entityHeader-overlay', '.main-actionBar-ActionBarBackground', '.main-actionBarBackground-background', '.main-home-filterChipsSection', '.main-home-filterChipsSectionActive', '[class*="filterChipsSection"]', '[class*="actionBarBackground"]'];
    targets.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const style = el.getAttribute('style') || '';
        // Only clear backgrounds that are not real image URLs.
        if (!style.includes('url(')) {
          setStyleIfChanged(el, 'background', 'transparent', 'important');
          setStyleIfChanged(el, 'background-color', 'transparent', 'important');
          setStyleIfChanged(el, 'background-image', 'none', 'important');
        }
        setStyleIfChanged(el, 'box-shadow', 'none', 'important');
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
    let clusterHideTimer = null;
    const openCluster = () => {
      window.clearTimeout(clusterHideTimer);
      cluster.classList.add('ag-cluster-open');
    };
    const closeCluster = () => {
      window.clearTimeout(clusterHideTimer);
      clusterHideTimer = window.setTimeout(() => cluster.classList.remove('ag-cluster-open'), 220);
    };
    cluster.addEventListener('pointerenter', openCluster);
    cluster.addEventListener('pointerleave', closeCluster);
    cluster.addEventListener('focusin', openCluster);
    cluster.addEventListener('focusout', closeCluster);
    document.body.appendChild(cluster);
    applyLayout();
  }

  function createHeroGlow() { if (!document.getElementById('ag-hero-glow')) { const g = document.createElement('div'); g.id = 'ag-hero-glow'; document.body.prepend(g); } }
  function createPageCoverBackground() {
    if (document.getElementById('ag-page-cover-bg')) return;
    const bg = document.createElement('div');
    bg.id = 'ag-page-cover-bg';
    bg.setAttribute('aria-hidden', 'true');
    document.body.prepend(bg);
  }
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
  function createGlowSmoother() {
    if (document.getElementById('ag-glow-smoother')) return;
    const smoother = document.createElement('div');
    smoother.id = 'ag-glow-smoother';
    document.body.prepend(smoother);
  }

  function createSearchOverlay() {
    if (document.getElementById('ag-centered-search')) return;
    const d = document.createElement('div'); d.id = 'ag-centered-search';
    d.innerHTML = `<div class="ag-ring"></div><div class="ag-pill-search">${svg(ICONS.search, { size: 18 })}<input class="ag-input" placeholder="Artists..."/></div><div id="ag-search-suggestions"></div>`;
    const inp = d.querySelector('input');
    inp.setAttribute('autocomplete', 'new-password');
    inp.setAttribute('autocorrect', 'off');
    inp.setAttribute('autocapitalize', 'off');
    inp.setAttribute('spellcheck', 'false');
    inp.setAttribute('aria-autocomplete', 'none');
    inp.setAttribute('data-form-type', 'other');
    inp.id = 'ag-input-' + Date.now();
    inp.name = 'ag-search-' + Date.now();
    setupSearchPlaceholderRotation(inp);
    setupSearchSuggestions(inp, d.querySelector('#ag-search-suggestions'));
    document.body.appendChild(d);
    applyLayout();
  }

  function focusAmbientSearch() {
    if (isFullscreen()) return false;
    createSearchOverlay();
    const search = document.getElementById('ag-centered-search');
    const input = search?.querySelector('input');
    if (!search || !input) return false;
    search.classList.add('ag-search-hotkey-focus');
    input.focus();
    input.select?.();
    setTimeout(() => search.classList.remove('ag-search-hotkey-focus'), 900);
    return true;
  }

  function setupAmbientSearchHotkey() {
    if (window.__agSearchHotkeyInstalled) return;
    window.__agSearchHotkeyInstalled = true;
    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key === ',') {
        openSettingsPanel();
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey || event.key?.toLowerCase?.() !== 'k') return;
      if (!focusAmbientSearch()) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);
  }

  function createUpNextCard() {
    if (document.getElementById('ag-up-next-card')) return;
    const card = document.createElement('button');
    card.id = 'ag-up-next-card';
    card.type = 'button';
    card.innerHTML = `
      <span class="ag-up-next-art"></span>
      <span class="ag-up-next-copy">
        <span class="ag-up-next-label">Up next</span>
        <span class="ag-up-next-title"></span>
        <span class="ag-up-next-subtitle"></span>
      </span>
    `;
    card.addEventListener('click', () => {
      const uri = card.dataset.uri;
      if (uri) safeNavigate(uri);
    });
    document.body.appendChild(card);
    positionUpNextCard();
  }

  function positionUpNextCard() {
    const card = document.getElementById('ag-up-next-card');
    const nowPlayingCandidates = [
      ...document.querySelectorAll('.main-nowPlayingBar-container, .main-nowPlayingBar-nowPlayingBar, .Root__now-playing-bar, .Root__now-playing-bar > *')
    ].map(el => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) =>
        rect.width >= 200 &&
        rect.height >= 10 &&
        rect.bottom >= window.innerHeight * 0.5
      )
      .sort((a, b) => b.rect.bottom - a.rect.bottom || b.rect.width - a.rect.width);
    const nowPlaying = nowPlayingCandidates[0]?.el || document.getElementById('ag-centered-search');
    if (!card || !nowPlaying) return;
    const rect = nowPlaying.getBoundingClientRect();
    if (!rect.width) return;
    const showBelow = rect.top < 130;
    const top = showBelow ? rect.bottom + 12 : rect.top - 12;
    card.style.left = `${rect.left + rect.width / 2}px`;
    card.style.top = `${top}px`;
    card.style.width = `${Math.min(Math.max(rect.width * 0.68, 300), 460)}px`;
    card.classList.toggle('ag-up-next-below', showBelow);
  }

  function getPlayerPositionMs() {
    try {
      if (typeof Spicetify.Player.getProgress === 'function') return Number(Spicetify.Player.getProgress()) || 0;
    } catch {}
    const data = Spicetify.Player?.data || {};
    const position = Number(data.position || data.progress || data.progressMs || 0);
    const since = Number(data.positionAsOfTimestamp || data.timestamp || 0);
    if (position && since) return position + Math.max(0, Date.now() - since);
    const progress = getDomPlaybackProgress();
    if (progress.positionMs > 0) return progress.positionMs;
    return position || 0;
  }

  function getPlayerDurationMs() {
    const item = Spicetify.Player?.data?.item || {};
    const metadata = item.metadata || {};
    const duration = Number(item.duration?.milliseconds || item.duration_ms || metadata.duration || metadata.duration_ms || 0);
    if (duration > 0) return duration;
    return getDomPlaybackProgress().durationMs;
  }

  function getDomPlaybackProgress() {
    const slider = document.querySelector(`
      [data-testid="playback-progressbar"] input[type="range"],
      [data-testid="playback-progressbar"] [role="slider"],
      .playback-progressbar input[type="range"],
      .playback-progressbar [role="slider"]
    `);
    if (!slider) return { positionMs: 0, durationMs: 0 };
    const current = Number(slider.value || slider.getAttribute('aria-valuenow') || 0);
    const max = Number(slider.max || slider.getAttribute('aria-valuemax') || 0);
    if (!(current >= 0) || !(max > 0)) return { positionMs: 0, durationMs: 0 };
    const unitScale = max <= 1000 ? 1000 : 1;
    return {
      positionMs: current * unitScale,
      durationMs: max * unitScale
    };
  }

  function normalizeSpotifyImageUrl(url) {
    const clean = String(url || '').trim();
    if (!clean) return '';
    if (clean.startsWith('spotify:image:')) return `https://i.scdn.co/image/${clean.split(':').pop()}`;
    return clean;
  }

  function firstImageUrl(...sources) {
    for (const source of sources) {
      if (!source) continue;
      if (typeof source === 'string') {
        const url = normalizeSpotifyImageUrl(source);
        if (url) return url;
      }
      if (Array.isArray(source)) {
        const url = firstImageUrl(...source);
        if (url) return url;
      }
      if (source?.url) return normalizeSpotifyImageUrl(source.url);
      if (source?.uri) return normalizeSpotifyImageUrl(source.uri);
      if (source?.sources) {
        const url = firstImageUrl(source.sources);
        if (url) return url;
      }
      if (source?.items) {
        const url = firstImageUrl(source.items);
        if (url) return url;
      }
    }
    return '';
  }

  function deepFindImageUrl(source, depth = 0, seen = new Set()) {
    if (!source || depth > 5 || seen.has(source)) return '';
    if (typeof source === 'string') {
      if (source.startsWith('spotify:image:') || source.includes('i.scdn.co/image/') || /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?|$)/i.test(source)) {
        return normalizeSpotifyImageUrl(source);
      }
      return '';
    }
    if (typeof source !== 'object') return '';
    seen.add(source);
    if (Array.isArray(source)) {
      for (const item of source) {
        const url = deepFindImageUrl(item, depth + 1, seen);
        if (url) return url;
      }
      return '';
    }
    if (source.url || source.uri) {
      const url = firstImageUrl(source.url, source.uri);
      if (url) return url;
    }
    if (source.file_id) return normalizeSpotifyImageUrl(`spotify:image:${source.file_id}`);
    const preferredKeys = ['image', 'images', 'coverArt', 'cover', 'cover_group', 'album', 'albumOfTrack', 'metadata', 'sources', 'items'];
    for (const key of preferredKeys) {
      const url = deepFindImageUrl(source[key], depth + 1, seen);
      if (url) return url;
    }
    for (const [key, value] of Object.entries(source)) {
      if (!/image|cover|album|art|metadata|source|item/i.test(key)) continue;
      const url = deepFindImageUrl(value, depth + 1, seen);
      if (url) return url;
    }
    return '';
  }

  function normalizeNextTrack(raw) {
    const item = raw?.track || raw?.item || raw?.contextTrack || raw?.data || raw;
    if (!item) return null;
    const metadata = item.metadata || {};
    const name = item.name || metadata.title || metadata.name || item.title;
    const artistItems = item.artists?.items || item.artists || item.albumOfTrack?.artists?.items || [];
    const artists = artistItems?.map?.(artist => artist?.name || artist?.profile?.name).filter(Boolean).join(', ') ||
                    metadata.artist_name ||
                    metadata.artistName ||
                    metadata.artists ||
                    item.subtitle ||
                    '';
    const image = firstImageUrl(
      item.album?.images,
      item.images,
      item.images?.items,
      item.coverArt,
      item.albumOfTrack?.coverArt,
      item.image_url,
      item.imageUrl,
      metadata.image_url,
      metadata.imageUrl,
      metadata.image_small_url,
      metadata.image_large_url,
      metadata.image_xlarge_url,
      metadata.album_image_url
    ) || deepFindImageUrl(raw) || deepFindImageUrl(item);
    const uri = item.uri || raw?.uri || metadata.uri || '';
    return name ? { name, artists, image, uri } : null;
  }

  function getCurrentTrackImage() {
    const data = Spicetify.Player?.data || Spicetify.Platform?.PlayerAPI?._state || {};
    const item = data.item || data.track || data.contextTrack || data.current || data;
    const apiImage = normalizeNextTrack(item)?.image || deepFindImageUrl(data) || '';
    if (apiImage) return apiImage;
    const domImage = Array.from(document.querySelectorAll(`
      .main-nowPlayingView-coverArt img,
      [data-testid="CoverSlotCollapsed--image"] img,
      [data-testid="cover-art-image"],
      img.cover-art-image,
      img.main-image-image,
      .cover-art img,
      [data-testid="entity-image"] img
    `)).map(img => img.currentSrc || img.src || '')
      .find(src => src && !src.startsWith('data:') && !src.includes('localfile'));
    return domImage || '';
  }

  let _lastSidebarCover = '';
  function updateSidebarCoverBackground() {
    createPageCoverBackground();
    const image = getCurrentTrackImage();
    if (image === _lastSidebarCover) {
      document.body?.classList.toggle('ag-sidebar-cover-active', !!image);
      return;
    }
    _lastSidebarCover = image;
    document.body?.classList.toggle('ag-sidebar-cover-active', !!image);
    if (image) {
      setStyleIfChanged(document.documentElement, '--ag-sidebar-cover', `url("${image.replace(/"/g, '\\"')}")`);
    } else {
      document.documentElement.style.removeProperty('--ag-sidebar-cover');
    }
  }

  async function hydrateNextTrackImage(track) {
    if (!track || track.image || !track.uri?.startsWith?.('spotify:track:')) return track;
    const id = track.uri.split(':').pop();
    try {
      const data = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/tracks/${id}`);
      return {
        ...track,
        image: firstImageUrl(data?.album?.images),
        artists: track.artists || (data?.artists || []).map(artist => artist.name).join(', ')
      };
    } catch {
      try {
        const data = await Spicetify.CosmosAsync.get(`sp://metadata/4/track/${id}`);
        return {
          ...track,
          image: firstImageUrl(
            data?.album?.cover_group?.image?.map?.(image => image.file_id ? `spotify:image:${image.file_id}` : ''),
            data?.album?.cover?.map?.(image => image.file_id ? `spotify:image:${image.file_id}` : '')
          ),
          artists: track.artists || (data?.artist || []).map(artist => artist.name).join(', ')
        };
      } catch {
        return track;
      }
    }
  }

  async function getNextTrackInfo() {
    const directSources = [
      Spicetify.Queue?.nextTracks?.[0],
      Spicetify.Queue?.queue?.nextTracks?.[0],
      Spicetify.Queue?.queue?.next_tracks?.[0],
      Spicetify.Player?.data?.nextItems?.[0],
      Spicetify.Player?.data?.queue?.nextTracks?.[0],
      Spicetify.Player?.data?.queue?.next_tracks?.[0],
      Spicetify.Platform?.PlayerAPI?._state?.nextTracks?.[0],
      Spicetify.Platform?.PlayerAPI?._state?.queue?.nextTracks?.[0]
    ];
    for (const source of directSources) {
      const normalized = normalizeNextTrack(source);
      if (normalized) return hydrateNextTrackImage(normalized);
    }

    try {
      const data = await Spicetify.CosmosAsync.get('sp://player/v2/main');
      const candidates = [
        data?.queue?.next_tracks?.[0],
        data?.queue?.nextTracks?.[0],
        data?.next_tracks?.[0],
        data?.nextTracks?.[0]
      ];
      for (const source of candidates) {
        const normalized = normalizeNextTrack(source);
        if (normalized) return hydrateNextTrackImage(normalized);
      }
    } catch {}
    return null;
  }

  let _upNextLastUri = '';
  let _upNextLastImage = '';
  let _upNextLastFetch = 0;
  let _upNextCached = null;
  async function updateUpNextCard() {
    const card = document.getElementById('ag-up-next-card');
    if (!card || document.hidden) return;

    const duration = getPlayerDurationMs();
    const position = getPlayerPositionMs();
    const remaining = duration - position;
    const shouldShow = duration > 0 && remaining > 0 && remaining <= 10000 && !isModalOpen() && !isFullscreen();
    if (!shouldShow) {
      if (card.classList.contains('ag-up-next-visible')) card.classList.remove('ag-up-next-visible');
      return;
    }

    if (Date.now() - _lastUpNextUpdate < 750) return;
    _lastUpNextUpdate = Date.now();
    const generation = _upNextGeneration;
    if (Date.now() - _upNextLastFetch > 5000) {
      if (_upNextRequest) return;
      _upNextLastFetch = Date.now();
      const request = getNextTrackInfo();
      _upNextRequest = request;
      try {
        const track = await request;
        if (generation !== _upNextGeneration) return;
        _upNextCached = track;
      } finally {
        if (_upNextRequest === request) _upNextRequest = null;
      }
    }
    const remainingNow = getPlayerDurationMs() - getPlayerPositionMs();
    if (generation !== _upNextGeneration || document.hidden || remainingNow <= 0 || remainingNow > 10000 ||
        isModalOpen() || isFullscreen()) return;
    const next = _upNextCached;
    if (!next) {
      if (card.classList.contains('ag-up-next-visible')) card.classList.remove('ag-up-next-visible');
      return;
    }

    const image = next.image || '';
    if (_upNextLastUri !== next.uri || _upNextLastImage !== image) {
      _upNextLastUri = next.uri;
      _upNextLastImage = image;
      card.querySelector('.ag-up-next-title').textContent = next.name;
      card.querySelector('.ag-up-next-subtitle').textContent = next.artists || 'Next track';
      card.dataset.uri = next.uri || '';
      const art = card.querySelector('.ag-up-next-art');
      art.style.backgroundImage = image ? `url("${image.replace(/"/g, '\\"')}")` : '';
      art.classList.toggle('ag-up-next-art-empty', !image);
    }
    positionUpNextCard();
    if (!card.classList.contains('ag-up-next-visible')) card.classList.add('ag-up-next-visible');
  }

  function setupSearchPlaceholderRotation(input) {
    if (!input || input.dataset.agPlaceholderRotation === 'true') return;
    input.dataset.agPlaceholderRotation = 'true';
    let labels = getCachedPersonalSearchPlaceholders();
    if (!labels.length) labels = ['Search...'];
    let index = 0;
    const apply = () => {
      if (document.activeElement === input && input.value.trim()) return;
      input.placeholder = labels[index % labels.length];
      index += 1;
    };
    apply();
    const rotate = () => {
      if (!input.isConnected) return;
      if (!document.hidden) apply();
      window.setTimeout(rotate, 1800);
    };
    window.setTimeout(rotate, 1800);
    const load = () => loadPersonalSearchPlaceholders().then(personalLabels => {
      if (personalLabels.length) {
        labels = personalLabels;
        index = 0;
        apply();
      }
    }).catch(() => {});
    load();
    let retryCount = 0;
    const retry = window.setInterval(() => {
      retryCount += 1;
      if ((labels.length > 1 && labels[0] !== 'Search...') || retryCount > 2) {
        window.clearInterval(retry);
        return;
      }
      load();
    }, 5000);
  }

  function getCachedPersonalSearchPlaceholders() {
    try {
      const cached = JSON.parse(localStorage.getItem('ag-personal-search-placeholders') || '[]');
      return Array.isArray(cached) ? cached.filter(Boolean).slice(0, 18) : [];
    } catch {
      return [];
    }
  }

  function rememberPersonalSearchPlaceholders(labels) {
    try {
      localStorage.setItem('ag-personal-search-placeholders', JSON.stringify(labels.slice(0, 18)));
      localStorage.setItem('ag-personal-search-placeholders-ts', String(Date.now()));
    } catch {}
  }

  function shuffleArray(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function loadPersonalSearchPlaceholders() {
    const cached = getCachedPersonalSearchPlaceholders();
    const cachedAt = Number(localStorage.getItem('ag-personal-search-placeholders-ts') || 0);
    const freshEnough = cached.length && cachedAt && Date.now() - cachedAt < 6 * 60 * 60 * 1000;
    if (freshEnough || window.__agPersonalSearchLoadInFlight) return cached;
    window.__agPersonalSearchLoadInFlight = true;
    const seen = new Set();
    const groups = { artists: [], tracks: [], albums: [], playlists: [] };
    const push = (group, name) => {
      const clean = String(name || '').trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      groups[group]?.push(`${clean}...`);
    };

    try {
      const [artists, tracks] = await Promise.all([
        Spicetify.CosmosAsync.get('https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=3'),
        Spicetify.CosmosAsync.get('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=6')
      ]);

      (artists?.items || []).slice(0, 3).forEach(item => push('artists', item.name));
      (tracks?.items || []).slice(0, 3).forEach(item => push('tracks', item.name));
      (tracks?.items || [])
        .map(item => item?.album?.name)
        .filter(Boolean)
        .slice(0, 3)
        .forEach(name => push('albums', name));
    } catch {}

    try {
      const recent = await Spicetify.CosmosAsync.get('https://api.spotify.com/v1/me/player/recently-played?limit=12');
      (recent?.items || []).slice(0, 6).forEach(entry => {
        const track = entry?.track;
        push('tracks', track?.name);
        push('artists', track?.artists?.[0]?.name);
        push('albums', track?.album?.name);
      });
    } catch {}

    try {
      const lib = await Spicetify.Platform.LibraryAPI.getContents({ limit: 300 });
      const items = lib?.items || [];
      items.filter(item => item?.uri?.includes(':artist:')).slice(0, 3).forEach(item => push('artists', item.name));
      items.filter(item => item?.uri?.includes(':album:')).slice(0, 3).forEach(item => push('albums', item.name));
      items.filter(item => item?.uri?.includes(':playlist:')).slice(0, 3).forEach(item => push('playlists', item.name));
    } catch {}

    collectVisibleSearchPlaceholders().forEach(item => push(item.group, item.name));

    const mixed = [];
    const shuffledGroups = shuffleArray(Object.values(groups).map(group => shuffleArray(group)));
    for (let round = 0; round < 3; round += 1) {
      shuffledGroups.forEach(group => {
        if (group[round]) mixed.push(group[round]);
      });
    }
    const labels = mixed.length ? shuffleArray(mixed).slice(0, 12) : getCachedPersonalSearchPlaceholders();
    if (labels.length) rememberPersonalSearchPlaceholders(labels);
    window.__agPersonalSearchLoadInFlight = false;
    return labels.length ? labels : cached;
  }

  function collectVisibleSearchPlaceholders() {
    const items = [];
    const add = (group, name) => {
      const clean = String(name || '').trim();
      if (!clean || clean.length < 2 || clean.length > 48) return;
      if (/^(music|podcasts|show all|search|ambientglass|date added)$/i.test(clean)) return;
      items.push({ group, name: clean });
    };
    document.querySelectorAll('.view-homeShortcutsGrid-shortcut, [data-testid="home-card"], [data-testid="card-click-handler"]').forEach(card => {
      const text = (card.textContent || '').split('\n').map(x => x.trim()).filter(Boolean)[0];
      add('playlists', text);
    });
    document.querySelectorAll('[data-testid="tracklist-row"], .main-trackList-trackListRow').forEach(row => {
      const lines = (row.textContent || '').split('\n').map(x => x.trim()).filter(Boolean);
      add('tracks', lines.find(line => !/^\d+$/.test(line)));
      if (lines[1]) add('artists', lines[1].replace(/^E\s+/, ''));
    });
    return items.slice(0, 12);
  }

  const LIBRARY_TYPES = {
    albums: { title: 'Albums', uriPart: ':album:', icon: ICONS.album },
    playlists: { title: 'Playlists', uriPart: ':playlist:', icon: ICONS.playlist },
    artists: { title: 'Artists', uriPart: ':artist:', icon: ICONS.artist }
  };
  let _libraryState = null;
  let _libraryTrigger = null;

  function createLibraryPanel() {
    if (document.getElementById('ag-lib-panel')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'ag-lib-panel-backdrop';
    backdrop.addEventListener('click', closeLibraryPanel);
    const panel = document.createElement('div');
    panel.id = 'ag-lib-panel';
    panel.inert = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'ag-lib-panel-title');
    panel.innerHTML = `
      <header id="ag-lib-panel-header">
        <div class="ag-lib-header-row">
          <h2 id="ag-lib-panel-title">Library</h2>
          <button id="ag-lib-panel-close" type="button" aria-label="Close library">${svg(ICONS.close, { size: 16 })}</button>
        </div>
        <div class="ag-lib-controls">
          <label class="ag-lib-search">${svg(ICONS.search, { size: 16 })}
            <input id="ag-lib-search-input" type="search" aria-label="Filter library" placeholder="Filter library" />
          </label>
          <select id="ag-lib-sort" aria-label="Sort library">
            <option value="recent">Recently added</option>
            <option value="az">Name A–Z</option>
          </select>
        </div>
      </header>
      <div id="ag-lib-panel-grid" aria-live="polite"></div>
    `;
    panel.querySelector('#ag-lib-panel-close').addEventListener('click', closeLibraryPanel);
    panel.querySelector('#ag-lib-search-input').addEventListener('input', renderLibraryGrid);
    panel.querySelector('#ag-lib-sort').addEventListener('change', renderLibraryGrid);
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeLibraryPanel();
      } else if (event.key === 'Tab') {
        const controls = panel.querySelectorAll('button, input, select');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    document.body.append(backdrop, panel);
  }

  function closeLibraryPanel() {
    const panel = document.getElementById('ag-lib-panel');
    if (!panel?.classList.contains('ag-panel-visible')) return;
    _libraryRequestId++;
    _libraryState = null;
    panel.classList.remove('ag-panel-visible');
    panel.inert = true;
    document.getElementById('ag-lib-panel-backdrop')?.classList.remove('ag-panel-visible');
    if (_libraryTrigger?.isConnected) _libraryTrigger.focus({ preventScroll: true });
    _libraryTrigger = null;
  }

  function setLibraryMessage(grid, text) {
    const message = document.createElement('p');
    message.className = 'ag-lib-empty';
    message.textContent = text;
    grid.replaceChildren(message);
  }

  async function openLibraryPanel(type) {
    const definition = LIBRARY_TYPES[type];
    const panel = document.getElementById('ag-lib-panel');
    if (!definition || !panel) return;
    const requestId = ++_libraryRequestId;
    _libraryState = null;
    if (!panel.classList.contains('ag-panel-visible')) _libraryTrigger = document.activeElement;
    panel.dataset.agLibraryType = type;
    panel.querySelector('#ag-lib-panel-title').textContent = definition.title;
    const filter = panel.querySelector('#ag-lib-search-input');
    filter.value = '';
    filter.placeholder = 'Filter ' + type;
    filter.setAttribute('aria-label', filter.placeholder);
    panel.querySelector('#ag-lib-sort').value = 'recent';
    const grid = panel.querySelector('#ag-lib-panel-grid');
    grid.scrollTop = 0;
    setLibraryMessage(grid, 'Loading your library…');
    panel.inert = false;
    panel.classList.add('ag-panel-visible');
    document.getElementById('ag-lib-panel-backdrop').classList.add('ag-panel-visible');
    filter.focus({ preventScroll: true });
    try {
      const response = await Spicetify.Platform.LibraryAPI.getContents({ limit: 400 });
      if (requestId !== _libraryRequestId) return;
      const items = Array.isArray(response?.items) ? response.items : [];
      _libraryState = {
        type,
        definition,
        items: items.filter(item => typeof item?.uri === 'string' && item.uri.includes(definition.uriPart))
      };
      renderLibraryGrid();
    } catch (error) {
      if (requestId !== _libraryRequestId) return;
      setLibraryMessage(grid, 'Could not load your library. Close this window and try again.');
      console.warn('[AmbientGlass] Library could not be loaded', error);
    }
  }

  function renderLibraryGrid() {
    if (!_libraryState) return;
    const { type, definition, items } = _libraryState;
    const grid = document.getElementById('ag-lib-panel-grid');
    const query = document.getElementById('ag-lib-search-input').value.trim().toLowerCase();
    const sort = document.getElementById('ag-lib-sort').value;
    const matches = items.filter(item => !query || String(item.name || '').toLowerCase().includes(query));
    if (sort === 'az') matches.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    if (!matches.length) {
      setLibraryMessage(grid, 'No ' + type + ' found.');
      return;
    }
    const cards = document.createDocumentFragment();
    for (const item of matches) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ag-lib-item';
      card.addEventListener('click', () => {
        closeLibraryPanel();
        safeNavigate(item.uri);
      });
      const cover = document.createElement('span');
      cover.className = 'ag-lib-item-cover';
      cover.setAttribute('aria-hidden', 'true');
      const url = normalizeSpotifyImageUrl(item.images?.[0]?.url || item.image?.url);
      const showPlaceholder = () => { cover.innerHTML = svg(definition.icon, { size: 24 }); };
      if (/^https:\/\//i.test(url)) {
        const image = document.createElement('img');
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.src = url;
        image.addEventListener('error', showPlaceholder, { once: true });
        cover.appendChild(image);
      } else showPlaceholder();
      const name = document.createElement('span');
      name.className = 'ag-lib-item-name';
      name.textContent = item.name || 'Untitled';
      card.title = name.textContent;
      card.append(cover, name);
      cards.appendChild(card);
    }
    grid.replaceChildren(cards);
  }

  let _artistBanner = null;

  function bindArtistBanner(path) {
    let layer = null;
    if (/^\/artist\//.test(path) && document.querySelector('[data-testid="artist-page"]')) {
      const main = document.querySelector('.Root__main-view');
      const viewport = main?.querySelector('[data-overlayscrollbars-viewport], .os-viewport');
      const image = main?.querySelector('[data-testid="background-image"]') ||
        document.querySelector('[data-testid="background-image"]');
      // Older Spotify layouts already put their banner inside the scrolling viewport.
      if (viewport && image && !viewport.contains(image)) layer = image.parentElement;
    }
    if (_artistBanner !== layer) {
      _artistBanner?.removeAttribute('data-ag-scroll-banner');
      _artistBanner?.style.removeProperty('--ag-banner-offset');
      _artistBanner = layer;
      _artistBanner?.setAttribute('data-ag-scroll-banner', '');
    }
    moveArtistBanner();
  }

  function moveArtistBanner() {
    if (!_artistBanner?.isConnected) return;
    setStyleIfChanged(_artistBanner, '--ag-banner-offset', -Math.round(_lastScrollY) + 'px');
  }

  let _lastScrollY = 0;
  function handleScroll(event) {
    const target = event.target;
    if (!target?.closest?.('.Root__main-view')) return;
    if (target.closest('.main-contextMenu-menu, [role="menu"], #ag-lib-panel, #ag-settings-panel')) return;
    if (!Number.isFinite(target.scrollTop)) return;
    _lastScrollY = Math.max(0, target.scrollTop);
    queueVisibilityUpdate();
  }

  function triggerStartupAnimation() {
    if (document.getElementById('ag-startup-splash')) return;
    if (sessionStorage.getItem('ag-skip-startup-once') === 'marketplace-tab') {
      sessionStorage.removeItem('ag-skip-startup-once');
      triggerEntrance();
      return;
    }
    const s = document.createElement('div'); s.id = 'ag-startup-splash';
    const l = `<svg viewBox="0 0 24 24" width="80" height="80" fill="#1DB954"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.305c-.218.358-.684.474-1.042.256-2.848-1.74-6.433-2.133-10.655-1.17-.41.094-.813-.164-.906-.574-.094-.41.163-.813.573-.906 4.622-1.057 8.583-.605 11.774 1.345.358.218.474.685.256 1.043zm1.468-3.26c-.275.446-.86.59-1.306.314-3.258-2-8.226-2.583-12.08-1.413-.502.152-1.03-.134-1.182-.636-.152-.503.134-1.03.636-1.182 4.4-1.335 9.876-.683 13.618 1.618.447.275.59.86.314 1.306zm.128-3.41c-3.905-2.32-10.334-2.533-14.075-1.398-.6.182-1.24-.163-1.422-.763-.182-.6.163-1.24.763-1.422 4.29-1.302 11.393-1.04 15.894 1.63.54.32.715 1.014.395 1.554-.32.54-1.014.715-1.555.395z"/></svg>`;
    s.innerHTML = `
      <style>
        #ag-startup-splash { position: fixed; inset: 0; background: #040408 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 99999; transition: opacity 1s; }
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
      <div style="position: absolute; bottom: 20px; left: 20px; color: #fff; font-size: 10px; letter-spacing: 1px;">${THEME_VERSION}</div>
    `;
    document.body.appendChild(s);

    setTimeout(() => s.classList.add('fade-out'), 2500);
    setTimeout(() => {
      s.remove();
      triggerEntrance();
      markDockDirty();
      enqueueRuntime('dock', 'visibility');
    }, 3000);
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
    const path = Spicetify.Platform?.History?.location?.pathname || '';
    if (!path.includes('/artist/')) return;

    const artistId = path.split('/').pop();
    const artistUri = `spotify:artist:${artistId}`;
    const header = document.querySelector('.main-entityHeader-headerText');
    if (!header || document.querySelector('.ag-healed-image')) return;

    if (_artistImageCache.has(artistId)) {
      injectHealedImage(header, _artistImageCache.get(artistId));
      return;
    }

    try {
      // 2. In der Library nachschauen (da sind die "echten" Bilder)
      const library = await Spicetify.Platform.LibraryAPI.getContents({ limit: 500 });
      const savedArtist = library.items?.find(i => i.uri === artistUri);

      let imgUrl = savedArtist?.images?.[0]?.url || savedArtist?.image?.url;

      // Artist pages use AmbientGlass' own profile image, not Spotify's banner art.
      if (!imgUrl) {
        const data = await Spicetify.CosmosAsync.get(`hm://artist/v1/artist/${artistId}/desktop`);
        imgUrl = data.visuals?.avatar?.sources?.[0]?.url ||
          data.visuals?.avatarImage?.sources?.[0]?.url ||
          data.avatar?.sources?.[0]?.url ||
          data.profile?.avatar?.sources?.[0]?.url ||
          '';
      }

      if (imgUrl) {
        _artistImageCache.set(artistId, imgUrl);
        injectHealedImage(header, imgUrl);
      }
    } catch {}
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
    const ids = ['ag-notify-hitbox', 'ag-friends-hitbox', 'ag-market-hitbox', 'ag-stats-hitbox'];
    const isBlocking = document.getElementById('ag-startup-splash') || document.getElementById('ag-settings-panel');
    ids.forEach(id => {
      const h = document.getElementById(id);
      if (h) h.style.opacity = isBlocking ? '0' : '1';
    });
    if (isBlocking) return;

    positionNativeLeftDock();
    document.querySelectorAll('.ag-dock-hitbox').forEach(button => button.remove());
    const dock = document.getElementById('ag-side-dock');
    if (dock) {
      dock.classList.remove('ag-dock-open');
      setStyleIfChanged(dock, 'display', 'none', 'important');
      setStyleIfChanged(dock, 'pointer-events', 'none', 'important');
    }
  }

  function findNativeLeftRailButtons() {
    const badText = /back|forward|zur.ck|vorw.rts|previous|next/i;
    return Array.from(document.querySelectorAll('button, a'))
      .map(el => ({
        el,
        rect: el.getBoundingClientRect(),
        label: `${el.getAttribute('aria-label') || ''} ${el.title || ''} ${el.textContent || ''}`
      }))
      .filter(x => x.rect.width >= 24 &&
                   x.rect.width <= 68 &&
                   x.rect.height >= 24 &&
                   x.rect.height <= 68 &&
                   x.rect.left < 140 &&
                   x.rect.top > 24 &&
                   x.rect.top < 380 &&
                   !badText.test(x.label) &&
                   !x.el.classList.contains('ag-dock-hitbox') &&
                   !String(x.el.id || '').startsWith('ag-') &&
                   !x.el.closest('.Root__main-view, .Root__now-playing-bar, .main-connectBar-connectBar, .Root__right-sidebar, [data-testid="queue-page"], [class*="Queue"], [class*="queue"]'))
      .sort((a, b) => a.rect.top - b.rect.top)
      .map(x => x.el);
  }

  function positionNativeLeftDock() {
    const layout = getLayout();
    const signature = [layout.dock.x, layout.dock.y, window.innerWidth, window.innerHeight].join('|');
    if (!_dockButtonsDirty && signature === _nativeDockSignature &&
        _nativeDockButtons.every(button => button.isConnected)) return;
    const startX = clamp(layout.dock?.x ?? DEFAULT_LAYOUT.dock.x, 8, 72);
    const startY = clamp(layout.dock?.y ?? DEFAULT_LAYOUT.dock.y, 40, 96);
    const profile = findNativeProfileButton();
    const market = document.getElementById('marketplace-extension-button') ||
                   document.querySelector('button[aria-label*="Marketplace"]:not(.ag-native-dock-proxy), button[title*="Marketplace"]:not(.ag-native-dock-proxy)');
    const stats = document.getElementById('stats-extension-button') ||
                  document.querySelector('.stats-button') ||
                  document.querySelector('button[aria-label*="Stat"], button[title*="Stat"]');
    const friends = document.querySelector('.Root__globalNav [data-restore-focus-key="buddy_feed"]');
    const notify = document.querySelector('.Root__globalNav .main-actionButtons-button:not([data-restore-focus-key="buddy_feed"])');
    const rail = findNativeLeftRailButtons().filter(button => !button.matches('[data-testid="user-widget-link"], .main-userWidget-box') && !button.querySelector('.main-userWidget-box'));
    const used = new Set([profile, market, stats, friends, notify].filter(Boolean));
    const smallRail = rail.filter(button => !used.has(button) && !button.querySelector?.('img')).slice(0, 2);
    smallRail.forEach(button => used.add(button));
    const extensionRail = rail
      .filter(button => !used.has(button) && !button.querySelector?.('img'))
      .slice(0, 8)
      .map((button, index) => ({ key: `ext-${index}`, button }));
    const entries = [
      { key: 'profile', button: profile },
      { key: 'settings', button: ensureSettingsDockButton() },
      { key: 'notify', button: notify || smallRail[0] },
      { key: 'friends', button: friends || smallRail[1] },
      { key: 'market', button: market ? ensureNativeDockProxy('market', market, svg(ICONS.cart, { size: 18 })) : null },
      { key: 'stats', button: stats ? ensureNativeDockProxy('stats', stats, svg(ICONS.stats, { size: 18 })) : null },
      ...extensionRail
    ].filter(entry => entry.button?.isConnected);

    document.querySelectorAll('.ag-native-dock-button').forEach(button => {
      if (!entries.some(entry => entry.button === button)) cleanupNativeDockButton(button);
    });

    entries.forEach((entry, index) => styleNativeDockButton(entry.button, entry.key, startX, startY + index * 52));
    if (!document.body.classList.contains('ag-dock-ready')) document.body.classList.add('ag-dock-ready');
    _nativeDockSignature = signature;
    _nativeDockButtons = entries.map(entry => entry.button);
    _dockButtonsDirty = false;
  }

  function ensureNativeDockProxy(key, original, html) {
    original.dataset.agDockSource = key;
    const id = `ag-native-${key}-proxy`;
    let proxy = document.getElementById(id);
    if (!proxy) {
      proxy = document.createElement('button');
      proxy.id = id;
      proxy.type = 'button';
      proxy.className = 'ag-native-dock-proxy';
      proxy.setAttribute('aria-label', key === 'market' ? 'Marketplace' : 'Statistics');
      proxy.title = proxy.getAttribute('aria-label');
      proxy.innerHTML = html;
      proxy.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const fresh = key === 'market'
          ? (document.getElementById('marketplace-extension-button') || document.querySelector('button[aria-label*="Marketplace"]:not(.ag-native-dock-proxy), button[title*="Marketplace"]:not(.ag-native-dock-proxy)'))
          : (document.getElementById('stats-extension-button') || document.querySelector('.stats-button') || document.querySelector('button[aria-label*="Stat"], button[title*="Stat"]'));
        (fresh || original)?.click?.();
      });
      document.body.appendChild(proxy);
    } else if (proxy.parentElement !== document.body) {
      document.body.appendChild(proxy);
    }
    return proxy;
  }

  function ensureSettingsDockButton() {
    let button = document.getElementById('ag-native-settings-button');
    if (!button) {
      button = document.createElement('button');
      button.id = 'ag-native-settings-button';
      button.type = 'button';
      button.className = 'ag-native-dock-proxy';
      button.setAttribute('aria-label', 'AmbientGlass Settings');
      button.title = 'AmbientGlass Settings';
      button.innerHTML = svg(ICONS.settings, { size: 18 });
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openSettingsPanel();
      });
      document.body.appendChild(button);
    } else if (button.parentElement !== document.body) {
      document.body.appendChild(button);
    }
    return button;
  }

  function styleNativeDockButton(button, key, left, top) {
    const safeKey = String(key).replace(/[^a-z0-9_-]/gi, '-');
    button.classList.add('ag-native-dock-button', `ag-native-dock-${safeKey}`);
    button.dataset.agDockKey = key;
    // Preserve disabled state managed by Spotify.
    setStyleIfChanged(button, 'position', 'fixed', 'important');
    setStyleIfChanged(button, 'left', `${left}px`, 'important');
    setStyleIfChanged(button, 'top', `${top}px`, 'important');
    setStyleIfChanged(button, 'right', 'auto', 'important');
    setStyleIfChanged(button, 'bottom', 'auto', 'important');
    setStyleIfChanged(button, 'width', '44px', 'important');
    setStyleIfChanged(button, 'height', '44px', 'important');
    setStyleIfChanged(button, 'min-width', '44px', 'important');
    setStyleIfChanged(button, 'min-height', '44px', 'important');
    setStyleIfChanged(button, 'max-width', '44px', 'important');
    setStyleIfChanged(button, 'max-height', '44px', 'important');
    setStyleIfChanged(button, 'margin', '0', 'important');
    setStyleIfChanged(button, 'padding', '0', 'important');
    setStyleIfChanged(button, 'display', 'flex', 'important');
    setStyleIfChanged(button, 'align-items', 'center', 'important');
    setStyleIfChanged(button, 'justify-content', 'center', 'important');
    setStyleIfChanged(button, 'cursor', 'pointer', 'important');
    if (key === 'profile') {
      setStyleIfChanged(button, 'opacity', '1', 'important');
      setStyleIfChanged(button, 'visibility', 'visible', 'important');
      setStyleIfChanged(button, 'pointer-events', 'auto', 'important');
      setStyleIfChanged(button, 'transform', 'none', 'important');
    } else {
      button.style.removeProperty('opacity');
      button.style.removeProperty('visibility');
      button.style.removeProperty('pointer-events');
      button.style.removeProperty('transform');
    }
    setStyleIfChanged(button, 'z-index', '2147483647', 'important');
    setStyleIfChanged(button, '-webkit-app-region', 'no-drag', 'important');
    if (!button.dataset.agNativeDockHoverBound) {
      button.dataset.agNativeDockHoverBound = 'true';
      button.addEventListener('pointerenter', () => setDockOpen(true));
      button.addEventListener('pointerleave', () => setDockOpen(false));
      button.addEventListener('focusin', () => setDockOpen(true));
      button.addEventListener('focusout', () => setDockOpen(false));
    }
  }

  function cleanupNativeDockButton(button) {
    button.className = String(button.className || '').split(/\s+/).filter(cls => cls && cls !== 'ag-native-dock-button' && !cls.startsWith('ag-native-dock-')).join(' ');
    delete button.dataset.agDockKey;
    for (const property of ['position', 'left', 'top', 'right', 'bottom', 'width', 'height',
      'min-width', 'min-height', 'max-width', 'max-height', 'margin', 'padding', 'display',
      'align-items', 'justify-content', 'cursor', 'opacity', 'visibility', 'pointer-events',
      'transform', 'z-index', '-webkit-app-region']) button.style.removeProperty(property);
  }

  function ensureDockContainer(layout = getLayout()) {
    let dock = document.getElementById('ag-side-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'ag-side-dock';
      document.body.appendChild(dock);
    } else if (dock.parentElement !== document.body) {
      document.body.appendChild(dock);
    }
    positionDockContainer(dock, layout);
    return dock;
  }

  function positionDockContainer(dock, layout = getLayout()) {
    if (!dock) return;
    const profile = findNativeProfileButton();
    const rect = profile?.getBoundingClientRect?.();
    const dockX = rect?.width ? rect.left : clamp(layout.dock.x || DEFAULT_LAYOUT.dock.x, 8, 90);
    const dockY = rect?.height ? rect.bottom + 8 : clamp(layout.dock.y || DEFAULT_LAYOUT.dock.y, 38, 72);
    setStyleIfChanged(dock, '--ag-dock-x', `${dockX}px`);
    setStyleIfChanged(dock, '--ag-dock-y', `${dockY}px`);
    dock.style.left = `${dockX}px`;
    dock.style.top = `${dockY}px`;
  }

  function setDockOpen(open) {
    const dock = document.getElementById('ag-side-dock');
    window.clearTimeout(window._agNativeDockCloseTimer);
    if (dock) window.clearTimeout(dock._agCloseTimer);
    if (open) {
      document.body?.classList.add('ag-native-dock-open');
      dock?.classList.add('ag-dock-open');
    } else {
      window._agNativeDockCloseTimer = window.setTimeout(() => document.body?.classList.remove('ag-native-dock-open'), 180);
      if (dock) dock._agCloseTimer = window.setTimeout(() => dock.classList.remove('ag-dock-open'), 180);
    }
  }



  function getDockButtons(force = false) {
    if (!force && !_dockButtonsDirty && _dockButtonsCache.length && _dockButtonsCache.every(entry => entry?.original?.isConnected)) {
      return _dockButtonsCache;
    }
    const badText = /back|forward|zur.ck|vorw.rts|previous|next/i;
    const rail = Array.from(document.querySelectorAll('button, a'))
      .map(el => ({ el, rect: el.getBoundingClientRect(), label: `${el.getAttribute('aria-label') || ''} ${el.title || ''} ${el.textContent || ''}` }))
      .filter(x => x.rect.width >= 28 && x.rect.width <= 58 &&
                   x.rect.height >= 28 && x.rect.height <= 58 &&
                   x.rect.left < 120 &&
                   x.rect.top > 34 &&
                   x.rect.top < 285 &&
                   !badText.test(x.label) &&
                   !x.el.classList.contains('ag-dock-hitbox') &&
                   !String(x.el.id || '').startsWith('ag-') &&
                   !x.el.closest('.Root__main-view, .Root__now-playing-bar, .main-connectBar-connectBar, .Root__right-sidebar, [data-testid="queue-page"], [class*="Queue"], [class*="queue"]'))
      .sort((a, b) => a.rect.top - b.rect.top)
      .slice(0, 3)
      .map((x, i) => ({ key: ['notify', 'friends', 'profile'][i], original: x.el, html: dockButtonHtml(x.el, i) }));

    const profileButton = findNativeProfileButton();
    const visibleRail = rail.filter(entry => entry.original !== profileButton && !entry.original.querySelector?.('img'));

    const seen = new Set(visibleRail.map(x => x.original));
    const add = (key, original, html) => {
      if (!original || seen.has(original)) return;
      seen.add(original);
      visibleRail.push({ key, original, html });
    };
    add('market', document.getElementById('marketplace-extension-button') || document.querySelector('button[aria-label*="Marketplace"], button[title*="Marketplace"]'), svg(ICONS.cart, { size: 18 }));
    add('stats', document.getElementById('stats-extension-button') || document.querySelector('.stats-button') || document.querySelector('button[aria-label*="Stat"], button[title*="Stat"]'), svg(ICONS.stats, { size: 18 }));
    _dockButtonsCache = visibleRail;
    _dockButtonsDirty = false;
    return _dockButtonsCache;
  }

  function dockButtonHtml(original, index) {
    const img = original?.querySelector?.('img');
    if (img?.src) return `<img src="${img.src}" alt="">`;
    const svgEl = original?.querySelector?.('svg');
    if (svgEl) return svgEl.outerHTML;
    if (index === 1) return svg(ICONS.artist, { size: 18 });
    if (index === 2) return '<span style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.2);display:block"></span>';
    return original?.innerHTML || svg(ICONS.stats, { size: 18 });
  }

  function createOrUpdateDockButton(entry, layout, index) {
    if (!entry?.original) return;
    const dock = ensureDockContainer(layout);
    const id = `ag-${entry.key}-hitbox`;
    let h = document.getElementById(id);
    if (!h) {
      h = document.createElement('button');
      h.id = id;
      h.type = 'button';
      h.className = 'ag-dock-hitbox';
      h.addEventListener('click', event => {
        if (entry.key === 'profile') return;
        event.preventDefault();
        event.stopPropagation();
        const freshEntry = getDockButtons(true).find(item => item.key === entry.key) || entry;
        const target = entry.key === 'profile'
          ? (findNativeProfileButton() || freshEntry.original || entry.original)
          : (freshEntry.original?.isConnected ? freshEntry.original : entry.original);
        const rect = h.getBoundingClientRect();
        const targetRect = target?.getBoundingClientRect?.();
        const eventX = targetRect?.width ? targetRect.left + targetRect.width / 2 : rect.left + rect.width / 2;
        const eventY = targetRect?.height ? targetRect.top + targetRect.height / 2 : rect.top + rect.height / 2;
        const restore = [];
        if (entry.key === 'profile' && target?.style) {
          ['pointer-events', 'visibility', 'opacity', 'z-index', '-webkit-app-region'].forEach(prop => {
            restore.push([prop, target.style.getPropertyValue(prop), target.style.getPropertyPriority(prop)]);
          });
          setStyleIfChanged(target, 'pointer-events', 'auto', 'important');
          setStyleIfChanged(target, 'visibility', 'visible', 'important');
          setStyleIfChanged(target, 'opacity', '0.01', 'important');
          setStyleIfChanged(target, 'z-index', '2147483647', 'important');
          setStyleIfChanged(target, '-webkit-app-region', 'no-drag', 'important');
          setStyleIfChanged(h, 'pointer-events', 'none', 'important');
        }
        const eventInit = {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: eventX,
          clientY: eventY,
          screenX: Math.round(window.screenX + eventX),
          screenY: Math.round(window.screenY + eventY),
          button: 0,
          buttons: 1,
          composed: true,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true
        };
        try { target?.focus?.({ preventScroll: true }); } catch {}
        const realHit = entry.key === 'profile' ? document.elementFromPoint(eventX, eventY) : null;
        const dispatchTarget = realHit?.closest?.('button, a') || target;
        ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => {
          const Evt = type.startsWith('pointer') && typeof PointerEvent !== 'undefined' ? PointerEvent : MouseEvent;
          dispatchTarget?.dispatchEvent(new Evt(type, eventInit));
        });
        if (entry.key === 'profile') {
          ['keydown', 'keyup'].forEach(type => {
            dispatchTarget?.dispatchEvent(new KeyboardEvent(type, {
              bubbles: true,
              cancelable: true,
              key: 'Enter',
              code: 'Enter',
              composed: true
            }));
          });
        }
        if (typeof dispatchTarget?.click === 'function') dispatchTarget.click();
        if (restore.length) {
          window.setTimeout(() => {
            restore.forEach(([prop, value, priority]) => {
              if (value) setStyleIfChanged(target, prop, value, priority);
              else target.style.removeProperty(prop);
            });
            setStyleIfChanged(h, 'pointer-events', 'auto', 'important');
          }, 260);
        }
      });
      dock.appendChild(h);
    } else if (h.parentElement !== dock) {
      dock.appendChild(h);
    }
    h.innerHTML = entry.html || '';
    h.classList.remove('ag-profile-spacer');
    h.style.pointerEvents = 'auto';
    h.style.display = '';
    h.style.left = 'auto';
    h.style.top = 'auto';
    h.style.order = String(index);
    if (entry.key !== 'profile') {
      setStyleIfChanged(entry.original, 'opacity', '0', 'important');
      setStyleIfChanged(entry.original, 'pointer-events', 'none', 'important');
      setStyleIfChanged(entry.original, 'visibility', 'hidden', 'important');
    }
  }

  function findNativeProfileButton() {
    const userBox = document.querySelector('[data-testid="user-widget-link"], .main-userWidget-box');
    const direct = userBox?.closest?.('button, a');
    if (direct?.isConnected) return direct;
    const labeled = Array.from(document.querySelectorAll('button, a')).find(el => {
      const label = `${el.getAttribute('aria-label') || ''} ${el.title || ''}`.toLowerCase();
      const rect = el.getBoundingClientRect();
      return rect.left < 150 && rect.top > 28 && rect.top < 330 && (label.includes('profile') || label.includes('konto') || label.includes('account'));
    });
    if (labeled) return labeled;
    const candidates = Array.from(document.querySelectorAll('button, a'))
      .map(el => ({ el, rect: el.getBoundingClientRect(), html: el.innerHTML || '' }))
      .filter(x => x.rect.width >= 28 &&
                   x.rect.width <= 58 &&
                   x.rect.height >= 28 &&
                   x.rect.height <= 58 &&
                   x.rect.left < 130 &&
                   x.rect.top > 34 &&
                   x.rect.top < 320 &&
                   !x.el.classList.contains('ag-dock-hitbox') &&
                   !String(x.el.id || '').startsWith('ag-') &&
                   !!x.el.querySelector('img') &&
                   !x.el.closest('.Root__main-view, .Root__now-playing-bar, .main-connectBar-connectBar, .Root__right-sidebar, [data-testid="queue-page"], [class*="Queue"], [class*="queue"]'));
    return candidates.sort((a, b) => b.rect.top - a.rect.top)[0]?.el || null;
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

        /* Hide stale native elements after rebuilding this block. */
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
      if ((text.includes('You Liked') || text.includes('Gef\u00e4llt dir')) &&
          !text.includes('Artist pick') && !text.includes('Auswahl des K\u00fcnstlers')) {

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

        // Manual text extraction for maximum stability.
        let songsCount = "";
        let releasesCount = "";
        let artistName = "";

        node.querySelectorAll('span, div, a').forEach(el => {
          const t = el.innerText.trim();
          if (!t || t.includes('You Liked') || t.includes('Gef\u00e4llt dir')) return;
          if (t.toLowerCase().includes('song')) songsCount = t;
          else if (t.toLowerCase().includes('release')) releasesCount = t;
          else if (t.length > 1 && !t.includes('\u2022')) artistName = t;
        });

        const line1 = document.createElement('div');
        line1.className = 'ag-yl-text-line1';
        line1.innerText = `${songsCount}${songsCount && releasesCount ? ' - ' : ''}${releasesCount}`;

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

  const FULLSCREEN_VIEW = [
    '.npv-main-container', '[data-testid="lyrics-container"]',
    '[data-testid="lyrics-fullscreen-cinema"]', '.lyrics-lyricsContainer-LyricsContainer',
    '[data-testid="lyrics-button"][aria-pressed="true"]',
    '[data-testid="fullscreen-mode-button"][aria-pressed="true"]',
    'button[aria-label*="exit full screen" i]', 'button[aria-label*="exit fullscreen" i]',
    'button[aria-label*="vollbild beenden" i]'
  ].join(', ');
  const fullscreenDisplay = window.matchMedia('(display-mode: fullscreen)');

  function isFullscreen() {
    const path = Spicetify.Platform.History.location?.pathname || '';
    return !!(document.fullscreenElement || document.webkitFullscreenElement ||
      fullscreenDisplay.matches || window.fullScreen === true ||
      /^\/(?:lyrics|queue|preferences|fullscreen)(?:\/|$)/.test(path) ||
      document.querySelector(FULLSCREEN_VIEW));
  }

  let _isModalOpenCached = false;
  let _lastModalCheckTime = 0;
  function isModalOpen() {
    const now = Date.now();
    if (now - _lastModalCheckTime < 250) {
      return _isModalOpenCached;
    }
    _lastModalCheckTime = now;
    const isVisible = el => {
      if (!el) return false;
      // Use offsetWidth and offsetHeight to avoid getComputedStyle layout recalculation triggers
      return el.offsetWidth > 0 && el.offsetHeight > 0;
    };
    _isModalOpenCached = !!(
      Array.from(document.querySelectorAll('[data-testid="dialog"]')).some(isVisible) ||
      Array.from(document.querySelectorAll('[class*="GenericModal"]')).some(isVisible) ||
      Array.from(document.querySelectorAll('[class*="modal-overlay"]')).some(isVisible) ||
      Array.from(document.querySelectorAll('.main-embedWidgetGenerator-container')).some(isVisible) ||
      Array.from(document.querySelectorAll('[class*="Backdrop"]')).some(isVisible) ||
      document.getElementById('ag-settings-panel') ||
      document.getElementById('ag-onboarding') ||
      document.getElementById('ag-layout-overlay')
    );
    return _isModalOpenCached;
  }

  function updateVisibility() {
    const search = document.getElementById('ag-centered-search');
    const cluster = document.getElementById('ag-home-cluster');
    if (!search || !cluster) return;
    const layout = _layoutDraft || getLayout();

    if (_layoutEditMode) {
      applyLayout(layout);
      setStyleIfChanged(search, 'opacity', '1');
      setStyleIfChanged(search, 'visibility', 'visible');
      setStyleIfChanged(search, 'pointer-events', 'auto');
      setStyleIfChanged(cluster, 'opacity', '1');
      setStyleIfChanged(cluster, 'visibility', 'visible');
      setStyleIfChanged(cluster, 'pointer-events', 'auto');
      if (!_layoutDragging) scheduleLayoutEditorFrame(false);
      return;
    }

    applyLayout(layout);

    const path = Spicetify.Platform.History.location?.pathname || '';
    const isSearchPage = path.startsWith('/search/');
    const isNarrow = window.innerWidth < 750;
    const isExtensionPage = path.includes('marketplace') ||
                            path.includes('stats') ||
                            path.includes('statistics') ||
                            !!document.querySelector('.marketplace-header') ||
                            !!document.querySelector('.stats-header');
    const isFull = isFullscreen();
    document.body?.classList.toggle('ag-fullscreen-active', isFull);
    if (isFull && search.contains(document.activeElement)) document.activeElement.blur();
    document.body?.classList.toggle('ag-extension-page', isExtensionPage);
    const isModal = isModalOpen();
    const shouldHide = !_layoutEditMode && (isFull || isNarrow || isModal);
    const suppressSearch = shouldHide || isExtensionPage;
    const y = getMainScrollY();
    const searchFadeDistance = isSearchPage ? 220 : 150;
    const o = suppressSearch ? 0 : Math.max(0, 1 - y / searchFadeDistance);
    const hidden = suppressSearch || y > searchFadeDistance || o < 0.05;
    const pinHomeTop = shouldHide || isSearchPage || isExtensionPage || y > 12;
    const visibilitySignature = [
      shouldHide ? 1 : 0,
      pinHomeTop ? 1 : 0,
      Math.round(o * 100),
      Math.min(Math.round(y * 0.18), 80),
      path, layout.search.x, layout.search.y, layout.homeCluster.x, layout.homeCluster.y
    ].join('|');
    if (visibilitySignature === _lastVisibilitySignature) return;
    _lastVisibilitySignature = visibilitySignature;

    if (shouldHide) {
      setStyleIfChanged(search, 'opacity', '0');
      setStyleIfChanged(search, 'visibility', 'hidden');
      setStyleIfChanged(search, 'pointer-events', 'none');
      setStyleIfChanged(cluster, 'opacity', '0');
      setStyleIfChanged(cluster, 'visibility', 'hidden');
      setStyleIfChanged(cluster, 'pointer-events', 'none');
      setStyleIfChanged(cluster, 'left', '50%', 'important');
      setStyleIfChanged(cluster, 'top', '60px', 'important');
      setStyleIfChanged(cluster, 'right', 'auto', 'important');
      setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
      setStyleIfChanged(cluster, 'width', '340px', 'important');
      setStyleIfChanged(cluster, 'height', '92px', 'important');
      setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
    } else {
      setStyleIfChanged(search, 'opacity', String(o));
      setStyleIfChanged(search, 'visibility', hidden ? 'hidden' : 'visible');
      setStyleIfChanged(search, 'pointer-events', hidden || o < 0.1 ? 'none' : 'auto');
      setStyleIfChanged(search, 'left', `clamp(calc(var(--ag-search-width) / 2 + 8px), ${layoutLeft(layout.search.x)}, calc(var(--ag-layout-viewport, 100vw) - var(--ag-search-width) / 2 - 8px))`);
      setStyleIfChanged(search, 'top', `${layout.search.y}%`);
      setStyleIfChanged(search, 'transform', `translate(-50%, -50%) translateY(-${Math.min(y * 0.18, 80)}px) scale(1)`);
      setStyleIfChanged(cluster, 'opacity', '1');
      setStyleIfChanged(cluster, 'visibility', 'visible');
      setStyleIfChanged(cluster, 'pointer-events', 'auto');
      if (pinHomeTop) {
        setStyleIfChanged(cluster, 'left', layoutLeft(50), 'important');
        setStyleIfChanged(cluster, 'top', isExtensionPage ? '32px' : isSearchPage ? '48px' : '60px', 'important');
        setStyleIfChanged(cluster, 'right', 'auto', 'important');
        setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
        setStyleIfChanged(cluster, 'width', '340px', 'important');
        setStyleIfChanged(cluster, 'height', '92px', 'important');
        setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
      } else {
        setStyleIfChanged(cluster, 'left', layoutLeft(layout.homeCluster.x), 'important');
        setStyleIfChanged(cluster, 'top', `${layout.homeCluster.y}%`, 'important');
        setStyleIfChanged(cluster, 'right', 'auto', 'important');
        setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
        setStyleIfChanged(cluster, 'width', '340px', 'important');
        setStyleIfChanged(cluster, 'height', '92px', 'important');
        setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
      }
    }
  }
  let _searchSuggestionItems = [];
  let _searchSuggestionLoaded = false;
  let _searchSuggestionActiveIndex = -1;
  let _searchSuggestionRequestId = 0;
  let _searchPageRequestId = 0;
  const _searchSuggestionCache = new Map();

  function normalizeSpotifySearchItems(section, type) {
    return (section?.items || [])
      .filter(item => item?.name && item?.uri)
      .map(item => ({
        name: item.name,
        uri: item.uri,
        type,
        image: item.images?.[0]?.url || item.album?.images?.[0]?.url || ''
      }));
  }

  function normalizeLooseSearchItems(items, fallbackType = 'item') {
    return (items || []).map(raw => {
      const item = raw?.data || raw?.item || raw;
      const uri = item?.uri || item?.id || raw?.uri;
      const name = item?.name || item?.title || item?.profile?.name || item?.albumOfTrack?.name;
      const type = item?.type || raw?.type || fallbackType;
      const image = item?.images?.items?.[0]?.sources?.[0]?.url ||
                    item?.visuals?.avatarImage?.sources?.[0]?.url ||
                    item?.coverArt?.sources?.[0]?.url ||
                    item?.albumOfTrack?.coverArt?.sources?.[0]?.url ||
                    item?.images?.[0]?.url ||
                    item?.album?.images?.[0]?.url ||
                    '';
      return name && uri ? { name, uri, type, image } : null;
    }).filter(Boolean);
  }

  async function searchSpotifySuggestions(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    if (_searchSuggestionCache.has(normalized)) return _searchSuggestionCache.get(normalized);

    try {
      const endpoint = 'https://api.spotify.com/v1/search?' + new URLSearchParams({
        q: query.trim(),
        type: 'artist,album,playlist,track',
        limit: '4'
      }).toString();
      const data = await Spicetify.CosmosAsync.get(endpoint);
      const results = [
        ...normalizeSpotifySearchItems(data?.artists, 'artist'),
        ...normalizeSpotifySearchItems(data?.albums, 'album'),
        ...normalizeSpotifySearchItems(data?.tracks, 'track'),
        ...normalizeSpotifySearchItems(data?.playlists, 'playlist')
      ].slice(0, 8);
      if (results.length) {
        _searchSuggestionCache.set(normalized, results);
        return results;
      }
    } catch {}

    try {
      const data = await Spicetify.CosmosAsync.get('sp://core-search/v1/search?' + new URLSearchParams({
        query: query.trim(),
        type: 'artist,album,playlist,track',
        limit: '6'
      }).toString());
      const results = [
        ...normalizeLooseSearchItems(data?.artists?.items || data?.artists, 'artist'),
        ...normalizeLooseSearchItems(data?.albums?.items || data?.albums, 'album'),
        ...normalizeLooseSearchItems(data?.tracks?.items || data?.tracks, 'track'),
        ...normalizeLooseSearchItems(data?.playlists?.items || data?.playlists, 'playlist'),
        ...normalizeLooseSearchItems(data?.topResults?.items || data?.topResults, 'result')
      ].slice(0, 8);
      _searchSuggestionCache.set(normalized, results);
      return results;
    } catch {}

    _searchSuggestionCache.set(normalized, []);
    return [];
  }

  async function loadSearchSuggestionItems() {
    if (_searchSuggestionLoaded) return _searchSuggestionItems;
    _searchSuggestionLoaded = true;
    try {
      const lib = await Spicetify.Platform.LibraryAPI.getContents({ limit: 600 });
      _searchSuggestionItems = (lib.items || [])
        .filter(item => item?.name && item?.uri)
        .map(item => ({
          name: item.name,
          uri: item.uri,
          type: item.uri.split(':')[1] || 'item',
          image: item.images?.[0]?.url || item.image?.url || ''
        }));
    } catch {
      _searchSuggestionItems = [];
    }
    return _searchSuggestionItems;
  }

  function setupSearchSuggestions(input, panel) {
    if (!input || !panel) return;

    const close = () => {
      panel.classList.remove('ag-search-suggestions-visible');
      panel.replaceChildren();
      _searchSuggestionActiveIndex = -1;
    };

    const clearInputAfterSearch = () => {
      window.setTimeout(() => {
        input.value = '';
        close();
      }, 80);
    };

    const navigateQuery = () => {
      const query = input.value.trim();
      if (!query) return;
      close();
      safeNavigate('/search/' + encodeURIComponent(query));
      clearInputAfterSearch();
    };

    const setActive = index => {
      const buttons = Array.from(panel.querySelectorAll('.ag-search-suggestion'));
      _searchSuggestionActiveIndex = buttons.length ? clamp(index, 0, buttons.length - 1) : -1;
      buttons.forEach((button, i) => button.classList.toggle('ag-search-suggestion-active', i === _searchSuggestionActiveIndex));
    };

    const render = async () => {
      const query = input.value.trim().toLowerCase();
      if (query.length < 1) {
        close();
        return;
      }

      const requestId = ++_searchSuggestionRequestId;
      const spotifyMatches = await searchSpotifySuggestions(input.value.trim());
      if (requestId !== _searchSuggestionRequestId) return;
      const localItems = await loadSearchSuggestionItems();
      if (requestId !== _searchSuggestionRequestId) return;
      const seenUris = new Set(spotifyMatches.map(item => item.uri));
      const localMatches = localItems
        .filter(item => !seenUris.has(item.uri) && item.name.toLowerCase().includes(query))
        .sort((a, b) => {
          const an = a.name.toLowerCase();
          const bn = b.name.toLowerCase();
          const aStarts = an.startsWith(query) ? 0 : 1;
          const bStarts = bn.startsWith(query) ? 0 : 1;
          return aStarts - bStarts || an.localeCompare(bn);
        });
      const matches = [...spotifyMatches, ...localMatches].slice(0, 6);

      panel.replaceChildren();

      const searchButton = document.createElement('button');
      searchButton.type = 'button';
      searchButton.className = 'ag-search-suggestion ag-search-suggestion-query';
      searchButton.innerHTML = svg(ICONS.search, { size: 16 });
      const searchText = document.createElement('span');
      searchText.textContent = `Search "${input.value.trim()}"`;
      searchButton.appendChild(searchText);
      searchButton.addEventListener('mousedown', event => event.preventDefault());
      searchButton.addEventListener('click', navigateQuery);
      panel.appendChild(searchButton);

      matches.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ag-search-suggestion';
        button.addEventListener('mousedown', event => event.preventDefault());
        button.addEventListener('click', () => {
          close();
          safeNavigate(item.uri);
          clearInputAfterSearch();
        });

        const art = document.createElement('span');
        art.className = 'ag-search-suggestion-art';
        if (item.image) {
          art.style.backgroundImage = `url("${item.image.replace(/"/g, '\\"')}")`;
          const img = document.createElement('img');
          img.src = item.image;
          img.alt = '';
          img.loading = 'lazy';
          art.appendChild(img);
        }

        const copy = document.createElement('span');
        copy.className = 'ag-search-suggestion-copy';

        const title = document.createElement('span');
        title.className = 'ag-search-suggestion-title';
        title.textContent = item.name;

        const type = document.createElement('span');
        type.className = 'ag-search-suggestion-type';
        type.textContent = item.type;

        copy.append(title, type);
        button.append(art, copy);
        panel.appendChild(button);
      });

      panel.classList.add('ag-search-suggestions-visible');
      setActive(0);
    };

    let debounce = 0;
    input.addEventListener('input', () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(render, 80);
    });
    input.addEventListener('focus', render);
    input.addEventListener('blur', () => window.setTimeout(close, 120));
    input.addEventListener('keydown', event => {
      const buttons = Array.from(panel.querySelectorAll('.ag-search-suggestion'));
      if (event.key === 'Escape') {
        close();
        input.blur();
        return;
      }
      if (event.key === 'ArrowDown' && buttons.length) {
        event.preventDefault();
        setActive(_searchSuggestionActiveIndex + 1);
        return;
      }
      if (event.key === 'ArrowUp' && buttons.length) {
        event.preventDefault();
        setActive(_searchSuggestionActiveIndex - 1);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const active = buttons[_searchSuggestionActiveIndex];
        if (active && panel.classList.contains('ag-search-suggestions-visible')) active.click();
        else navigateQuery();
      }
    });
  }

  function getSearchPageQuery() {
    const path = Spicetify.Platform?.History?.location?.pathname || '';
    if (!path.startsWith('/search/')) return '';
    return decodeURIComponent(path.replace(/^\/search\/?/, '').split('/')[0] || '').trim();
  }

  function findMainContentRoot() {
    return document.querySelector('.main-view-container__scroll-node-child') ||
           document.querySelector('.Root__main-view main') ||
           document.querySelector('.Root__main-view');
  }

  function updateSearchPageVisualCenter() {
    const shell = document.getElementById('ag-search-page-redesign');
    if (!shell) {
      document.documentElement.style.removeProperty('--ag-search-page-shift');
      return;
    }
    const rect = shell.getBoundingClientRect();
    if (!rect.width) return;
    const viewportCenter = window.innerWidth / 2;
    const shellCenter = rect.left + rect.width / 2;
    const shift = clamp(viewportCenter - shellCenter, -160, 160);
    setStyleIfChanged(document.documentElement, '--ag-search-page-shift', `${shift}px`);
  }

  function createSearchPageCard(item) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'ag-search-page-card';
    card.addEventListener('click', () => safeNavigate(item.uri));

    const art = document.createElement('span');
    art.className = 'ag-search-page-card-art';
    if (item.image) {
      art.style.backgroundImage = `url("${item.image.replace(/"/g, '\\"')}")`;
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.loading = 'lazy';
      art.appendChild(img);
    }

    const copy = document.createElement('span');
    copy.className = 'ag-search-page-card-copy';

    const title = document.createElement('span');
    title.className = 'ag-search-page-card-title';
    title.textContent = item.name;

    const type = document.createElement('span');
    type.className = 'ag-search-page-card-type';
    type.textContent = item.type;

    copy.append(title, type);
    card.append(art, copy);
    return card;
  }

  async function updateSearchPageRedesign() {
    const query = getSearchPageQuery();
    const existing = document.getElementById('ag-search-page-redesign');
    if (!query) {
      existing?.remove();
      document.body?.classList.remove('ag-search-page');
      return;
    }

    const root = findMainContentRoot();
    if (!root) return;
    document.body?.classList.add('ag-search-page');

    let shell = existing;
    if (!shell) {
      shell = document.createElement('section');
      shell.id = 'ag-search-page-redesign';
      root.prepend(shell);
    } else if (shell.parentElement !== root) {
      root.prepend(shell);
    }
    requestAnimationFrame(updateSearchPageVisualCenter);

    const requestId = ++_searchPageRequestId;
    shell.replaceChildren();

    const hero = document.createElement('div');
    hero.className = 'ag-search-page-hero';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'ag-search-page-eyebrow';
    eyebrow.textContent = 'AmbientGlass Search';

    const title = document.createElement('h1');
    title.textContent = query;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Top matches, albums, artists and playlists blended into the glass view.';

    const cards = document.createElement('div');
    cards.className = 'ag-search-page-cards';
    const loading = document.createElement('div');
    loading.className = 'ag-search-page-loading';
    loading.textContent = 'Finding covers...';
    cards.appendChild(loading);

    hero.append(eyebrow, title, subtitle, cards);
    shell.appendChild(hero);
    requestAnimationFrame(updateSearchPageVisualCenter);

    const results = await searchSpotifySuggestions(query);
    if (requestId !== _searchPageRequestId || !document.body?.classList.contains('ag-search-page')) return;

    cards.replaceChildren();
    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'ag-search-page-loading';
      empty.textContent = 'No preview results found yet.';
      cards.appendChild(empty);
      return;
    }

    results.slice(0, 8).forEach(item => cards.appendChild(createSearchPageCard(item)));
  }









  // Settings.
  function ensureLayoutEditorStyle() {
    if (document.getElementById('ag-layout-editor-style')) return;
    const style = document.createElement('style');
    style.id = 'ag-layout-editor-style';
    style.textContent = `
      #ag-layout-overlay { position: fixed; inset: 0; z-index: 99998; pointer-events: none; background: rgba(0,0,0,0.16); }
      #ag-layout-toolbar { position: fixed; top: 56px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 8px; background: rgba(10, 8, 22, 0.9); border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 12px 40px rgba(0,0,0,0.45); backdrop-filter: blur(20px); pointer-events: auto; }
      #ag-layout-toolbar button { min-height: 32px; padding: 0 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); color: #fff; background: rgba(255,255,255,0.08); font-weight: 700; }
      #ag-layout-save { background: var(--ag-accent-main, #7b5fdb) !important; }
      .ag-layout-handle { position: fixed; z-index: 99999; display: flex; align-items: center; justify-content: center; min-width: 96px; height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); color: #fff; background: rgba(123,95,219,0.78); box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-size: 12px; font-weight: 800; cursor: grab; pointer-events: auto; user-select: none; }
      .ag-layout-handle:active { cursor: grabbing; }
      .ag-layout-ghost {
        position: fixed;
        z-index: 99997;
        pointer-events: auto;
        cursor: grab;
        border: 1px dashed rgba(255,255,255,0.32);
        border-radius: 12px;
        background: rgba(123,95,219,0.08);
        box-shadow: inset 0 0 0 1px rgba(123,95,219,0.16), 0 8px 24px rgba(0,0,0,0.18);
      }
      .ag-layout-ghost:active { cursor: grabbing; }
      body.ag-layout-dragging .ag-layout-handle,
      body.ag-layout-dragging .ag-layout-ghost {
        transition: none !important;
      }
      body.ag-layout-dragging #ag-home-cluster,
      body.ag-layout-dragging #ag-centered-search,
      body.ag-layout-dragging .Root__now-playing-bar,
      body.ag-layout-dragging .Root__right-sidebar,
      body.ag-layout-dragging #ag-jam-floating-pill {
        transition: none !important;
      }
      .ag-layout-ghost::after {
        content: attr(data-label);
        position: absolute;
        top: -28px;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(123,95,219,0.78);
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
      }
      body.ag-layout-editing #ag-jam-floating-pill { opacity: 1 !important; visibility: visible !important; pointer-events: none !important; }
    `;
    document.head.appendChild(style);
  }

  function layoutTargets() {
    return [
      { key: 'dock', label: 'Dock', el: document.getElementById('ag-notify-hitbox') || document.getElementById('ag-profile-hitbox') || document.querySelector('.main-userWidget-box'), unit: 'px' },
      { key: 'homeCluster', label: 'Home Cluster', el: document.getElementById('ag-home-cluster'), unit: '%' },
      { key: 'search', label: 'Searchbar', el: document.getElementById('ag-centered-search'), unit: '%' },
      { key: 'nowPlaying', label: 'Now Playing', el: document.querySelector('.Root__now-playing-bar'), unit: '%' }
    ].filter(t => t.el);
  }

  function positionLayoutHandles() {
    const overlay = document.getElementById('ag-layout-overlay');
    if (!overlay) return;
    const draft = _layoutDraft || getLayout();
    layoutTargets().forEach(target => {
      const handle = overlay.querySelector(`[data-layout-target="${target.key}"]`);
      if (!handle) return;
      let x;
      let y;
      if (_layoutEditMode && draft[target.key]) {
        if (target.unit === 'px') {
          x = draft[target.key].x + (target.el.offsetWidth || 44) / 2;
          y = draft[target.key].y;
        } else {
          x = (draft[target.key].x / 100) * window.innerWidth;
          y = (draft[target.key].y / 100) * window.innerHeight - 38;
        }
      } else {
        const rect = target.el.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top - 38;
      }
      handle.style.left = clampPx(x - handle.offsetWidth / 2, handle.offsetWidth, window.innerWidth) + 'px';
      handle.style.top = clampPx(y, handle.offsetHeight, window.innerHeight, 64) + 'px';
    });
    positionLayoutPreviews();
  }

  function positionLayoutPreviews() {
    if (!_layoutEditMode || !_layoutDraft) return;
    layoutTargets().forEach(target => {
      let ghost = document.querySelector(`.ag-layout-ghost[data-layout-target="${target.key}"]`);
      if (!ghost) return;
      const realRect = target.el.getBoundingClientRect();
      let left;
      let top;
      let width = Math.max(44, realRect.width);
      let height = Math.max(34, realRect.height);
      if (target.key === 'dock') {
        width = 44;
        height = 44 * 5 + 12 * 4;
        left = _layoutDraft.dock.x;
        top = _layoutDraft.dock.y;
      } else if (target.key === 'homeCluster') {
        width = Math.min(120, Math.max(52, realRect.width || 52));
        height = Math.min(72, Math.max(52, realRect.height || 52));
        left = (_layoutDraft.homeCluster.x / 100) * window.innerWidth - width / 2;
        top = (_layoutDraft.homeCluster.y / 100) * window.innerHeight - height / 2;
      } else if (target.key === 'search') {
        width = Math.min(760, Math.max(360, realRect.width || 560));
        height = Math.min(72, Math.max(46, realRect.height || 46));
        left = (_layoutDraft.search.x / 100) * window.innerWidth - width / 2;
        top = (_layoutDraft.search.y / 100) * window.innerHeight - height / 2;
      } else if (target.key === 'nowPlaying') {
        width = Math.min(760, window.innerWidth * 0.58);
        height = Math.min(86, Math.max(66, realRect.height || 66));
        left = (_layoutDraft.nowPlaying.x / 100) * window.innerWidth - width / 2;
        top = (_layoutDraft.nowPlaying.y / 100) * window.innerHeight - height / 2;
      }
      ghost.style.left = clampPx(left, width, window.innerWidth) + 'px';
      ghost.style.top = clampPx(top, height, window.innerHeight, 64) + 'px';
      ghost.style.width = width + 'px';
      ghost.style.height = height + 'px';
    });
    const jamPreview = document.getElementById('ag-jam-floating-pill');
    if (jamPreview) {
      setStyleIfChanged(jamPreview, 'left', `${_layoutDraft.nowPlaying.x}%`, 'important');
      setStyleIfChanged(jamPreview, 'top', `calc(${_layoutDraft.nowPlaying.y}% - 52px)`, 'important');
      setStyleIfChanged(jamPreview, 'bottom', 'auto', 'important');
      setStyleIfChanged(jamPreview, 'transform', 'translate(-50%, -50%)', 'important');
    }
    getDockButtons().forEach((entry, index) => createOrUpdateDockButton(entry, _layoutDraft, index));
  }

  function scheduleLayoutEditorFrame(applyReal = true) {
    if (_layoutFrame) return;
    _layoutFrame = requestAnimationFrame(() => {
      _layoutFrame = 0;
      if (!_layoutEditMode || !_layoutDraft) return;
      if (applyReal) applyLayout(_layoutDraft);
      positionLayoutHandles();
    });
  }

  function startLayoutEditor() {
    if (document.getElementById('ag-layout-overlay')) return;
    ensureLayoutEditorStyle();
    _layoutEditMode = true;
    _layoutDraft = getLayout();
    document.body.classList.add('ag-layout-editing');

    const overlay = document.createElement('div');
    overlay.id = 'ag-layout-overlay';
    overlay.innerHTML = `<div id="ag-layout-toolbar"><button id="ag-layout-save">Save</button><button id="ag-layout-reset">Reset</button><button id="ag-layout-cancel">Cancel</button></div>`;
    document.body.appendChild(overlay);

    let jamPreview = document.getElementById('ag-jam-floating-pill');
    if (!jamPreview) {
      jamPreview = document.createElement('div');
      jamPreview.id = 'ag-jam-floating-pill';
      document.body.appendChild(jamPreview);
    }
    jamPreview.dataset.agPreview = 'true';
    jamPreview.textContent = "Jam pill";
    setStyleIfChanged(jamPreview, 'display', 'inline-flex', 'important');
    jamPreview.classList.remove('ag-jam-hidden');
    positionLayoutPreviews();

    layoutTargets().forEach(target => {
      const ghost = document.createElement('div');
      ghost.className = 'ag-layout-ghost';
      ghost.dataset.layoutTarget = target.key;
      ghost.dataset.label = target.label;
      overlay.appendChild(ghost);

      const handle = document.createElement('div');
      handle.className = 'ag-layout-handle';
      handle.dataset.layoutTarget = target.key;
      handle.textContent = target.label;
      overlay.appendChild(handle);
      const beginDrag = event => {
        event.preventDefault();
        const dragEl = event.currentTarget;
        dragEl.setPointerCapture(event.pointerId);
        _layoutDragging = true;
        document.body.classList.add('ag-layout-dragging');
        const startX = event.clientX;
        const startY = event.clientY;
        const start = cloneLayout(_layoutDraft);
        const move = ev => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (target.unit === 'px') {
            const width = target.key === 'dock' ? 44 : (target.el.offsetWidth || 44);
            const height = target.key === 'dock' ? (44 * 5 + 12 * 4) : (target.el.offsetHeight || 44);
            _layoutDraft[target.key].x = clampPx(snapPxCenter(start[target.key].x + dx, width, window.innerWidth), width, window.innerWidth);
            _layoutDraft[target.key].y = clampPx(snapPxCenter(start[target.key].y + dy, height, window.innerHeight), height, window.innerHeight);
          } else {
            _layoutDraft[target.key].x = snapPercent(clamp(start[target.key].x + (dx / window.innerWidth) * 100, 0, 100));
            _layoutDraft[target.key].y = snapPercent(clamp(start[target.key].y + (dy / window.innerHeight) * 100, 0, 100));
          }
          if (target.key === 'homeCluster') _lastScrollY = 0;
          scheduleLayoutEditorFrame(true);
        };
        const up = () => {
          _layoutDragging = false;
          document.body.classList.remove('ag-layout-dragging');
          scheduleLayoutEditorFrame(true);
          dragEl.removeEventListener('pointermove', move);
          dragEl.removeEventListener('pointerup', up);
          dragEl.removeEventListener('pointercancel', up);
        };
        dragEl.addEventListener('pointermove', move);
        dragEl.addEventListener('pointerup', up);
        dragEl.addEventListener('pointercancel', up);
      };
      handle.addEventListener('pointerdown', beginDrag);
      ghost.addEventListener('pointerdown', beginDrag);
    });

    overlay.querySelector('#ag-layout-save').addEventListener('click', () => {
      saveLayout(_layoutDraft);
      applyLayout(_layoutDraft);
      stopLayoutEditor();
      Spicetify.showNotification("AmbientGlass: Layout saved");
    });
    overlay.querySelector('#ag-layout-reset').addEventListener('click', () => {
      _layoutDraft = cloneLayout(DEFAULT_LAYOUT);
      localStorage.removeItem('ag-layout');
      positionLayoutHandles();
    });
    overlay.querySelector('#ag-layout-cancel').addEventListener('click', stopLayoutEditor);
    window.addEventListener('resize', positionLayoutHandles);
    setTimeout(positionLayoutHandles, 50);
  }

  function stopLayoutEditor() {
    const previewJam = document.querySelector('#ag-jam-floating-pill[data-ag-preview="true"]');
    previewJam?.remove();
    if (_layoutFrame) {
      cancelAnimationFrame(_layoutFrame);
      _layoutFrame = 0;
    }
    document.getElementById('ag-layout-overlay')?.remove();
    document.body.classList.remove('ag-layout-editing');
    document.body.classList.remove('ag-layout-dragging');
    _layoutEditMode = false;
    _layoutDragging = false;
    _layoutDraft = null;
    applyLayout(getLayout());
    updateVisibility();
    enqueueRuntime('jam');
    window.removeEventListener('resize', positionLayoutHandles);
  }

  const DEFAULTS = {
    "glow": "#19c4e6",
    "s1": "#ff00dd",
    "s2": "#190e6c",
    "accent": "#362a5a",
    "home": "#1db954",
    "liked": "#ff4b4b",
    "albums": "#4b9eff",
    "playlists": "#b34bff",
    "artists": "#ffcc4b",
    "btn_bg": "rgba(20, 18, 38, 0.65)",
    "btn_icon": "#f0f0ff",
    "blobs": "#2c1556",
    "now_mode": "transparent",
    "now_gradient_enabled": "false",
    "now_color": "#2d2069",
    "now_color_2": "#5b3d7a",
    "now_gradient_angle": "135",
    "now_gradient_position": "57",
    "now_gradient_blend": "36",
    "now_brightness": "20",
    "now_frost": "100",
    "now_width": "840",
    "now_height": "70",
    "now_radius": "36",
    "cover_spin": "false",
    "sidebar_song_bg": "false",
    "sidebar_bg_strength": "0",
    "page_song_bg": "false",
    "glow_opacity": "0.8",
    "glow_size": "110",
    "blobs_opacity": "1",
    "glass_reflection": "false",
    "glass_blur": "0",
    "performance_mode": "false"
  };

  function getSetting(key) {
    const saved = localStorage.getItem('ag-setting-' + key);
    if (saved !== null) return saved;
    return DEFAULTS[key];
  }

  function getNumericSetting(key, fallback, min = -Infinity, max = Infinity) {
    const value = Number(getSetting(key));
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback));
  }

  function isNowGradientEnabled() {
    if (getSetting('now_mode') === 'transparent' || getSetting('now_mode') === 'frosted') return false;
    const saved = localStorage.getItem('ag-setting-now_gradient_enabled');
    if (saved !== null) return saved === 'true';
    return getSetting('now_mode') === 'gradient';
  }

  function isPerformanceMode() {
    return getSetting('performance_mode') === 'true';
  }

  function stripCloneIds(root) {
    root.querySelectorAll?.('[id]').forEach(el => el.removeAttribute('id'));
  }

  function updateNowPlayingPreviewClone() {
    if (!document.body?.classList.contains('ag-now-preview')) return;
    const source = document.querySelector('.Root__now-playing-bar');
    if (!source) return;
    let preview = document.getElementById('ag-now-playing-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'ag-now-playing-preview';
      preview.setAttribute('aria-hidden', 'true');
      document.body.appendChild(preview);
    }
    const clone = source.cloneNode(true);
    stripCloneIds(clone);
    clone.classList.add('ag-now-preview-clone');
    preview.replaceChildren(clone);
  }

  function setNowPlayingPreview(enabled) {
    document.body?.classList.toggle('ag-now-preview', !!enabled);
    if (enabled) {
      updateNowPlayingPreviewClone();
      setTimeout(updateNowPlayingPreviewClone, 80);
    } else {
      document.getElementById('ag-now-playing-preview')?.remove();
    }
  }

  // A dedicated introduction revision also reaches users of older releases.
  // Keep this revision unchanged for patches that do not need another tour.
  const ONBOARDING_VERSION = '2.0.0';
  const ONBOARDING_SEEN_KEY = 'ag-onboarding-seen-version';
  let _onboardingSeen = false;
  const ONBOARDING_SLIDES = [
    {
      kicker: 'Start',
      title: 'Welcome to AmbientGlass 2.0.0',
      text: 'A lighter glass layer for Spotify with floating controls, quick access, and a performance mode for weaker PCs.'
    },
    {
      kicker: 'Home Cluster',
      title: 'Fast navigation',
      text: 'Hover the home button to open Liked Songs, Albums, Playlists, and Artists without digging through Spotify menus.'
    },
    {
      kicker: 'Search',
      title: 'Ambient Search',
      text: 'Use the centered search bar or Ctrl+K to jump into search. The floating layout can be moved from Settings.'
    },
    {
      kicker: 'Performance',
      title: 'Keep it smooth',
      text: 'Performance Mode reduces heavy blur, shadows, hover effects, and background polling when a system needs more headroom.'
    },
    {
      kicker: 'Profile Dock',
      title: 'Settings and addons',
      text: 'Hover your profile picture to reveal the AmbientGlass dock. The first button below it opens Settings; Marketplace, Listening Stats, and other installed addons sit below.'
    }
  ];

  function hasSeenOnboarding() {
    if (_onboardingSeen) return true;
    try {
      return localStorage.getItem(ONBOARDING_SEEN_KEY) === ONBOARDING_VERSION;
    } catch {
      return false;
    }
  }

  function markOnboardingSeen() {
    _onboardingSeen = true;
    try {
      localStorage.setItem(ONBOARDING_SEEN_KEY, ONBOARDING_VERSION);
    } catch (error) {
      console.warn('[AmbientGlass] Could not remember introduction completion', error);
    }
  }

  function showOnboarding(force = false) {
    if (!force && hasSeenOnboarding()) return;
    const existing = document.getElementById('ag-onboarding');
    if (existing) {
      existing.querySelector('.ag-onboarding-next')?.focus();
      return;
    }
    const previousFocus = document.activeElement;

    let index = 0;
    const overlay = document.createElement('div');
    overlay.id = 'ag-onboarding';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ag-onboarding-title');

    overlay.innerHTML = `
      <div class="ag-onboarding-backdrop"></div>
      <div class="ag-onboarding-card">
        <div class="ag-onboarding-topline">
          <span class="ag-onboarding-kicker"></span>
          <button class="ag-onboarding-close" type="button" aria-label="Close introduction">${svg(ICONS.close, {size:16})}</button>
        </div>
        <h2 id="ag-onboarding-title"></h2>
        <p class="ag-onboarding-copy"></p>
        <div class="ag-onboarding-dots" aria-label="Introduction progress"></div>
        <div class="ag-onboarding-actions">
          <button class="ag-onboarding-skip" type="button">Skip</button>
          <button class="ag-onboarding-next" type="button">Next</button>
        </div>
      </div>
    `;

    const close = (seen = true) => {
      if (seen) markOnboardingSeen();
      overlay.remove();
      document.body?.classList.remove('ag-onboarding-open');
      document.removeEventListener('keydown', onKeydown, true);
      if (previousFocus?.isConnected) previousFocus.focus?.();
    };

    const render = () => {
      const slide = ONBOARDING_SLIDES[index];
      overlay.querySelector('.ag-onboarding-kicker').textContent = slide.kicker;
      overlay.querySelector('#ag-onboarding-title').textContent = slide.title;
      overlay.querySelector('.ag-onboarding-copy').textContent = slide.text;
      overlay.querySelector('.ag-onboarding-next').textContent = index === ONBOARDING_SLIDES.length - 1 ? 'Got it' : 'Next';
      overlay.querySelector('.ag-onboarding-dots').innerHTML = ONBOARDING_SLIDES.map((_, i) => (
        `<button type="button" class="${i === index ? 'active' : ''}" aria-label="Go to introduction step ${i + 1}"></button>`
      )).join('');
      overlay.querySelectorAll('.ag-onboarding-dots button').forEach((button, i) => {
        button.addEventListener('click', () => {
          index = i;
          render();
        });
      });
    };

    const onKeydown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      if (event.key === 'Tab') {
        const buttons = [...overlay.querySelectorAll('button:not([disabled])')];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (!overlay.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (index < ONBOARDING_SLIDES.length - 1) {
          index += 1;
          render();
        } else {
          close(true);
        }
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        index -= 1;
        render();
      }
    };

    overlay.querySelector('.ag-onboarding-close')?.addEventListener('click', () => close(true));
    overlay.querySelector('.ag-onboarding-skip')?.addEventListener('click', () => close(true));
    overlay.querySelector('.ag-onboarding-next')?.addEventListener('click', () => {
      if (index < ONBOARDING_SLIDES.length - 1) {
        index += 1;
        render();
      } else {
        close(true);
      }
    });
    overlay.addEventListener('pointerdown', event => {
      if (event.target === overlay.querySelector('.ag-onboarding-backdrop')) close(true);
    });

    document.body?.appendChild(overlay);
    document.body?.classList.add('ag-onboarding-open');
    document.addEventListener('keydown', onKeydown, true);
    render();
    setTimeout(() => overlay.querySelector('.ag-onboarding-next')?.focus(), 30);
  }

  function openSettingsPanel() {
    if (document.getElementById('ag-settings-panel')) return;
    const d = document.createElement('div'); d.id = 'ag-settings-panel';

    document.body?.classList.add('ag-settings-open');
    const tip = text => `<button class="ag-setting-help" type="button" aria-label="${text}" title="${text}">?</button>`;

    d.innerHTML = `
      <div class="ag-settings-wrapper">
        <div class="ag-settings-content">
          <div class="ag-settings-header">
            <h3 id="ag-settings-title">AmbientGlass settings</h3>
            <button id="ag-settings-close" type="button" aria-label="Close settings">${svg(ICONS.close, {size:16})}</button>
          </div>

          <div class="ag-settings-tabs">
            <button class="ag-tab-btn active" data-tab="general">General</button>
            <button class="ag-tab-btn" data-tab="cluster">Cluster</button>
            <button class="ag-tab-btn" data-tab="search">Search</button>
            <button class="ag-tab-btn" data-tab="layout">Layout</button>
            <button class="ag-tab-btn" data-tab="ui">UI & Accent</button>
          </div>

            <div class="ag-settings-body">
              <div class="ag-tab-content active" id="tab-general">
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Hero Glow Color</label>${tip('Main ambient glow color used across the home view and glass tint.')}</span><input type="color" id="ag-col-glow" value="${getSetting('glow')}"/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Hero Glow Intensity</label>${tip('Controls how visible the large background glow is.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-glow_opacity" min="0" max="1" step="0.05" value="${getSetting('glow_opacity')}"/><span id="ag-glow-opacity-value">${Math.round(Number(getSetting('glow_opacity')) * 100)}%</span></div></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Hero Glow Size</label>${tip('Changes how wide and tall the main background glow spreads.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-glow_size" min="60" max="220" step="5" value="${getSetting('glow_size')}"/><span id="ag-glow-size-value">${getSetting('glow_size')}%</span></div></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Background Glow Color</label>${tip('Color used by the soft background glow.')}</span><input type="color" id="ag-col-blobs" value="${getSetting('blobs')}"/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Background Glow Intensity</label>${tip('Controls the strength of the soft background glow.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-blobs_opacity" min="0" max="1" step="0.05" value="${getSetting('blobs_opacity')}"/><span id="ag-blobs-opacity-value">${Math.round(Number(getSetting('blobs_opacity')) * 100)}%</span></div></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Song Sidebar BG</label>${tip('Uses the current cover as a blurred frosted background in the right sidebar.')}</span><input type="checkbox" id="ag-check-sidebar_song_bg" ${getSetting('sidebar_song_bg') === 'true' ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Sidebar BG Strength</label>${tip('Adjusts how strongly the cover colors show through the sidebar glass.')}</span><input type="range" id="ag-range-sidebar_bg_strength" min="0" max="100" step="5" value="${getSetting('sidebar_bg_strength')}"/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Song Background Blur</label>${tip('Uses the current cover as an optional blurred page background without changing Hero Glow or Background Glow settings.')}</span><input type="checkbox" id="ag-check-page_song_bg" ${getSetting('page_song_bg') === 'true' ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>FrostedGlass/Glass</label>${tip('Adds a stronger reflective border and inset shine to glass surfaces.')}</span><input type="checkbox" id="ag-check-glass_reflection" ${getSetting('glass_reflection') === 'true' ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Frosted Glass Blur</label>${tip('Controls blur amount for AmbientGlass glass panels.')}</span><input type="range" id="ag-range-glass_blur" min="0" max="80" step="2" value="${getSetting('glass_blur')}"/></div>
              <div class="ag-setting-item ag-performance-setting"><span class="ag-setting-label"><label>Performance Mode</label>${tip('Reduces heavy blur, shadows, hover effects, and background polling for smoother use on weaker PCs.')}</span><input type="checkbox" id="ag-check-performance_mode" ${isPerformanceMode() ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Introduction</label>${tip('Shows the AmbientGlass first-run introduction again.')}</span><button id="ag-show-onboarding" type="button">Show</button></div>
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

            <div class="ag-tab-content" id="tab-layout">
              <div class="ag-setting-item ag-layout-change-setting"><span class="ag-setting-label"><label>Move AmbientGlass Layout</label></span><button id="ag-change-layout" type="button">Change</button></div>
              <div class="ag-setting-item"><label>Reset Saved Layout</label><button id="ag-reset-layout" type="button">Reset</button></div>
            </div>

            <div class="ag-tab-content" id="tab-ui">
              <div class="ag-gradient-builder" data-gradient-enabled="${isNowGradientEnabled()}" data-now-mode="${getSetting('now_mode')}">
                <div class="ag-settings-section">
                  <div class="ag-settings-section-title">Basics</div>
                  <div class="ag-setting-item"><label>Accent Color (Like/UI)</label><input type="color" id="ag-col-accent" value="${getSetting('accent')}"/></div>
                  <div class="ag-setting-item"><label>Now Playing Color</label><input type="color" id="ag-col-now_color" value="${getSetting('now_color')}"/></div>
                  <div class="ag-setting-item"><label>Bar Style</label><select id="ag-select-now_mode"><option value="transparent" ${getSetting('now_mode') === 'transparent' ? 'selected' : ''}>Normal glass</option><option value="frosted" ${getSetting('now_mode') === 'frosted' ? 'selected' : ''}>Frosted glass</option><option value="colored" ${getSetting('now_mode') !== 'transparent' && getSetting('now_mode') !== 'frosted' ? 'selected' : ''}>Colored glass</option></select></div>
                  <div class="ag-setting-item"><label>Gradient</label><input type="checkbox" id="ag-check-now_gradient_enabled" ${isNowGradientEnabled() ? 'checked' : ''}/></div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Spinning Cover</label>${tip('Turns the player and sidebar cover art into a slow rotating circle.')}</span><input type="checkbox" id="ag-check-cover_spin" ${getSetting('cover_spin') === 'true' ? 'checked' : ''}/></div>
                </div>
                <div class="ag-settings-section">
                  <div class="ag-settings-section-title">Player</div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Player Width</label>${tip('Changes the floating song player width in pixels.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-now_width" min="520" max="1120" step="20" value="${getSetting('now_width')}"/><span id="ag-now-width-value">${getSetting('now_width')}px</span></div></div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Player Height</label>${tip('Changes the floating song player height in pixels.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-now_height" min="62" max="110" step="2" value="${getSetting('now_height')}"/><span id="ag-now-height-value">${getSetting('now_height')}px</span></div></div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Player Radius</label>${tip('Rounds the song player. Higher values make it pill shaped.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-now_radius" min="8" max="56" step="2" value="${getSetting('now_radius')}"/><span id="ag-now-radius-value">${getSetting('now_radius')}px</span></div></div>
                  <div class="ag-setting-item ag-frosted-only"><label>Frosted Strength</label><div class="ag-angle-control"><input type="range" id="ag-range-now_frost" min="0" max="100" step="2" value="${getSetting('now_frost')}"/><span id="ag-now-frost-value">${getSetting('now_frost')}%</span></div></div>
                </div>
                <div class="ag-settings-section ag-settings-section-wide">
                  <div class="ag-settings-section-title">Gradient</div>
                  <div class="ag-setting-item ag-gradient-only"><label>Second Color</label><input type="color" id="ag-col-now_color_2" value="${getSetting('now_color_2')}"/></div>
                  <div class="ag-setting-item ag-gradient-only"><label>Gradient Angle</label><div class="ag-angle-control"><input type="range" id="ag-range-now_gradient_angle" min="0" max="360" step="5" value="${getSetting('now_gradient_angle')}"/><span id="ag-now-angle-value">${getSetting('now_gradient_angle')} deg</span></div></div>
                  <div class="ag-setting-item ag-gradient-only"><label>Gradient Position</label><div class="ag-angle-control"><input type="range" id="ag-range-now_gradient_position" min="0" max="100" step="1" value="${getSetting('now_gradient_position')}"/><span id="ag-now-position-value">${getSetting('now_gradient_position')}%</span></div></div>
                  <div class="ag-setting-item ag-gradient-only"><label>Blend Width</label><div class="ag-angle-control"><input type="range" id="ag-range-now_gradient_blend" min="0" max="100" step="2" value="${getSetting('now_gradient_blend')}"/><span id="ag-now-blend-value">${getSetting('now_gradient_blend')}%</span></div></div>
                  <div class="ag-setting-item"><label>Glass Brightness</label><div class="ag-angle-control"><input type="range" id="ag-range-now_brightness" min="20" max="100" step="2" value="${getSetting('now_brightness')}"/><span id="ag-now-brightness-value">${getSetting('now_brightness')}%</span></div></div>
                  <div class="ag-gradient-preview" style="--ag-preview-angle:${getSetting('now_gradient_angle')}deg;--ag-preview-position:${getSetting('now_gradient_position')}%;--ag-preview-blend:${getNumericSetting('now_gradient_blend', 36, 0, 100)}%;--ag-preview-a:${getSetting('now_color')};--ag-preview-b:${getSetting('now_color_2')};--ag-preview-brightness:${getSetting('now_brightness')}%;"></div>
                </div>
               </div>
               <p style="font-size: 11px; opacity: 0.6; margin-top: 10px;">These options use AmbientGlass variables only and do not change Spotify spice text colors.</p>
            </div>
          </div>

          <div class="ag-settings-footer">
            <button id="ag-save-settings" type="button">Done</button>
            <button id="ag-reset-settings" style="background:rgba(255,255,255,0.05);color:#fff;margin-top:10px;">Reset to Defaults</button>
          </div>
        </div>
      </div>
    `;
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'true');
    d.setAttribute('aria-labelledby', 'ag-settings-title');
    document.body.appendChild(d);
    d.querySelectorAll('.ag-setting-item').forEach((item, index) => {
      const label = item.querySelector('label');
      const control = item.querySelector('input, select, textarea, button:not(.ag-setting-help)');
      if (!label || !control) return;
      if (!control.id) control.id = `ag-setting-control-${index}`;
      label.setAttribute('for', control.id);
    });
    const closeSettings = () => {
      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
    };
    const closeButton = d.querySelector('#ag-settings-close');
    closeButton?.addEventListener('click', closeSettings);
    closeButton?.focus({ preventScroll: true });
    d.addEventListener('pointerdown', event => {
      if (event.target === d) closeSettings();
    });
    d.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeSettings();
      }
    });

    // Tab Logic
    const tabs = d.querySelectorAll('.ag-tab-btn');
    const contents = d.querySelectorAll('.ag-tab-content');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active'));
        contents.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        d.querySelector('#tab-' + t.dataset.tab).classList.add('active');
        setNowPlayingPreview(t.dataset.tab === 'ui');
      });
    });

    d.querySelector('#ag-change-layout')?.addEventListener('click', () => {
      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
      startLayoutEditor();
    });
    d.querySelector('#ag-reset-layout')?.addEventListener('click', () => {
      localStorage.removeItem('ag-layout');
      _layoutDraft = null;
      applyLayout(getLayout());
      updateVisibility();
      Spicetify.showNotification("AmbientGlass: Layout reset");
    });
    d.querySelector('#ag-show-onboarding')?.addEventListener('click', () => showOnboarding(true));
    // Live update logic.
    const inputs = d.querySelectorAll('input, select');
    inputs.forEach(input => {
      const eventType = input.type === 'range' || input.type === 'color' ? 'input' : 'change';
      input.addEventListener(eventType, () => {
        const k = input.id.replace('ag-col-', '').replace('ag-range-', '').replace('ag-check-', '').replace('ag-select-', '');
            const val = input.type === 'checkbox' ? input.checked.toString() : input.value;
            localStorage.setItem('ag-setting-' + k, val);
            if (k === 'now_mode' && (val === 'transparent' || val === 'frosted')) {
              const gradientCheck = d.querySelector('#ag-check-now_gradient_enabled');
              if (gradientCheck) gradientCheck.checked = false;
              localStorage.setItem('ag-setting-now_gradient_enabled', 'false');
            }
            if (k === 'now_gradient_angle') d.querySelector('#ag-now-angle-value').textContent = val + ' deg';
            if (k === 'now_gradient_position') d.querySelector('#ag-now-position-value').textContent = val + '%';
            if (k === 'now_gradient_blend') d.querySelector('#ag-now-blend-value').textContent = val + '%';
            if (k === 'now_brightness') d.querySelector('#ag-now-brightness-value').textContent = val + '%';
            if (k === 'now_frost') d.querySelector('#ag-now-frost-value').textContent = val + '%';
            if (k === 'now_width') d.querySelector('#ag-now-width-value').textContent = val + 'px';
            if (k === 'now_height') d.querySelector('#ag-now-height-value').textContent = val + 'px';
            if (k === 'now_radius') d.querySelector('#ag-now-radius-value').textContent = val + 'px';
            if (k === 'glow_opacity') d.querySelector('#ag-glow-opacity-value').textContent = Math.round(Number(val) * 100) + '%';
            if (k === 'glow_size') d.querySelector('#ag-glow-size-value').textContent = val + '%';
            if (k === 'blobs_opacity') d.querySelector('#ag-blobs-opacity-value').textContent = Math.round(Number(val) * 100) + '%';
            const builder = d.querySelector('.ag-gradient-builder');
            if (builder) {
              builder.dataset.gradientEnabled = (d.querySelector('#ag-check-now_gradient_enabled')?.checked || false).toString();
              builder.dataset.nowMode = d.querySelector('#ag-select-now_mode')?.value || getSetting('now_mode');
            }
            const preview = d.querySelector('.ag-gradient-preview');
            if (preview) {
              setStyleIfChanged(preview, '--ag-preview-angle', (d.querySelector('#ag-range-now_gradient_angle')?.value || getSetting('now_gradient_angle')) + 'deg');
              setStyleIfChanged(preview, '--ag-preview-position', (d.querySelector('#ag-range-now_gradient_position')?.value || getSetting('now_gradient_position')) + '%');
              setStyleIfChanged(preview, '--ag-preview-blend', (d.querySelector('#ag-range-now_gradient_blend')?.value || getSetting('now_gradient_blend')) + '%');
              setStyleIfChanged(preview, '--ag-preview-a', d.querySelector('#ag-col-now_color')?.value || getSetting('now_color'));
              setStyleIfChanged(preview, '--ag-preview-b', d.querySelector('#ag-col-now_color_2')?.value || getSetting('now_color_2'));
              setStyleIfChanged(preview, '--ag-preview-brightness', (d.querySelector('#ag-range-now_brightness')?.value || getSetting('now_brightness')) + '%');
            }
            applyCustomColors();
            updateNowPlayingPreviewClone();
      });
    });

    d.querySelector('#ag-save-settings').addEventListener('click', () => {
      Object.keys(DEFAULTS).forEach(k => {
        const el = d.querySelector('#ag-col-' + k) || d.querySelector('#ag-range-' + k) || d.querySelector('#ag-check-' + k) || d.querySelector('#ag-select-' + k);
        if (el) {
          const val = el.type === 'checkbox' ? el.checked.toString() : el.value;
          localStorage.setItem('ag-setting-' + k, val);
        }
      });

      // Live Apply!
      try {
        applyCustomColors();
      } catch(e) {}

      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
      Spicetify.showNotification("AmbientGlass: Applied");
    });
    d.querySelector('#ag-reset-settings').addEventListener('click', () => {
      Object.keys(DEFAULTS).forEach(k => localStorage.removeItem('ag-setting-' + k));

      applyCustomColors();
      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
      Spicetify.showNotification("AmbientGlass: Reset to defaults");
    });
  }

  function applyCustomColors() {
    const glow = getSetting('glow');
    const s1 = getSetting('s1');
    const s2 = getSetting('s2');
    const home = getSetting('home');
    const liked = getSetting('liked');
    const albums = getSetting('albums');
    const playlists = getSetting('playlists');
    const artists = getSetting('artists');
    const accent = getSetting('accent');
    const selectedNowMode = getSetting('now_mode');
    const nowSurfaceMode = selectedNowMode === 'transparent' ? 'transparent' : selectedNowMode === 'frosted' ? 'frosted' : 'colored';
    const nowMode = isNowGradientEnabled() ? 'gradient' : nowSurfaceMode;
    const nowColor = getSetting('now_color');
    const nowColor2 = getSetting('now_color_2');
    const nowGradientAngle = getSetting('now_gradient_angle');
    const nowGradientPosition = getNumericSetting('now_gradient_position', 50, 0, 100);
    const nowGradientBlend = getNumericSetting('now_gradient_blend', 36, 0, 100);
    const nowBrightness = Math.max(20, Math.min(100, Number(getSetting('now_brightness')) || 72));
    const nowFrost = Math.max(0, Math.min(100, Number(getSetting('now_frost')) || 52));
    const nowWidth = Math.max(520, Math.min(1120, Number(getSetting('now_width')) || 860));
    const nowHeight = Math.max(62, Math.min(110, Number(getSetting('now_height')) || 80));
    const nowRadius = Math.max(8, Math.min(56, Number(getSetting('now_radius')) || 40));
    const coverSpin = getSetting('cover_spin') === 'true';
    const sidebarSongBg = getSetting('sidebar_song_bg') === 'true';
    const pageSongBg = getSetting('page_song_bg') === 'true';
    const sidebarBgStrength = getNumericSetting('sidebar_bg_strength', 0, 0, 100);
    const btn_bg = getSetting('btn_bg');
    const blobs = getSetting('blobs');
    const glowOpacity = getSetting('glow_opacity');
    const glowSize = getNumericSetting('glow_size', 155, 60, 220);
    const blobsOpacity = getSetting('blobs_opacity');

    // Root Variables for Cluster & Glow
    const root = document.documentElement;
    setStyleIfChanged(root, '--ag-s1', s1);
    setStyleIfChanged(root, '--ag-s2', s2);
    setStyleIfChanged(root, '--ag-s3', s2);
    setStyleIfChanged(root, '--ag-accent-main', accent);
    setStyleIfChanged(root, '--ag-accent-1', accent);
    setStyleIfChanged(root, '--ag-accent-2', s2);
    setStyleIfChanged(root, '--ag-now-mode', nowMode);
    setStyleIfChanged(root, '--ag-now-color', nowColor);
    setStyleIfChanged(root, '--ag-now-color-2', nowColor2);
    setStyleIfChanged(root, '--ag-now-gradient-angle', nowGradientAngle + 'deg');
    setStyleIfChanged(root, '--ag-now-gradient-position', nowGradientPosition + '%');
    setStyleIfChanged(root, '--ag-now-gradient-blend', nowGradientBlend + '%');
    setStyleIfChanged(root, '--ag-now-brightness', nowBrightness + '%');
    setStyleIfChanged(root, '--ag-now-frost', nowFrost + '%');
    setStyleIfChanged(root, '--ag-now-width', nowWidth + 'px');
    setStyleIfChanged(root, '--ag-now-height', nowHeight + 'px');
    setStyleIfChanged(root, '--ag-now-radius', nowRadius + 'px');
    document.body?.classList.toggle('ag-cover-spin', coverSpin);
    document.body?.classList.toggle('ag-performance-mode', isPerformanceMode());
    document.body?.classList.toggle('ag-page-song-bg-enabled', pageSongBg);
    setStyleIfChanged(root, '--ag-sidebar-cover-opacity', (sidebarBgStrength / 100).toFixed(2));
    setStyleIfChanged(root, '--ag-sidebar-cover-blur', (28 + sidebarBgStrength * 0.42).toFixed(0) + 'px');
    setStyleIfChanged(root, '--ag-page-cover-opacity', (0.10 + sidebarBgStrength / 260).toFixed(2));
    setStyleIfChanged(root, '--ag-page-cover-blur', (36 + sidebarBgStrength * 0.48).toFixed(0) + 'px');
    document.body?.classList.toggle('ag-sidebar-song-bg-disabled', !sidebarSongBg);
    setStyleIfChanged(root, '--ag-now-frost-blur', nowMode === 'frosted' ? (18 + nowFrost * 0.62).toFixed(0) + 'px' : 'var(--ag-glass-blur, 24px)');
    setStyleIfChanged(root, '--ag-now-frost-saturate', nowMode === 'frosted' ? (130 + nowFrost * 0.9).toFixed(0) + '%' : '180%');
    setStyleIfChanged(root, '--ag-now-glass-filter-brightness', (0.86 + nowBrightness / 300).toFixed(2));
    const nowBase = `rgba(8,7,14,${(0.88 - nowBrightness / 220).toFixed(2)})`;
    const nowGlass = 'linear-gradient(0deg, rgba(14, 12, 26, 0.42), rgba(14, 12, 26, 0.42))';
    const frostAlpha = (0.18 + nowFrost / 190).toFixed(2);
    const frostWhite = (nowFrost * 0.32).toFixed(1);
    const nowFrosted = `linear-gradient(135deg, color-mix(in srgb, rgba(255,255,255,${frostAlpha}) ${frostWhite}%, rgba(10,9,18,0.62)), rgba(12,10,20,${(0.34 + nowFrost / 260).toFixed(2)}))`;
    const nowSolid = `linear-gradient(0deg, color-mix(in srgb, ${nowColor} ${nowBrightness}%, ${nowBase}), color-mix(in srgb, ${nowColor} ${nowBrightness}%, ${nowBase}))`;
    const nowHalfBlend = nowGradientBlend / 2;
    const nowLeftStop = Math.max(0, nowGradientPosition - nowHalfBlend);
    const nowRightStop = Math.min(100, nowGradientPosition + nowHalfBlend);
    const nowA = `color-mix(in srgb, ${nowColor} ${nowBrightness}%, ${nowBase})`;
    const nowB = `color-mix(in srgb, ${nowColor2} ${nowBrightness}%, ${nowBase})`;
    const nowGradient = nowGradientBlend <= 0
      ? `linear-gradient(${nowGradientAngle}deg, ${nowA} 0%, ${nowA} ${nowGradientPosition}%, ${nowB} ${nowGradientPosition}%, ${nowB} 100%)`
      : `linear-gradient(${nowGradientAngle}deg, ${nowA} 0%, ${nowA} ${nowLeftStop}%, ${nowB} ${nowRightStop}%, ${nowB} 100%)`;
    const glowLeftStop = Math.max(0, nowGradientPosition - Math.max(nowHalfBlend, 30));
    const glowRightStop = Math.min(100, nowGradientPosition + Math.max(nowHalfBlend, 30));
    const nowGlowGlass = 'linear-gradient(90deg, var(--ag-surface-tint-soft, rgba(123,95,219,0.22)), color-mix(in srgb, var(--ag-s2, #4f8edb) 18%, transparent))';
    const nowGlowSolid = `linear-gradient(0deg, color-mix(in srgb, ${nowColor} 50%, transparent), color-mix(in srgb, ${nowColor} 50%, transparent))`;
    const nowGlowGradient = `linear-gradient(${nowGradientAngle}deg, color-mix(in srgb, ${nowColor} 52%, transparent) 0%, color-mix(in srgb, ${nowColor} 42%, ${nowColor2} 18%) ${glowLeftStop}%, color-mix(in srgb, ${nowColor} 30%, ${nowColor2} 30%) ${nowGradientPosition}%, color-mix(in srgb, ${nowColor2} 42%, ${nowColor} 18%) ${glowRightStop}%, color-mix(in srgb, ${nowColor2} 52%, transparent) 100%)`;
    setStyleIfChanged(root, '--ag-now-glass-bg', nowMode === 'gradient' ? nowGradient : nowMode === 'colored' ? nowSolid : nowMode === 'frosted' ? nowFrosted : nowGlass);
    setStyleIfChanged(root, '--ag-now-glow-bg', nowMode === 'gradient' ? nowGlowGradient : nowMode === 'colored' ? nowGlowSolid : nowMode === 'frosted' ? nowFrosted : nowGlowGlass);
    setStyleIfChanged(root, '--ag-now-glow-a', `color-mix(in srgb, ${nowColor} 52%, transparent)`);
    setStyleIfChanged(root, '--ag-now-glow-b', `color-mix(in srgb, ${nowMode === 'gradient' ? nowColor2 : nowColor} 52%, transparent)`);
    setStyleIfChanged(root, '--ag-now-glass-border', nowMode === 'transparent'
      ? 'rgba(255, 255, 255, 0.09)'
      : nowMode === 'frosted'
        ? `rgba(255, 255, 255, ${(0.12 + nowFrost / 380).toFixed(2)})`
      : 'rgba(255, 255, 255, 0.13)');
    setStyleIfChanged(root, '--ag-now-glass-glow', nowMode === 'gradient'
      ? `color-mix(in srgb, ${nowColor2} 36%, transparent)`
      : nowMode === 'colored'
        ? `color-mix(in srgb, ${nowColor} 42%, transparent)`
      : 'var(--ag-surface-tint-soft, rgba(123,95,219,0.18))');

    setStyleIfChanged(root, '--ag-col-home', home);
    setStyleIfChanged(root, '--ag-col-liked', liked);
    setStyleIfChanged(root, '--ag-col-albums', albums);
    setStyleIfChanged(root, '--ag-col-playlists', playlists);
    setStyleIfChanged(root, '--ag-col-artists', artists);
    setStyleIfChanged(root, '--ag-col-btn_bg', btn_bg);

    setStyleIfChanged(root, '--ag-ambient-color', glow);
    setStyleIfChanged(root, '--ag-glow-opacity', glowOpacity);
    setStyleIfChanged(root, '--ag-glow-size', glowSize + 'vw');
    setStyleIfChanged(root, '--ag-glow-height', Math.round(glowSize * 0.84) + 'vh');
    setStyleIfChanged(root, '--ag-blobs-opacity', blobsOpacity);
    setStyleIfChanged(root, '--ag-col-blobs', blobs);
    setStyleIfChanged(root, '--ag-surface-tint', `color-mix(in srgb, ${glow} 22%, transparent)`);
    setStyleIfChanged(root, '--ag-surface-tint-soft', `color-mix(in srgb, ${glow} 13%, transparent)`);
    setStyleIfChanged(root, '--ag-surface-tint-strong', `color-mix(in srgb, ${glow} 34%, transparent)`);
    setStyleIfChanged(root, '--ag-search-tint-a', `color-mix(in srgb, ${s1} 26%, transparent)`);
    setStyleIfChanged(root, '--ag-search-tint-b', `color-mix(in srgb, ${s2} 22%, transparent)`);

    const reflection = getSetting('glass_reflection') === 'true';
    const blur = getSetting('glass_blur');
    setStyleIfChanged(root, '--ag-glass-blur', blur + 'px');

    let s = document.getElementById('ag-dynamic-colors');
    if (!s) { s = document.createElement('style'); s.id = 'ag-dynamic-colors'; document.head.appendChild(s); }

    s.textContent = `
      :root {
        --spice-button: ${accent} !important;
        --spice-button-active: ${accent} !important;
        --spice-accent: ${accent} !important;
      }
      html, body, .Root__top-container, .under-main-view { background: transparent !important; }
      #ag-startup-splash { background: transparent !important; }
      #ag-home-cluster,
      #ag-centered-search,
      #ag-jam-floating-pill {
        position: fixed !important;
        z-index: 30 !important;
      }
      #ag-centered-search {
        z-index: 9000 !important;
      }
      #ag-jam-floating-pill {
        width: auto !important;
        min-width: 92px !important;
        max-width: 220px !important;
        height: 34px !important;
        min-height: 34px !important;
        max-height: 34px !important;
        padding: 0 16px !important;
        border-radius: 999px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        background: rgba(123,95,219,0.72) !important;
        color: #fff !important;
        font-weight: 800 !important;
        font-size: 12px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 18px rgba(123,95,219,0.28) !important;
      }
      #ag-jam-floating-pill.ag-jam-hidden {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      body.ag-layout-custom .Root__now-playing-bar {
        position: fixed !important;
        left: clamp(calc(var(--ag-player-width) / 2 + 8px), var(--ag-now-x, 50%), calc(100vw - var(--ag-player-width) / 2 - 8px)) !important;
        top: clamp(calc(var(--ag-now-height, 80px) / 2 + 8px), var(--ag-now-y, 94%), calc(100vh - var(--ag-now-height, 80px) / 2 - 8px)) !important;
        bottom: auto !important;
        transform: translate(-50%, -50%) !important;
        width: var(--ag-player-width) !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: var(--ag-now-height, 80px) !important;
        max-height: var(--ag-now-height, 80px) !important;
        background: none !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        border: 0 !important;
        overflow: visible !important;
        z-index: 80 !important;
      }
      body.ag-layout-custom .Root__now-playing-bar > * {
        position: relative !important;
        left: auto !important;
        top: auto !important;
        transform: none !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: var(--ag-player-width) !important;
        margin: 0 auto !important;
        z-index: 80 !important;
      }
      body.ag-layout-editing .Root__now-playing-bar,
      body.ag-layout-editing .Root__now-playing-bar > *,
      body.ag-now-preview .Root__now-playing-bar,
      body.ag-now-preview .Root__now-playing-bar > *,
      body:has(#ag-settings-panel) .Root__now-playing-bar,
      body:has(#ag-settings-panel) .Root__now-playing-bar > * {
        z-index: 2147483646 !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      body.ag-now-preview .Root__top-container {
        z-index: 2147483645 !important;
        isolation: auto !important;
      }
      body.ag-now-preview .Root__now-playing-bar {
        position: fixed !important;
        bottom: 30px !important;
        top: auto !important;
      }
      body.ag-layout-custom .Root__now-playing-bar::before,
      body.ag-layout-custom .Root__now-playing-bar::after {
        display: none !important;
      }
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




      #ag-centered-search { will-change: transform, opacity !important; }
      #ag-centered-search:hover .ag-pill-search { transform: scale(1.03) !important; }

      #ag-centered-search:hover .ag-ring { opacity: 0.8 !important; border-color: rgba(255, 255, 255, 0.2) !important; }
      #ag-centered-search:hover .ag-pill-search { border-color: rgba(255, 255, 255, 0.15) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important; }

      .ag-albums:hover { box-shadow: 0 0 25px ${albums}44 !important; border-color: ${albums}66 !important; }
      .ag-albums:hover svg { stroke: ${albums} !important; }
      .ag-playlists:hover { box-shadow: 0 0 25px ${playlists}44 !important; border-color: ${playlists}66 !important; }
      .ag-playlists:hover svg { stroke: ${playlists} !important; }
      .ag-artists:hover { box-shadow: 0 0 25px ${artists}44 !important; border-color: ${artists}66 !important; }
      .ag-artists:hover svg { stroke: ${artists} !important; }

      #ag-settings-panel .ag-settings-tabs {
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: 8px !important;
        overflow: visible !important;
      }
      #ag-settings-panel .ag-tab-btn {
        min-width: 0 !important;
        max-width: none !important;
        white-space: normal !important;
        text-align: center !important;
      }
      #ag-settings-panel .ag-setting-item button:not(.ag-setting-help),
      #ag-settings-panel #ag-change-layout,
      #ag-settings-panel #ag-reset-layout {
        min-width: 92px !important;
        min-height: 32px !important;
        padding: 0 14px !important;
        border-radius: 7px !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        background: rgba(123,95,219,0.72) !important;
        color: #fff !important;
        font-weight: 800 !important;
        box-shadow: 0 8px 18px rgba(0,0,0,0.25) !important;
      }

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

      /* Glass settings injection - high-specificity overrides */
      html body .ag-pill-search,
      html body .ag-cluster-btn,
      html body .view-homeShortcutsGrid-shortcut {
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







  function positionJamPill(pill = document.getElementById('ag-jam-floating-pill')) {
    const player = document.querySelector('.Root__now-playing-bar .main-nowPlayingBar-container') ||
      document.querySelector('.Root__now-playing-bar');
    const rect = player?.getBoundingClientRect();
    if (!pill || !rect?.width || !rect.height) return;
    setStyleIfChanged(pill, 'left', Math.round(rect.left + rect.width / 2) + 'px', 'important');
    setStyleIfChanged(pill, 'top', Math.max(0, Math.round(rect.top) - 12) + 'px', 'important');
    setStyleIfChanged(pill, 'bottom', 'auto', 'important');
    setStyleIfChanged(pill, 'transform', 'translate(-50%, -100%)', 'important');
  }

  function updateJamPill() {
    let pill = document.getElementById('ag-jam-floating-pill');
    const api = Spicetify.Platform.SocialConnectAPI;
    const session = api?.getCurrentSession?.();
    const active = !!session && session.active !== false;
    document.body.toggleAttribute('data-ag-jam-active', active);
    if (pill?.dataset.agPreview === 'true') return;
    if (!active) {
      pill?.remove();
      return;
    }
    if (!pill) {
      pill = document.createElement('button');
      pill.type = 'button';
      pill.id = 'ag-jam-floating-pill';
      pill.addEventListener('click', () => {
        const queue = document.querySelector('[data-testid="control-button-queue"], button[aria-label="Queue"]');
        if (queue) queue.click();
        else safeNavigate('/queue');
      });
      document.body.appendChild(pill);
    }
    const host = session.sessionMembers?.find(member => member.id === session.sessionOwnerId)?.displayName;
    const label = host ? host + '’s Jam' : 'Jam Active';
    if (pill.textContent !== label) pill.textContent = label;
    positionJamPill(pill);
  }

  function agSafeRun(label, fn) {
    try {
      const result = fn();
      result?.catch?.(error => console.warn('[AmbientGlass] ' + label + ' failed', error));
    } catch (e) {
      console.warn(`[AmbientGlass] ${label} failed`, e);
    }
  }


  const RUNTIME_SIGNALS = {
    page: '.Root__main-view, .main-entityHeader-container, [data-testid="background-image"], .marketplace-header, .view-homeShortcutsGrid-shortcuts',
    dock: '.Root__globalNav, .main-actionButtons, [data-testid="user-widget-link"], [id$="-extension-button"]',
    sidebar: '.Root__right-sidebar, [data-testid="right-sidebar"]',
    jam: '.main-connectBar-connectBar, .main-connectBar-connected, [data-testid="queue-page"]',
    visibility: FULLSCREEN_VIEW + ', [role="dialog"], [data-testid="dialog"], #ag-settings-panel, #ag-layout-overlay'
  };
  let _runtimeFrame = 0;
  const _pendingRuntimeJobs = new Set();

  function enqueueRuntime(...jobs) {
    if (document.hidden) return;
    for (const job of jobs) _pendingRuntimeJobs.add(job);
    if (_runtimeFrame) return;
    _runtimeFrame = requestAnimationFrame(() => {
      _runtimeFrame = 0;
      const pending = [..._pendingRuntimeJobs];
      _pendingRuntimeJobs.clear();
      if (document.hidden) return;
      for (const job of pending) agSafeRun(job, RUNTIME_JOBS[job]);
    });
  }

  function refreshPage() {
    const { path, isSearchPage } = syncPageClasses();
    bindArtistBanner(path);
    killTopbar();
    killResidues();
    if (/^\/artist\//.test(path)) {
      agSafeRun('healArtistImage', healArtistImage);
      agSafeRun('fixYouLiked', fixYouLiked);
    }
    if (isSearchPage || document.getElementById('ag-search-page-redesign')) {
      agSafeRun('updateSearchPageRedesign', updateSearchPageRedesign);
    }
    queueVisibilityUpdate();
  }

  function createSidebarRestoreButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'ag-sidebar-restore';
    button.setAttribute('aria-label', 'Expand right sidebar');
    button.title = 'Expand right sidebar';
    button.textContent = '‹';
    button.addEventListener('click', () => {
      const peek = document.querySelector('.Root__right-sidebar-collapsed');
      const nativeExpand = peek?.querySelector('.Root__right-sidebar-overlayButton, .Root__right-sidebar-overlay');
      nativeExpand?.click();
    });
    document.body.appendChild(button);
  }

  function refreshSidebar() {
    const sidebar = document.querySelector('.Root__right-sidebar');
    if (sidebar === _observedSidebar) return;
    _sidebarObserver?.disconnect();
    _observedSidebar = sidebar;

    const updateSpace = () => {
      const width = Math.round(sidebar?.getBoundingClientRect().width || 0);
      document.body.toggleAttribute('data-ag-sidebar-open', width > 160);
      setStyleIfChanged(document.documentElement, '--ag-sidebar-space', width > 160 ? width + 'px' : '0px');
    };
    updateSpace();
    if (!sidebar) return;
    _sidebarObserver = new ResizeObserver(updateSpace);
    _sidebarObserver.observe(sidebar);
  }

  const RUNTIME_JOBS = {
    page: refreshPage,
    dock: enforceProfileHitbox,
    sidebar: refreshSidebar,
    jam: updateJamPill,
    visibility: () => {
      _lastModalCheckTime = 0;
      queueVisibilityUpdate();
    }
  };

  function observeRuntime() {
    const observer = new MutationObserver(records => {
      if (document.hidden) return;
      const jobs = new Set();
      let remaining = 48;
      for (const record of records) {
        if (record.type === 'attributes') {
          if (record.target.matches('[data-testid="lyrics-button"], [data-testid="fullscreen-mode-button"]')) jobs.add('visibility');
          continue;
        }
        if (record.target?.closest?.('[id^="ag-"]')) continue;
        if (record.target?.closest?.(RUNTIME_SIGNALS.dock)) jobs.add('dock');
        if (record.target?.closest?.(RUNTIME_SIGNALS.jam)) jobs.add('jam');
        for (const node of [...record.addedNodes, ...record.removedNodes]) {
          if (node.nodeType !== 1 || --remaining < 0) continue;
          if (node.id.startsWith('ag-') && !node.matches(RUNTIME_SIGNALS.visibility)) continue;
          for (const [job, selector] of Object.entries(RUNTIME_SIGNALS)) {
            if (node.matches(selector) || node.querySelector(selector)) jobs.add(job);
          }
        }
        if (remaining <= 0) break;
      }
      if (jobs.has('dock')) markDockDirty();
      if (jobs.size) enqueueRuntime(...jobs);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
  }

  // Native caption buttons are drawn outside the DOM. Use the window service
  // for transparent controls, and keep native controls when it is unavailable.
  let _customWindowControls = false;
  let _windowStateRequest = false;
  function windowClients() {
    const platform = Spicetify.Platform;
    return {
      window: platform.FocusMainWindowAPI?._windowStateClient,
      ui: platform.ControlMessageAPI?._updateUiClient || platform.UpdateAPI?._updateUiClient
    };
  }

  async function restoreNativeWindowControls() {
    if (!_customWindowControls) return;
    const { ui } = windowClients();
    const results = await Promise.allSettled([
      ui.setButtonsVisibility({ showButtons: true }),
      ui.updateTitlebarHeight({ height: 64 })
    ]);
    if (results.every(result => result.status === 'fulfilled')) {
      _customWindowControls = false;
      document.getElementById('ag-window-controls')?.remove();
    } else {
      // Keep working controls available if the native chrome cannot be restored.
      const controls = document.getElementById('ag-window-controls');
      if (controls) controls.hidden = false;
      console.warn('[AmbientGlass] Native window controls could not be restored', results);
    }
  }

  async function updateWindowControlState() {
    const maximize = document.querySelector('#ag-window-controls [data-action="maximize"]');
    if (!maximize || _windowStateRequest) return;
    _windowStateRequest = true;
    try {
      const { state } = await windowClients().window.getWindowState({});
      maximize.setAttribute('aria-label', state === 2 ? 'Restore window' : 'Maximize');
      maximize.title = state === 2 ? 'Restore window' : 'Maximize';
      maximize.classList.toggle('ag-window-maximized', state === 2);
    } finally {
      _windowStateRequest = false;
    }
  }

  async function createWindowControls(attempt = 0) {
    if (!/Win/i.test(navigator.platform) || document.getElementById('ag-window-controls')) return;
    const clients = windowClients();
    if (!clients.window?.getWindowState || !clients.window?.setWindowState ||
        !clients.window?.closeWindow || !clients.ui?.setButtonsVisibility || !clients.ui?.updateTitlebarHeight) {
      if (attempt < 20) setTimeout(() => agSafeRun('window controls', () => createWindowControls(attempt + 1)), 500);
      return;
    }
    await clients.window.getWindowState({});
    const controls = document.createElement('div');
    controls.id = 'ag-window-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Window controls');
    const icons = {
      minimize: '<path d="M5 12h14"/>',
      maximize: '<rect class="ag-window-maximize-icon" x="5" y="5" width="14" height="14"/><path class="ag-window-restore-icon" d="M8 8V4h12v12h-4M4 8h12v12H4z"/>',
      close: '<path d="m5 5 14 14M19 5 5 19"/>'
    };
    for (const [action, icon] of Object.entries(icons)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.action = action;
      button.setAttribute('aria-label', action[0].toUpperCase() + action.slice(1));
      button.title = button.getAttribute('aria-label');
      button.innerHTML = svg(icon, { size: 12, stroke: 1.5 });
      button.addEventListener('click', () => agSafeRun('window ' + action, async () => {
        if (action === 'close') return clients.window.closeWindow({});
        const state = action === 'minimize' ? 3 : (await clients.window.getWindowState({})).state === 2 ? 1 : 2;
        await clients.window.setWindowState({ state });
        await updateWindowControlState();
      }));
      controls.appendChild(button);
    }
    controls.hidden = true;
    document.body.appendChild(controls);
    _customWindowControls = true;
    try {
      await clients.ui.setButtonsVisibility({ showButtons: false });
      await clients.ui.updateTitlebarHeight({ height: 1 });
      controls.hidden = false;
      await updateWindowControlState();
    } catch (error) {
      await restoreNativeWindowControls();
      throw error;
    }
  }

  function init() {
    const visibilityStyle = document.createElement('style');
    visibilityStyle.id = 'ag-visibility-guard';
    visibilityStyle.textContent = [
      'body[data-ag-suspended] #ag-blobs, body[data-ag-suspended] #ag-hero-glow,',
      'body[data-ag-suspended] #ag-glow-smoother, body[data-ag-suspended] #ag-page-cover-bg { visibility: hidden !important; }',
      'body[data-ag-suspended] .ag-blob, body[data-ag-suspended] #ag-hero-glow,',
      'body[data-ag-suspended] .ag-ring, body[data-ag-suspended] .cover-art,',
      'body[data-ag-suspended] .main-nowPlayingView-coverArt { animation-play-state: paused !important; }'
    ].join(' ');
    document.head.appendChild(visibilityStyle);
    document.body.toggleAttribute('data-ag-suspended', document.hidden);

    agSafeRun('applyCustomColors', applyCustomColors);
    agSafeRun('startup animation', triggerStartupAnimation);
    createPageCoverBackground();
    createBlobs();
    createHeroGlow();
    createGlowSmoother();
    createHomeCluster();
    createSearchOverlay();
    createUpNextCard();
    createLibraryPanel();
    createSidebarRestoreButton();
    setupAmbientSearchHotkey();
    agSafeRun('window controls', createWindowControls);
    window.addEventListener('pagehide', () => agSafeRun('restore window controls', restoreNativeWindowControls));
    setTimeout(() => agSafeRun('showOnboarding', () => showOnboarding(false)), 3200);

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      if (resizeFrame || document.hidden) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        _lastAppliedLayoutSignature = '';
        _lastVisibilitySignature = '';
        updateSearchPageVisualCenter();
        positionJamPill();
        agSafeRun('window state', updateWindowControlState);
        if (document.getElementById('ag-up-next-card')?.classList.contains('ag-up-next-visible')) positionUpNextCard();
        enqueueRuntime('dock', 'sidebar', 'visibility');
      });
    });
    const syncFullscreen = () => enqueueRuntime('visibility');
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    fullscreenDisplay.addEventListener('change', syncFullscreen);
    document.addEventListener('visibilitychange', () => {
      document.body.toggleAttribute('data-ag-suspended', document.hidden);
      if (document.hidden) return;
      markDockDirty();
      enqueueRuntime('page', 'dock', 'sidebar', 'jam', 'visibility');
      agSafeRun('updateSidebarCoverBackground', updateSidebarCoverBackground);
      agSafeRun('updateUpNextCard', updateUpNextCard);
    });
    Spicetify.Platform.History.listen(() => {
      _lastScrollY = 0;
      _lastVisibilitySignature = '';
      _lastAppliedLayoutSignature = '';
      markDockDirty();
      enqueueRuntime('page', 'dock', 'sidebar', 'jam', 'visibility');
    });
    Spicetify.Player.addEventListener('songchange', () => {
      _upNextLastUri = '';
      _upNextLastImage = '';
      _upNextLastFetch = 0;
      _upNextCached = null;
      _upNextGeneration++;
      _upNextRequest = null;
      _lastUpNextUpdate = 0;
      document.getElementById('ag-up-next-card')?.classList.remove('ag-up-next-visible');
      if (document.hidden) return;
      agSafeRun('updateSidebarCoverBackground', updateSidebarCoverBackground);
      enqueueRuntime('sidebar', 'jam');
    });
    Spicetify.Player.addEventListener('onprogress', () => {
      if (!document.hidden) agSafeRun('updateUpNextCard', updateUpNextCard);
    });
    agSafeRun('Jam subscription', () => {
      const jamEvents = Spicetify.Platform.SocialConnectAPI?.getEvents?.();
      const subscribeJam = jamEvents?.addListener || jamEvents?.on;
      subscribeJam?.call(jamEvents, 'update', () => enqueueRuntime('jam'));
      subscribeJam?.call(jamEvents, 'session_ended', () => enqueueRuntime('jam'));
    });
    observeRuntime();
    agSafeRun('updateSidebarCoverBackground', updateSidebarCoverBackground);
    agSafeRun('updateUpNextCard', updateUpNextCard);
    enqueueRuntime('page', 'dock', 'sidebar', 'jam', 'visibility');
  }

  window.AmbientGlass = { version: THEME_VERSION, safeNavigate, closeLibraryPanel, restoreNativeWindowControls };
  init();
  window.__ambientGlassInitialized = true;
})();
