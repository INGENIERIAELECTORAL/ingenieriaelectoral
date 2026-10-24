/* Ingeniería Electoral Consultores · interacciones del sitio */
(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navegación ---------- */
  const nav = $('[data-nav]');
  if (nav) {
    const burger = $('[data-burger]', nav);
    const items = $$('[data-dropdown]', nav);
    const mq = window.matchMedia('(max-width: 1100px)');

    const onScroll = () => nav.classList.toggle('is-compact', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const closeAll = (except) => items.forEach(it => {
      if (it !== except) { it.classList.remove('is-open'); $('.nav__toggle', it).setAttribute('aria-expanded', 'false'); }
    });

    items.forEach(it => {
      const toggle = $('.nav__toggle', it);
      toggle.addEventListener('click', () => {
        const open = !it.classList.contains('is-open');
        closeAll(it);
        it.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      if (!mq.matches) {
        let timer;
        it.addEventListener('mouseenter', () => { clearTimeout(timer); if (!mq.matches) { closeAll(it); it.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); } });
        it.addEventListener('mouseleave', () => { if (!mq.matches) timer = setTimeout(() => { it.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }, 160); });
      }
      it.addEventListener('focusout', (e) => {
        if (!it.contains(e.relatedTarget)) { it.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
      });
    });

    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      if (!open) closeAll();
    };
    burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('.nav__menu a', nav).forEach(a => a.addEventListener('click', () => { if (mq.matches) setMenu(false); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); closeAll(); } });
    document.addEventListener('click', (e) => { if (!nav.contains(e.target)) { closeAll(); if (mq.matches) setMenu(false); } });
    mq.addEventListener('change', () => { setMenu(false); closeAll(); });
  }

  /* ---------- Revelado al desplazar ---------- */
  const revealables = $$('.reveal, .reveal-group');
  if (revealables.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealables.forEach(el => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
      revealables.forEach(el => io.observe(el));
      // Lo que ya está en pantalla al cargar
      setTimeout(() => revealables.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible'); }), 50);
    }
  }

  /* ---------- Grupos de pestañas (teclado) ---------- */
  function tabGroup(buttons, onSelect) {
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => onSelect(i));
      b.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % buttons.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = buttons.length - 1;
        if (n === null) return;
        e.preventDefault(); buttons[n].focus(); onSelect(n);
      });
    });
  }

  /* ---------- Exploradores de funciones ---------- */
  $$('[data-explorer]').forEach(ex => {
    const buttons = $$('.fn', ex);
    const stage = $('[data-stage]', ex);
    const select = (i) => {
      buttons.forEach((b, j) => {
        const on = i === j;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      const b = buttons[i];
      if (stage && stage.getAttribute('src') !== b.dataset.img) {
        stage.classList.remove('is-swapping');
        stage.src = b.dataset.img;
        stage.alt = b.dataset.alt || '';
        if (!reduced) requestAnimationFrame(() => stage.classList.add('is-swapping'));
      }
    };
    tabGroup(buttons, select);
  });

  /* ---------- Línea del tiempo ---------- */
  const tl = $('[data-timeline]');
  if (tl) {
    const data = JSON.parse($('[data-tl-data]', tl).textContent);
    const years = $$('.timeline__year', tl);
    const panel = $('.timeline__panel', tl);
    const title = $('[data-tl-title]', tl);
    const text = $('[data-tl-text]', tl);
    const prev = $('[data-tl-prev]', tl);
    const next = $('[data-tl-next]', tl);
    let idx = 0;
    const show = (i) => {
      idx = (i + data.length) % data.length;
      years.forEach((y, j) => { const on = j === idx; y.setAttribute('aria-selected', String(on)); y.tabIndex = on ? 0 : -1; });
      panel.setAttribute('aria-labelledby', years[idx].id);
      panel.classList.remove('is-swapping');
      title.innerHTML = `${data[idx].y} <b>${data[idx].t}</b>`;
      text.textContent = data[idx].p;
      if (!reduced) requestAnimationFrame(() => panel.classList.add('is-swapping'));
      years[idx].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
      prev.disabled = idx === 0; next.disabled = idx === data.length - 1;
    };
    tabGroup(years, show);
    prev.addEventListener('click', () => show(idx - 1));
    next.addEventListener('click', () => show(idx + 1));
    prev.disabled = true;
  }

  /* ---------- Diálogos (biografías) ---------- */
  const lockScroll = (on) => { document.documentElement.style.overflow = on ? 'hidden' : ''; };
  $$('dialog').forEach(d => {
    d.addEventListener('close', () => { lockScroll(false); if (d._opener) d._opener.focus({ preventScroll: true }); });
    $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close();
    });
  });
  $$('[data-open]').forEach(b => b.addEventListener('click', () => {
    const d = document.getElementById(b.dataset.open);
    if (!d) return;
    d._opener = b; lockScroll(true); d.showModal();
    const c = $('[data-close]', d); if (c) c.focus();
  }));

  /* ---------- FAQ: el acordeón nativo funciona sin script; aquí solo se sincroniza aria-expanded ---------- */
  $$('[data-faq] details').forEach(item => {
    const q = $('summary', item);
    if (!q) return;
    const sync = () => q.setAttribute('aria-expanded', String(item.open));
    sync();
    item.addEventListener('toggle', sync);
  });

  /* ---------- Carrusel de prensa ---------- */
  const car = $('[data-carousel]');
  if (car) {
    const track = $('.carousel__track', car);
    const slides = $$('.carousel__slide', car);
    const imgs = slides.map(s => $('img', s));
    const counter = $('[data-counter]', car);
    const caption = $('[data-caption]', car);
    const thumbs = $$('[data-go]', car);
    const total = slides.length;
    let i = 0;

    const lb = $('#lightbox');
    const lbImg = lb && $('[data-lb-img]', lb);
    const lbCounter = lb && $('[data-lb-counter]', lb);
    const lbCaption = lb && $('[data-lb-caption]', lb);

    const render = () => {
      track.style.transform = `translateX(${-i * 100}%)`;
      counter.textContent = `${i + 1} de ${total}`;
      caption.textContent = imgs[i].alt;
      thumbs.forEach((t, j) => { if (j === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
      slides.forEach((s, j) => { s.setAttribute('aria-hidden', String(j !== i)); $('button', s).tabIndex = j === i ? 0 : -1; });
      if (lb && lb.open) {
        lbImg.src = imgs[i].src; lbImg.alt = imgs[i].alt;
        lbCounter.textContent = `${i + 1} de ${total}`; lbCaption.textContent = imgs[i].alt;
      }
    };
    const go = (n) => { i = (n + total) % total; render(); };
    $('[data-prev]', car).addEventListener('click', () => go(i - 1));
    $('[data-next]', car).addEventListener('click', () => go(i + 1));
    thumbs.forEach((t, j) => t.addEventListener('click', () => go(j)));
    car.addEventListener('keydown', (e) => {
      if (e.target.closest('[data-thumbs]')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    });

    // Deslizamiento táctil / arrastre
    const vp = $('.carousel__viewport', car);
    let startX = null, dx = 0, dragging = false;
    const onStart = (x) => { startX = x; dx = 0; dragging = true; track.style.transition = 'none'; };
    const onMove = (x) => { if (!dragging) return; dx = x - startX; track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`; };
    const onEnd = () => {
      if (!dragging) return; dragging = false; track.style.transition = '';
      const limit = Math.max(40, vp.clientWidth * 0.12);
      if (dx < -limit) go(i + 1); else if (dx > limit) go(i - 1); else render();
    };
    vp.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; onStart(e.clientX); });
    vp.addEventListener('pointermove', (e) => onMove(e.clientX));
    vp.addEventListener('pointerup', onEnd);
    vp.addEventListener('pointercancel', onEnd);
    vp.addEventListener('pointerleave', onEnd);
    // Evitar que un arrastre dispare la ampliación
    let moved = false;
    vp.addEventListener('pointerdown', () => { moved = false; });
    vp.addEventListener('pointermove', () => { if (Math.abs(dx) > 8) moved = true; });
    $$('[data-zoom]', car).forEach(b => b.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); return; }
      if (!lb) return;
      go(Number(b.dataset.zoom));
      lb._opener = b; lockScroll(true); lb.showModal(); render();
      $('[data-close]', lb).focus();
    }));

    if (lb) {
      $('[data-lb-prev]', lb).addEventListener('click', () => go(i - 1));
      $('[data-lb-next]', lb).addEventListener('click', () => go(i + 1));
      lb.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
      });
      // Deslizamiento en la vista ampliada
      let lx = null;
      lb.addEventListener('pointerdown', (e) => { lx = e.clientX; });
      lb.addEventListener('pointerup', (e) => { if (lx === null) return; const d = e.clientX - lx; lx = null; if (d < -60) go(i + 1); else if (d > 60) go(i - 1); });
    }
    render();
  }

  /* ---------- Subnavegación de páginas interiores ---------- */
  const subnav = $('.subnav');
  if (subnav) {
    const links = $$('a[href^="#"]', subnav);
    const targets = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    if ('IntersectionObserver' in window && targets.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            links.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id));
            const cur = $('.is-current', subnav); if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
          }
        });
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      targets.forEach(t => io.observe(t));
    }
  }
})();
