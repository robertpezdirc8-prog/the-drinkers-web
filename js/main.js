/* The Drinkers — main.js (sveža različica, brez starih panel logik) */
(function () {
  'use strict';

  /* ---------- Mobilni meni ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll-spy aktivna povezava ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
  var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
  function spy() {
    var y = window.scrollY + 120;
    var cur = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) cur = s; });
    links.forEach(function (l) {
      l.classList.toggle('active', cur && l.getAttribute('href') === '#' + cur.id);
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- Slider (naslovnice) ---------- */
  var slider = document.getElementById('slider');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var dotsBox = document.getElementById('sliderDots');
    var idx = 0, timer = null, DELAY = 5000;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Slika ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); });
      dotsBox.appendChild(b);
    });
    var dots = dotsBox.querySelectorAll('button');

    function go(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) { d.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
    }
    function restart() { clearInterval(timer); if (!reduced) timer = setInterval(function () { go(idx + 1); }, DELAY); }

    document.getElementById('sliderNext').addEventListener('click', function () { go(idx + 1); restart(); });
    document.getElementById('sliderPrev').addEventListener('click', function () { go(idx - 1); restart(); });

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* swipe na mobilnem */
    var x0 = null;
    slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    }, { passive: true });

    /* pavza ko tab ni viden */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer); else restart();
    });

    go(0); restart();
  }

  /* ---------- Lite YouTube embed ---------- */
  var lite = document.getElementById('ytLite');
  if (lite) {
    function play() {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + lite.dataset.yt + '?autoplay=1&rel=0';
      f.title = 'The Drinkers — Ni še umru (videospot)';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      lite.innerHTML = '';
      lite.appendChild(f);
      lite.removeAttribute('role'); lite.removeAttribute('tabindex');
    }
    lite.addEventListener('click', play);
    lite.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  }

  /* ---------- Kontaktni obrazec (demo potrditev) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      document.getElementById('formOk').hidden = false;
      form.reset();
    });
  }
})();
