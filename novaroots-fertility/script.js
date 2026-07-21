/* =====================================================================
   Nova Roots Fertility — vanilla JS, no libraries
   Mobile nav · scroll reveal · the growing stem · form UX · footer year
   ===================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = year; });

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    // Close when a link is tapped
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    // Reset when resizing back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) setMenu(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- The growing stem ---------- */
  var stem = document.getElementById("stem");
  var grow = document.getElementById("stem-grow");
  var steps = stem ? stem.querySelectorAll(".step") : [];

  if (stem && grow) {
    if (reduceMotion) {
      grow.style.height = "100%";
      steps.forEach(function (s) { s.classList.add("is-in"); });
    } else {
      // Light up each node as it enters view
      if ("IntersectionObserver" in window) {
        var stepObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add("is-in");
          });
        }, { rootMargin: "0px 0px -45% 0px", threshold: 0 });
        steps.forEach(function (s) { stepObs.observe(s); });
      }

      // Grow the fill as the section scrolls through the viewport
      var ticking = false;
      function updateStem() {
        var rect = stem.getBoundingClientRect();
        var trigger = window.innerHeight * 0.62;
        var progress = (trigger - rect.top) / rect.height;
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        grow.style.height = (progress * 100).toFixed(2) + "%";
        ticking = false;
      }
      function requestStem() {
        if (!ticking) { window.requestAnimationFrame(updateStem); ticking = true; }
      }
      window.addEventListener("scroll", requestStem, { passive: true });
      window.addEventListener("resize", requestStem);
      updateStem();
    }
  }

  /* ---------- Combined scroll listener (header) ---------- */
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Form UX ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      // Honour native validation
      if (!form.checkValidity()) {
        e.preventDefault();
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      // Let the real submission proceed, then reflect a sending state
      if (submitBtn) {
        window.setTimeout(function () {
          submitBtn.disabled = true;
          submitBtn.classList.add("is-sending");
          submitBtn.innerHTML = "Sending your request…";
        }, 0);
      }
    });
  }
})();
