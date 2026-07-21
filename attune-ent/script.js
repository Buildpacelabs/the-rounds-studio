/* =========================================================
   Attune ENT — interactions
   Vanilla JS · no libraries
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = year;
  });

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  function openNav() {
    document.body.classList.add('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      if (document.body.classList.contains('nav-open')) { closeNav(); }
      else { openNav(); }
    });

    // Close when a menu link is tapped
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // Reset when resizing up to desktop
    var mq = window.matchMedia('(min-width: 761px)');
    (mq.addEventListener ? mq.addEventListener('change', closeNav)
                         : mq.addListener(closeNav));
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Appointment form UX ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    var submitBtn = form.querySelector('[type="submit"]');
    var emailField = form.querySelector('#email');

    function setError(field, message) {
      clearError(field);
      field.setAttribute('aria-invalid', 'true');
      var msg = document.createElement('p');
      msg.className = 'field-error';
      msg.textContent = message;
      msg.style.cssText = 'color:#b23b2e;font-size:.85rem;margin-top:.4rem;font-weight:500';
      field.insertAdjacentElement('afterend', msg);
      field._errorEl = msg;
    }
    function clearError(field) {
      field.removeAttribute('aria-invalid');
      if (field._errorEl) { field._errorEl.remove(); field._errorEl = null; }
    }

    // Clear an error as soon as the person starts fixing it
    ['input', 'change'].forEach(function (evt) {
      form.addEventListener(evt, function (e) {
        if (e.target.hasAttribute('aria-invalid')) clearError(e.target);
      });
    });

    form.addEventListener('submit', function (e) {
      var firstInvalid = null;

      // Required fields
      form.querySelectorAll('[required]').forEach(function (field) {
        var empty = field.type === 'checkbox' ? !field.checked
                                              : !String(field.value).trim();
        if (empty) {
          setError(field, field.type === 'checkbox'
            ? 'Please tick this to continue.'
            : 'This one is needed so we can reach you.');
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // Light email sanity check (only if filled)
      if (emailField && emailField.value.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
        setError(emailField, 'That email address looks incomplete.');
        if (!firstInvalid) firstInvalid = emailField;
      }

      if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus();
        firstInvalid.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center'
        });
        return;
      }

      // Valid — let the native POST proceed, guard against double submit
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
    });
  }
})();
