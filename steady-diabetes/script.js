/* Steady Diabetes Care — vanilla JS, no libraries.
   Mobile nav · scroll-reveal · header shadow · form UX · footer year. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  var y = String(new Date().getFullYear());
  var years = document.querySelectorAll("[data-year]");
  for (var i = 0; i < years.length; i++) years[i].textContent = y;

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var panel = document.getElementById("navPanel");

  function closeNav() {
    if (!toggle || !panel) return;
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  function openNav() {
    if (!toggle || !panel) return;
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeNav(); else openNav();
    });
    // close on link tap
    var links = panel.querySelectorAll("a");
    for (var j = 0; j < links.length; j++) {
      links[j].addEventListener("click", closeNav);
    }
    // close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    // close if resized up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    for (var k = 0; k < revealEls.length; k++) revealEls[k].classList.add("is-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    for (var m = 0; m < revealEls.length; m++) io.observe(revealEls[m]);
  }

  /* ---------- form UX ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    var preferred = form.querySelector("#preferred");
    if (preferred) {
      // don't allow past date/times
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      preferred.min = now.toISOString().slice(0, 16);
    }

    form.addEventListener("submit", function (e) {
      // native validation first
      if (!form.checkValidity()) {
        e.preventDefault();
        var invalid = form.querySelector(":invalid");
        if (invalid) invalid.focus();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.dataset.label = btn.innerHTML;
        btn.innerHTML = "Sending…";
      }
    });
  }
})();
