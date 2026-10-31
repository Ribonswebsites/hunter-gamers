/* Hunter Game app layer: orbit hero, sheets, bottom nav, login, cookies, app download */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IN_APP = /HunterGameApp/i.test(navigator.userAgent);
  const IS_ANDROID = /Android/i.test(navigator.userAgent);
  const store = { get: k => { try { return JSON.parse(localStorage.getItem('hg.' + k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('hg.' + k, JSON.stringify(v)); } catch {} } };
  const I = n => '/img/' + n + '?v=10';
  const POSTERS = Array.from({ length: 12 }, (_, i) => I(`card-${String(i + 1).padStart(2, '0')}.webp`));
  const LOGO = I('hg-logo.png');
  const sv = (p, w = 30) => `<svg class="hg-svg" width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {
    pad: w => sv('<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2L1.6 14.6A3 3 0 0 0 4.5 18c1 0 1.9-.5 2.4-1.3L8 15h8l1.1 1.7c.5.8 1.4 1.3 2.4 1.3a3 3 0 0 0 2.9-3.4l-1.2-6.4A4 4 0 0 0 17.3 5z"/>', w),
    bolt: w => sv('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', w),
    joy: w => sv('<circle cx="12" cy="6" r="3"/><path d="M12 9v6M5 15h14l1 5H4z"/>', w),
    home: w => sv('<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>', w),
    chips: w => sv('<path d="M6 3h12l-1.5 18h-9z"/><path d="M9 8l3 3 3-3M9 14h6"/>', w),
    drink: w => sv('<path d="M6 6h12l-1.6 15H7.6z"/><path d="M12 6l2-4h3"/><path d="M6.6 11h10.8"/>', w),
    snack: w => sv('<path d="M5 9h14l-2 12H7z"/><path d="M7 9a2.5 2.5 0 0 1 2-4 2.5 2.5 0 0 1 3-2 2.5 2.5 0 0 1 3 2 2.5 2.5 0 0 1 2 4"/>', w),
    user: w => sv('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', w),
    cookie: w => sv('<path d="M21 12a9 9 0 1 1-9-9 3 3 0 0 0 4 4 3 3 0 0 0 5 5z"/><circle cx="8.5" cy="9.5" r="1" fill="currentColor"/><circle cx="14" cy="15" r="1" fill="currentColor"/><circle cx="8" cy="15.5" r="1" fill="currentColor"/><circle cx="12" cy="11" r=".6" fill="currentColor"/>', w),
    x: w => sv('<path d="M6 6l12 12M18 6 6 18"/>', w),
    arrow: () => sv('<path d="M5 12h14M13 6l6 6-6 6"/>', 16),
    play: () => sv('<path d="M7 4v16l13-8z" fill="currentColor"/>', 16),
    dl: () => sv('<path d="M12 3v12M6 11l6 6 6-6M4 21h16"/>', 16),
    clock: w => sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', w),
    list: w => sv('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>', w),
    live: w => sv('<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>', w),
    left: () => sv('<path d="M15 6l-6 6 6 6"/>', 12), right: () => sv('<path d="M9 6l6 6-6 6"/>', 12),
  };
  const ARW = ' ' + IC.arrow();

  // Each slide: one game. Centre = clean cutout, background = different official art (dimmed + blurred), ring = posters of the OTHER games
  const SLIDES = [
    { id: 'wolverine', pop: 'f-wolverine', clear: 1, bg: 'wolverine-key', tag: "Marvel's Wolverine · PS5", h: 'Unleash the <span>claws.</span>' },
    { id: 'gow', bg: 'h-gow', tag: 'God of War Ragnarök', h: 'Kratos is <span>waiting.</span>' },
    { id: 'gta6', bg: 'gta6-bg', soon: 1, tag: 'Grand Theft Auto VI', h: 'Vice City nights. <span>Coming soon.</span>' },
    { id: 'sm2', cut: 'peter', bg: 'h-sm2', tag: "Marvel's Spider-Man 2", h: 'Swing into <span>the city.</span>' },
    { id: 'acs', bg: 'h-acs', tag: "Assassin's Creed Shadows", h: 'Strike from <span>the shadows.</span>' },
    { id: 'fc26', bg: 'h-fc26', tag: 'EA SPORTS FC 26', h: 'Settle it <span>on the pitch.</span>' },
    { id: 'nr', bg: 'h-nr', tag: 'Elden Ring Nightreign', h: 'Survive <span>the night.</span>' },
    { id: 'wk', bg: 'h-wk', tag: 'Black Myth: Wukong', h: 'Take up <span>the staff.</span>' },
  ];
  const PIDS2 = ['sb', 'hfw', 'ff7r', 't8', 'mk1', 'hl', 'tlou2', 'rc', 'dmc5']; // second ring: its own posters, never shared
  const PIDS = ['wolverine', 'gow', 'sm2', 'acs', 'fc26', 'nr', 'wk', 're9', 'got', 'ds2', 'bo7'];

  /* ---------- Sheets ---------- */
  const scrim = document.createElement('div'); scrim.className = 'hg-scrim'; document.body.append(scrim);
  let openSheet = null;
  function sheet(html, { center = false, cls = '' } = {}) {
    const el = document.createElement('div');
    el.className = 'hg-sheet ' + (center ? 'center ' : '') + cls;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = (center ? '' : '<div class="hg-grab"></div>') + `<button class="hg-x" aria-label="Close" data-close>${IC.x(18)}</button>` + html;
    document.body.append(el); return el;
  }
  function show(el) {
    if (openSheet && openSheet !== el) hide(openSheet, true);
    openSheet = el; scrim.classList.add('on'); document.body.classList.add('hg-lock');
    requestAnimationFrame(() => el.classList.add('on'));
  }
  function hide(el = openSheet, swap) {
    if (!el) return; el.classList.remove('on');
    if (el._temp) setTimeout(() => el.remove(), 500);
    if (openSheet === el) openSheet = null;
    if (!swap) { scrim.classList.remove('on'); document.body.classList.remove('hg-lock'); }
  }
  scrim.addEventListener('click', () => hide());
  document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) hide(c.closest('.hg-sheet')); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  function popup(o) {
    const art = o.art === false ? '' : `<div class="hg-art" style="background-image:url(${o.art || I('r-bookings.webp')})"></div>`;
    const el = sheet(`${art}<div class="hg-icon">${o.icon || IC.pad()}</div><h3>${o.title}</h3><p>${o.text}</p>${o.extra || ''}<div class="hg-row">${(o.actions || []).map((a, i) => `<button class="hg-btn ${a.primary ? 'p' : 's'}" data-i="${i}">${a.label}</button>`).join('')}</div>`, { center: o.center, cls: 'hg-pop' + (art ? ' has-art' : '') + (o.cls ? ' ' + o.cls : '') });
    el._temp = true;
    $$('[data-i]', el).forEach(b => b.onclick = () => { const a = o.actions[+b.dataset.i]; hide(el, !!a.keep); a.run && a.run(); });
    const artEl = $('.hg-art', el); if (artEl) { const src = (o.art || I('r-bookings.webp')), im = new Image(); im.onload = () => { const r = im.naturalHeight / im.naturalWidth; artEl.style.aspectRatio = `${im.naturalWidth} / ${Math.round(im.naturalWidth * Math.min(r, 0.72))}`; }; im.src = src; }
    show(el); return el;
  }

  // Booking lives in a sheet (the original form, moved, so all its logic keeps working)
  const bookSec = $('#book');
  const bookSheet = sheet('', { cls: 'book-sheet' });
  if (bookSec) bookSheet.append(bookSec);
  const openBook = () => { if (openSheet !== bookSheet) show(bookSheet); };

  /* ---------- Hero: cutout centre-stage over a spinning poster ring, dimmed + blurred background ---------- */
  const MOB = innerWidth <= 760, BIG = innerWidth > 1100 ? '-md' : '-sm', CUT = '-md';
  const HIBG = ['wolverine', 'gow', 'sm2', 'acs', 'fc26', 'nr', 'wk'];
  const bgSrc = s => HIBG.includes(s.id) ? I((MOB ? 't-' : 'w-') + s.id + '.webp') : I(s.bg + (s.id === 'wolverine' || s.id === 'gta6' ? '-md' : (MOB ? '-sm' : BIG)) + '.webp');
  const cutSrc = s => I('c-' + (s.cut || s.id) + CUT + '.webp');
  function buildHero() {
    const hx = $('#top > .hgx') || document.createElement('section');
    hx.className = 'hgx'; hx.setAttribute('aria-label', 'Featured games');
    // Separate layers (not per-slide wrappers) so fading never creates a stacking context that lets the ring pass in front.
    hx.innerHTML = `<div class="hgx-layer hgx-bgs">${SLIDES.map((s, i) => `<div class="hgx-bg${s.clear ? ' clear' : ''}${i ? '' : ' on'}"${i ? '' : ` style="background-image:url(${bgSrc(s)})"`}></div>`).join('')}</div>
      <div class="hgx-ring r1"></div>
      <div class="hgx-layer hgx-subs">${SLIDES.map((s, i) => s.pop
        ? `<div class="hgx-pop hgx-subject-w${i ? '' : ' on'}"><img ${i ? 'data-src' : 'src'}="${cutSrc(s)}" alt="" decoding="async"${i ? '' : ' fetchpriority="high"'}></div>`
        : `<img class="hgx-subject hgx-subject-w${i ? '' : ' on'}" ${i ? 'data-src' : 'src'}="${cutSrc(s)}" alt="" decoding="async">`).join('')}</div>
      ${SLIDES.map((s, i) => `<div class="hgx-copy${i ? '' : ' on'}" aria-hidden="${i ? 'true' : 'false'}"><span class="hgx-tag"><i></i>${s.tag}</span>${s.soon ? '<span class="hgx-soon">Coming soon</span>' : ''}<h1>${s.h}</h1>
      <p>PS5 &amp; PS4 by the hour in Indora, Nagpur. Pick a slot, add snacks, walk in and play.</p>
      <div class="hgx-cta"><button class="hg-btn p" data-hg-book>Book a slot${ARW}</button><button class="hg-btn s" data-hg-console>See rates</button></div></div>`).join('')}
      <div class="hgx-progress"></div>`;
    if (!hx.parentNode) $('#top').prepend(hx);
    const bgs = $$('.hgx-bg', hx), subs = $$('.hgx-subject-w', hx), copies = $$('.hgx-copy', hx), prog = $('.hgx-progress', hx);
    const preload = src => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = src; });
    const ready = SLIDES.map(() => null);
    // Fetch + decode a slide's images before showing it, so nothing pops in half-loaded.
    const ensure = i => ready[i] || (ready[i] = Promise.all([preload(bgSrc(SLIDES[i])), preload(cutSrc(SLIDES[i]))].concat(SLIDES[i].pop ? [preload(I(SLIDES[i].pop + '.webp'))] : [])).then(() => {
      if (!bgs[i].style.backgroundImage) bgs[i].style.backgroundImage = `url(${bgSrc(SLIDES[i])})`;
      const im = subs[i].tagName === 'IMG' ? subs[i] : $('img', subs[i]); if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
    }));
    function mkRing(el, ids, n) { const cs = []; for (let i = 0; i < n; i++) { const c = document.createElement('div'); c.className = 'hgx-card'; if (ids) c.style.backgroundImage = `url(${I(ids[i] + '.webp')})`; el.append(c); cs.push(c); } return cs; }
    const ring1 = $('.hgx-ring.r1', hx);
    const N = 9, cards = mkRing(ring1, null, N);
    let auto = 0, drag = 0, cur = 0, t0 = performance.now(), visible = true, R = 0, R2 = 0, step = 0, step2 = 0, busy = false;
    const DUR = 6500;
    function fillRing() { const HERO = SLIDES.map(x => x.id), others = ['re9', 'got', 'ds2', 'er', 'cp', 'rdr2', 'dg', 'sek', 're4'].filter(p => !HERO.includes(p)); cards.forEach((c, i) => { c.style.backgroundImage = `url(${I('p-' + others[(i + cur) % others.length] + '.webp')})`; }); }
    function measure() {
      const w = hx.clientWidth; R = Math.min(w * 0.42, 620); step = Math.PI * 2 / N;
      const cw = Math.max(96, Math.min(170, w * 0.12));
      ring1.style.setProperty('--cw', cw + 'px');
    }
    function place(cs, rot, st, rad) {
      for (let i = 0; i < cs.length; i++) {
        const a = rot + i * st, c = Math.cos(a), s = Math.sin(a), d = (c + 1) / 2;
        cs[i].style.transform = `perspective(1000px) translate3d(${(s * rad).toFixed(1)}px,${(c * -18).toFixed(1)}px,0) rotateY(${(s * -38).toFixed(1)}deg) scale(${(0.62 + d * 0.48).toFixed(3)})`;
        cs[i].style.zIndex = Math.round(d * 100); cs[i].style.filter = d < 0.3 ? `brightness(${(0.55 + d * 1.5).toFixed(2)})` : '';
      }
    }
    function layout() { place(cards, auto + drag, step, R); }
    function go(i) {
      const next = (i + SLIDES.length) % SLIDES.length; if (next === cur || busy) { t0 = performance.now(); return; }
      busy = true; t0 = performance.now(); lastP = 0;
      ensure(next).then(() => requestAnimationFrame(() => {
        const prev = cur; cur = next; fillRing();
        bgs.forEach((b, j) => b.classList.toggle('on', j === cur)); hx.classList.toggle('clr', !!SLIDES[cur].clear);
        subs[prev].classList.remove('on'); subs[prev].classList.add('out');
        setTimeout(() => subs[prev].classList.remove('out'), 700);
        subs[cur].classList.remove('out'); subs[cur].classList.add('on');
        copies.forEach((c, j) => { c.classList.toggle('on', j === cur); c.setAttribute('aria-hidden', j !== cur); });
        t0 = performance.now(); busy = false;
        ensure((cur + 1) % SLIDES.length); // preload the next slide while this one plays
      }));
    }
    hx.classList.toggle('clr', !!SLIDES[0].clear); measure(); fillRing(); layout();
    let sx = null, moved = 0;
    hx.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; sx = e.clientX; moved = 0; });
    addEventListener('pointermove', e => { if (sx == null) return; const dx = e.clientX - sx; sx = e.clientX; moved += dx; drag += dx * 0.01; }, { passive: true });
    addEventListener('pointerup', () => { if (sx == null) return; sx = null; if (Math.abs(moved) > 60) go(cur + (moved < 0 ? 1 : -1)); });
    let rz; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { measure(); layout(); }); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; hx.classList.toggle('paused', !visible); if (visible) { t0 = performance.now() - lastP * DUR; loop(); } }).observe(hx);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) { t0 = performance.now() - lastP * DUR; loop(); } });
    let running = false, lastP = 0;
    function loop() { if (!running) { running = true; requestAnimationFrame(tick); } }
    function tick(now) {
      if (!visible || document.hidden) { running = false; tick.l = 0; return; }
      const dt = Math.min(50, now - (tick.l || now)); tick.l = now; if (!reduce) auto += dt * 0.00018; layout();
      lastP = Math.min(1, (now - t0) / DUR); prog.style.transform = `scaleX(${lastP.toFixed(4)})`;
      if (lastP >= 1 && !reduce) go(cur + 1);
      requestAnimationFrame(tick);
    }
    ensure(0); setTimeout(() => ensure(1), 1200);
    loop();
    window.HG_go = go;
  }

  /* ---------- Games available to play (cutout-on-stage cards) ---------- */
  const GAMES = [
    { id: 'wolverine', name: "Marvel's Wolverine", tag: 'PS5', blurb: 'Brutal, fast melee action as Logan. Best on the big screen with surround sound.' },
    { id: 'gow', name: 'God of War Ragnarök', tag: 'PS5 · PS4', blurb: 'Kratos and Atreus journey across the Nine Realms.' },
    { id: 'gta6', name: 'Grand Theft Auto VI', tag: 'Coming soon · PS5', soon: 1, blurb: 'Jason and Lucia in Vice City. Coming soon; ask at the counter about launch-day slots.' },
    { id: 'sm2', name: "Marvel's Spider-Man 2", tag: 'PS5', blurb: 'Peter and Miles team up against Venom. A PS5 showcase.' },
    { id: 'acs', name: "Assassin's Creed Shadows", tag: 'PS5', blurb: 'Naoe and Yasuke in feudal Japan. Stealth or steel, your call.' },
    { id: 'fc26', name: 'EA SPORTS FC 26', tag: 'PS5 · PS4', blurb: 'Bring a friend and settle it on the pitch.' },
    { id: 'nr', name: 'Elden Ring Nightreign', tag: 'PS5 · PS4', blurb: 'Three-player co-op runs against the night.' },
    { id: 'wk', name: 'Black Myth: Wukong', tag: 'PS5', blurb: 'Mythic boss fights as the Destined One.' },
    { id: 're9', name: 'Resident Evil Requiem', tag: 'PS5', blurb: 'Survival horror at its finest. Lights off, headphones on.' },
    { id: 'got', name: 'Ghost of Tsushima', tag: 'PS5 · PS4', blurb: 'Jin Sakai defends Tsushima. Gorgeous on PS5.' },
    { id: 'ds2', name: 'Death Stranding 2', tag: 'PS5', blurb: "Hideo Kojima's journey across a broken world." },
    { id: 'bo7', name: 'Call of Duty: Black Ops 7', tag: 'PS5 · PS4', blurb: 'Campaign, multiplayer and Zombies. Squad up.' },
  ];
  const SPOT = ['gow', 'gta6', 'acs', 'got', 'nr', 'wk', 'sm2', 'wolverine'];
  function buildGames() {
    const sec = document.createElement('section');
    sec.className = 'section hg-games'; sec.id = 'games'; sec.setAttribute('aria-labelledby', 'games-title');
    const sp = SPOT.map(id => GAMES.find(g => g.id === id));
    sec.innerHTML = `<div class="hg-games-in"><p class="hg-eyebrow rv">On our consoles</p><h2 id="games-title" class="rv">Games available to play</h2>
      <p class="hg-games-sub rv">Featured this week. Swipe the shelf for everything else.</p>
      <div class="hg-cf rv" aria-roledescription="carousel" aria-label="Featured games">
        <div class="hg-cf-bg">${sp.map((g, i) => `<span data-bg="${I('k-' + g.id + '.webp')}"${i ? '' : ' class="on" style="background-image:url(' + I('k-' + g.id + '.webp') + ')"'}></span>`).join('')}</div>
        <div class="hg-cf-stage">${sp.map((g, i) => `<button class="hg-cf-card" data-i="${i}" aria-label="${g.name}"><img src="${I('p-' + g.id + '.webp')}" alt="" decoding="sync"><img class="rf" src="${I('p-' + g.id + '.webp')}" alt="" decoding="sync"><i class="sh"></i></button>`).join('')}</div>
        <div class="hg-cf-info">${sp.map((g, i) => `<div class="hg-cf-t${i ? '' : ' on'}"><div class="hg-cf-chips"><span>${g.tag}</span>${g.soon ? (/soon/i.test(g.tag) ? '' : '<span class="y">Coming soon</span>') : `<span>Up to 4 players</span><span>From ₹${/PS4/.test(g.tag) ? 75 : 100} / player / hr</span>`}</div><h3>${g.name}</h3><p>${g.blurb}</p></div>`).join('')}
          <div class="hg-cf-row"><button class="hg-btn p hg-cf-go" data-game="${sp[0].id}">Book this game${ARW}</button>
          <div class="hg-cf-dial" aria-hidden="true"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="p" cx="22" cy="22" r="19" pathLength="1"/></svg><b>01</b><small>/${String(sp.length).padStart(2, '0')}</small></div></div></div>
      </div>
      <div class="hg-shelf rv" tabindex="0" aria-label="All games">${GAMES.map(g => `<button class="hg-post" data-game="${g.id}" aria-label="${g.name}"><span class="pi"><img loading="lazy" decoding="async" src="${I('p-' + g.id + '.webp')}" alt="">${g.soon ? '<span class="soon">Coming soon</span>' : ''}</span><b>${g.name}</b><small>${g.tag}</small></button>`).join('')}</div></div>`;
    const after = $('#how') || $('#consoles');
    after ? after.after(sec) : $('#top').append(sec);
    sec.addEventListener('click', e => { const b = e.target.closest('[data-game]'); if (b) gamePopup(GAMES.find(g => g.id === b.dataset.game)); });
    const cf = $('.hg-cf', sec), cs = $$('.hg-cf-card', cf), bgs = $$('.hg-cf-bg span', cf), ts = $$('.hg-cf-t', cf), go = $('.hg-cf-go', cf), dial = $('.hg-cf-dial', cf), n = cs.length;
    let pos = 0, vel = 0, target = 0, cur = 0, drag = null, last = 0, t0 = performance.now(), vis = false, raf = 0;
    const wrap = x => ((x % n) + n) % n;
    const setCur = i => { if (i === cur) return; cur = i;
      bgs.forEach((b, j) => { if (j === i && b.dataset.bg) { b.style.backgroundImage = `url(${b.dataset.bg})`; delete b.dataset.bg; } b.classList.toggle('on', j === i); });
      ts.forEach((t, j) => t.classList.toggle('on', j === i)); go.dataset.game = SPOT[i]; const g = GAMES.find(x => x.id === SPOT[i]);
      go.className = 'hg-btn ' + (g.soon ? 's' : 'p') + ' hg-cf-go'; go.innerHTML = (g.soon ? 'Ask about launch day' : 'Book this game') + ARW; $('b', dial).textContent = String(i + 1).padStart(2, '0'); };
    function render() {
      const W = cf.clientWidth, cw = Math.min(W * 0.5, 260);
      cs.forEach((c, i) => { let o = i - pos; o -= Math.round(o / n) * n; const a = Math.abs(o);
        c.style.transform = `perspective(1100px) translate3d(${(Math.sign(o) * Math.min(a, 1) * cw * 0.62 + o * cw * 0.2).toFixed(1)}px,0,0) rotateY(${(-Math.max(-1, Math.min(1, o)) * 48).toFixed(1)}deg) scale(${(1 - Math.min(a, 1) * 0.22 - Math.max(0, Math.min(a, 3) - 1) * 0.08).toFixed(3)})`;
        c.style.zIndex = 100 - Math.round(a * 10); c.style.opacity = a > 3.4 ? '0' : '1'; c.classList.toggle('on', a < 0.5); $('.sh', c).style.opacity = Math.min(1, a * 0.55).toFixed(2); });
      setCur(wrap(Math.round(pos)));
    }
    function tick(now) {
      raf = 0; const dt = Math.min(48, now - (last || now)); last = now;
      if (drag == null) { const k = 1 - Math.pow(0.0009, dt / 1000 * 4); pos += (target - pos) * k; }
      render();
      const p = reduce ? 0 : Math.min(1, (now - t0) / 5600); $('.p', dial).style.strokeDashoffset = (1 - p).toFixed(4);
      if (p >= 1 && drag == null && vis) { target = Math.round(target) + 1; t0 = now; }
      if (vis && !document.hidden) raf = requestAnimationFrame(tick); else last = 0;
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) { t0 = performance.now(); kick(); } }).observe(cf);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && vis) kick(); });
    let sx = 0, lx = 0, lt = 0, moved = 0;
    cf.addEventListener('pointerdown', e => { if (e.target.closest('.hg-cf-info')) return; drag = pos; sx = lx = e.clientX; lt = performance.now(); vel = 0; moved = 0; kick(); });
    addEventListener('pointermove', e => { if (drag == null) return; const now = performance.now(), dx = e.clientX - lx; vel = dx / Math.max(1, now - lt); lx = e.clientX; lt = now; moved = e.clientX - sx;
      pos = drag - moved / (cf.clientWidth * 0.42); kick(); }, { passive: true });
    addEventListener('pointerup', () => { if (drag == null) return; drag = null; target = Math.round(pos - vel * 2.2); t0 = performance.now(); kick(); });
    cs.forEach((c, i) => c.addEventListener('click', e => { e.stopPropagation(); if (Math.abs(moved) > 8) return; let o = i - pos; o -= Math.round(o / n) * n;
      if (Math.abs(o) < 0.5) gamePopup(GAMES.find(g => g.id === SPOT[i])); else { target = Math.round(pos + o); t0 = performance.now(); kick(); } }));
    $$('img', cf).forEach(im => im.decode && im.decode().catch(() => {}));
    render();
  }
  function gamePopup(g) {
    window.HG_lastGame = g.name;
    popup({ art: I('k-' + g.id + '.webp'), cls: 'g-' + g.id, icon: g.soon ? IC.clock() : IC.pad(), title: g.name, text: g.soon ? `${g.blurb}` : `${g.blurb} PS5 ₹100 / PS4 ₹75 per player per hour.`,
      extra: `<div class="hg-chips"><span>${g.tag.replace('Coming soon · ', '')}</span>${g.soon ? '<span class="y">Coming soon</span>' : '<span>Up to 4 players</span>'}</div>`,
      actions: g.soon ? [{ label: 'Close' }, { label: `Live consoles${ARW}`, primary: true, run: () => $('#live').scrollIntoView({ behavior: 'smooth' }) }]
        : [{ label: 'Live status', run: () => $('#live').scrollIntoView({ behavior: 'smooth' }) }, { label: `Book this game${ARW}`, primary: true, keep: true, run: openBook }] });
  }

  /* ---------- Bottom nav ---------- */
  const ico = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    pad: '<path d="M7 7h10a5 5 0 0 1 4.9 6l-.8 4a2.5 2.5 0 0 1-4.4 1L15 16H9l-1.7 2a2.5 2.5 0 0 1-4.4-1l-.8-4A5 5 0 0 1 7 7z"/><path d="M8 10v3M6.5 11.5h3"/><circle cx="15.5" cy="11" r=".6"/><circle cx="17" cy="12.6" r=".6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    snack: '<path d="M7 3h10l1 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7z"/><path d="M6 8h12"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    house: '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>',
    dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
  };
  const svg = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  function buildNav() {
    const n = document.createElement('nav'); n.className = 'hg-nav'; n.setAttribute('aria-label', 'App');
    n.innerHTML = `<a href="#top" data-sec="top" class="on">${svg(ico.home)}Home</a>
      <a href="#control" data-route="control" data-sec="live">${IC.live(22)}Live</a>
      <button class="fab" data-hg-book aria-label="Book a slot"><span class="b">${svg(ico.plus)}</span>Book</button>
      <button data-hg-snacks data-sec="snacks">${svg(ico.snack)}Snacks</button>
      <button data-hg-account>${svg(ico.user)}<span data-acct-label>Login</span></button>`;
    document.body.append(n);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('[data-sec]', n).forEach(a => a.classList.toggle('on', a.dataset.sec === e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'live', 'rent', 'snacks', 'visit'].forEach(id => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- Popups for every action ---------- */
  const CONS = { ps5: { n: 'PS5', r: 100, img: 'card-06.webp', d: '4K graphics, DualSense haptics, fast loading.' }, ps4: { n: 'PS4', r: 75, img: 'card-02.webp', d: 'Huge library of classics. Best value for groups.' } };
  function consolePopup(id) {
    const c = CONS[id];
    popup({ art: I(id === 'ps5' ? 'r-ps5.webp' : 'r-ps4.webp'), icon: id === 'ps5' ? IC.bolt() : IC.pad(), title: `${c.n} · ₹${c.r} per player / hour`, text: c.d,
      extra: liveChips(id),
      actions: [{ label: 'Not now' }, { label: `Book ${c.n}${ARW}`, primary: true, keep: true, run: () => document.querySelector(`[data-pick="${id}"]`)._hgReal() }] });
  }
  function chooseConsole() {
    popup({ art: I('r-choose.webp'), icon: IC.joy(), title: 'Pick your console', text: 'Rates are per player, per hour. Up to 4 players.', extra: liveChips(),
      actions: [{ label: 'PS4 · ₹75', keep: true, run: () => consolePopup('ps4') }, { label: 'PS5 · ₹100', primary: true, keep: true, run: () => consolePopup('ps5') }] });
  }
  function rentPopup(real) {
    popup({ art: I('r-rent.webp'), icon: IC.home(), title: 'Take a PS5 home', text: '₹1,000 for 12 hours with 2 controllers. Extra controller ₹200 (up to 4). ₹1,000 refundable deposit. Pick up and return at the shop.',
      actions: [{ label: 'Cancel' }, { label: `Rent a PS5${ARW}`, primary: true, keep: true, run: real }] });
  }
  function snackAdded(name, qty, price) {
    popup({ art: I('r-snack.webp'), icon: name.startsWith('Chips') ? IC.chips() : IC.drink(), title: `${name} added`, text: `${qty} in your booking · ₹${price} each. Pay together with your slot.`,
      actions: [{ label: 'Keep browsing' }, { label: `View booking${ARW}`, primary: true, keep: true, run: openBook }] });
  }
  function snacksPopup() {
    popup({ art: I('r-snacks.webp'), icon: IC.snack(), title: 'Snacks & drinks', text: 'Add them to your booking and pay for everything together.',
      actions: [{ label: '+ Chips ₹50', keep: true, run: () => $('[data-add="chips50"]').click() }, { label: '+ Cold drink ₹40', primary: true, keep: true, run: () => $('[data-add="drink"]').click() }] });
  }
  function wireActions() {
    // Console + rent buttons: popup first, then the original handler
    $$('[data-pick]').forEach(b => {
      const clone = b.cloneNode(true); b.replaceWith(clone); // drop direct handler; re-dispatch through it below
      clone._hgReal = () => { b.click(); };
      clone.addEventListener('click', () => consolePopup(clone.dataset.pick));
    });
    $$('[data-rent]').forEach(b => {
      const clone = b.cloneNode(true); b.replaceWith(clone);
      clone.addEventListener('click', () => rentPopup(() => b.click()));
    });
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-hg-orders],[data-hg-book],[data-hg-console],[data-hg-snacks],[data-hg-account],[data-hg-app]');
      if (!t) return; e.preventDefault();
      if (t.matches('[data-hg-orders]')) { HG.hide && HG.hide(); location.hash = 'orders'; }
      else if (t.matches('[data-hg-book]')) { const g = document.querySelector('[data-go-book]'); g ? g.click() : openBook(); }
      else if (t.matches('[data-hg-console]')) chooseConsole();
      else if (t.matches('[data-hg-snacks]')) snacksPopup();
      else if (t.matches('[data-hg-account]')) accountPopup();
      else if (t.matches('[data-hg-app]')) appPopup();
    });
  }

  /* ---------- Login ---------- */
  function buildLogin() {
    const L = document.createElement('div'); L.className = 'hg-login'; L.setAttribute('role', 'dialog'); L.setAttribute('aria-label', 'Login');
    const col = k => { const set = [0, 1, 2, 3, 4, 5].map(j => POSTERS[(k + j * 2) % POSTERS.length]); return `<div class="hgl-col"><div class="hgl-track">${[...set, ...set].map(s => `<img src="${s}" alt="" decoding="sync">`).join('')}</div></div>`; };
    const SH = ['<path d="M12 4 21 20H3z"/>', '<circle cx="12" cy="12" r="9"/>', '<path d="M5 5l14 14M19 5 5 19"/>', '<rect x="4" y="4" width="16" height="16" rx="1"/>'];
    const glyphs = SH.flatMap(g => [g, g, g]).map((g, i) => `<span style="left:${(i * 37) % 100}%;animation-duration:${14 + (i * 7) % 16}s;animation-delay:-${(i * 3) % 14}s;width:${18 + (i * 11) % 30}px"><svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5">${g}</svg></span>`).join('');
    L.innerHTML = `<div class="hgl-bg" style="background-image:url(${I('wolverine-bg-sm.webp')})"></div>
      <div class="hgl-cols">${[0, 3, 6, 9].map(col).join('')}</div><div class="hgl-shade"></div><div class="hgl-glyphs">${glyphs}</div>
      <form class="hgl-card" novalidate>
        <div class="hgl-brand"><img src="${LOGO}" alt="">HUNTER GAMERS</div>
        <h2>Press start.<br><em>Enter the arena.</em></h2>
        <p class="sub">Save your name &amp; number once, book any slot in two taps.</p>
        <div class="hgl-field"><label for="hglName">Gamer name</label><input id="hglName" autocomplete="name" required></div>
        <div class="hgl-field"><label for="hglPhone">Mobile number</label><input id="hglPhone" inputmode="numeric" autocomplete="tel-national" maxlength="10" required></div>
        <div class="hgl-err" aria-live="polite"></div>
        <button class="hg-btn p" type="submit">${IC.play()} Start playing</button>
        <div class="hgl-or">or</div>
        <button class="hg-btn s" type="button" data-guest>Continue as guest</button>
      </form>`;
    document.body.append(L);
    const bgs = ['wolverine-bg', 'gta6-bg', 'spidey2-bg', 'gta6-jason-bg', 'miles-bg'].map(b => b + '-sm.webp');
    let bi = 0; setInterval(() => { if (L.classList.contains('on')) $('.hgl-bg', L).style.backgroundImage = `url(${I(bgs[++bi % bgs.length])})`; }, 5000);
    $$('.hgl-col img', L).forEach(im => im.decode && im.decode().catch(() => {}));
    const f = $('form', L), err = $('.hgl-err', L);
    $('#hglPhone', L).addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10));
    f.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#hglName', L).value.trim(), phone = $('#hglPhone', L).value;
      if (name.length < 2) { err.textContent = 'Enter your name (at least 2 letters).'; return; }
      if (!/^[6-9]\d{9}$/.test(phone)) { err.textContent = 'Enter a valid 10-digit Indian mobile number.'; return; }
      store.set('user', { name, phone }); fillUser(); closeLogin();
    });
    $('[data-guest]', L).onclick = () => { store.set('guest', true); closeLogin(); };
    return L;
  }
  let loginEl;
  function openLogin() { loginEl.classList.add('on'); document.body.classList.add('hg-lock'); }
  function closeLogin() { loginEl.classList.remove('on'); document.body.classList.remove('hg-lock'); afterLogin(); }
  function fillUser() {
    const u = store.get('user'); const lab = $('[data-acct-label]');
    if (lab) lab.textContent = u ? u.name.split(' ')[0] : 'Login';
    if (!u) return;
    [['#name', u.name], ['#phone', u.phone]].forEach(([s, v]) => { const el = $(s); if (el && !el.value) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } });
  }
  function accountPopup() {
    const u = store.get('user');
    if (!u) return openLogin();
    popup({ art: I('r-account.webp'), icon: IC.user(), title: `Hi, ${u.name}`, text: `Bookings are filled with +91 ${u.phone}.`,
      extra: `<button class="hg-linkrow" data-hg-orders>${IC.list(20)}<span><b>My bookings</b><small>${orders().length ? orders().length + ' saved on this phone' : 'Nothing yet'}</small></span>${IC.right()}</button>`,
      actions: [{ label: 'Log out', run: () => { localStorage.removeItem('hg.user'); fillUser(); } }, { label: `Book a slot${ARW}`, primary: true, keep: true, run: () => { fillUser(); openBook(); } }] });
  }

  /* ---------- Cookies ---------- */
  function buildCookie() {
    const c = document.createElement('div'); c.className = 'hg-cookie'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'Cookie preferences');
    c.innerHTML = `<div class="top"><div class="ck">${IC.cookie(28)}</div><div><h4>Cookies, but make it gaming</h4>
      <p>We use essential storage to keep you logged in and remember your booking. With your OK we also measure which pages help players book.</p></div></div>
      <div class="prefs"><label>Essential (always on)<input type="checkbox" class="hg-tog" checked disabled></label>
      <label>Analytics<input type="checkbox" class="hg-tog" data-k="analytics"></label>
      <label>Personalised offers<input type="checkbox" class="hg-tog" data-k="offers"></label></div>
      <div class="hg-row"><button class="hg-btn s" data-c="essential">Essential only</button><button class="hg-btn p" data-c="all">Accept all</button></div>
      <button class="hg-linkbtn" data-c="more">Customise</button>`;
    document.body.append(c);
    c.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      const k = b.dataset.c;
      if (k === 'more') { if (c.classList.toggle('more')) b.textContent = 'Save my choices'; else save(Object.fromEntries($$('[data-k]', c).map(t => [t.dataset.k, t.checked]))); return; }
      save(k === 'all' ? { analytics: true, offers: true } : { analytics: false, offers: false });
    });
    function save(v) { store.set('consent', { ...v, at: Date.now() }); c.classList.remove('on'); setTimeout(maybeApp, 600); }
    return c;
  }

  /* ---------- App download ---------- */
  function appPopup() {
    popup({ art: I('r-app.webp'), icon: `<img src="${LOGO}" alt="Hunter Gamers" style="width:46px">`, title: 'Get the Hunter Game app', text: 'Book slots faster, keep your login, and get the full-screen experience on Android.',
      extra: `<p style="font-size:12px">Android 7+ · about 6 MB · allow "install unknown apps" when asked.</p>`,
      actions: [{ label: 'Maybe later', run: () => store.set('appAsked', Date.now()) }, { label: `${IC.dl()} Download APK`, primary: true, run: () => { store.set('appAsked', Date.now()); location.href = '/downloads/hunter-game.apk'; } }] });
  }
  function maybeApp() {
    if (IN_APP || !IS_ANDROID) return;
    const t = store.get('appAsked'); if (t && Date.now() - t < 3 * 864e5) return;
    if (loginEl.classList.contains('on') || openSheet) return;
    appPopup();
  }
  function addAppLinks() {
    if (IN_APP) return;
    const a = `<a class="hg-dl-link" href="/downloads/hunter-game.apk" data-hg-app>${svg(ico.dl).replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"')}Get the app</a>`;
    const nav = $('.nav-links'); nav && nav.insertAdjacentHTML('beforeend', a);
    const ff = $('.foot-links'); ff && ff.insertAdjacentHTML('beforeend', a);
  }

  function afterLogin() { if (!store.get('consent')) setTimeout(() => cookieEl.classList.add('on'), 500); else setTimeout(maybeApp, 900); }

  /* ---------- Live console status: 3 x PS5, 2 x PS4 ----------
     Data layer: GET {API_URL}/api/status every 15 s once the booking server is live.
     Expected JSON: { updated, consoles: [{ id, type: 'ps5'|'ps4', name, queue: [{ start, end, players }] }] } (ms timestamps).
     Until then a clearly labelled DEMO schedule is generated on the device so the board can be seen working. */
  const LIVE = { data: null, demo: true, subs: [] };
  const RIG = [{ id: 'P1', type: 'ps5', name: 'PS5 · 1' }, { id: 'P2', type: 'ps5', name: 'PS5 · 2' }, { id: 'P3', type: 'ps5', name: 'PS5 · 3' }, { id: 'P4', type: 'ps4', name: 'PS4 · 1' }, { id: 'P5', type: 'ps4', name: 'PS4 · 2' }];
  const OPEN_H = 10, CLOSE_H = 22;
  function demoStatus() {
    const d = new Date(); d.setHours(0, 0, 0, 0); const day = d.getTime(), seed = d.getDate() * 31 + d.getMonth();
    const hash = (a, b) => { let x = (seed * 374761393 + a * 668265263 + b * 2246822519) >>> 0; x = (x ^ (x >>> 13)) * 1274126177 >>> 0; return ((x ^ (x >>> 16)) >>> 0) % 100; };
    const consoles = RIG.map((c, k) => {
      const q = []; const off = ((k * 17) % 4) * 10; // sessions start at :00, :10, :20 or :30
      for (let h = OPEN_H; h < CLOSE_H; h++) {
        if (hash(k, h) < (h >= 17 ? 62 : 38)) {
          const len = hash(h, k) < 30 ? 2 : 1, s = day + (h * 60 + off) * 6e4, e = Math.min(s + len * 36e5, day + CLOSE_H * 36e5);
          q.push({ start: s, end: e, players: 1 + hash(k + 9, h) % 4 }); h += len - 1;
        }
      }
      return { ...c, queue: q };
    });
    return { updated: Date.now(), demo: true, consoles };
  }
  function derive(c, now) {
    const q = c.queue.filter(b => b.end > now).sort((a, b) => a.start - b.start), cur = q.find(b => b.start <= now);
    const nxt = q.filter(b => b !== cur);
    let free = cur ? cur.end : now; for (const b of nxt) { if (b.start <= free + 6e4) free = Math.max(free, b.end); else break; }
    const st = cur ? 'playing' : nxt[0] && nxt[0].start - now < 30 * 6e4 ? 'reserved' : 'free';
    return { ...c, st, cur, nxt, free };
  }
  function feedSlots(data) {
    const B = window.HG_BOOK; if (!B || B.API_READY) return; // the real server supplies its own availability
    const today = B.dayDate(0), t0 = today.getTime(), used = { ps5: {}, ps4: {} };
    data.consoles.forEach(c => c.queue.forEach(b => { for (let h = OPEN_H; h < CLOSE_H; h++) { const hs = t0 + h * 36e5; if (b.start < hs + 36e5 && b.end > hs) used[c.type][h] = (used[c.type][h] || 0) + 1; } }));
    B.setAvail(B.dkey(today), { units: { ps5: 3, ps4: 2 }, used, demo: true });
  }
  async function pull() {
    const B = window.HG_BOOK; let d = null;
    if (B && B.API_READY) { try { const r = await fetch(B.API_URL + '/api/status', { cache: 'no-store' }); if (r.ok) d = await r.json(); } catch {} }
    LIVE.demo = !d; LIVE.data = d || demoStatus(); feedSlots(LIVE.data); LIVE.subs.forEach(f => f());
  }
  const tfmt = t => new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toUpperCase();
  const left = ms => { const m = Math.max(0, Math.ceil(ms / 6e4)); return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m} min`; };
  function liveChips(type) {
    if (!LIVE.data) return '';
    const now = Date.now(), cs = LIVE.data.consoles.filter(c => !type || c.type === type).map(c => derive(c, now)), f = cs.filter(c => c.st === 'free').length;
    const nf = Math.min(...cs.map(c => c.free));
    return `<div class="hg-chips"><span class="g"><i></i>${f} of ${cs.length} free now</span><span>Next free ${nf <= now ? 'now' : tfmt(nf)}</span>${LIVE.demo ? '<span class="d">Demo data</span>' : ''}</div>`;
  }
  function buildLive() {
    const sec = document.createElement('section'); sec.className = 'section hg-live hg-live-teaser'; sec.id = 'live'; sec.setAttribute('aria-labelledby', 'live-title');
    sec.innerHTML = `<div class="hg-games-in"><button class="hg-lt" data-route="control" aria-label="Open the live control room">
      <span class="hg-lt-top"><span class="hg-eyebrow">${IC.live(14)} Live at the shop</span><span class="hg-lt-demo" hidden>Demo</span></span>
      <h2 id="live-title">Console status</h2>
      <span class="hg-lt-st">${RIG.map(r => `<i data-id="${r.id}"><em></em><small>${r.name.replace(' · ', ' ')}</small></i>`).join('')}</span>
      <span class="hg-lt-sum"></span><span class="hg-lt-go">Open control room${ARW}</span></button></div>`;
    const anchor = $('#games') || $('#consoles'); anchor.after(sec);
    function draw() {
      if (!LIVE.data) return; const now = Date.now(), cs = LIVE.data.consoles.map(c => derive(c, now));
      { const d = $('.hg-lt-demo', sec); if (d) d.hidden = !LIVE.demo; }
      cs.forEach(c => { const el = $(`[data-id="${c.id}"]`, sec); if (el) el.dataset.st = c.st; });
      const fr = cs.filter(c => c.st === 'free').length, nf = Math.min(...cs.map(c => c.free));
      $('.hg-lt-sum', sec).innerHTML = `<b>${fr}</b> free now<span></span>${fr ? 'Walk in and play' : `Next free <b>${tfmt(nf)}</b>`}`;
      CTRL.draw && CTRL.draw();
    }
    LIVE.subs.push(draw);
    pull(); setInterval(() => { if (!document.hidden) pull(); }, 15000);
    setInterval(() => { if (!document.hidden) draw(); }, 1000);
  }

  /* ---------- Pages (hash routes: #control, #orders) ---------- */
  const CTRL = {};
  const page = (() => { const p = document.createElement('div'); p.className = 'hg-page'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true'); document.body.append(p); return p; })();
  const ROUTES = { control: renderControl, orders: renderOrders };
  function route() {
    const r = location.hash.slice(1);
    if (ROUTES[r]) { ROUTES[r](); page.scrollTop = 0; page.classList.add('on'); document.documentElement.classList.add('hg-paged'); }
    else { page.classList.remove('on'); document.documentElement.classList.remove('hg-paged'); CTRL.draw = null; }
  }
  addEventListener('hashchange', route);
  document.addEventListener('click', e => { const r = e.target.closest('[data-route]'); if (r) { e.preventDefault(); HG.hide && HG.hide(); location.hash = r.dataset.route; } });
  page.addEventListener('click', e => { if (e.target.closest('[data-back]')) { history.length > 1 && /#(control|orders)/.test(location.hash) ? history.back() : (location.hash = ''); } });
  const pageHead = (art, icon, title, text) => `<header class="hg-ph"><div class="hg-art" style="background-image:url(${art})"></div>
    <button class="hg-ph-back" data-back aria-label="Back">${IC.left()}</button><div class="hg-ph-t"><span class="hg-ic">${icon}</span><h1>${title}</h1><p>${text}</p></div></header>`;

  function renderControl() {
    const ART = { P1: 'k-gow', P2: 'k-acs', P3: 'k-nr', P4: 'k-got', P5: 'k-wk' };
    page.innerHTML = `<div class="hg-pg hg-ctl">${pageHead(I('r-ctl.webp'), IC.live(26), 'Control room', '3 PS5 and 2 PS4 at Hunter Gamers, Indora. Live status, time left and the next free slot for every console.')}
      <div class="hg-pg-in"><p class="hg-demo hg-ctl-demo" hidden>Demo data: the live feed switches on with the booking server.</p>
      <p class="hg-cs-sum"></p>
      <div class="hg-cs">${RIG.map(r => `<article class="hg-cs-c" data-id="${r.id}"><div class="bg" style="background-image:url(${I(ART[r.id] + '.webp')})"></div>
        <div class="tx"><span class="tag"><i></i><b class="st"></b></span><h3>${r.name}</h3>
        <dl><div><dt>Time left</dt><dd class="tl"></dd></div><div><dt>Next free</dt><dd class="nf"></dd></div><div><dt>Queue</dt><dd class="qc"></dd></div></dl></div></article>`).join('')}</div>
      <p class="hg-live-upd"></p>
      <button class="hg-btn p hg-pg-cta" data-hg-book>Book a slot${ARW}</button></div></div>`;
    CTRL.draw = () => {
      if (!LIVE.data) return; const now = Date.now(), cs = LIVE.data.consoles.map(c => derive(c, now));
      { const d = $('.hg-ctl-demo', page); if (d) d.hidden = !LIVE.demo; }
      const fr = cs.filter(c => c.st === 'free').length;
      $('.hg-cs-sum', page).innerHTML = `<b>${fr} of ${cs.length}</b> consoles free right now`;
      cs.forEach(c => { const el = $(`.hg-cs-c[data-id="${c.id}"]`, page); el.dataset.st = c.st;
        $('.st', el).textContent = { free: 'Free', playing: 'Playing', reserved: 'Reserved' }[c.st];
        $('.tl', el).textContent = c.cur ? left(c.cur.end - now) : '—';
        $('.nf', el).textContent = c.free <= now ? 'Now' : tfmt(c.free);
        const q = c.nxt.length; $('.qc', el).textContent = q ? `${q} booking${q > 1 ? 's' : ''}` : 'None'; });
      $('.hg-live-upd', page).textContent = `Updated ${tfmt(LIVE.data.updated || now)} · refreshes every 15 s`;
    };
    CTRL.draw();
  }


  function renderOrders(filter = 'all') {
    const now = Date.now(), CN = { ps5: 'PS5', ps4: 'PS4' };
    const when = o => { const [y, m, d] = (o.date || '1970-01-01').split('-').map(Number); return new Date(y, m - 1, d, o.start || 0).getTime(); };
    const cat = o => /cancel/i.test(o.status || '') ? 'cancelled' : when(o) + (o.hours || 1) * 36e5 > now ? 'upcoming' : 'completed';
    const all = orders(), list = all.filter(o => filter === 'all' || cat(o) === filter);
    const poster = o => { const g = GAMES.find(g => g.name === o.game); return g ? I('p-' + g.id + '.webp') : null; };
    const live = all.filter(o => cat(o) !== 'cancelled'), spent = live.reduce((s, o) => s + Number(o.amount || 0), 0), hrs = live.reduce((s, o) => s + Number(o.hours || 0), 0);
    page.innerHTML = `<div class="hg-pg hg-oh">${pageHead(I('r-bookings.webp'), IC.list(26), 'Order history', 'Every booking made on this phone, with codes for the counter.')}
      <div class="hg-pg-in"><div class="hg-ctl-sum"><span><b>${all.length}</b>Bookings</span><span><b>${hrs}</b>Hours</span><span class="r"><b>₹${spent.toLocaleString('en-IN')}</b>Spent</span></div>
      <div class="hg-filt" role="tablist">${[['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Completed'], ['cancelled', 'Cancelled']].map(([k, l]) => `<button role="tab" data-f="${k}" class="${k === filter ? 'on' : ''}" aria-selected="${k === filter}">${l}<em>${k === 'all' ? all.length : all.filter(o => cat(o) === k).length}</em></button>`).join('')}</div>
      ${list.length ? `<ul class="hg-oc">${list.map(o => { const c = cat(o), p = poster(o), d = new Date(when(o));
        return `<li data-c="${c}"><span class="th"${p ? ` style="background-image:url(${p})"` : ''}>${p ? '' : IC.pad(26)}</span><div class="bd">
          <div class="r1"><b>${o.game || (o.kind === 'rental' ? 'PS5 home rental' : 'Gaming session')}</b><span class="s ${c}">${c === 'upcoming' ? 'Upcoming' : c === 'cancelled' ? 'Cancelled' : 'Completed'}</span></div>
          <small>${CN[o.console] || ''} · ${o.hours} h · ${o.players ? o.players + ' players · ' : ''}${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${tfmt(d)}</small>
          <div class="r2"><code>#${o.code || '—'}</code><b>₹${Number(o.amount || 0).toLocaleString('en-IN')}</b><button class="hg-btn s" data-hg-book>Rebook</button></div></div></li>`; }).join('')}</ul>`
      : `<div class="hg-empty hg-oh-empty">${IC.pad(46)}<b>${filter === 'all' ? 'No bookings yet' : 'Nothing here'}</b><span>${filter === 'all' ? 'Book your first slot and it will show up here with game, console, time and amount.' : 'No ' + filter + ' bookings on this phone.'}</span><button class="hg-btn p" data-hg-book>Book a slot${ARW}</button></div>`}
      </div></div>`;
    $$('[data-f]', page).forEach(b => b.onclick = () => renderOrders(b.dataset.f));
  }


  /* ---------- Official PS5 hardware strip (Sony Interactive press images) ---------- */
  const FEATS = [
    { id: 'sm2', img: 'c-spidey-feature.webp', alt: 'Spider-Man', kick: "Marvel's Spider-Man 2 · PS5", h: 'Suit up. <span>Swing in.</span>', p: 'Play the full campaign on our PS5s, at the shop, by the hour.', glow: '251,36,28' },
    { id: 'gow', img: 'f-kratos.webp', alt: 'Kratos and Atreus', kick: 'God of War · PS5 · PS4', h: 'Father. <span>Son. War.</span>', p: 'Kratos and Atreus take on the Norse realms. Big screen, surround sound, controller in hand.', glow: '64,156,255' },
    { id: 'got', img: 'f-jin.webp', alt: 'Jin Sakai', kick: "Ghost of Tsushima Director's Cut · PS5 · PS4", h: 'Become <span>the Ghost.</span>', p: 'Draw your blade as Jin Sakai in feudal Japan. Stunning on our PS5s.', glow: '232,176,74' },
    { id: 'smm', img: 'f-miles.webp', alt: 'Miles Morales', kick: "Marvel's Spider-Man: Miles Morales · PS5", h: 'Be yourself. <span>Be Spider-Man.</span>', p: 'Venom blasts, camouflage and Harlem at Christmas. Swing by for a session.', glow: '160,82,255' },
  ];
  function buildFeature() {
    let at = $('#games'); if (!at) return;
    FEATS.forEach((f, i) => {
      const d = document.createElement('section'); d.className = 'hg-feat' + (i % 2 ? ' alt' : ''); d.style.setProperty('--glow', f.glow); d.setAttribute('aria-label', f.alt);
      d.innerHTML = `<div class="hg-feat-in"><img class="hg-feat-cut" src="${I(f.img)}" alt="${f.alt}" loading="lazy" decoding="async">
        <div class="hg-feat-txt"><p class="hg-eyebrow">${f.kick}</p><h2>${f.h}</h2>
        <p>${f.p}</p><button class="hg-btn p" data-feat="${f.id}">Book this game${ARW}</button></div></div>`;
      at.after(d); at = d;
      d.addEventListener('click', e => { if (!e.target.closest('[data-feat]')) return; const g = GAMES.find(x => x.id === f.id); g ? gamePopup(g) : openBook(); });
    });
  }
  function buildHardware() {
    const c = $('#consoles'); if (!c) return;
    const d = document.createElement('div'); d.className = 'hg-hw';
    d.innerHTML = [['x-ps5.webp', 'PS5', 'Fast SSD loading, 3D audio.', 'cut'], ['x-dualsense.webp', 'DualSense', 'Haptics you can feel.', 'cut']]
      .map(([img, t, p, cut]) => `<figure class="rv${cut ? ' cut' : ''}"><img loading="lazy" decoding="async" src="${I(img)}" alt="${t}"><figcaption><b>${t}</b><span>${p}</span></figcaption></figure>`).join('');
    ($('.wrap', c) || c).append(d);
  }

  /* ---------- Order history (stored on this phone until the booking server keeps accounts) ---------- */
  const orders = () => store.get('orders') || [];
  window.HG_saveOrder = o => { const a = orders(); a.unshift(o); store.set('orders', a.slice(0, 50)); };
  function ordersPopup() {
    const a = orders(), CN = { ps5: 'PS5', ps4: 'PS4' };
    const fmtD = (k, h) => { const [y, m, d] = k.split('-').map(Number); const t = new Date(y, m - 1, d, h || 0); return t.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + tfmt(t); };
    const list = a.length ? `<ul class="hg-orders">${a.map(o => `<li><div class="l"><b>${o.game || (o.kind === 'rental' ? 'PS5 home rental' : 'Gaming session')}</b><small>${CN[o.console] || ''} · ${o.hours} h · ${fmtD(o.date, o.start)}</small><small class="c">#${o.code || ''}</small></div><div class="r"><b>₹${Number(o.amount || 0).toLocaleString('en-IN')}</b><span class="s ${(o.status || '').toLowerCase()}">${o.status}</span></div></li>`).join('')}</ul>`
      : `<div class="hg-empty">${IC.pad(40)}<b>No bookings yet</b><span>Your slots will show up here with game, console, time and amount.</span></div>`;
    popup({ art: I('r-bookings.webp'), icon: IC.list(), title: 'My bookings', text: 'Saved on this phone.', extra: list,
      actions: [{ label: 'Full history', run: () => { location.hash = 'orders'; } }, { label: `Book a slot${ARW}`, primary: true, keep: true, run: openBook }] });
  }

  /* ---------- Scroll reveal (transform + opacity only) ---------- */
  function buildReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    $$('main .section:not(.book) .wrap > *, .hg-games-in > *:not(.hg-live-grid), .hg-con, .hg-hw figure').forEach(el => el.classList.add('rv'));
    document.documentElement.classList.add('hg-rv');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    const watch = () => $$('.rv:not(.in)').forEach((el, i) => { if (!el._rv) { el._rv = 1; el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); } });
    watch(); new MutationObserver(watch).observe(document.body, { childList: true, subtree: true });
  }

  let cookieEl;
  /* ---------- In-app update (Android app only; native side calls HGUpdate when /version.json is newer) ---------- */
  IC.update = () => sv('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/><path d="M12 8v5l3 2"/>', 30);
  window.HGUpdate = (ver, notes) => {
    if ($('.hg-upd')) return;
    const el = popup({ art: I('k-wolverine.webp'), cls: 'upd', icon: IC.update(), title: 'Update available', text: `Version ${ver} of the Hunter Game app is ready.${notes ? ' ' + notes.replace(/</g, '&lt;') : ''}`,
      extra: '<div class="hg-upd"><div class="hg-upd-bar"><i></i></div><small class="hg-upd-st">Takes a few seconds. Your bookings stay saved.</small></div>',
      actions: [{ label: 'Later', run: () => { try { sessionStorage.setItem('hg.updLater', ver.replace(/^1\./, '')); } catch (e) {} window.HGApp && HGApp.later(); } },
        { label: `Update now${ARW}`, primary: true, keep: true, run: () => { el.classList.add('upd-busy'); window.HGApp && HGApp.startUpdate(); HGUpdateProgress(0, 'downloading');
          // fallback: if the native downloader never reports progress, hand the APK to the phone's browser
          window.__hgUpdTick = 0; setTimeout(() => { if (!window.__hgUpdTick) location.href = 'https://github.com/Ribonswebsites/hunter-gamers/releases/download/latest/hunter-game.apk'; }, 4000); } }] });
  };
  // Site-side update check (works even if an older app's native check never fires the popup)
  function selfUpdateCheck() {
    if (!IN_APP) return;
    const m = navigator.userAgent.match(/HunterGameApp\/[\w.?]+ \((\d+)\)/);
    let have = m ? +m[1] : 0; try { if (window.HGApp && HGApp.versionCode) have = HGApp.versionCode() || have; } catch (e) {}
    if (!have) return;
    fetch('/version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(v => {
      if (!(v.versionCode > have) || sessionStorage.getItem('hg.updLater') == v.versionCode) return;
      const wait = () => { if ($('.hg-upd')) return; if (loginEl && loginEl.classList.contains('on')) return setTimeout(wait, 1500); window.HGUpdate(v.versionName, v.notes); };
      setTimeout(wait, 1200);
    }).catch(() => {});
  }
  window.HGUpdateProgress = (pct, st) => {
    window.__hgUpdTick = (window.__hgUpdTick || 0) + (pct > 0 || st !== 'downloading' ? 1 : 0);
    const box = $('.hg-upd'); if (!box) return;
    const sh = box.closest('.hg-sheet'); sh.classList.add('upd-busy'); sh.classList.toggle('upd-err', pct < 0);
    if (pct >= 0) $('i', box).style.transform = `scaleX(${pct / 100})`;
    const msg = { downloading: pct >= 0 ? `Downloading ${pct}%` : 'Downloading...', installing: 'Opening installer...', permission: 'Allow "Install unknown apps" for Hunter Game, then come back.', error: 'Download failed. Check your internet and try again.', denied: 'Install permission was not allowed. Tap Update now to try again.' };
    $('.hg-upd-st', box).textContent = msg[st] || '';
    if (pct < 0) sh.classList.remove('upd-busy');
  };

  buildHero(); buildGames(); buildFeature(); buildHardware(); buildLive(); buildReveal(); route(); buildNav(); wireActions(); addAppLinks();
  loginEl = buildLogin(); cookieEl = buildCookie(); fillUser();
  if (IN_APP) document.documentElement.classList.add('in-app');
  if (!store.get('user') && !store.get('guest')) openLogin(); else afterLogin();
  selfUpdateCheck();

  window.HG = { ordersPopup, gamePopup, games: () => GAMES, snacksPopup, accountPopup, live: LIVE, openBook, snackAdded, openLogin, appPopup, chooseConsole, consolePopup, cookie: () => cookieEl.classList.add('on'), hide };
})();
