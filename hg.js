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
  const I = n => '/img/' + (REN[n] || n) + '?v=46';
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

  // Each slide: one game. Centre = clean cutout character. Background = login-style scrolling mosaic of THAT game's own 4k posters only (8 images).
  const GAME_POSTERS = {
    wolverine: ['wolverine-bg.webp', 'wolverine-key.webp', 'card-01.webp', 'card-11.webp', 'p-wolverine.webp', 'c-wolverine-md.webp', 'c-wolverine-sm.webp', 'wolverine-bg-md.webp'],
    gow: ['h-gow.webp', 'p-gow.webp', 'c-gow-md.webp', 'c-gow-sm.webp', 'h-gow-md.webp', 'h-gow-sm.webp', 'p-gow.webp', 'c-gow-md.webp'],
    gta6: ['gta6-bg.webp', 'gta6-jason-bg.webp', 'p-gta6.webp', 'card-02.webp', 'card-05.webp', 'gta6-bg-md.webp', 'gta6-jason-bg-md.webp', 'c-gta6-md.webp'],
    sm2: ['spidey2-bg.webp', 'h-sm2.webp', 'p-sm2.webp', 'card-06.webp', 'card-10.webp', 'spidey2-bg-md.webp', 'h-sm2-md.webp', 'c-peter-md.webp'],
    acs: ['h-acs.webp', 'p-acs.webp', 'h-acs-md.webp', 'h-acs-sm.webp', 'c-acs-md.webp', 'c-acs-sm.webp', 'p-acs.webp', 'h-acs.webp'],
    fc26: ['h-fc26.webp', 'p-fc26.webp', 'h-fc26-md.webp', 'h-fc26-sm.webp', 'c-fc26-md.webp', 'c-fc26-sm.webp', 'p-fc26.webp', 'h-fc26.webp'],
    nr: ['h-nr.webp', 'p-nr.webp', 'h-nr-md.webp', 'h-nr-sm.webp', 'c-nr-md.webp', 'c-nr-sm.webp', 'p-nr.webp', 'h-nr.webp'],
    wk: ['h-wk.webp', 'p-wk.webp', 'h-wk-md.webp', 'h-wk-sm.webp', 'c-wk-md.webp', 'c-wk-sm.webp', 'p-wk.webp', 'h-wk.webp']
  };
  const SLIDES = [
    { id: 'wolverine', tag: "Marvel's Wolverine · PS5", h: 'Unleash the <span>claws.</span>' },
    { id: 'gow', tag: 'God of War Ragnarök', h: 'Kratos is <span>waiting.</span>' },
    { id: 'gta6', cut: 'gta6-r24', soon: 1, tag: 'Grand Theft Auto VI', h: 'Vice City nights. <span>Coming soon.</span>' },
    { id: 'sm2', cut: 'peter', tag: "Marvel's Spider-Man 2", h: 'Swing into <span>the city.</span>' },
    { id: 'acs', tag: "Assassin's Creed Shadows", h: 'Strike from <span>the shadows.</span>' },
    { id: 'fc26', tag: 'EA SPORTS FC 26', h: 'Settle it <span>on the pitch.</span>' },
    { id: 'nr', tag: 'Elden Ring Nightreign', h: 'Survive <span>the night.</span>' },
    { id: 'wk', tag: 'Black Myth: Wukong', h: 'Take up <span>the staff.</span>' },
  ];
  const PIDS2 = ['sb', 'hfw', 'ff7r', 't8', 'mk1', 'hl', 'tlou2', 'rc', 'dmc5'];
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

  /* ---------- Hero: cutout centre-stage over login-style per-game poster mosaic ---------- */
  const MOB = () => innerWidth <= 760 || !matchMedia('(orientation: landscape)').matches;
  const cutSrc = s => {
    let n = s.cut || ('c-' + s.id + (MOB() ? '-sm' : '-md'));
    const sm = { 'c-peter-md': 'c-peter-sm', 'c-wk-md': 'c-wk-sm', 'c-wolverine-md': 'c-wolverine-sm' };
    if (innerWidth <= 760 && sm[n]) n = sm[n];
    return I(n + '.webp');
  };
  function buildHero() {
    const hx = $('#top > .hgx') || document.createElement('section');
    hx.className = 'hgx'; hx.setAttribute('aria-label', 'Featured games');
    // Login-style scrolling mosaic of each game's own 8 posters + central character cutout
    const mosaic = (s, i) => {
      const posters = (GAME_POSTERS[s.id] || []).slice(0, 8);
      const cols = [0,1,2,3].map(k => {
        const set = posters.concat(posters.slice(0, 4));
        return `<div class="hgl-col"><div class="hgl-track">${[...set, ...set].map(p => `<img src="${I(p)}" alt="" decoding="async">`).join('')}</div></div>`;
      }).join('');
      return `<div class="hgx-mosaic${i ? '' : ' on'}" data-id="${s.id}"><div class="hgl-cols">${cols}</div><div class="hgl-shade"></div></div>`;
    };
    hx.innerHTML = `${SLIDES.map(mosaic).join('')}
      <div class="hgx-layer hgx-subs">${SLIDES.map((s, i) => s.pop
        ? `<div class="hgx-pop hgx-subject-w${i ? '' : ' on'}" data-id="${s.id}"><img ${i ? 'data-src' : 'src'}="${cutSrc(s)}" alt="" decoding="async"${i ? '' : ' fetchpriority="high"'}></div>`
        : `<img data-id="${s.id}" class="hgx-subject hgx-subject-w${i ? '' : ' on'}" ${i ? 'data-src' : 'src'}="${cutSrc(s)}" alt="" decoding="async">`).join('')}</div>
      ${SLIDES.map((s, i) => `<div class="hgx-copy${i ? '' : ' on'}" aria-hidden="${i ? 'true' : 'false'}"><span class="hgx-tag"><i></i>${s.tag}</span>${s.soon ? '<span class="hgx-soon">Coming soon</span>' : ''}<h1>${s.h}</h1>
      <p>PS5 & PS4 by the hour in Indora, Nagpur. Pick a slot, add snacks, walk in and play.</p>
      <div class="hgx-cta"><button class="hg-btn p" data-hg-book>Book a slot${ARW}</button><button class="hg-btn s" data-route="request">Request a game</button></div></div>`).join('')}
      <div class="hgx-progress"></div>`;
    if (!hx.parentNode) $('#top').prepend(hx);
    const mosaics = $$('.hgx-mosaic', hx), subs = $$('.hgx-subject-w', hx), copies = $$('.hgx-copy', hx), prog = $('.hgx-progress', hx);
    const preload = src => new Promise(r => { const im = new Image(); im.decoding = 'async'; im.src = src; (im.decode ? im.decode() : new Promise((a, b) => { im.onload = a; im.onerror = b; })).then(r, r); });
    const ready = SLIDES.map(() => null);
    const ensure = i => ready[i] || (ready[i] = Promise.all([preload(cutSrc(SLIDES[i]))]).then(() => {
      const im = subs[i].tagName === 'IMG' ? subs[i] : $('img', subs[i]); if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
    }));
    let auto = 0, drag = 0, cur = 0, t0 = performance.now(), visible = true, busy = false;
    const DUR = 6500;
    function go(i) {
      const next = (i + SLIDES.length) % SLIDES.length; if (next === cur || busy) { t0 = performance.now(); return; }
      busy = true;
      ensure(next).then(() => {
        const prev = cur; cur = next;
        mosaics.forEach((b, j) => b.classList.toggle('on', j === cur));
        subs[prev].classList.add('out'); subs[prev].classList.remove('on');
        subs[cur].classList.remove('out'); subs[cur].classList.add('on');
        copies.forEach((c, j) => { c.classList.toggle('on', j === cur); c.setAttribute('aria-hidden', j !== cur); });
        setTimeout(() => { busy = false; }, 700);
        ensure((cur + 1) % SLIDES.length);
        t0 = performance.now();
      });
    }
    function tick() {
      if (!visible || reduce || busy) return;
      if (performance.now() - t0 > DUR) go(cur + 1);
      requestAnimationFrame(tick);
    }
    hx.addEventListener('pointerdown', e => { if (e.button) return; drag = 1; auto = performance.now(); }, { passive: true });
    hx.addEventListener('pointerup', e => { if (Math.abs(performance.now() - auto) > 200) go(cur + (e.clientX < hx.clientWidth / 2 ? -1 : 1)); drag = 0; });
    addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) t0 = performance.now(); });
    ensure(0); requestAnimationFrame(tick);
    setInterval(() => { if (visible && !reduce && !busy) go(cur + 1); }, DUR);
  }
  buildHero();

  // rest of the original file continues below — this is a partial update focused on hero
})();