/* =====================================================================
   Kindra Home Health — vanilla JS
   Mobile nav · sticky header · scroll reveal · form UX · footer year
   No libraries.
   ===================================================================== */
(function () {
  "use strict";

  // Mark JS active so reveal styles apply (content stays visible without JS).
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });

  /* ---- Sticky header shadow ---------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile navigation ------------------------------------------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navlinks");

  function closeNav() {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    links.classList.remove("open");
  }
  function openNav() {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    links.classList.add("open");
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      open ? closeNav() : openNav();
    });
    // Close when a link is tapped
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    // Reset drawer state when resizing back to desktop
    var mq = window.matchMedia("(min-width: 821px)");
    var handleMq = function () { if (mq.matches) closeNav(); };
    mq.addEventListener ? mq.addEventListener("change", handleMq)
                        : mq.addListener(handleMq);
  }

  /* ---- Scroll reveal ------------------------------------------------ */
  var revealables = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- Form UX ------------------------------------------------------ */
  var form = document.getElementById("careForm");
  if (form) {
    var showError = function (input, show) {
      input.classList.toggle("invalid", show);
      if (show) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
      var msg = form.querySelector('.err-msg[data-for="' + input.id + '"]');
      if (msg) msg.classList.toggle("show", show);
    };

    var validate = function (input) {
      if (!input.id) return true;
      // required fields
      if (input.hasAttribute("required") && !input.value.trim()) {
        showError(input, true);
        return false;
      }
      // email format (only if provided)
      if (input.type === "email" && input.value.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        showError(input, true);
        return false;
      }
      // phone: at least 10 digits
      if (input.type === "tel" && input.value.trim() &&
          input.value.replace(/\D/g, "").length < 10) {
        showError(input, true);
        return false;
      }
      showError(input, false);
      return true;
    };

    // Clear error as the user fixes the field
    form.querySelectorAll(".input").forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.classList.contains("invalid")) validate(input);
      });
      input.addEventListener("blur", function () {
        if (input.value.trim() || input.classList.contains("invalid")) validate(input);
      });
    });

    var submitBtn = document.getElementById("submitBtn");

    form.addEventListener("submit", function (e) {
      var ok = true;
      var firstBad = null;
      form.querySelectorAll(".input[required], .input[type=email], .input[type=tel]")
        .forEach(function (input) {
          if (!validate(input) && ok) { ok = false; firstBad = input; }
          else if (!validate(input)) { /* keep flagged */ }
        });

      // consent checkbox
      var consent = form.querySelector('input[name="callback_consent"]');
      if (consent && !consent.checked) {
        ok = false;
        if (!firstBad) firstBad = consent;
      }

      if (!ok) {
        e.preventDefault();
        if (firstBad && firstBad.focus) firstBad.focus();
        return;
      }

      // Passed validation — show a friendly busy state while it posts.
      if (submitBtn) {
        submitBtn.setAttribute("aria-busy", "true");
        var label = submitBtn.querySelector(".btn-label");
        if (label) label.textContent = "Sending…";
      }
    });
  }
})();
