/* =========================================================================
   Étoile Aesthetics — site behaviour (vanilla JS, no dependencies)
   - Footer year
   - Header shadow on scroll
   - Mobile navigation
   - Scroll reveal (reduced-motion aware)
   - Appointment form UX (min date, submit state)
   ========================================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Current year -------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });

  /* ---- Header state on scroll --------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 20) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile navigation -------------------------------------------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.setAttribute("data-open", open ? "true" : "false");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open && window.matchMedia("(max-width: 860px)").matches ? "hidden" : "";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(nav.getAttribute("data-open") !== "true");
    });

    // Close when a link inside the menu is tapped
    nav.querySelectorAll(".nav__links a, .nav__cta a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setNav(false);
        toggle.focus();
      }
    });

    // Reset when resizing back to desktop
    window.addEventListener("resize", function () {
      if (!window.matchMedia("(max-width: 860px)").matches) setNav(false);
    });
  }

  /* ---- Scroll reveal ------------------------------------------------- */
  var revealItems = document.querySelectorAll(".reveal");

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // gentle stagger for siblings
          var siblings = Array.prototype.slice.call(el.parentElement ? el.parentElement.children : []);
          var idx = siblings.indexOf(el);
          el.style.transitionDelay = Math.min(idx, 5) * 70 + "ms";
          el.classList.add("is-visible");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---- Appointment form --------------------------------------------- */
  var form = document.querySelector(".form");
  if (form) {
    // No past dates
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var today = new Date();
      var iso = today.toISOString().split("T")[0];
      dateInput.min = iso;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function (e) {
      // Let the browser show native validation messages first
      if (!form.checkValidity()) {
        e.preventDefault();
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      // Valid: reflect a sending state (Web3Forms then redirects)
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
    });
  }
})();
