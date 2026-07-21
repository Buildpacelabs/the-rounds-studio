/* =====================================================================
   Aranya Ayurveda — site behaviour
   Vanilla JS, no libraries: mobile nav, scroll-reveal, header state,
   form UX, footer year.
   ===================================================================== */
(function () {
  "use strict";

  var doc = document;
  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var year = String(new Date().getFullYear());
  Array.prototype.forEach.call(doc.querySelectorAll("[data-year]"), function (el) {
    el.textContent = year;
  });

  /* ---------- Mobile navigation ---------- */
  var toggle = doc.getElementById("nav-toggle");
  var menu = doc.getElementById("nav-menu");

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  }

  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    // Close when a link inside the menu is tapped
    menu.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.closest && t.closest("a")) closeMenu();
    });

    // Close on Escape
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) closeMenu();
    });

    // Reset menu state if resizing up to desktop
    var mq = window.matchMedia("(min-width: 761px)");
    var onChange = function () { if (mq.matches) closeMenu(); };
    if (mq.addEventListener) { mq.addEventListener("change", onChange); }
    else if (mq.addListener) { mq.addListener(onChange); }
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = doc.querySelector(".site-header");
  if (header) {
    var lastState = false;
    var onScroll = function () {
      var scrolled = window.pageYOffset > 8;
      if (scrolled !== lastState) {
        header.classList.toggle("scrolled", scrolled);
        lastState = scrolled;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));

  if (!reveals.length) {
    // nothing to do
  } else if (prefersReduced || !("IntersectionObserver" in window)) {
    // Show everything immediately
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Form UX ---------- */
  var form = doc.querySelector('form[action*="web3forms"]');
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      // Native validation first — surface the first invalid field nicely.
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        e.preventDefault();
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) {
          firstInvalid.focus();
          if (typeof firstInvalid.reportValidity === "function") {
            firstInvalid.reportValidity();
          }
        }
        return;
      }

      // Valid: give the button a pending state (page will redirect on success).
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.innerHTML = "Sending…";
        // Safety net: restore if the network stalls or user navigates back.
        window.setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
          submitBtn.innerHTML = originalLabel;
        }, 8000);
      }
    });

    // Prevent past dates on the preferred-date picker.
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput && !dateInput.getAttribute("min")) {
      var today = new Date();
      var mm = String(today.getMonth() + 1).padStart(2, "0");
      var dd = String(today.getDate()).padStart(2, "0");
      dateInput.setAttribute("min", today.getFullYear() + "-" + mm + "-" + dd);
    }
  }

})();
