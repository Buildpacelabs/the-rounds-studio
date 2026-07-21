/* Kinnect Physiotherapy — vanilla JS. No libraries.
   Mobile nav · scroll reveal · path-curve draw · sticky header · form UX · footer year */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Footer year ------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = year;
  });

  /* ---- Mobile navigation ------------------------------------------- */
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  function closeNav() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobileNav.classList.remove('is-open');
    document.body.style.removeProperty('overflow');
  }
  function openNav() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    mobileNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) { closeNav(); } else { openNav(); }
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    // Close on Escape and on resize back to desktop
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeNav(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 940) { closeNav(); }
    });
  }

  /* ---- Sticky header shadow ---------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) { header.classList.add('is-stuck'); }
      else { header.classList.remove('is-stuck'); }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Scroll reveal + path-curve draw ----------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  var curves = document.querySelectorAll('.path__curve');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    curves.forEach(function (el) { el.classList.add('is-drawn'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.classList.contains('path__curve')) {
          el.classList.add('is-drawn');
        } else {
          el.classList.add('is-visible');
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) { io.observe(el); });
    curves.forEach(function (el) { io.observe(el); });
  }

  /* ---- Appointment form UX ----------------------------------------- */
  var form = document.querySelector('form.form');
  if (form) {
    // Prevent past dates on the preferred-date picker.
    var dateInput = form.querySelector('#preferred_date');
    if (dateInput) {
      var t = new Date();
      var iso = t.getFullYear() + '-' +
        String(t.getMonth() + 1).padStart(2, '0') + '-' +
        String(t.getDate()).padStart(2, '0');
      dateInput.min = iso;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function () {
      // Native validation handles required fields; only reflect state if valid.
      if (form.checkValidity() && submitBtn) {
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending your request…';
      }
    });
  }
})();
