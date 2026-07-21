/* Willow Paws Veterinary — vanilla JS
   Mobile nav, scroll-reveal, header shadow, form UX, footer year.
   No libraries. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year --------------------------------------- */
  var year = String(new Date().getFullYear());
  var yearEls = document.querySelectorAll("[data-year]");
  for (var i = 0; i < yearEls.length; i++) yearEls[i].textContent = year;

  /* ---- Mobile navigation --------------------------------- */
  var toggle = document.getElementById("navToggle");
  var panel = document.getElementById("mobilePanel");

  function closeMenu() {
    if (!toggle || !panel) return;
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  function openMenu() {
    if (!toggle || !panel) return;
    panel.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeMenu(); else openMenu();
    });
    // Close when a link inside the panel is tapped
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    // Reset when resizing up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  /* ---- Sticky header shadow ------------------------------ */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Scroll reveal ------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    for (var r = 0; r < revealEls.length; r++) revealEls[r].classList.add("in");
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    for (var k = 0; k < revealEls.length; k++) io.observe(revealEls[k]);
  }

  /* ---- Appointment form UX ------------------------------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');

    // Keep the preferred date/time from being set in the past
    var dt = form.querySelector('input[type="datetime-local"]');
    if (dt) {
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dt.min = now.toISOString().slice(0, 16);
    }

    form.addEventListener("submit", function (e) {
      // Native validation first
      if (!form.checkValidity()) {
        e.preventDefault();
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      // Give feedback while the POST + redirect happens
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Sending your request…";
        submitBtn.style.opacity = "0.85";
      }
    });
  }
})();
