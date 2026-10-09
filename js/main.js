/* ============================================================
   THE DRINKERS — interaktivnost (nav, reveal, lightbox, stats)
   ============================================================ */
(function () {
  'use strict';

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

  /* ---------- aktivna povezava v navigaciji (scroll spy) ---------- */
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
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
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- reveal animacije ob drsenju ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

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
  var items = Array.prototype.slice.call(document.querySelectorAll('.gitem img'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var idx = 0;
  function showLb(i) {
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].src;
    lbImg.alt = items[idx].alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function hideLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
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

  /* ---------- gumb "nazaj na vrh" ---------- */
  var topBtn = document.createElement('button');
  topBtn.className = 'toTop';
  topBtn.setAttribute('aria-label', 'Nazaj na vrh');
  topBtn.textContent = '▲';
  document.body.appendChild(topBtn);
  window.addEventListener('scroll', function () {
    topBtn.classList.toggle('show', window.scrollY > 700);
  }, { passive: true });
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
})();
