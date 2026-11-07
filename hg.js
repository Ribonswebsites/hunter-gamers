/* Hunter Game app layer: orbit hero, sheets, bottom nav, login, cookies, app download */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Android shell sets HunterGameApp. iPhone full-screen install sets navigator.standalone (not a browser tab).
  const IN_APP = /HunterGameApp/i.test(navigator.userAgent) || (IS_IOS && navigator.standalone === true);
  const IS_ANDROID = /Android/i.test(navigator.userAgent);
  const store = { get: k => { try { return JSON.parse(localStorage.getItem('hg.' + k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('hg.' + k, JSON.stringify(v)); } catch {} } };
  // r20: art that changed gets a new filename so no cache (SW, WebView, CDN) can serve the old file
  const REN = { 'c-wk-md.webp': 'c-wk-md-r20.webp', 'c-wk-sm.webp': 'c-wk-sm-r20.webp', 't-wk.webp': 't-wk-r20.webp', 'w-wk.webp': 'w-wk-r20.webp', 'c-nr-md.webp': 'c-nr-md-r20.webp', 'c-nr-sm.webp': 'c-nr-sm-r20.webp', 't-nr.webp': 't-nr-r20.webp', 'w-nr.webp': 'w-nr-r20.webp' };
  const I = n => '/img/' + (REN[n] || n) + '?v=30';
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
  const SLIDES = [ // every slide shows the ring; rt = per-slide ring centre (% of hero height), kept below background faces
    { id: 'wolverine', bg: 'wolverine-key', tag: "Marvel's Wolverine · PS5", h: 'Unleash the <span>claws.</span>' },
    { id: 'gow', bg: 'h-gow', tag: 'God of War Ragnarök', h: 'Kratos is <span>waiting.</span>' },
    { id: 'gta6', bg: 'gta6-bg', cut: 'gta6-r24', soon: 1, tag: 'Grand Theft Auto VI', h: 'Vice City nights. <span>Coming soon.</span>' },
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
    el.innerHTML = '<div class="hg-grab" aria-hidden="true"></div>' + `<button class="hg-x" aria-label="Close" data-close>${IC.x(20)}</button>` + html;
    document.body.append(el); swipe(el); return el;
  }
  // r18: swipe down to close (from the handle anywhere, or anywhere while the sheet is scrolled to top)
  function swipe(el) {
    let y0 = null, dy = 0, grab = false;
    el.addEventListener('touchstart', e => { if (e.touches.length !== 1) return; grab = !!e.target.closest('.hg-grab'); if (!grab && el.scrollTop > 0) return; if (e.target.closest('input,select,textarea,.hg-cf,[data-noswipe]')) return; y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
    el.addEventListener('touchmove', e => { if (y0 == null) return; dy = e.touches[0].clientY - y0; if (dy <= 0 || (!grab && el.scrollTop > 0)) { if (dy < 0 && !grab) y0 = null; el.style.transform = ''; return; } if (e.cancelable) e.preventDefault(); el.style.transition = 'none'; el.style.transform = el.classList.contains('center') ? `translate(-50%,calc(-50% + ${dy}px))` : `translate(-50%,${dy}px)`; }, { passive: false });
    const end = () => { if (y0 == null) return; y0 = null; el.style.transition = ''; el.style.transform = ''; if (dy > 90) hide(el); dy = 0; };
    el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
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

  /* ---------- r20: booking wizard (moves the original fieldsets into steps; ids and logic untouched) ---------- */
  (function wizard() {
    const form = $('#bookForm', bookSheet); if (!form) return;
    const panel = $('.panel', form), ticket = $('.ticket', form), fs = $$('fieldset', panel);
    const by = (txt) => fs.find(f => ($('legend', f) || {}).textContent && $('legend', f).textContent.includes(txt));
    const STEPS = [
      { l: 'Console', a: 'k-sm2', t: 'Console', s: 'How do you want to play?', els: [$('#modeOpts', form), by('Console')] },
      { l: 'Time', a: 'k-acs', t: 'Day & time', s: 'Pick your day, start time and hours.', els: [by('Day'), $('#slots', form) && $('#slots', form).closest('fieldset'), by('How long')] },
      { l: 'Squad', a: 'k-gow', t: 'Squad & snacks', s: 'Who is playing and what do you eat?', els: [by('Players'), by('Snacks'), by('Controllers')] },
      { l: 'You', a: 'k-re9', t: 'Your details', s: 'So we can hold the slot for you.', els: [by('Your details')] },
      { l: 'Pay', a: 'k-wk', t: 'Payment', s: 'Pay now by UPI or at the counter.', els: [by('Payment')] },
      { l: 'Review', a: 'k-gta6', t: 'Review', s: 'Check everything, then confirm.', els: [ticket] }
    ];
    const N = STEPS.length;
    const wz = document.createElement('div'); wz.className = 'bw';
    wz.innerHTML = `<div class="bw-prog" aria-hidden="true"><div class="bw-ring"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" class="bg"/><circle cx="32" cy="32" r="27" class="fg" pathLength="100"/></svg><b>1</b><small>/${N}</small></div>
      <div class="bw-meta"><p class="bw-k">Step <span>1</span> of ${N}</p><h3 class="bw-t">${STEPS[0].t}</h3><p class="bw-s">${STEPS[0].s}</p></div></div>
      <ol class="bw-rail">${STEPS.map((st, i) => `<li data-i="${i}"><i></i><span>${st.l}</span></li>`).join('')}</ol>
      <div class="bw-view"><div class="bw-track">${STEPS.map((_, i) => `<div class="bw-step" data-step="${i}"></div>`).join('')}</div></div>
      <div class="bw-bar"><button type="button" class="bw-back" aria-label="Back"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
      <div class="bw-tot"><span>Total</span><b>₹100</b></div><button type="button" class="hg-btn p bw-next">Next<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>`;
    form.before(wz);
    const steps = $$('.bw-step', wz), track = $('.bw-track', wz), view = $('.bw-view', wz);
    STEPS.forEach((st, i) => st.els.filter(Boolean).forEach(el => steps[i].append(el)));
    // r22: distinct per-step layouts
    steps.forEach((x, i) => x.classList.add('bw-s' + i));
    $$('#consoleOpts .opt', wz).forEach(b => { const im = document.createElement('img'); im.className = 'bw-hw'; im.alt = ''; im.decoding = 'async'; im.src = I(b.dataset.console === 'ps5' ? 'x-ps5.webp' : 'hw-ps4.webp'); b.prepend(im); });
    { const f = by('Your details'); if (f) { const c = document.createElement('div'); c.className = 'bw-id'; c.innerHTML = `<img src="/img/inline-0de9c85f.webp" alt="" width="40" height="32"><div><small>Hunter Gamers</small><b>Player pass</b></div><span class="bw-chip"></span>`; f.querySelector('.fields').before(c); f.classList.add('bw-idcard'); } }
    { const PI = { counter: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="13" width="38" height="24" rx="4"/><circle cx="24" cy="25" r="5"/><path d="M11 19v.01M37 31v.01"/></svg>', online: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="13" y="4" width="22" height="40" rx="4"/><path d="M19 15h4v4h-4zM25 15h4v4h-4zM19 21h4v4h-4zM27 23l2 2M21 38h6"/></svg>' };
      $$('#payOpts .pay-opt', wz).forEach(b => { const d = document.createElement('span'); d.className = 'bw-pi'; d.innerHTML = PI[b.dataset.pay] || ''; b.prepend(d); }); }
    { const tk = $('.ticket', wz); if (tk) tk.classList.add('bw-pass'); }
    // the form keeps wrapping everything so submit + validation still work
    form.append(wz); panel.hidden = true; form.classList.add('bw-on');
    const head = $('.section-head', bookSheet); if (head) head.classList.add('bw-head');
    const tot = $('.bw-tot b', wz), sumT = $('#sumTotal', form);
    const syncTot = () => { if (sumT) tot.textContent = sumT.textContent; };
    if (sumT) new MutationObserver(syncTot).observe(sumT, { childList: true, characterData: true, subtree: true }); syncTot();
    let cur = 0;
    const fit = () => { view.style.height = steps[cur].offsetHeight + 'px'; };
    function go(i, focus) {
      i = Math.max(0, Math.min(N - 1, i)); const dir = i > cur; cur = i;
      { const bk = bookSheet.querySelector('#book') || bookSheet; bk.style.setProperty('--bw-art', `url(${I(STEPS[i].a + '.webp')})`); bk.dataset.bw = i; }
      track.style.transform = `translate3d(${-i * 100}%,0,0)`;
      steps.forEach((s, j) => { s.classList.toggle('on', j === i); s.inert = j !== i; });
      $('.bw-ring b', wz).textContent = i + 1; $('.bw-k span', wz).textContent = i + 1; $('.bw-t', wz).textContent = STEPS[i].t; $('.bw-s', wz).textContent = STEPS[i].s;
      $('.bw-ring .fg', wz).style.strokeDashoffset = 100 - ((i + 1) / N) * 100;
      $$('.bw-rail li', wz).forEach((l, j) => { l.classList.toggle('done', j < i); l.classList.toggle('on', j === i); });
      wz.classList.toggle('first', i === 0); wz.classList.toggle('last', i === N - 1);
      $('.bw-next', wz).firstChild.textContent = i === N - 1 ? 'Confirm booking' : i === N - 2 ? 'Review' : 'Next';
      fit(); if (bookSheet.scrollTop > 0) bookSheet.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const err = (id, msg) => { const e = $('#err-' + id, form); if (e) { e.textContent = msg; e.hidden = false; } fit(); };
    function ok(i) {
      const st = document.querySelector('#slots .slot[aria-pressed=true], #slots .on, #slots [aria-checked=true]');
      if (i === 1 && $('#sumTime', form) && $('#sumTime', form).textContent.trim() === '—' && !st) { err('slot', 'Pick a start time to continue.'); return false; }
      if (i === 2 && $('#depositOk', form) && !$('#depositOk', form).closest('fieldset').hidden && !$('#depositOk', form).checked) { err('deposit', 'Tick the box to agree to the ₹1,000 refundable deposit.'); return false; }
      if (i === 3) { const n = $('#name', form), p = $('#phone', form); let g = true;
        if (n.value.trim().length < 2) { err('name', 'Enter the name for this booking.'); g = false; }
        if (!/^[6-9]\d{9}$/.test(p.value)) { err('phone', 'Enter a 10-digit mobile number.'); g = false; } return g; }
      return true;
    }
    $('.bw-next', wz).addEventListener('click', () => { if (cur === N - 1) { form.requestSubmit ? form.requestSubmit() : $('button[type=submit]', form).click(); return; } if (ok(cur)) go(cur + 1); });
    $('.bw-back', wz).addEventListener('click', () => go(cur - 1));
    $$('.bw-rail li', wz).forEach(l => l.addEventListener('click', () => { const i = +l.dataset.i; if (i < cur) go(i); }));
    // after a failed submit, jump to the step holding the first error
    form.addEventListener('submit', () => setTimeout(() => { const e = $$('.err', form).find(x => !x.hidden && x.textContent); if (e) { const s = e.closest('.bw-step'); if (s) go(+s.dataset.step); } }, 0));
    view.addEventListener('scroll', () => { view.scrollLeft = 0; }); track.addEventListener('scroll', () => { track.scrollLeft = 0; });
    { const ro = new ResizeObserver(fit); steps.forEach(x => ro.observe(x)); } addEventListener('resize', fit);
    const _show = show; bookSheet._wzReset = () => go(0);
    go(0);
    // swipe left/right between steps is not used (avoids fighting the day/time scrollers)
  })();

  /* ---------- Hero: cutout centre-stage over a spinning poster ring, dimmed + blurred background ---------- */
  const MOB = innerWidth <= 760, BIG = innerWidth > 1100 ? '-md' : '-sm', CUT = '-md';
  const HIBG = ['wolverine', 'gta6', 'gow', 'sm2', 'acs', 'fc26', 'nr', 'wk'];
  const bgSrc = s => I('hb-' + s.id + '.webp');
  const cutSrc = s => I('hp-' + s.id + '.webp');
  function buildHero() {
    const hx = $('#top > .hgx') || document.createElement('section');
    hx.className = 'hgx'; hx.setAttribute('aria-label', 'Featured games');
    // Separate layers (not per-slide wrappers) so fading never creates a stacking context that lets the ring pass in front.
    hx.innerHTML = `<div class="hgx-layer hgx-bgs">${SLIDES.map((s, i) => `<div class="hgx-bg${s.clear ? ' clear' : ''}${i ? '' : ' on'}"${i ? '' : ` style="background-image:url(${bgSrc(s)})"`}></div>`).join('')}</div>
      <div class="hgx-ring r1"></div>
      <div class="hgx-layer hgx-subs">${SLIDES.map((s, i) => s.pop
        ? `<div class="hgx-pop hgx-subject-w${i ? '' : ' on'}" data-id="${s.id}"><img ${i ? 'data-src' : 'src'}="${cutSrc(s)}" alt="" decoding="async"${i ? '' : ' fetchpriority="high"'}></div>`
        : `<img data-id="${s.id}" class="hgx-subject hgx-subject-w${i ? '' : ' on'}" ${i ? 'data-src' : 'src'}="${cutSrc(s)}" alt="" decoding="async">`).join('')}</div>
      ${SLIDES.map((s, i) => `<div class="hgx-copy${i ? '' : ' on'}" aria-hidden="${i ? 'true' : 'false'}"><span class="hgx-tag"><i></i>${s.tag}</span>${s.soon ? '<span class="hgx-soon">Coming soon</span>' : ''}<h1>${s.h}</h1>
      <p>PS5 &amp; PS4 by the hour in Indora, Nagpur. Pick a slot, add snacks, walk in and play.</p>
      <div class="hgx-cta"><button class="hg-btn p" data-hg-book>Book a slot${ARW}</button><button class="hg-btn s" data-route="request">Request a game</button></div></div>`).join('')}
      <div class="hgx-progress"></div>`;
    if (!hx.parentNode) $('#top').prepend(hx);
    const bgs = $$('.hgx-bg', hx), subs = $$('.hgx-subject-w', hx), copies = $$('.hgx-copy', hx), prog = $('.hgx-progress', hx);
    const preload = src => new Promise(r => { const im = new Image(); im.decoding = 'async'; im.src = src; (im.decode ? im.decode() : new Promise((a, b) => { im.onload = a; im.onerror = b; })).then(r, r); });
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
        cs[i].style.transform = `translate3d(${(s * rad).toFixed(1)}px,${(c * -18).toFixed(1)}px,0) scale(${(0.62 + d * 0.48).toFixed(3)})`;
        cs[i].style.zIndex = Math.round(d * 100);
      }
    }
    function layout() { place(cards, auto + drag, step, R); }
    function go(i) {
      const next = (i + SLIDES.length) % SLIDES.length; if (next === cur || busy) { t0 = performance.now(); return; }
      busy = true; t0 = performance.now(); lastP = 0;
      ensure(next).then(() => requestAnimationFrame(() => {
        const prev = cur; cur = next; fillRing();
        bgs.forEach((b, j) => b.classList.toggle('on', j === cur)); hx.classList.toggle('clr', !!SLIDES[cur].clear); hx.classList.add('ring-on'); hx.dataset.s = SLIDES[cur].id;
        subs[prev].classList.remove('on'); subs[prev].classList.add('out');
        setTimeout(() => subs[prev].classList.remove('out'), 700);
        subs[cur].classList.remove('out'); subs[cur].classList.add('on');
        copies.forEach((c, j) => { c.classList.toggle('on', j === cur); c.setAttribute('aria-hidden', j !== cur); });
        t0 = performance.now(); busy = false;
        ensure((cur + 1) % SLIDES.length); // preload the next slide while this one plays
      }));
    }
    hx.classList.toggle('clr', !!SLIDES[0].clear); hx.classList.add('ring-on'); hx.dataset.s = SLIDES[0].id;
    // Ring sits as low as possible: its bottom edge stops just above the game tag, so it stays under every face and title.
    function fitRing() {
      const tag = $('.hgx-copy.on .hgx-tag', hx) || $('.hgx-copy.on', hx); if (!tag) return;
      const hr = hx.getBoundingClientRect(); let bo = -1e9; cards.forEach(c => { const r = c.getBoundingClientRect(); if (r.bottom > bo) bo = r.bottom; });
      const cur = parseFloat(getComputedStyle(ring1).top) || 0, want = cur + (tag.getBoundingClientRect().top - 12 - bo);
      hx.style.setProperty('--rt', Math.round(want) + 'px');
    }
    measure(); fillRing(); layout();
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
      const dt = Math.min(50, now - (tick.l || now)); tick.l = now; auto += dt * 0.00018; layout();
      lastP = Math.min(1, (now - t0) / DUR); prog.style.transform = `scaleX(${lastP.toFixed(4)})`;
      if (lastP >= 1 && !reduce) go(cur + 1);
      requestAnimationFrame(tick);
    }
    ensure(0).then(() => SLIDES.forEach((_, i) => setTimeout(() => ensure(i), 300 * i)));
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
    // r19: spring-physics 3D cover-flow. Transform-only (GPU), fractional positions while dragging, momentum + spring settle.
    let cw = 0, W = 0; const measure = () => { W = cf.clientWidth; cw = Math.min(W * 0.5, 260); };
    measure(); addEventListener('resize', () => { measure(); kick(); });
    const ease = x => x * (2 - Math.min(1, x)); // soft knee for spacing
    function render() {
      for (let i = 0; i < n; i++) { const c = cs[i]; let o = i - pos; o -= Math.round(o / n) * n; const a = Math.abs(o), sg = o < 0 ? -1 : 1, k = Math.min(a, 1);
        if (a > 2.7) { if (c._v !== 0) { c.style.visibility = 'hidden'; c._v = 0; } continue; }
        if (c._v !== 1) { c.style.visibility = 'visible'; c._v = 1; }
        const x = sg * (ease(k) * cw * 0.6 + Math.max(0, a - 1) * cw * 0.28), z = -Math.min(a, 2.5) * 150, r = -sg * k * 48, sc = 1 - Math.min(a, 2) * 0.06;
        c.style.transform = `perspective(1100px) translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${r.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        const zi = 100 - Math.round(a * 10); if (c._z !== zi) { c.style.zIndex = zi; c._z = zi; }
        const on = a < 0.5; if (c._on !== on) { c.classList.toggle('on', on); c._on = on; } }
      setCur(wrap(Math.round(pos)));
    }
    const K = 210, D = 2 * Math.sqrt(210) * 0.86; // stiffness / damping (slightly under-damped = premium settle)
    function tick(now) {
      raf = 0; const dt = Math.min(0.032, (now - (last || now)) / 1000) || 0.016; last = now;
      if (drag == null) { const steps = Math.max(1, Math.ceil(dt / 0.008)), h = dt / steps;
        for (let j = 0; j < steps; j++) { vel += ((target - pos) * K - vel * D) * h; pos += vel * h; }
        if (Math.abs(target - pos) < 0.0006 && Math.abs(vel) < 0.002) { pos = target; vel = 0; render(); last = 0; return; } }
      render(); raf = requestAnimationFrame(tick);
    }
    const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
    new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) { t0 = performance.now(); kick(); } }).observe(cf);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && vis) kick(); });
    let st0 = 0, sx = 0, sy = 0, lx = 0, lt = 0, moved = 0, pid = null, dv = 0, axis = 0;
    const stage = $('.hg-cf-stage', cf); stage.style.touchAction = 'pan-y';
    // r20: one gesture engine fed by touch events (Android WebView/Chrome) and mouse pointers; axis lock so vertical scroll still works
    let touching = false;
    const gStart = (x, y) => { drag = pos; st0 = Math.round(pos); sx = lx = x; sy = y; lt = performance.now(); dv = 0; moved = 0; axis = 0; vel = 0; touching = true; };
    const gMove = (x, y, ev) => { if (drag == null) return;
      if (!axis) { const ax = Math.abs(x - sx), ay = Math.abs(y - sy); if (ax < 5 && ay < 5) return; axis = ax >= ay * 0.8 ? 1 : 2; }
      if (axis !== 1) { drag = null; touching = false; kick(); return; }
      if (ev && ev.cancelable) ev.preventDefault();
      const now = performance.now(), dx = x - lx, d = Math.max(1, now - lt); const iv = -dx / (cw * 0.9) / (d / 1000); dv = dv * 0.6 + iv * 0.4; lx = x; lt = now; moved = x - sx;
      pos = drag - moved / (cw * 0.9); t0 = now; kick(); };
    const gEnd = () => { touching = false; if (drag == null) return; drag = null; if (performance.now() - lt > 120) dv *= 0.3;
      const v = Math.max(-9, Math.min(9, dv)); let tgt = Math.round(pos + v * 0.16); tgt = Math.max(st0 - 3, Math.min(st0 + 3, tgt));
      if (tgt === st0 && (Math.abs(moved) > 22 || Math.abs(v) > 0.35)) tgt = st0 + (moved < 0 ? 1 : -1);
      target = tgt; vel = v; t0 = performance.now(); kick(); };
    stage.addEventListener('touchstart', e => { if (e.touches.length !== 1) { gEnd(); return; } const t = e.touches[0]; gStart(t.clientX, t.clientY); }, { passive: true });
    stage.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) gMove(t.clientX, t.clientY, e); }, { passive: false });
    stage.addEventListener('touchend', gEnd); stage.addEventListener('touchcancel', gEnd);
    stage.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button > 0) return; pid = e.pointerId; gStart(e.clientX, e.clientY); });
    addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && e.pointerId === pid) gMove(e.clientX, e.clientY, e); });
    addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.pointerId === pid) { pid = null; gEnd(); } });
    stage.addEventListener('dragstart', e => e.preventDefault());
    cs.forEach((c, i) => c.addEventListener('click', e => { e.stopPropagation(); if (Math.abs(moved) > 8) return; let o = i - pos; o -= Math.round(o / n) * n;
      if (Math.abs(o) < 0.5) gamePopup(GAMES.find(g => g.id === SPOT[i])); else { target = Math.round(pos + o); t0 = performance.now(); kick(); } }));
    $$('img', cf).forEach(im => im.decode && im.decode().catch(() => {}));
    setInterval(() => { if (vis && drag == null && !touching && !document.hidden && performance.now() - t0 > 3500) { target = Math.round(target) + 1; t0 = performance.now(); kick(); } }, 250);
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
    popup({ cls: 'p-con', art: I(id === 'ps5' ? 'r-ps5.webp' : 'r-ps4.webp'), extraTop: 1, icon: id === 'ps5' ? IC.bolt() : IC.pad(), title: `${c.n} · ₹${c.r} per player / hour`, text: c.d,
      extra: `<div class="hg-spec"><span><b>${id === 'ps5' ? '4K' : '1080p'}</b>Graphics</span><span><b>4</b>Players max</span><span><b>₹${c.r}</b>Per hour</span></div>` + liveChips(id),
      actions: [{ label: 'Not now' }, { label: `Book ${c.n}${ARW}`, primary: true, keep: true, run: () => document.querySelector(`[data-pick="${id}"]`)._hgReal() }] });
  }
  function chooseConsole() {
    popup({ cls: 'p-choose', art: I('r-choose.webp'), icon: IC.joy(), title: 'Pick your console', text: 'Rates are per player, per hour. Up to 4 players.', extra: liveChips(),
      actions: [{ label: 'PS4 · ₹75', keep: true, run: () => consolePopup('ps4') }, { label: 'PS5 · ₹100', primary: true, keep: true, run: () => consolePopup('ps5') }] });
  }
  function rentPopup(real) {
    popup({ cls: 'p-rent', art: I('r-rent.webp'), icon: IC.home(), title: 'Take a PS5 home', extra: '<div class="hg-stamp"><b>₹1,000</b><span>12 hours · 2 controllers</span></div>', text: '₹1,000 for 12 hours with 2 controllers. Extra controller ₹200 (up to 4). ₹1,000 refundable deposit. Pick up and return at the shop.',
      actions: [{ label: 'Cancel' }, { label: `Rent a PS5${ARW}`, primary: true, keep: true, run: real }] });
  }
  function snackAdded(name, qty, price) {
    popup({ cls: 'p-snk', art: I('r-snack.webp'), icon: name.startsWith('Chips') ? IC.chips() : IC.drink(), title: `${name} added`, text: `${qty} in your booking · ₹${price} each. Pay together with your slot.`,
      actions: [{ label: 'Keep browsing' }, { label: `View booking${ARW}`, primary: true, keep: true, run: openBook }] });
  }
  function snacksPopup() {
    popup({ cls: 'p-snk', art: I('r-snacks.webp'), icon: IC.snack(), title: 'Snacks & drinks', text: 'Add them to your booking and pay for everything together.',
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
    popup({ cls: 'p-acct', art: I('r-account.webp'), icon: IC.user(), title: `Hi, ${u.name}`, extra0: 1, text: `Bookings are filled with +91 ${u.phone}.`,
      extra: `<div class="hg-acct-st"><span><b>${orders().length}</b>Bookings</span><span><b>${orders().reduce((t, o) => t + Number(o.hours || 0), 0)}</b>Hours</span><span><b>+91 ${u.phone.slice(0, 5)}…</b>Mobile</span></div><button class="hg-linkrow" data-hg-orders>${IC.list(20)}<span><b>My bookings</b><small>${orders().length ? orders().length + ' saved on this phone' : 'Nothing yet'}</small></span>${IC.right()}</button>`,
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
    if (IN_APP || window.HGApp) return;
    const P = ['gta6', 'gow', 'fc26', 'sm2', 'wk'];
    const feat = [['M4 7h16v12H4zM8 3v4M16 3v4', 'Book in 3 taps'], ['M12 3v12M6 11l6 6 6-6M4 21h16', 'Stay logged in'], ['M3 12h4l3-8 4 16 3-8h4', 'Live seat status']];
    const inSafariTab = IS_IOS && /CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV|Line|Twitter|Snapchat/i.test(navigator.userAgent);
    const dl = IS_IOS
      ? (inSafariTab
          ? `<p class="ap-ios-note">Apple only installs the app from Safari, not from this in-app browser.</p>
             <a class="hg-btn p ap-dl" href="https://hunter-gamers.pages.dev/">${IC.dl()}<span>Open in Safari<small class="hg-app-meta">Then tap Get the app</small></span></a>`
          : `<a class="hg-btn p ap-dl" href="/downloads/Hunter-Gamers.mobileconfig">${IC.dl()}<span>Install on iPhone<small class="hg-app-meta">Full screen · no Safari bar</small></span></a>
             <ol class="ap-steps">
               <li><b>1</b><span>Tap Install. iOS downloads the app profile.</span></li>
               <li><b>2</b><span>Open Settings. Tap <em>Profile Downloaded</em>, then Install. Enter your passcode and tap Install again.</span></li>
               <li><b>3</b><span>Leave Safari. Open the Hunter Gamers icon on the home screen. That icon is the app.</span></li>
             </ol>
             <p class="ap-ios-note">If you do not see Profile Downloaded: Settings → General → VPN & Device Management → Hunter Gamers → Install.</p>`)
      : `<a class="hg-btn p ap-dl" href="/downloads/hunter-flutter.apk" download>${IC.dl()}<span>Download APK<small class="hg-app-meta">Flutter · same site and images</small></span></a>`;
    const el = popup({ cls: 'p-app ap2', art: false, center: true, icon: '', title: '', text: '',
      extra: `<div class="ap-stage"><img class="ap-key" src="${I('k-gta6.webp')}" alt="Grand Theft Auto VI official art" decoding="async"><div class="ap-fade"></div>
        <div class="ap-fan">${P.map((g, i) => `<img src="${I('p-' + g + '.webp')}" alt="" style="--i:${i - 2}" decoding="async">`).join('')}</div>
        <div class="ap-phone"><div class="ap-scr"><img src="${I('t-fc26.webp')}" alt="" decoding="async"><img class="ap-logo" src="${LOGO}" alt="Hunter Gamers"><b>Book a slot</b></div></div>
        <span class="ap-chip">${IS_IOS ? 'iPhone app' : 'Android app'}</span></div>
        <div class="ap-body"><h3>Hunter Gamers<span>in your pocket</span></h3>
        <ul class="ap-feat">${feat.map(([d, t]) => `<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>${t}</li>`).join('')}</ul>
        ${dl}
        <button class="hg-linkbtn ap-later" type="button" data-close>Maybe later</button></div>`,
      actions: [] });
    document.body.classList.add('hg-app-on');
    const later = () => { try { sessionStorage.setItem('hg.appLater', '1'); } catch (e) {} document.body.classList.remove('hg-app-on'); };
    const gotApp = () => { store.set('appInstalled', Date.now()); document.body.classList.remove('hg-app-on'); };
    $$('[data-close]', el).forEach(x => x.addEventListener('click', later));
    const dlBtn = $('.ap-dl', el);
    if (dlBtn) dlBtn.addEventListener('click', () => {
      const openSafari = /hunter-gamers\.pages\.dev\/?$/.test(dlBtn.getAttribute('href') || '');
      if (!openSafari) gotApp();
      if (!IS_IOS) setTimeout(() => hide(el), 300);
    });
    new MutationObserver(() => { if (!el.classList.contains('on')) document.body.classList.remove('hg-app-on'); }).observe(el, { attributes: true, attributeFilter: ['class'] });
    if (!IS_IOS) {
      Promise.all([fetch('/version.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null), fetch('/downloads/hunter-flutter.apk', { method: 'HEAD', cache: 'no-store' }).then(r => +r.headers.get('content-length') || 0).catch(() => 0)])
        .then(([v, len]) => { const m = $('.hg-app-meta', el); if (m) m.textContent = `Flutter · Android 7+${len ? ' · ' + (len / 1048576).toFixed(1) + ' MB' : ''}`; });
    }
  }
  // r18: on the website the popup shows on top of everything (login wall included) on first visit; waits only for another open sheet.
  function maybeApp() {
    if (IN_APP || window.HGApp || store.get('appInstalled') || document.querySelector('.p-app')) return;
    try { if (sessionStorage.getItem('hg.appLater')) return; } catch (e) {}
    if (openSheet) { setTimeout(maybeApp, 2000); return; }
    appPopup();
  }
  setTimeout(maybeApp, 2000);
  function addAppLinks() {
    if (IN_APP) return;
    const a = `<a class="hg-dl-link" href="${IS_IOS ? '/downloads/Hunter-Gamers.mobileconfig' : '/downloads/hunter-flutter.apk'}" data-hg-app>${svg(ico.dl).replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"')}Get the app</a>`;
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
    const CI = { ps5: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3c2 0 3 1 3 3v12c0 2-1 3-3 3H7l1-9-1-9z"/><path d="M13 3c-1 0-1.5 1-1.5 2v14c0 1 .5 2 1.5 2h3c-1-6-1-12 0-18z"/></svg>', ps4: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h18l-2 7H5z"/><path d="M3 9l2-2h14l2 2"/></svg>' };
    sec.innerHTML = `<div class="hg-games-in"><div class="hg-cst">
      <div class="hg-cst-glow"></div><img class="hg-cst-ps5" src="${I('x-ps5.webp')}" alt="PS5 console" loading="lazy" decoding="async"><img class="hg-cst-ps4" src="${I('hw-ps4.webp')}" alt="PS4 console" loading="lazy" decoding="async">
      <div class="hg-cst-tx"><p class="hg-eyebrow">${IC.live(14)} Live at the shop <span class="hg-lt-demo" hidden>Demo</span></p>
      <h2 id="live-title">Console <span>status.</span></h2><p class="hg-cst-sum hg-lt-sum"></p></div>
      <div class="hg-cst-chips">${RIG.map(r => `<div class="hg-cst-c" data-id="${r.id}" data-type="${r.type}">${CI[r.type]}<b>${r.name.replace(' · ', ' ')}</b><span class="st"></span><small class="tl"></small></div>`).join('')}</div>
      <button class="hg-btn p hg-cst-go" data-route="control">Open control room${ARW}</button></div></div>`;
    const anchor = $('#games') || $('#consoles'); anchor.after(sec);
    function draw() {
      if (!LIVE.data) return; const now = Date.now(), cs = LIVE.data.consoles.map(c => derive(c, now));
      { const d = $('.hg-lt-demo', sec); if (d) d.hidden = !LIVE.demo; }
      cs.forEach(c => { const el = $(`[data-id="${c.id}"]`, sec); if (!el) return; el.dataset.st = c.st; $('.st', el).textContent = c.st === 'free' ? 'Free' : c.st === 'playing' ? 'In use' : 'Reserved'; $('.tl', el).textContent = c.cur ? left(c.cur.end - now) + ' left' : c.free <= now ? 'Ready now' : 'Free ' + tfmt(c.free); });
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
  /* ---------- Request a game (₹200 upfront) ---------- */
  const REQ_FEE = 200, REQ_UPI = '7038896627@okbizaxis';
  const GAMES_REQ = [
    [2322010,'God of War Ragnarök'],[1593500,'God of War'],[2358720,'Black Myth: Wukong'],[2622380,'Elden Ring Nightreign'],[1245620,'Elden Ring'],
    [3159330,"Assassin's Creed Shadows"],[2651280,"Marvel's Spider-Man 2"],[1817070,"Marvel's Spider-Man: Miles Morales"],[1817190,"Marvel's Spider-Man Remastered"],
    [2215430,'Ghost of Tsushima'],[1888930,'The Last of Us Part I'],[2531310,'The Last of Us Part II'],[1151640,'Horizon Zero Dawn'],[2420110,'Horizon Forbidden West'],
    [271590,'Grand Theft Auto V'],[1174180,'Red Dead Redemption 2'],[1091500,'Cyberpunk 2077'],[292030,'The Witcher 3'],[814380,'Sekiro'],[2050650,'Resident Evil 4'],
    [1196590,'Resident Evil Village'],[1687950,'Persona 5 Royal'],[976310,'Mortal Kombat 1'],[1778820,'Tekken 8'],[1888160,'Armored Core VI'],[1240440,'Halo Infinite'],
    [570,'Dota 2'],[2357570,'Overwatch 2'],[1962663,'Call of Duty'],[990080,'Hogwarts Legacy'],[1811260,'EA SPORTS FIFA 23'],[2195250,'EA SPORTS FC 24'],
    [2669320,'EA SPORTS FC 25'],[3405690,'EA SPORTS FC 26'],[1222670,'The Sims 4'],[1240440,'Halo Infinite'],[1888930,'The Last of Us'],[883710,'Uncharted: Legacy of Thieves'],
    [0,'Astro Bot'],[0,'Gran Turismo 7'],[0,'Demon\'s Souls'],[0,'Bloodborne'],[0,'Marvel\'s Wolverine'],[0,'Grand Theft Auto VI'],[0,'Ghost of Yotei']
  ];
  const reqStore = {
    get() { try { return JSON.parse(localStorage.getItem('hg.requests') || '[]'); } catch { return []; } },
    set(v) { localStorage.setItem('hg.requests', JSON.stringify(v)); }
  };
  const reqPoster = id => id ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900_2x.jpg` : '';
  let reqState = { view: 'shelf', q: '', game: null, opened: false };
  function renderRequest() {
    const root = document.createElement('div');
    page.innerHTML = ''; page.append(root); root.className = 'hg-pg rq';
    const go = (patch) => { reqState = Object.assign({}, reqState, patch); draw(); };
    const esc = s => String(s).replace(/&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;').replace(/"/g, '&' + 'quot;').replace(/'/g, '&#39;');
    const art = g => g && g.id ? `<img src="${reqPoster(g.id)}" alt="" data-fb="${esc((g.name || 'G').slice(0, 2).toUpperCase())}">` : `<div class="rq-ph">${esc(((g && g.name) || 'G').slice(0, 2).toUpperCase())}</div>`;
    const bindPosters = () => $$('img[data-fb]', root).forEach(im => { im.onerror = () => { const d = document.createElement('div'); d.className = 'rq-ph'; d.textContent = im.dataset.fb; im.replaceWith(d); }; });
    function draw() {
      const s = reqState;
      if (s.view === 'shelf') {
        const q = s.q.trim().toLowerCase();
        const list = (q ? GAMES_REQ.filter(g => g[1].toLowerCase().includes(q)) : GAMES_REQ).filter((g, i, a) => a.findIndex(x => x[1] === g[1]) === i).slice(0, 24);
        const custom = q && !GAMES_REQ.some(g => g[1].toLowerCase() === q);
        root.innerHTML = `<div class="rq-top"><button class="rq-back" data-back aria-label="Back">${IC.left()}</button><div><h1>Request a game</h1><p>₹200 paid now. Then we order it.</p></div></div>
          <label class="rq-search"><input id="rqFind" placeholder="Search any game" value="${esc(s.q)}" autocomplete="off"><button type="button" id="rqMine">Mine</button></label>
          <p class="rq-note">${list.length ? 'Tap a poster. The ₹200 is the order fee, not the hourly slot.' : 'Nothing matched. You can still request that name.'}</p>
          <div class="rq-grid">${list.map((g, i) => `<button class="rq-card" data-i="${i}">${g[0] ? `<img src="${reqPoster(g[0])}" alt="" loading="lazy" data-fb="${esc(g[1].slice(0, 2).toUpperCase())}">` : `<div class="rq-ph">${esc(g[1].slice(0, 2).toUpperCase())}</div>`}<b>${esc(g[1])}</b><small>₹200</small></button>`).join('')}${custom ? `<button class="rq-card" data-custom="1"><div class="rq-ph">+</div><b>Request “${esc(s.q)}”</b><small>₹200</small></button>` : ''}</div>`;
        const input = $('#rqFind', root);
        const caret = input.value.length; input.focus(); try { input.setSelectionRange(caret, caret); } catch {}
        input.addEventListener('input', () => { reqState.q = input.value; draw(); });
        $('#rqMine', root).onclick = () => go({ view: 'mine' });
        bindPosters();
        $$('.rq-card', root).forEach(b => b.onclick = () => {
          if (b.dataset.custom) go({ view: 'game', game: { id: 0, name: reqState.q.trim() }, opened: false });
          else { const g = list[+b.dataset.i]; go({ view: 'game', game: { id: g[0], name: g[1] }, opened: false }); }
        });
        return;
      }
      if (s.view === 'mine') {
        const rows = reqStore.get();
        root.innerHTML = `<div class="rq-top"><button class="rq-back" data-rq-back aria-label="Back">${IC.left()}</button><div><h1>Your requests</h1><p>Saved on this phone.</p></div></div>
          ${rows.length ? `<div class="rq-list">${rows.map(r => `<article class="rq-item">${r.id ? `<img src="${reqPoster(r.id)}" alt="" data-fb="${esc(r.name.slice(0, 2).toUpperCase())}">` : `<div class="rq-ph">${esc(r.name.slice(0, 2).toUpperCase())}</div>`}<div><b>${esc(r.name)}</b><small>${esc(r.code)} · ₹200 · ${new Date(r.at).toLocaleDateString('en-IN')}</small></div></article>`).join('')}</div>` : `<p class="rq-empty">No requests yet. Search a game and pay ₹200.</p>`}`;
        bindPosters();
        $('[data-rq-back]', root).onclick = () => go({ view: 'shelf' });
        return;
      }
      const g = s.game;
      if (s.view === 'game') {
        root.innerHTML = `<div class="rq-top"><button class="rq-back" data-rq-back aria-label="Back">${IC.left()}</button><div><h1>Game</h1><p>Check the poster, then pay.</p></div></div>
          <div class="rq-hero">${art(g)}<h2>${esc(g.name)}</h2>
          <ol class="rq-steps"><li><b>1</b><span>You pay ₹200 now.</span></li><li><b>2</b><span>We order this game for the shop.</span></li><li><b>3</b><span>Come play it here. Slot booking is extra.</span></li></ol>
          <div class="rq-fee"><span>Pay now</span><strong>₹200</strong></div>
          <button class="hg-btn p" id="rqPay" style="width:100%;justify-content:center">Pay ₹200${ARW}</button></div>`;
        bindPosters();
        $('[data-rq-back]', root).onclick = () => go({ view: 'shelf' });
        $('#rqPay', root).onclick = () => go({ view: 'pay', opened: false });
        return;
      }
      const note = 'Game request ' + g.name;
      const upi = `upi://pay?pa=${encodeURIComponent(REQ_UPI)}&pn=${encodeURIComponent('Hunter Gamers')}&am=${REQ_FEE}.00&cu=INR&tn=${encodeURIComponent(note)}`;
      const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=' + encodeURIComponent(upi);
      root.innerHTML = `<div class="rq-top"><button class="rq-back" data-rq-back aria-label="Back">${IC.left()}</button><div><h1>Pay ₹200</h1><p>${esc(g.name)}</p></div></div>
        <div class="rq-pay"><img class="rq-qr" src="${qr}" alt="UPI QR for ₹200"><p class="rq-id">${REQ_UPI}</p>
        <a class="hg-btn p" id="rqUpi" href="${upi}" style="justify-content:center">Open UPI app</a>
        <button class="hg-btn s" id="rqDone" ${s.opened ? '' : 'disabled'} style="justify-content:center">I paid ₹200</button>
        <p class="rq-note">Open the UPI app first. The ₹200 has to be paid before the request is placed. We cannot see your bank from the site, so the shop confirms it on WhatsApp.</p></div>`;
      $('[data-rq-back]', root).onclick = () => go({ view: 'game' });
      $('#rqUpi', root).addEventListener('click', () => { reqState.opened = true; $('#rqDone', root).disabled = false; });
      $('#rqDone', root).onclick = () => {
        if (!reqState.opened) return;
        const code = 'RQ' + Math.floor(1000 + Math.random() * 9000);
        const all = reqStore.get(); all.unshift({ id: g.id, name: g.name, code, at: Date.now() }); reqStore.set(all.slice(0, 30));
        const msg = encodeURIComponent(`Game request ${code}: ${g.name}. I paid ₹200 on UPI.`);
        location.href = 'https://wa.me/917038896627?text=' + msg;
        go({ view: 'done', code });
      };
    }
    if (reqState.view === 'done') reqState.view = 'shelf';
    draw();
  }

  const ROUTES = { control: renderControl, orders: renderOrders, request: renderRequest };
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
    const ART = { P1: 'cr-p1-r23', P2: 'cr-p2-r23', P3: 'cr-p3-r23', P4: 'cr-p4-r23', P5: 'cr-p5-r24' };
    page.innerHTML = `<div class="hg-pg hg-ctl cr">${pageHead(I('r-ctl.webp'), IC.live(26), 'Control room', '3 PS5 and 2 PS4 at Hunter Gamers, Indora. Live status, time left and the next free slot for every console.')}
      <div class="hg-pg-in">
      <section class="cr-hero"><img src="${I('cr-hero-r23.webp')}" alt="Three PS5 and two PS4 consoles" width="1024" height="576" decoding="async">
        <div class="cr-hero-tx"><p class="cr-k">Right now at the shop</p>
        <div class="cr-counts"><div class="f"><b class="cr-nf">0</b><span>Free</span></div><div class="p"><b class="cr-np">0</b><span>Playing</span></div></div>
        <p class="cr-next"></p></div></section>
      <div class="cr-list">${RIG.map(r => `<article class="cr-c" data-id="${r.id}" data-type="${r.type}">
        <div class="cr-art"><img src="${I(ART[r.id] + '.webp')}" alt="" loading="lazy" decoding="async"></div>
        <div class="cr-bd"><div class="cr-top"><span class="cr-ty ${r.type}">${r.type.toUpperCase()}</span><h3>${r.name.replace(' · ', ' #')}</h3><span class="cr-st"></span></div>
        <div class="cr-main"></div><div class="cr-foot"><span class="cr-q"></span></div></div></article>`).join('')}</div>
      <p class="cr-upd"></p>
      <p class="cr-demo" hidden>Demo data · the live feed switches on with the booking server</p></div></div>`;
    const els = {};
    $$('.cr-c', page).forEach(el => els[el.dataset.id] = { el, st: $('.cr-st', el), main: $('.cr-main', el), q: $('.cr-q', el), mode: '' });
    CTRL.draw = () => {
      if (!LIVE.data) return; const now = Date.now(), cs = LIVE.data.consoles.map(c => derive(c, now));
      $('.cr-demo', page).hidden = !LIVE.demo;
      const fr = cs.filter(c => c.st === 'free').length, pl = cs.filter(c => c.st === 'playing').length, nf = Math.min(...cs.map(c => c.free));
      $('.cr-nf', page).textContent = fr; $('.cr-np', page).textContent = pl;
      $('.cr-next', page).innerHTML = fr ? 'Walk in and play, a console is waiting' : `Next console free at <b>${tfmt(nf)}</b>`;
      cs.forEach(c => { const o = els[c.id]; if (!o) return; o.el.dataset.st = c.st;
        o.st.textContent = { free: 'Free', playing: 'Playing', reserved: 'Reserved' }[c.st];
        if (o.mode !== c.st) { o.mode = c.st;
          o.main.innerHTML = c.st === 'free' ? `<p class="cr-ready">Ready to play now</p><button class="cr-book" data-hg-book>Book now${ARW}</button>`
            : c.st === 'playing' ? `<div class="cr-left"><b class="n"></b><span>left</span></div><div class="cr-bar"><i></i></div><p class="cr-nx">Free at <b class="t"></b></p>`
            : `<div class="cr-left"><b class="n"></b><span>until booked slot</span></div><p class="cr-nx">Booking starts <b class="t"></b></p>`; }
        if (c.st === 'playing') { const d = c.cur.end - c.cur.start; $('.n', o.main).textContent = left(c.cur.end - now); $('.cr-bar i', o.main).style.transform = `scaleX(${Math.min(1, (now - c.cur.start) / d)})`; $('.t', o.main).textContent = tfmt(c.free); }
        else if (c.st === 'reserved') { $('.n', o.main).textContent = left(c.nxt[0].start - now); $('.t', o.main).textContent = tfmt(c.nxt[0].start); }
        const q = c.nxt.length; o.q.textContent = q ? `${q} in queue` : 'No queue'; o.q.classList.toggle('on', !!q); });
      $('.cr-upd', page).textContent = `Updated ${tfmt(LIVE.data.updated || now)} · refreshes every 15 s`;
    };
    CTRL.draw();
  }


  function renderOrders(filter = 'all') {
    CTRL.draw = null;
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
          <div class="r2"><code><small>Counter code</small>#${o.code || '—'}</code><b>₹${Number(o.amount || 0).toLocaleString('en-IN')}</b><button class="hg-btn s" data-hg-book>Rebook</button></div></div></li>`; }).join('')}</ul>`
      : `<div class="hg-empty hg-oh-empty">${IC.pad(46)}<b>${filter === 'all' ? 'No bookings yet' : 'Nothing here'}</b><span>${filter === 'all' ? 'Book your first slot and it will show up here with game, console, time and amount.' : 'No ' + filter + ' bookings on this phone.'}</span><button class="hg-btn p" data-hg-book>Book a slot${ARW}</button></div>`}
      </div></div>`;
    $$('[data-f]', page).forEach(b => b.onclick = () => renderOrders(b.dataset.f));
  }


  /* ---------- Official PS5 hardware strip (Sony Interactive press images) ---------- */
  const FEATS = [
    { id: 'sm2', lay: 'bleed', img: 'c-spidey-feature.webp', alt: 'Spider-Man', bg: ['fx-sm2-bg', 'fx-sm2-a', 'fx-sm2-b'], kick: "Marvel's Spider-Man 2 · PS5", h: 'Suit up. <span>Swing in.</span>', p: 'Play the full campaign on our PS5s, at the shop, by the hour.', glow: '251,36,28' },
    { id: 'gow', lay: 'collage', img: 'f-kratos.webp', alt: 'Kratos and Atreus', bg: ['fx-gow-a', 'fx-gow-b', 'fx-gow-c'], kick: 'God of War · PS5 · PS4', h: 'Father. <span>Son. War.</span>', p: 'Kratos and Atreus take on the Norse realms. Big screen, surround sound, controller in hand.', glow: '64,156,255' },
    { id: 'got', lay: 'split', img: 'f-jin.webp', alt: 'Jin Sakai', bg: ['fx-got-a', 'fx-got-b', 'fx-got-c'], kick: "Ghost of Tsushima Director's Cut · PS5 · PS4", h: 'Become <span>the Ghost.</span>', p: 'Draw your blade as Jin Sakai in feudal Japan. Stunning on our PS5s.', glow: '232,176,74' },
    { id: 'smm', lay: 'stack', img: 'f-miles.webp', alt: 'Miles Morales', bg: ['fx-smm-a', 'fx-smm-b', 'fx-smm-c'], kick: "Marvel's Spider-Man: Miles Morales · PS5", h: 'Be yourself. <span>Be Spider-Man.</span>', p: 'Venom blasts, camouflage and Harlem at Christmas. Swing by for a session.', glow: '160,82,255' },
  ];
  function buildFeature() {
    let at = $('#games'); if (!at) return;
    FEATS.forEach((f, i) => {
      const d = document.createElement('section'); d.className = 'hg-feat fx-' + f.lay; d.style.setProperty('--glow', f.glow); d.setAttribute('aria-label', f.alt);
      const pics = f.bg.map((b, k) => `<div class="fx-p fx-p${k}"><img src="${I(b + '.webp')}" alt="" loading="lazy" decoding="async"></div>`).join('');
      if (f.lay === 'plain') { d.className = 'hg-feat'; d.innerHTML = `<div class="hg-feat-in"><img class="hg-feat-cut" src="${I(f.img)}" alt="${f.alt}" loading="lazy" decoding="async"><div class="hg-feat-txt"><p class="hg-eyebrow">${f.kick}</p><h2>${f.h}</h2><p>${f.p}</p><button class="hg-btn p" data-feat="${f.id}">Book this game${ARW}</button></div></div>`; }
      else d.innerHTML = `<div class="fx-art">${pics}<img class="hg-feat-cut" src="${I(f.img)}" alt="${f.alt}" loading="lazy" decoding="async"></div>
        <div class="hg-feat-txt"><p class="hg-eyebrow">${f.kick}</p><h2>${f.h}</h2>
        <p>${f.p}</p><button class="hg-btn p" data-feat="${f.id}">Book this game${ARW}</button></div>`;
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
    // never let another sheet (login, cookies, app promo) swallow the update popup: wait until the screen is clear
    if (openSheet || (loginEl && loginEl.classList.contains('on'))) { clearTimeout(window.__hgUpdWait); window.__hgUpdWait = setTimeout(() => window.HGUpdate(ver, notes), 1200); return; }
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
      setTimeout(() => window.HGUpdate(v.versionName, v.notes), 1200);
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

  buildHero(); buildGames(); buildFeature(); buildHardware(); buildLive(); { const lv = $('#live'), co = $('#consoles'), re = $('#rent'); if (lv && co) { lv.after(co); if (re) co.after(re); } } buildReveal(); route(); buildNav(); wireActions(); addAppLinks();
  loginEl = buildLogin(); cookieEl = buildCookie(); fillUser();
  if (IN_APP) document.documentElement.classList.add('in-app');
  if (!store.get('user') && !store.get('guest')) openLogin(); else afterLogin();
  selfUpdateCheck(); document.addEventListener('visibilitychange', () => { if (!document.hidden) selfUpdateCheck(); });

  window.HG = { ordersPopup, gamePopup, games: () => GAMES, snacksPopup, accountPopup, live: LIVE, openBook, snackAdded, openLogin, appPopup, chooseConsole, consolePopup, rentPopup, cookie: () => cookieEl.classList.add('on'), hide };
})();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(r => {
  r.update().catch(() => {});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) r.update().catch(() => {}); });
  let shown = false; const hadC = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (shown || !hadC) return; shown = true;
    const t = document.createElement('div'); t.className = 'hg-newver'; t.setAttribute('role', 'status');
    t.innerHTML = '<span>New version of the site is ready</span><button type="button">Refresh</button>';
    t.querySelector('button').onclick = () => location.reload();
    document.body.append(t); requestAnimationFrame(() => t.classList.add('on'));
  });
}).catch(() => {}));
