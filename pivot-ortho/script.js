/* Pivot Orthopaedics — vanilla JS: nav, reveal, spine rail, year */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("mobileNav");
  if (toggle && drawer) {
    var closeNav = function () {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    toggle.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* ---------- header stuck shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- spine rail (section indicator) ---------- */
  var segs = Array.prototype.slice.call(document.querySelectorAll(".spine-rail__seg"));
  if (segs.length) {
    var targets = segs.map(function (seg) {
      return document.getElementById(seg.getAttribute("data-target"));
    });

    segs.forEach(function (seg) {
      seg.addEventListener("click", function () {
        var t = document.getElementById(seg.getAttribute("data-target"));
        if (t) {
          t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
      });
    });

    var setActive = function (id) {
      segs.forEach(function (seg) {
        seg.classList.toggle("is-active", seg.getAttribute("data-target") === id);
      });
    };

    if ("IntersectionObserver" in window) {
      var visible = {};
      var sr = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });
        var bestId = null, best = 0;
        targets.forEach(function (t) {
          if (t && visible[t.id] > best) { best = visible[t.id]; bestId = t.id; }
        });
        if (bestId) { setActive(bestId); }
      }, { threshold: [0.15, 0.4, 0.7], rootMargin: "-30% 0px -45% 0px" });

      targets.forEach(function (t) { if (t) { sr.observe(t); } });
    }
  }
})();
