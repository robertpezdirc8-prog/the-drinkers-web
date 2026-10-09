/* ============================================================
   THE DRINKERS — interaktivnost (nav, reveal, lightbox, stats)
   ============================================================ */
(function () {
  'use strict';

  /* oznaka, da je JS zivy (CSS-only varnostna mreza: brez JS je vse vidno) */
  document.body.classList.add('js');

  /* ---------- mobilni meni ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav__link').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- ENOTAJNA IZKUŠNJA: paneli, krmilni stolp, listanje s tipkami ---------- */
  var panes = Array.prototype.slice.call(document.querySelectorAll('.pane'));
  var railDots = Array.prototype.slice.call(document.querySelectorAll('.rail__dot'));
  var links = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  /* števec strani */
  var pagenum = document.createElement('div');
  pagenum.className = 'pagenum';
  pagenum.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pagenum);

  function paneIndex(el) { return panes.indexOf(el); }

  function setActive(i) {
    railDots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
    var id = panes[i] ? panes[i].id : '';
    links.forEach(function (l) {
      var h = l.getAttribute('href').slice(1);
      l.classList.toggle('is-active', h === id || (h === 'zgodba' && id === 'zgodovina'));
    });
    if (panes.length) {
      pagenum.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b> / ' + String(panes.length).padStart(2, '0');
    }
  }

  function goPane(i) {
    i = Math.max(0, Math.min(panes.length - 1, i));
    panes[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(i);
  }

  /* gumb "naslednji panel" na dnu vsakega panela (poleg hero scroll) */
  var CHEV_DOWN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  var CHEV_UP = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
  panes.forEach(function (p, i) {
    if (i > 0 && i < panes.length - 1) {
      var t = document.createElement('button');
      t.className = 'pagecue pagecue--up';
      t.setAttribute('aria-label', 'Prejšnja stran');
      t.innerHTML = CHEV_UP;
      t.addEventListener('click', function () { goPane(i - 1); });
      p.appendChild(t);
    }
  });

  /* --- skrij lebdece gumbe ko je lightbox odprt --- */
  function refreshCues() {
    var lbOpen = lbEl && lbEl.classList.contains('open');
    document.querySelectorAll('.pagecue').forEach(function (b) {
      b.style.visibility = lbOpen ? 'hidden' : '';
    });
  }

  /* listanje s tipkami (samo namizje, ne v obrazcih) */
  function typing(e) {
    var t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }
  var lbEl = document.getElementById('lightbox');
  document.addEventListener('keydown', function (e) {
    if (typing(e) || (lbEl && lbEl.classList.contains('open'))) return;
    if (window.innerWidth < 861) return;
    var cur = currentPane();
    if (e.key === 'PageDown' || (e.altKey && e.key === 'ArrowDown')) { e.preventDefault(); goPane(cur + 1); }
    else if (e.key === 'PageUp' || (e.altKey && e.key === 'ArrowUp')) { e.preventDefault(); goPane(cur - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goPane(0); }
    else if (e.key === 'End') { e.preventDefault(); goPane(panes.length - 1); }
  });

  /* rail klik */
  railDots.forEach(function (d) {
    d.addEventListener('click', function (e) {
      e.preventDefault();
      var target = d.getAttribute('href').slice(1);
      var idx = panes.findIndex(function (p) { return p.id === target; });
      if (idx >= 0) goPane(idx);
    });
  });

  /* trenutni panel = najbližji vrhu zaslona */
  function currentPane() {
    var mid = window.innerHeight * 0.35, best = 0, bestD = Infinity;
    panes.forEach(function (p, i) {
      var r = p.getBoundingClientRect();
      var d = Math.abs(Math.max(r.top, 0) - 0) + (r.top < 0 ? Math.min(-r.top, r.height) * 2 : 0);
      if (r.top <= mid && r.bottom > mid) { best = i; bestD = 0; }
      else if (bestD !== 0) {
        var dd = Math.abs(r.top - mid);
        if (dd < bestD) { bestD = dd; best = i; }
      }
    });
    return best;
  }

  /* IntersectionObserver: .in razred za animacijo vstopa + posodobitev stanja */
  if ('IntersectionObserver' in window) {
    var ioRail = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.intersectionRatio > 0.25) en.target.classList.add('in');
      });
      var vis = entries.filter(function (e) { return e.isIntersecting; });
      if (vis.length) setActive(paneIndex(vis[0].target));
    }, { threshold: [0, 0.25, 0.6] });
    panes.forEach(function (p) { ioRail.observe(p); });
  } else {
    panes.forEach(function (p) { p.classList.add('in'); });
  }
  window.addEventListener('scroll', function () { setActive(currentPane()); }, { passive: true });
  document.body.classList.add('op-ready');
  setActive(0);

  /* ---------- aktivna povezava v navigaciji (scroll spy) ---------- */
  var sections = document.querySelectorAll('section[id]');
  function spy() {
    var pos = window.scrollY + 140;
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        links.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  }

  /* ---------- reveal animacije — na enotajni strani jih nadomestijo paneli (.in) ---------- */
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });

  /* ---------- steveci v hero sekciji ---------- */
  var counted = false;
  function animateCounters() {
    if (counted) return;
    counted = true;
    document.querySelectorAll('.stat__num').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var dur = 1400, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var heroStats = document.querySelector('.hero__stats');
  if (heroStats) {
    var io2 = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { animateCounters(); io2.disconnect(); }
    }, { threshold: 0.4 });
    io2.observe(heroStats);
  }

  /* ---------- lightbox galerija ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.gitem img, .album > img'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var idx = 0;
  function showLb(i) {
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].src;
    lbImg.alt = items[idx].alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (typeof refreshCues === 'function') refreshCues();
  }
  function hideLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (typeof refreshCues === 'function') refreshCues();
  }
  items.forEach(function (img, i) {
    img.parentElement.addEventListener('click', function () { showLb(i); });
  });
  if (lb) {
    document.getElementById('lbClose').addEventListener('click', hideLb);
    document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); showLb(idx - 1); });
    document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); showLb(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) hideLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') hideLb();
      if (e.key === 'ArrowLeft') showLb(idx - 1);
      if (e.key === 'ArrowRight') showLb(idx + 1);
    });
  }

  /* ---------- Lite YouTube: iframe se nalozi sele ob kliku ---------- */
  document.querySelectorAll('[data-yt]').forEach(function (thumb) {
    thumb.addEventListener('click', function (e) {
      e.preventDefault();
      var frame = thumb.closest('.video-frame');
      var ifr = document.createElement('iframe');
      ifr.src = thumb.href;
      ifr.title = 'THE DRINKERS - NI ŠE UMRU ( uradni videospot 2026 )';
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      ifr.allowFullscreen = true;
      frame.innerHTML = '';
      frame.appendChild(ifr);
      ifr.focus && ifr.focus();
    });
  });

  /* ---------- gumb "nazaj na vrh" (samo mobilno; namizje ima rail + dol gumbe) ---------- */
  var isDesktop = window.matchMedia('(min-width: 861px)');
  var topBtn = document.createElement('button');
  topBtn.className = 'toTop';
  topBtn.setAttribute('aria-label', 'Nazaj na vrh');
  topBtn.textContent = '▲';
  document.body.appendChild(topBtn);
  function toggleTop() {
    topBtn.classList.toggle('show', !isDesktop.matches && window.scrollY > 700);
  }
  window.addEventListener('scroll', toggleTop, { passive: true });
  if (isDesktop.addEventListener) isDesktop.addEventListener('change', toggleTop);
  toggleTop();
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- obrazci (demo potrditev) ---------- */
  var nlForm = document.getElementById('nlForm');
  if (nlForm) {
    nlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('nlOk').classList.add('show');
      nlForm.reset();
    });
  }
  var ctForm = document.getElementById('ctForm');
  if (ctForm) {
    ctForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('ctOk').classList.add('show');
      ctForm.reset();
    });
  }

  /* ---------- GLAVNI SLIDER (dslider) — kot superblockslider na originalu ---------- */
  (function () {
    var root = document.querySelector('.dslider');
    if (!root) return;
    var track = root.querySelector('.dslider__track');
    var slides = root.querySelectorAll('.dslide');
    var dots = root.querySelectorAll('.dslider__dot');
    var prev = root.querySelector('.dslider__btn--prev');
    var next = root.querySelector('.dslider__btn--next');
    var idx = 0, timer = null;
    var AUTO = parseInt(root.getAttribute('data-auto') || '5000', 10);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(n) {
      idx = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
    }
    function start() {
      if (reduce) return;
      stop();
      timer = setInterval(function () { go(idx + 1); }, AUTO);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    prev.addEventListener('click', function () { go(idx - 1); start(); });
    next.addEventListener('click', function () { go(idx + 1); start(); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { go(i); start(); });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    /* dotik: swipe */
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      x0 = null; start();
    }, { passive: true });

    /* ustavi avtomatsko listanje, ko je odprt lightbox ali drug overlay */
    var lb = document.querySelector('.lightbox');
    if (lb) new MutationObserver(function () {
      var vis = getComputedStyle(lb).display !== 'none';
      if (vis) stop(); else start();
    }).observe(lb, { attributes: true, attributeFilter: ['style', 'class'] });

    go(0); start();
  })();
})();
