/* =====================================================================
   Vesta Women's Health — interactions
   Vanilla JS, no dependencies: mobile nav, scroll-reveal, header state,
   form UX, footer year. Respects prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Footer year ---- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = year;
  });

  /* ---- Sticky header shadow on scroll ---- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.setAttribute('data-scrolled', '');
      else header.removeAttribute('data-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav]');

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  function openMenu() {
    if (!menu || !toggle) return;
    menu.setAttribute('data-open', '');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    });

    // Close when a link is tapped
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Close if resized up to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    });

    // Close when clicking outside the header
    document.addEventListener('click', function (e) {
      if (menu.hasAttribute('data-open') &&
          !menu.contains(e.target) &&
          !toggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ---- Scroll reveal ---- */
  var revealItems = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Form UX: min date = today + gentle submit state ---- */
  var dateInput = document.getElementById('date');
  if (dateInput) {
    var today = new Date();
    var tz = today.getTimezoneOffset() * 60000;
    dateInput.min = new Date(today - tz).toISOString().slice(0, 10);
  }

  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener('submit', function (e) {
      // Honour native validation; only show pending state when valid
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        return; // let the browser surface the messages
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn && !btn.dataset.busy) {
        btn.dataset.busy = '1';
        btn.setAttribute('aria-busy', 'true');
        btn.style.opacity = '0.75';
        btn.style.pointerEvents = 'none';
      }
    });
  }
})();
