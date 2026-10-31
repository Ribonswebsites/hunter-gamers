/* Hunter Game app layer: orbit hero, sheets, bottom nav, login, cookies, app download */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IN_APP = /HunterGameApp/i.test(navigator.userAgent);
  const IS_ANDROID = /Android/i.test(navigator.userAgent);
  const store = { get: k => { try { return JSON.parse(localStorage.getItem('hg.' + k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('hg.' + k, JSON.stringify(v)); } catch {} } };
  const I = n => '/img/' + n;
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
    left: () => sv('<path d="M15 6l-6 6 6 6"/>', 12), right: () => sv('<path d="M9 6l6 6-6 6"/>', 12),
  };
  const ARW = ' ' + IC.arrow();

  // Each slide: one game, its own centre character (official art), orbit of official art behind (NowssB HeroCurveStage layout)
  const SLIDES = [
    { bg: 'wolverine-bg.webp', subject: 'wolverine-cutout.webp', cut: true, tag: "Marvel's Wolverine · PS5", h: 'Unleash the <span>claws.</span>' },
    { bg: 'gta6-bg.webp', subject: 'gta6-duo-cutout.webp', cut: true, tag: 'Grand Theft Auto VI', h: 'Vice City nights. <span>Your call.</span>' },
    { bg: 'spidey-bg.webp', subject: 'spidey-cutout.webp', cut: true, tag: "Marvel's Spider-Man", h: 'Swing into <span>your slot.</span>' },
    { bg: 'spidey2-bg.webp', subject: 'spidey2-centre.webp', tag: "Marvel's Spider-Man 2", h: 'Book PS5. <span>Claim the screen.</span>' },
    { bg: 'miles-bg.webp', subject: 'miles-centre.webp', tag: 'Spider-Man: Miles Morales', h: 'Squad up. <span>Drop in.</span>' },
    { bg: 'gta6-jason-bg.webp', subject: 'gta6-lucia-centre.webp', tag: 'GTA VI · Lucia Caminos', h: 'Ride out. <span>₹100/hr.</span>' },
  ];

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
    const el = sheet(`<div class="hg-icon">${o.icon || IC.pad()}</div><h3>${o.title}</h3><p>${o.text}</p>${o.extra || ''}<div class="hg-row">${(o.actions || []).map((a, i) => `<button class="hg-btn ${a.primary ? 'p' : 's'}" data-i="${i}">${a.label}</button>`).join('')}</div>`, { center: o.center });
    el._temp = true;
    $$('[data-i]', el).forEach(b => b.onclick = () => { const a = o.actions[+b.dataset.i]; hide(el, !!a.keep); a.run && a.run(); });
    show(el); return el;
  }

  // Booking lives in a sheet (the original form, moved, so all its logic keeps working)
  const bookSec = $('#book');
  const bookSheet = sheet('', { cls: 'book-sheet' });
  if (bookSec) bookSheet.append(bookSec);
  const openBook = () => { if (openSheet !== bookSheet) show(bookSheet); };

  /* ---------- Orbit hero ---------- */
  function buildHero() {
    const hx = document.createElement('section');
    hx.className = 'hgx'; hx.setAttribute('aria-label', 'Featured games');
    hx.innerHTML = SLIDES.map((s, i) => `<div class="hgx-slide${i ? '' : ' on'}" aria-hidden="${i ? 'true' : 'false'}">
      <div class="hgx-bg" style="background-image:url(${I(s.bg)})"></div>
      <div class="hgx-subject ${s.cut ? 'cut' : 'poster'}"><img src="${I(s.subject)}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>
      <div class="hgx-copy"><span class="hgx-tag"><i></i>${s.tag}</span><h1>${s.h}</h1>
      <p>PS5 &amp; PS4 by the hour in Indora, Nagpur. Pick a slot, add snacks, walk in and play.</p>
      <div class="hgx-cta"><button class="hg-btn p" data-hg-book>Book a slot${ARW}</button><button class="hg-btn s" data-hg-console>See rates</button></div></div></div>`).join('') +
      `<div class="hgx-ring"></div><div class="hgx-hint">${IC.left()} drag to spin ${IC.right()}</div><div class="hgx-dots">${SLIDES.map((_, i) => `<button aria-label="Slide ${i + 1}"${i ? '' : ' class="on"'}></button>`).join('')}</div><div class="hgx-progress"></div>`;
    $('#top').prepend(hx);
    const ring = $('.hgx-ring', hx);
    const cards = POSTERS.slice(0, 9).map(src => { const c = document.createElement('div'); c.className = 'hgx-card'; c.style.backgroundImage = `url(${src})`; ring.append(c); return c; });
    let auto = 0, drag = 0, scroll = 0, cur = 0, t0 = performance.now();
    const DUR = 6500;
    function layout() {
      const w = hx.clientWidth, n = cards.length, step = Math.PI * 2 / n;
      const R = Math.min(w * 0.42, 620), cw = Math.max(92, Math.min(170, w * 0.13));
      ring.style.setProperty('--cw', cw + 'px');
      const rot = auto + drag + scroll * 0.0016;
      cards.forEach((c, i) => {
        const a = rot + i * step, x = Math.sin(a) * R, z = Math.cos(a) * R * 0.55, y = Math.cos(a) * -18;
        const depth = (Math.cos(a) + 1) / 2;                 // 1 = front, 0 = back
        c.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${Math.sin(a) * -38}deg) scale(${0.72 + depth * 0.38})`;
        c.style.opacity = (0.25 + depth * 0.75).toFixed(2);
        c.style.zIndex = Math.round(depth * 100);
        c.style.filter = `brightness(${0.45 + depth * 0.55})`;
      });
    }
    function go(i) {
      cur = (i + SLIDES.length) % SLIDES.length; t0 = performance.now();
      $$('.hgx-slide', hx).forEach((s, j) => { s.classList.toggle('on', j === cur); s.setAttribute('aria-hidden', j !== cur); });
      $$('.hgx-dots button', hx).forEach((d, j) => d.classList.toggle('on', j === cur));
    }
    $$('.hgx-dots button', hx).forEach((d, j) => d.onclick = () => go(j));
    let sx = null, moved = 0;
    hx.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; sx = e.clientX; moved = 0; });
    addEventListener('pointermove', e => { if (sx == null) return; const dx = e.clientX - sx; sx = e.clientX; moved += dx; drag += dx * 0.01; });
    addEventListener('pointerup', () => { if (sx == null) return; sx = null; if (Math.abs(moved) > 60) go(cur + (moved < 0 ? 1 : -1)); });
    addEventListener('scroll', () => { scroll = scrollY; }, { passive: true });
    addEventListener('resize', layout);
    (function tick(now) {
      if (!reduce) auto += 0.0055 * 0.6;
      layout();
      const p = Math.min(1, (now - t0) / DUR); $('.hgx-progress', hx).style.width = p * 100 + '%';
      if (p >= 1 && !reduce) go(cur + 1);
      requestAnimationFrame(tick);
    })(performance.now());
    window.HG_go = go;
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
      <button data-hg-console data-sec="consoles">${svg(ico.pad)}Consoles</button>
      <button class="fab" data-hg-book aria-label="Book a slot"><span class="b">${svg(ico.plus)}</span>Book</button>
      <button data-hg-snacks data-sec="snacks">${svg(ico.snack)}Snacks</button>
      <button data-hg-account>${svg(ico.user)}<span data-acct-label>Login</span></button>`;
    document.body.append(n);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('[data-sec]', n).forEach(a => a.classList.toggle('on', a.dataset.sec === e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'consoles', 'rent', 'snacks', 'visit'].forEach(id => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- Popups for every action ---------- */
  const CONS = { ps5: { n: 'PS5', r: 100, img: 'card-06.webp', d: '4K graphics, DualSense haptics, fast loading.' }, ps4: { n: 'PS4', r: 75, img: 'card-02.webp', d: 'Huge library of classics. Best value for groups.' } };
  function consolePopup(id) {
    const c = CONS[id];
    popup({ icon: id === 'ps5' ? IC.bolt() : IC.pad(), title: `${c.n} · ₹${c.r} per player / hour`, text: c.d,
      extra: `<div class="hg-dl-art"><img src="${I('card-01.webp')}" alt=""><img src="${I(c.img)}" alt=""><img src="${I('card-05.webp')}" alt=""></div>`,
      actions: [{ label: 'Not now' }, { label: `Book ${c.n}${ARW}`, primary: true, keep: true, run: () => document.querySelector(`[data-pick="${id}"]`)._hgReal() }] });
  }
  function chooseConsole() {
    popup({ icon: IC.joy(), title: 'Pick your console', text: 'Rates are per player, per hour. Up to 4 players.',
      actions: [{ label: 'PS4 · ₹75', keep: true, run: () => consolePopup('ps4') }, { label: 'PS5 · ₹100', primary: true, keep: true, run: () => consolePopup('ps5') }] });
  }
  function rentPopup(real) {
    popup({ icon: IC.home(), title: 'Take a PS5 home', text: '₹1,000 for 12 hours with 2 controllers. Extra controller ₹200 (up to 4). ₹1,000 refundable deposit. Pick up and return at the shop.',
      actions: [{ label: 'Cancel' }, { label: `Rent a PS5${ARW}`, primary: true, keep: true, run: real }] });
  }
  function snackAdded(name, qty, price) {
    popup({ icon: name.startsWith('Chips') ? IC.chips() : IC.drink(), title: `${name} added`, text: `${qty} in your booking · ₹${price} each. Pay together with your slot.`,
      actions: [{ label: 'Keep browsing' }, { label: `View booking${ARW}`, primary: true, keep: true, run: openBook }] });
  }
  function snacksPopup() {
    popup({ icon: IC.snack(), title: 'Snacks & drinks', text: 'Add them to your booking and pay for everything together.',
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
      const t = e.target.closest('[data-hg-book],[data-hg-console],[data-hg-snacks],[data-hg-account],[data-hg-app]');
      if (!t) return; e.preventDefault();
      if (t.matches('[data-hg-book]')) { const g = document.querySelector('[data-go-book]'); g ? g.click() : openBook(); }
      else if (t.matches('[data-hg-console]')) chooseConsole();
      else if (t.matches('[data-hg-snacks]')) snacksPopup();
      else if (t.matches('[data-hg-account]')) accountPopup();
      else if (t.matches('[data-hg-app]')) appPopup();
    });
  }

  /* ---------- Login ---------- */
  function buildLogin() {
    const L = document.createElement('div'); L.className = 'hg-login'; L.setAttribute('role', 'dialog'); L.setAttribute('aria-label', 'Login');
    const col = k => `<div class="hgl-col">${[...POSTERS.slice(k), ...POSTERS.slice(0, k), ...POSTERS.slice(k), ...POSTERS.slice(0, k)].map(s => `<img src="${s}" alt="">`).join('')}</div>`;
    const SH = ['<path d="M12 4 21 20H3z"/>', '<circle cx="12" cy="12" r="9"/>', '<path d="M5 5l14 14M19 5 5 19"/>', '<rect x="4" y="4" width="16" height="16" rx="1"/>'];
    const glyphs = SH.flatMap(g => [g, g, g]).map((g, i) => `<span style="left:${(i * 37) % 100}%;animation-duration:${14 + (i * 7) % 16}s;animation-delay:-${(i * 3) % 14}s;width:${18 + (i * 11) % 30}px"><svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5">${g}</svg></span>`).join('');
    L.innerHTML = `<div class="hgl-bg" style="background-image:url(${I('wolverine-bg.webp')})"></div>
      <div class="hgl-cols">${[0, 3, 6, 2, 8, 5].map(col).join('')}</div><div class="hgl-shade"></div><div class="hgl-glyphs">${glyphs}</div>
      <form class="hgl-card" novalidate>
        <div class="hgl-brand"><img src="${LOGO}" alt="">HUNTER GAMERS</div>
        <h2>Press start.<br><em>Enter the arena.</em></h2>
        <p class="sub">Save your name &amp; number once, book any slot in two taps.</p>
        <div class="hgl-field"><label for="hglName">Gamer name</label><input id="hglName" autocomplete="name" placeholder="e.g. Rohan" required></div>
        <div class="hgl-field"><label for="hglPhone">Mobile number</label><input id="hglPhone" inputmode="numeric" autocomplete="tel-national" maxlength="10" placeholder="10-digit number" required></div>
        <div class="hgl-err" aria-live="polite"></div>
        <button class="hg-btn p" type="submit">${IC.play()} Start playing</button>
        <div class="hgl-or">or</div>
        <button class="hg-btn s" type="button" data-guest>Continue as guest</button>
        <p class="hgl-note">Saved only on this device to fill your bookings. No password needed.</p>
      </form>
      <div class="hgl-ticker"><div>${'PS5 ₹100/HR · PS4 ₹75/HR · TAKE A PS5 HOME ₹1,000 · SNACKS & COLD DRINKS · INDORA, NAGPUR · '.repeat(6)}</div></div>`;
    document.body.append(L);
    const bgs = ['wolverine-bg.webp', 'gta6-bg.webp', 'spidey2-bg.webp', 'gta6-jason-bg.webp', 'miles-bg.webp'];
    let bi = 0; setInterval(() => { if (L.classList.contains('on')) $('.hgl-bg', L).style.backgroundImage = `url(${I(bgs[++bi % bgs.length])})`; }, 5000);
    L.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      $('.hgl-bg', L).style.transform = `translate(${x * -30}px,${y * -30}px)`;
      $('.hgl-cols', L).style.transform = `rotate(-12deg) scale(1.15) translate(${x * 40}px,${y * 40}px)`;
    });
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
    popup({ icon: IC.user(), title: `Hi, ${u.name}`, text: `Bookings are filled with +91 ${u.phone}.`,
      actions: [{ label: 'Log out', run: () => { localStorage.removeItem('hg.user'); fillUser(); } }, { label: 'Book a slot${ARW}', primary: true, keep: true, run: () => { fillUser(); openBook(); } }] });
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
    popup({ icon: `<img src="${LOGO}" alt="Hunter Gamers" style="width:46px">`, title: 'Get the Hunter Game app', text: 'Book slots faster, keep your login, and get the full-screen experience on Android.',
      extra: `<div class="hg-dl-art"><img src="${I('card-06.webp')}" alt=""><img src="${I('card-01.webp')}" alt=""><img src="${I('card-05.webp')}" alt=""></div><p style="font-size:12px">Android 7+ · about 6 MB · allow "install unknown apps" when asked.</p>`,
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

  let cookieEl;
  buildHero(); buildNav(); wireActions(); addAppLinks();
  loginEl = buildLogin(); cookieEl = buildCookie(); fillUser();
  if (IN_APP) document.documentElement.classList.add('in-app');
  if (!store.get('user') && !store.get('guest')) openLogin(); else afterLogin();

  window.HG = { openBook, snackAdded, openLogin, appPopup, chooseConsole, consolePopup, cookie: () => cookieEl.classList.add('on'), hide };
})();
