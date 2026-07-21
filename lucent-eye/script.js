/* Lucent Eye Care — vanilla JS. No libraries. */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.add("js"); // enable reveal / focus-in states
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();

  var started = false;
  function init() {
    if (started) return;
    started = true;

    setFooterYear();
    setupNav();
    setupStickyHeader();
    setupReveal();
    setupAcuity();
    setupScrollSpy();
    setupForm();
  }

  /* --- Footer year --- */
  function setFooterYear() {
    var y = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = y;
    });
  }

  /* --- Mobile navigation --- */
  function setupNav() {
    var toggle = document.getElementById("nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;

    function close() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
    function open() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    }

    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) close();
      else open();
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) close();
    });
  }

  /* --- Sticky header elevation --- */
  function setupStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Scroll reveal --- */
  function setupReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll(".reveal, .reveal-stagger")
    );
    if (!items.length) return;

    // Stagger children delays
    document.querySelectorAll(".reveal-stagger").forEach(function (group) {
      Array.prototype.slice.call(group.children).forEach(function (child, i) {
        child.style.setProperty("--d", i * 90);
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* --- Acuity chart: focus in --- */
  function setupAcuity() {
    var chart = document.getElementById("acuity");
    if (!chart) return;
    if (reduceMotion) { chart.classList.add("is-focus"); return; }
    // small delay so the blur-to-sharp reads as an intentional focus pull
    window.setTimeout(function () {
      chart.classList.add("is-focus");
    }, 260);
  }

  /* --- Scroll spy for in-page nav (index) --- */
  function setupScrollSpy() {
    var links = Array.prototype.slice
      .call(document.querySelectorAll('.nav-links a[href^="#"]'))
      .filter(function (a) { return a.getAttribute("href").length > 1; });
    if (links.length < 2 || !("IntersectionObserver" in window)) return;

    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) { map[id] = a; sections.push(sec); }
    });
    if (!sections.length) return;

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) { l.classList.remove("is-active"); });
            var active = map[entry.target.id];
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --- Appointment form UX --- */
  function setupForm() {
    var form = document.querySelector('form[action*="web3forms"]');
    if (!form) return;

    // Don't allow past dates on the preferred-date picker
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var t = new Date();
      var min =
        t.getFullYear() + "-" +
        String(t.getMonth() + 1).padStart(2, "0") + "-" +
        String(t.getDate()).padStart(2, "0");
      dateInput.setAttribute("min", min);
    }

    var btn = document.getElementById("submitBtn");
    form.addEventListener("submit", function () {
      // Let the browser handle validation + native POST/redirect.
      if (!form.checkValidity()) return;
      if (btn) {
        btn.disabled = true;
        btn.classList.add("is-sending");
        btn.innerHTML = "Sending your request…";
      }
    });
  }
})();
