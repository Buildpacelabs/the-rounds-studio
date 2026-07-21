/* =========================================================================
   Solène Skin Clinic — interactions (vanilla JS, no libraries)
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Footer year -------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });

  /* ----- Header state on scroll --------------------------------------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----- Mobile nav toggle -------------------------------------------- */
  var toggle = document.getElementById("navToggle");
  if (toggle && header) {
    var closeNav = function () {
      header.removeAttribute("data-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    toggle.addEventListener("click", function () {
      var open = header.getAttribute("data-open") === "true";
      if (open) {
        closeNav();
      } else {
        header.setAttribute("data-open", "true");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
      }
    });
    // Close when a link is chosen or when leaving mobile width / pressing Esc
    var navLinks = document.getElementById("navLinks");
    if (navLinks) {
      navLinks.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeNav();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeNav();
    });
  }

  /* ----- Scroll reveal ------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal:not(.is-in)");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ----- Conditions index (signature) --------------------------------- */
  var list = document.getElementById("condList");
  var caption = document.getElementById("condCaption");
  if (list && caption) {
    var elTitle = document.getElementById("condTitle");
    var elNote = document.getElementById("condNote");
    var elKicker = document.getElementById("condKicker");
    var items = Array.prototype.slice.call(list.querySelectorAll(".index__item"));

    var swap = function (btn) {
      if (btn.getAttribute("aria-current") === "true") return;
      items.forEach(function (i) { i.removeAttribute("aria-current"); });
      btn.setAttribute("aria-current", "true");

      var apply = function () {
        elTitle.innerHTML = btn.getAttribute("data-title");
        elNote.textContent = btn.getAttribute("data-note");
        elKicker.textContent = btn.getAttribute("data-cat");
      };

      if (reduceMotion) {
        apply();
      } else {
        caption.classList.add("is-swapping");
        window.setTimeout(function () {
          apply();
          caption.classList.remove("is-swapping");
        }, 200);
      }
    };

    items.forEach(function (btn) {
      btn.addEventListener("mouseenter", function () { swap(btn); });
      btn.addEventListener("focus", function () { swap(btn); });
      btn.addEventListener("click", function () { swap(btn); });
    });
  }

  /* ----- Form: gentle submit UX --------------------------------------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn && !btn.disabled) {
        btn.dataset.label = btn.innerHTML;
        btn.disabled = true;
        btn.style.opacity = "0.75";
        btn.innerHTML = "Sending…";
      }
    });
  }
})();
