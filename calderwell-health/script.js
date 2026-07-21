/* Calderwell Health — vanilla JS
   Mobile nav · scroll-reveal · sticky header · live "open now" · today's hours · footer year
   No libraries. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year --------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Mobile nav ---------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  var menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.setAttribute("data-open", String(open));
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 640) setMenu(false);
  });

  /* ---- Sticky header shadow ----------------------------------------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Scroll reveal ------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Clinic hours model -------------------------------------------
     day index: 0 Sun ... 6 Sat. [openMinutes, closeMinutes] or null. */
  var HOURS = {
    0: [9 * 60, 14 * 60],   // Sunday
    1: [8 * 60, 20 * 60],   // Monday
    2: [8 * 60, 20 * 60],
    3: [8 * 60, 20 * 60],
    4: [8 * 60, 20 * 60],
    5: [8 * 60, 20 * 60],   // Friday
    6: [8 * 60, 18 * 60]    // Saturday
  };

  function isOpenNow() {
    var now = new Date();
    var span = HOURS[now.getDay()];
    if (!span) return false;
    var mins = now.getHours() * 60 + now.getMinutes();
    return mins >= span[0] && mins < span[1];
  }

  var open = isOpenNow();

  document.querySelectorAll(".status-pill").forEach(function (pill) {
    var txt = pill.querySelector(".status-text");
    if (txt) txt.textContent = open ? "Open now" : "Closed now";
    pill.classList.toggle("is-closed", !open);
  });

  var ctaStatus = document.getElementById("cta-status");
  if (ctaStatus) ctaStatus.textContent = open ? "Open now" : "Closed now";

  /* ---- Highlight today's row in hours tables -------------------------
     rows use data-day: "1", "0", a list "1,2", or a range "1-5". */
  function dayMatches(spec, day) {
    return spec.split(",").some(function (part) {
      part = part.trim();
      if (part.indexOf("-") > -1) {
        var b = part.split("-");
        return day >= +b[0] && day <= +b[1];
      }
      return +part === day;
    });
  }
  var today = new Date().getDay();
  document.querySelectorAll("tr[data-day]").forEach(function (row) {
    if (dayMatches(row.getAttribute("data-day"), today)) {
      row.classList.add("is-today");
    }
  });
})();
