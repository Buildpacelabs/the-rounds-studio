/* ==========================================================================
   Northlight Therapy — interactions (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  "use strict";

  // Signal that JS is available (used to gate scroll-reveal in CSS).
  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") { fn(); }
    else { document.addEventListener("DOMContentLoaded", fn); }
  }

  ready(function () {

    /* ---- Footer year ---------------------------------------------------- */
    var year = new Date().getFullYear();
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });

    /* ---- Header shadow on scroll --------------------------------------- */
    var header = document.querySelector(".site-header");
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---- Mobile navigation --------------------------------------------- */
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav__toggle");

    if (nav && toggle) {
      var setOpen = function (open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      };

      toggle.addEventListener("click", function () {
        setOpen(!nav.classList.contains("is-open"));
      });

      // Close when a link inside the menu is tapped.
      nav.querySelectorAll(".nav__links a, .nav__phone").forEach(function (link) {
        link.addEventListener("click", function () { setOpen(false); });
      });

      // Close on Escape.
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          setOpen(false);
          toggle.focus();
        }
      });

      // Reset when moving back to desktop width.
      window.addEventListener("resize", function () {
        if (window.innerWidth > 900) { setOpen(false); }
      });
    }

    /* ---- Scroll reveal -------------------------------------------------- */
    var revealItems = document.querySelectorAll(".reveal");

    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

      revealItems.forEach(function (el) { observer.observe(el); });
    }

    /* ---- FAQ accordion -------------------------------------------------- */
    var faqButtons = document.querySelectorAll(".faq__q");

    faqButtons.forEach(function (btn) {
      var panel = btn.nextElementSibling; // .faq__a
      if (!panel) { return; }

      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!isOpen));
        if (isOpen) {
          panel.style.maxHeight = "0px";
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });

    // Keep any open FAQ panels sized correctly on resize.
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        document.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(function (btn) {
          var panel = btn.nextElementSibling;
          if (panel) { panel.style.maxHeight = panel.scrollHeight + "px"; }
        });
      }, 150);
    });

    /* ---- Appointment form UX ------------------------------------------- */
    var form = document.querySelector('form[action*="web3forms"]');
    if (form) {
      var submitBtn = form.querySelector('button[type="submit"]');

      form.addEventListener("submit", function (e) {
        // Manual validation so we control styling but still surface native hints.
        if (!form.checkValidity()) {
          e.preventDefault();
          form.reportValidity();
          return;
        }
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.label = submitBtn.innerHTML;
          submitBtn.textContent = "Sending your request…";
          submitBtn.style.opacity = "0.75";
          submitBtn.style.cursor = "progress";
        }
      });
    }

  });
})();
