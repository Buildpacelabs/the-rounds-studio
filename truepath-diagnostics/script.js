/* Truepath Diagnostics — vanilla JS, no libraries.
   Mobile nav · scroll-reveal · header state · form UX · footer year. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("primary-nav");
  if (toggle && links) {
    var closeNav = function () {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    var openNav = function () {
      links.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    };
    toggle.addEventListener("click", function () {
      if (links.classList.contains("is-open")) { closeNav(); } else { openNav(); }
    });
    // close after choosing a link on mobile
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    // close on escape / resize to desktop
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) { closeNav(); toggle.focus(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) { closeNav(); }
    });
  }

  /* ---- Sticky header shadow on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Scroll reveal ---- */
  var revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("reveal-in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---- Reference-range bars that aren't inside a reveal (safety) ---- */
  // The hero card lives inside a .reveal wrapper, so its marker animates
  // when that wrapper reveals. Anything standalone goes live immediately.
  document.querySelectorAll(".rangebar").forEach(function (bar) {
    if (!bar.closest(".reveal")) { bar.classList.add("is-live"); }
  });

  /* ---- Form UX: min date = today, gentle submit state ---- */
  var dateInput = document.getElementById("date");
  if (dateInput) {
    var today = new Date();
    var iso = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
    dateInput.min = iso;
  }

  var form = document.querySelector("form[action*='web3forms']");
  if (form) {
    form.addEventListener("submit", function () {
      // honeypot guard: if a bot checked it, quietly stop
      var honey = form.querySelector("input[name='botcheck']");
      if (honey && honey.checked) { return; }
      var btn = form.querySelector("button[type='submit']");
      if (btn && form.checkValidity()) {
        btn.disabled = true;
        btn.style.opacity = "0.7";
        btn.textContent = "Sending…";
      }
    });
  }
})();
