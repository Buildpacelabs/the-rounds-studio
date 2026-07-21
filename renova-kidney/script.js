/* ============================================================
   Renova Kidney Care — interactions
   Vanilla JS, no dependencies.
   - Mobile navigation
   - Sticky-header state
   - Scroll reveal (IntersectionObserver)
   - Appointment form UX (inline validation + submit state)
   - Footer year
   - Gentle magnetic buttons (skipped for reduced motion)
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mark that JS is active so reveal elements may start hidden.
  // (An inline <script> in the document head sets this before first paint;
  //  this is a belt-and-braces fallback in case that was missed.)
  document.documentElement.classList.add("js");

  /* ---------- Footer year ---------- */
  var year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.classList.remove("is-open");
  }
  function openMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    menu.classList.add("is-open");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      open ? closeMenu() : openMenu();
    });
    // Close when a link is tapped
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    // Close if resized up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ---------- Sticky-header state ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) {
    // nothing to do
  } else if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });

    // Safety net: nothing should ever stay hidden. If the observer hasn't
    // fired for an element a few seconds after load, reveal it anyway.
    window.addEventListener("load", function () {
      setTimeout(function () {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
      }, 2600);
    });
  }

  /* ---------- Gentle magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".btn-primary, .btn-whatsapp").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = "translate(" + (x * 5).toFixed(1) + "px," +
          (y * 5 - 2).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Appointment form UX ---------- */
  var form = document.getElementById("appointmentForm");
  if (form) {
    var summary = document.getElementById("errSummary");

    // Set the minimum selectable date to today
    var dateInput = form.querySelector("#preferred_date");
    if (dateInput) {
      var t = new Date();
      var iso = t.getFullYear() + "-" +
        String(t.getMonth() + 1).padStart(2, "0") + "-" +
        String(t.getDate()).padStart(2, "0");
      dateInput.min = iso;
    }

    var fieldOf = function (input) { return input.closest(".field"); };

    var validateField = function (input) {
      var field = fieldOf(input);
      if (!field) return true;
      var ok = input.checkValidity();
      field.classList.toggle("invalid", !ok);
      return ok;
    };

    // Clear the error state as the user corrects a field
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      if (input.type === "hidden") return;
      input.addEventListener("input", function () {
        var field = fieldOf(input);
        if (field && field.classList.contains("invalid")) validateField(input);
      });
      input.addEventListener("blur", function () {
        if (input.value !== "" || input.required) validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      var firstInvalid = null;
      form.querySelectorAll("input, select, textarea").forEach(function (input) {
        if (input.type === "hidden" || input.name === "botcheck") return;
        var ok = validateField(input);
        if (!ok && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        e.preventDefault();
        if (summary) summary.classList.add("show");
        firstInvalid.focus();
        firstInvalid.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center"
        });
        return;
      }

      if (summary) summary.classList.remove("show");
      // Show a submitting state (the browser then posts to Web3Forms)
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Sending…";
      }
    });
  }
})();
