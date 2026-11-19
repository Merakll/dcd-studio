document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- МОБИЛЬНОЕ МЕНЮ ---
const burger = $('#burgerBtn'), menu = $('#mobileMenu');
if (burger && menu) {
  const setMenu = open => {
    burger.classList.toggle('active', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
}

// --- ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ ---
const revealSel = '.hero-content > *, .hero-visual, .directions-header, .card, .project-card, .filter-bar, .about-hero-card, .about-hero-art, .about-fact-card, .team-member-card, .about-join-banner, .stub-card, .project-detail-section > *, .devlog-entry';
if ('IntersectionObserver' in window && !reduce) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const t = e.target;
    t.classList.add('is-in');
    io.unobserve(t);
    setTimeout(() => t.removeAttribute('data-reveal'), 1300);
  }), { threshold: 0.12 });
  $$(revealSel).forEach(el => {
    const i = [...el.parentElement.children].indexOf(el);
    el.style.setProperty('--d', Math.min(i, 5) * 0.08 + 's');
    el.setAttribute('data-reveal', '');
    io.observe(el);
  });
}

// --- КУБ: НАКЛОН ЗА КУРСОРОМ / ГИРОСКОП ---
const tilt = $('#heroTilt');
if (tilt && !reduce) {
  const setTilt = (rx, ry) => {
    tilt.style.setProperty('--rx', rx + 'deg');
    tilt.style.setProperty('--ry', ry + 'deg');
  };
  if (matchMedia('(hover: hover)').matches) {
    const hero = $('.hero');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      setTilt(-((e.clientY - r.top) / r.height - 0.5) * 18, ((e.clientX - r.left) / r.width - 0.5) * 22);
    });
    hero.addEventListener('pointerleave', () => setTilt(0, 0));
  } else if ('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    // Android: гироскоп без запроса; на iOS куб просто парит
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));
    addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      setTilt(clamp(((e.beta || 0) - 45) / 3, 14), clamp(e.gamma / 2, 18));
    });
  }
}

// --- СЛАЙДЕР «НАШИ НАПРАВЛЕНИЯ» ---
const track = $('#cardsTrack');
if (track) {
  const cards = $$('.card', track), counter = $('#sliderCounter'), prev = $('#prevBtn'), next = $('#nextBtn');
  const pad = n => String(n).padStart(2, '0');
  const step = () => (cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const update = () => {
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    const i = atEnd ? cards.length : Math.round(track.scrollLeft / step()) + 1;
    counter.textContent = `${pad(Math.min(i, cards.length))} / ${pad(cards.length)}`;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = atEnd;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  addEventListener('resize', update);
  update();

  // перетаскивание мышью (на телефоне работает родной свайп)
  let down = false, moved = false, sx = 0, sl = 0;
  track.addEventListener('dragstart', e => e.preventDefault());
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); }
    if (moved) track.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => { down = false; track.classList.remove('dragging'); });
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
}

// --- ФИЛЬТРЫ ПО ТЕГАМ (проекты, девлог) ---
const bar = $('#filterBar');
if (bar) {
  const items = $$(bar.dataset.target);
  const tagsOf = el => (el.dataset.tags || '').split(',').map(s => s.trim()).filter(Boolean);
  const mk = (value, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (value === 'all' ? ' active' : '');
    b.dataset.filter = value;
    b.textContent = label;
    return b;
  };
  const all = [...new Set(items.flatMap(tagsOf))];
  bar.append(mk('all', 'Все'), ...all.map(t => mk(t, t)));
  const empty = $('#filterEmpty');
  bar.addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('.chip', bar).forEach(c => c.classList.toggle('active', c === b));
    let shown = 0;
    items.forEach(el => {
      const ok = b.dataset.filter === 'all' || tagsOf(el).includes(b.dataset.filter);
      el.hidden = !ok;
      if (ok) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  });
}

// --- ЕСЛИ КАРТИНКИ ЕЩЁ НЕТ — ПОКАЗЫВАЕМ ГРАДИЕНТ ВМЕСТО БИТОГО ЗНАЧКА ---
$$('img.card-bg, img.project-img, .gallery-big-item img').forEach(img => {
  const bad = () => img.classList.add('img-missing');
  img.addEventListener('error', bad);
  if (img.complete && !img.naturalWidth) bad();
});

// --- ПЛАВНЫЕ ПЕРЕХОДЫ МЕЖДУ СТРАНИЦАМИ ---
document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (reduce || a.target === '_blank' || a.hasAttribute('download')) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
  e.preventDefault();
  document.body.classList.add('page-leave');
  setTimeout(() => { location.href = a.href; }, 220);
});
addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('page-leave'); });
