/* Clivo — vanilla JS. Mobile nav, scroll-reveal, header state, form UX, footer year. */
(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });

  /* ---------- Mobile navigation ---------- */
  var nav = document.querySelector('.nav');
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
  }
  function openNav() {
    if (!nav) return;
    nav.classList.add('is-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) { closeNav(); } else { openNav(); }
    });
  }
  if (links) {
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { closeNav(); }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeNav(); }
  });
  // Close the mobile menu if the viewport grows past the breakpoint.
  var mq = window.matchMedia('(min-width: 721px)');
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () {
    if (mq.matches) { closeNav(); }
  });

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('.header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Form UX ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    // Keep the datetime picker at "now or later" as a sensible floor.
    var dt = form.querySelector('#preferred');
    if (dt) {
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dt.min = now.toISOString().slice(0, 16);
    }

    form.addEventListener('submit', function (e) {
      // Let the browser surface native validation messages first.
      if (!form.checkValidity()) {
        e.preventDefault();
        var invalid = form.querySelector(':invalid');
        if (invalid) { invalid.focus(); }
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '.75';
        btn.style.cursor = 'progress';
        btn.textContent = 'Sending your request…';
      }
    });
  }

  /* ---------- Smooth-scroll offset for sticky header on in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      // Move focus for accessibility without an extra scroll jump.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

})();
