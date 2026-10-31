/* Hunter Gamers motion layer: no libraries, rAF-throttled, transforms only. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia('(pointer:fine)').matches, RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const io = (els, fn, opt = { rootMargin: '0px 0px -12% 0px' }) => { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } }), opt); els.forEach(e => o.observe(e)); };

  /* 1. Preloader with logo wipe + counter, once per session */
  if (!sessionStorage.getItem('hm.pre') || /[?&]intro/.test(location.search)) {
    sessionStorage.setItem('hm.pre', '1');
    const p = document.createElement('div'); p.className = 'hm-pre';
    p.innerHTML = '<div class="sl"></div><div class="hm-pre-in"><img src="/img/hg-logo.png" alt=""><b>Hunter Gamers</b><div class="bar"><i></i></div><span class="n">000</span></div>';
    document.documentElement.append(p);
    let v = 0; const bar = $('.bar i', p), n = $('.n', p), t0 = performance.now();
    const step = () => { const k = Math.min(1, (performance.now() - t0) / 1400); v = Math.round((1 - Math.pow(1 - k, 3)) * 100);
      bar.style.transform = `scaleX(${v / 100})`; n.textContent = String(v).padStart(3, '0');
      if (k < 1) requestAnimationFrame(step); else setTimeout(() => { p.classList.add('out'); setTimeout(() => p.remove(), 1000); }, 180); };
    requestAnimationFrame(step);
  }

  const ready = fn => document.readyState !== 'loading' ? setTimeout(fn, 60) : addEventListener('DOMContentLoaded', () => setTimeout(fn, 60));
  ready(() => {
    /* 2. Scroll progress */
    const prog = document.createElement('div'); prog.className = 'hm-prog'; document.body.append(prog);

    /* 3. Split-word reveal + scramble + glitch on section titles (hero untouched) */
    const heads = $$('main h2, section h2').filter(h => !h.closest('.hgx,.hg-login,.hg-pop,.hg-sheet,.hg-lt'));
    heads.forEach(h => {
      if (h.dataset.hm) return; h.dataset.hm = 1;
      const walk = node => [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { f.append(w); return; } const s = document.createElement('span'); s.className = 'w'; const i = document.createElement('span'); i.textContent = w; s.append(i); f.append(s); }); c.replaceWith(f); }
        else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
      walk(h); h.classList.add('hm-split', 'hm-glitch'); h.dataset.t = h.textContent;
      $$('.w>span', h).forEach((s, i) => s.style.setProperty('--i', i));
    });
    io(heads, h => { h.classList.add('hm-in'); setTimeout(() => { h.classList.add('hm-g'); setTimeout(() => h.classList.remove('hm-g'), 1100); }, 500); });

    /* scramble on eyebrows */
    const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&';
    const eyes = $$('.hg-eyebrow, .eyebrow').filter(e => !e.closest('.hgx,.hg-pop,.hg-sheet') && e.children.length === 0);
    io(eyes, e => { const fin = e.textContent; let f = 0; const tot = 18;
      const tick = () => { e.textContent = fin.split('').map((c, i) => c === ' ' || i < (f / tot) * fin.length ? c : CH[(Math.random() * CH.length) | 0]).join(''); if (++f <= tot) requestAnimationFrame(tick); else e.textContent = fin; };
      if (!RM) tick(); });

    /* 4. Reveal-up for cards */
    const ups = $$('.hg-feat-txt>*, .hg-hw>*, .console-card, .rate-card, .hg-lt, .snack, .faq details').filter(e => !e.closest('.hgx'));
    ups.forEach(e => e.classList.add('hm-up')); io(ups, e => e.classList.add('hm-in'));

    /* 5. Marquee strip before Live teaser */
    const live = $('#live'); if (live) { const m = document.createElement('div'); m.className = 'hm-mq'; m.setAttribute('aria-hidden', 'true');
      const words = ['PS5', 'Pay by the hour', 'PS4', 'Indora · Nagpur', 'Snacks', 'Walk in and play'];
      m.innerHTML = `<div>${[...words, ...words, ...words, ...words].map(w => `<span>${w}</span>`).join('')}</div>`; const o = document.createElement('div'); o.className = 'hm-mq-o'; o.append(m); live.before(o); }

    /* 6. Pinned feature scene with parallax depth (Spider-Man drifts and scales while text holds) */
    const feat = $('.hg-feat');
    if (feat && !RM) { const wrap = document.createElement('div'); wrap.className = 'hm-pin'; const st = document.createElement('div'); st.className = 'hm-stick';
      feat.before(wrap); wrap.append(st); st.append(feat);
      const fig = $('img', feat), txt = $('.hg-feat-txt', feat); fig && fig.classList.add('hm-depth'); txt && txt.classList.add('hm-depth');
      wrap._f = k => { if (fig) fig.style.transform = `translate3d(${(k - .5) * -40}px,${(k - .5) * -80}px,0) scale(${1 + k * .18}) rotate(${(k - .5) * -6}deg)`;
        if (txt) txt.style.transform = `translate3d(0,${(.5 - k) * 60}px,0)`; };
      PIN.push(wrap); }

    /* 7. Magnetic buttons */
    const mags = $$('.hg-btn, .btn, .hg-cf-go, .hg-nav .fab .b').filter(b => !b.closest('.hgx'));
    mags.forEach(b => b.classList.add('hm-mag'));
    if (fine) document.addEventListener('pointermove', e => { const b = e.target.closest('.hm-mag'); $$('.hm-mag.hm-on').forEach(x => { if (x !== b) { x.style.transform = ''; x.classList.remove('hm-on'); } });
      if (!b) return; const r = b.getBoundingClientRect(); b.classList.add('hm-on'); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; }, { passive: true });
    document.addEventListener('pointerdown', e => { const b = e.target.closest('.hm-mag'); if (b) { b.style.transform = 'scale(.94)'; setTimeout(() => b.style.transform = '', 180); } }, { passive: true });

    /* 8. Cursor glow (desktop) + touch ripple (mobile) */
    if (fine) { const g = document.createElement('div'); g.className = 'hm-glow'; document.body.append(g); let gx = 0, gy = 0, tx = 0, ty = 0, run = false;
      const loop = () => { gx += (tx - gx) * .15; gy += (ty - gy) * .15; g.style.transform = `translate3d(${gx}px,${gy}px,0)`; if (Math.abs(tx - gx) + Math.abs(ty - gy) > .5) requestAnimationFrame(loop); else run = false; };
      addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; g.classList.add('on'); if (!run) { run = true; requestAnimationFrame(loop); } }, { passive: true }); }
    addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && fine) return; const r = document.createElement('i'); r.className = 'hm-ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.append(r); setTimeout(() => r.remove(), 650); }, { passive: true });

    /* 9. 3D tilt + glare on posters (pointer on desktop, gyroscope-free touch drag on mobile) */
    const tiltSel = '.hg-oc .th, .hg-hw > *, .console-card, .hg-lt';
    const tilt = (el, x, y) => { const r = el.getBoundingClientRect(), px = (x - r.left) / r.width, py = (y - r.top) / r.height;
      el.style.transform = `perspective(700px) rotateY(${(px - .5) * 14}deg) rotateX(${(.5 - py) * 12}deg) translateZ(0)`; el.style.setProperty('--gx', px * 100 + '%'); el.style.setProperty('--gy', py * 100 + '%'); el.style.setProperty('--go', 1); };
    const untilt = el => { el.style.transform = ''; el.style.setProperty('--go', 0); };
    document.addEventListener('pointermove', e => { const el = e.target.closest(tiltSel); if (!el) return; if (!el.classList.contains('hm-tilt')) { el.classList.add('hm-tilt'); if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; } tilt(el, e.clientX, e.clientY); }, { passive: true });
    document.addEventListener('pointerout', e => { const el = e.target.closest(tiltSel); if (el && !el.contains(e.relatedTarget)) untilt(el); }, { passive: true });
    document.addEventListener('pointerup', e => { const el = e.target.closest(tiltSel); if (el) untilt(el); }, { passive: true });

    /* 10. Clip-path circle wipe on page routes (#control, #orders) */
    const wipe = document.createElement('div'); wipe.className = 'hm-wipe'; document.body.append(wipe); let last = { x: innerWidth / 2, y: innerHeight - 40 };
    addEventListener('pointerdown', e => { last = { x: e.clientX, y: e.clientY }; }, { passive: true });
    addEventListener('hashchange', () => { if (!/^#(control|orders)$/.test(location.hash) || RM) return; wipe.style.setProperty('--wx', last.x + 'px'); wipe.style.setProperty('--wy', last.y + 'px'); wipe.classList.remove('go'); void wipe.offsetWidth; wipe.classList.add('go'); });

    /* Scroll loop: one rAF per frame, only while scrolling */
    let tick = false;
    const onScroll = () => { tick = false; const h = document.documentElement, k = h.scrollTop / Math.max(1, h.scrollHeight - innerHeight); prog.style.transform = `scaleX(${k})`;
      PIN.forEach(w => { const r = w.getBoundingClientRect(), kk = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); w._f(kk); }); };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();
    window.HM = { replayIntro: () => { sessionStorage.removeItem('hm.pre'); location.reload(); } };
  });
  const PIN = [];
})();
