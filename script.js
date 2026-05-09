/**
 * HACK2SKILL — script.js
 * Vanilla JS, IIFE, no dependencies.
 */
(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────────
     1. CUSTOM CURSOR
  ───────────────────────────────────────────────────────────── */
  (function initCursor() {
    const dot  = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;

    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top  = my + "px";
    });

    // Ring lags via RAF lerp
    (function loop() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top  = ry + "px";
      requestAnimationFrame(loop);
    })();

    // Enlarge on interactive elements
    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest("a, button, [tabindex], .gal-item, .participant-card, .challenge-item, .reward-card");
      if (target) ring.classList.add("cursor-hover");
      else        ring.classList.remove("cursor-hover");
    });
  })();

  /* ─────────────────────────────────────────────────────────────
     2. PARTICLE CANVAS (hero)
  ───────────────────────────────────────────────────────────── */
  (function initParticles() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, particles;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x    = Math.random() * W;
        this.y    = H + 10;
        this.vy   = -(Math.random() * 0.6 + 0.2);
        this.vx   = (Math.random() - 0.5) * 0.3;
        this.r    = Math.random() * 2 + 1;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 120;
        this.hue  = 270 + (Math.random() - 0.5) * 50;
      }
      draw() {
        const progress = this.life / this.maxLife;
        const alpha    = progress < 0.15
          ? progress / 0.15
          : progress > 0.75
          ? 1 - (progress - 0.75) / 0.25
          : 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${alpha * 0.55})`;
        ctx.fill();
        this.x    += this.vx;
        this.y    += this.vy;
        this.life++;
        if (this.life >= this.maxLife) this.reset();
      }
    }

    function build() {
      const count = Math.min(90, Math.floor(W / 14));
      particles   = Array.from({ length: count }, () => {
        const p = new Particle();
        p.y    = Math.random() * H;
        p.life = Math.floor(Math.random() * p.maxLife);
        return p;
      });
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => p.draw());
      requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => { resize(); build(); });
    ro.observe(canvas.parentElement || document.body);
    resize();
    build();
    loop();
  })();

  /* ─────────────────────────────────────────────────────────────
     3. NAVBAR — scroll shadow + active link
  ───────────────────────────────────────────────────────────── */
  (function initNavbar() {
    const inner   = document.querySelector(".nav-inner");
    const links   = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section[id]");
    if (!inner) return;

    window.addEventListener("scroll", () => {
      inner.style.boxShadow = window.scrollY > 20
        ? "0 4px 32px rgba(0,0,0,0.4)"
        : "0 4px 24px rgba(0,0,0,0.25)";

      // Active link
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 100) current = s.id;
      });
      links.forEach((a) => {
        const href = a.getAttribute("href").replace("#", "");
        a.classList.toggle("active", href === current);
      });
    }, { passive: true });
  })();

  /* ─────────────────────────────────────────────────────────────
     4. HAMBURGER MENU
  ───────────────────────────────────────────────────────────── */
  (function initHamburger() {
    const btn   = document.getElementById("hamburger");
    const nav   = document.getElementById("mobile-nav");
    if (!btn || !nav) return;

    function toggle(force) {
      const open = force !== undefined ? force : !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      nav.setAttribute("aria-hidden", String(!open));
    }

    btn.addEventListener("click", () => toggle());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggle(false);
    });

    document.addEventListener("click", (e) => {
      if (!btn.contains(e.target) && !nav.contains(e.target)) toggle(false);
    });

    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  })();

  /* ─────────────────────────────────────────────────────────────
     5. SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────────────────────────── */
  (function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("visible"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement.querySelectorAll(".reveal:not(.visible)"));
        const delay    = siblings.indexOf(entry.target) * 80;
        setTimeout(() => entry.target.classList.add("visible"), delay);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    items.forEach((el) => io.observe(el));
  })();

  /* ─────────────────────────────────────────────────────────────
     6. COUNTDOWN TIMER
  ───────────────────────────────────────────────────────────── */
  (function initCountdown() {
    const elD = document.getElementById("cd-days");
    const elH = document.getElementById("cd-hours");
    const elM = document.getElementById("cd-mins");
    const elS = document.getElementById("cd-secs");
    if (!elD) return;

    // Target: Oct 05 2026 (submission deadline from timeline)
    const target = new Date("2026-10-05T23:59:59");

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now());
      elD.textContent = pad(Math.floor(diff / 86400000));
      elH.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      elM.textContent = pad(Math.floor((diff % 3600000) / 60000));
      elS.textContent = pad(Math.floor((diff % 60000) / 1000));
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ─────────────────────────────────────────────────────────────
     7. GALLERY — Tilt + shine (Requirement 3: hover animation)
  ───────────────────────────────────────────────────────────── */
  (function initGallery() {
    document.querySelectorAll(".gal-item").forEach((item) => {
      const inner = item.querySelector(".gal-inner");
      const shine = item.querySelector(".gal-shine");

      item.addEventListener("mousemove", (e) => {
        if (!inner) return;
        const r   = item.getBoundingClientRect();
        const x   = (e.clientX - r.left) / r.width  - 0.5;
        const y   = (e.clientY - r.top)  / r.height - 0.5;
        const rx  = (-y * 12).toFixed(2);
        const ry  = ( x * 12).toFixed(2);
        const mx  = ((x + 0.5) * 100).toFixed(1) + "%";
        const my  = ((y + 0.5) * 100).toFixed(1) + "%";

        inner.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;

        if (shine) {
          shine.style.setProperty("--mx", mx);
          shine.style.setProperty("--my", my);
        }
      });

      item.addEventListener("mouseleave", () => {
        if (inner) inner.style.transform = "";
      });

      // Keyboard: show overlay on focus
      item.addEventListener("focus", () => {
        const overlay = item.querySelector(".gal-overlay");
        if (overlay) overlay.style.opacity = "1";
      });
      item.addEventListener("blur", () => {
        const overlay = item.querySelector(".gal-overlay");
        if (overlay) overlay.style.opacity = "";
      });
    });
  })();

  /* ─────────────────────────────────────────────────────────────
     8. TIMELINE SLIDER (Requirement 2: interactive slider)
         — Pointer (mouse/touch) drag, keyboard, milestone cards
  ───────────────────────────────────────────────────────────── */
  (function initSlider() {
    const track   = document.getElementById("sl-track");
    const fill    = document.getElementById("sl-fill");
    const thumb   = document.getElementById("sl-thumb");
    const cards   = document.querySelectorAll(".tl-item");
    const stops   = document.querySelectorAll(".sl-stop");
    const titleEl = document.getElementById("tl-active-label");
    const dateEl  = document.getElementById("tl-active-date");
    if (!track) return;

    const TOTAL    = 4; // 0-indexed max
    let   activeIdx = 0;
    let   dragging  = false;

    const milestones = [
      { date: "Aug 10", label: "Registration Opens",  iso: "2026-08-10" },
      { date: "Sep 01", label: "Team Formation",       iso: "2026-09-01" },
      { date: "Sep 15", label: "Challenge Selection",  iso: "2026-09-15" },
      { date: "Oct 05", label: "Submission Deadline",  iso: "2026-10-05" },
      { date: "Oct 20", label: "Winners Announced",    iso: "2026-10-20" },
    ];

    function activate(idx) {
      activeIdx = Math.max(0, Math.min(TOTAL, idx));
      const pct = (activeIdx / TOTAL) * 100;

      // Slider visuals
      fill.style.width   = pct + "%";
      thumb.style.left   = pct + "%";

      // Update ARIA
      track.setAttribute("aria-valuenow",  activeIdx);
      track.setAttribute("aria-valuetext", `${milestones[activeIdx].date} — ${milestones[activeIdx].label}`);

      // Stop dots
      stops.forEach((s, i) => s.classList.toggle("active", i === activeIdx));

      // Milestone cards
      cards.forEach((c, i) => {
        const on = i === activeIdx;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", String(on));
      });

      // Active display (re-trigger animation by cloning)
      if (titleEl) {
        titleEl.style.animation = "none";
        // Force reflow
        void titleEl.offsetWidth;
        titleEl.textContent    = milestones[activeIdx].label;
        titleEl.style.animation = "";
      }
      if (dateEl) dateEl.textContent = milestones[activeIdx].date + ", 2026";
    }

    function idxFromClientX(clientX) {
      const rect  = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return Math.round(ratio * TOTAL);
    }

    // Pointer events (mouse + touch via pointer API)
    track.addEventListener("pointerdown", (e) => {
      dragging = true;
      track.setPointerCapture(e.pointerId);
      activate(idxFromClientX(e.clientX));
    });
    track.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      activate(idxFromClientX(e.clientX));
    });
    track.addEventListener("pointerup",     () => { dragging = false; });
    track.addEventListener("pointercancel", () => { dragging = false; });

    // Keyboard
    track.addEventListener("keydown", (e) => {
      const map = {
        ArrowRight: activeIdx + 1,
        ArrowUp:    activeIdx + 1,
        ArrowLeft:  activeIdx - 1,
        ArrowDown:  activeIdx - 1,
        Home:       0,
        End:        TOTAL,
      };
      if (e.key in map) {
        e.preventDefault();
        activate(map[e.key]);
      }
    });

    // Stop-dot clicks
    stops.forEach((s) => {
      s.addEventListener("click", (e) => {
        e.stopPropagation();
        activate(parseInt(s.dataset.idx, 10));
      });
    });

    // Milestone card clicks
    cards.forEach((c) => {
      c.addEventListener("click", () => activate(parseInt(c.dataset.idx, 10)));
    });

    // Initial state
    activate(0);
  })();

  /* ─────────────────────────────────────────────────────────────
     9. FAQ ACCORDION
  ───────────────────────────────────────────────────────────── */
  (function initFaq() {
    document.querySelectorAll(".faq-q").forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        const answerId = btn.getAttribute("aria-controls");
        const answer   = document.getElementById(answerId);
        const icon     = btn.querySelector(".faq-icon");

        // Close all others
        document.querySelectorAll(".faq-q").forEach((b) => {
          if (b === btn) return;
          b.setAttribute("aria-expanded", "false");
          const aId = b.getAttribute("aria-controls");
          const a   = document.getElementById(aId);
          const ic  = b.querySelector(".faq-icon");
          if (a)  a.hidden = true;
          if (ic) ic.textContent = "+";
        });

        // Toggle this one
        const nowOpen = !expanded;
        btn.setAttribute("aria-expanded", String(nowOpen));
        if (answer) answer.hidden = !nowOpen;
        if (icon)   icon.textContent = nowOpen ? "−" : "+";
      });
    });
  })();

  /* ─────────────────────────────────────────────────────────────
     10. SMOOTH SCROLL (offset by nav height)
  ───────────────────────────────────────────────────────────── */
  (function initSmoothScroll() {
    const NAV_H = 88; // pixels to offset

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  })();

  /* ─────────────────────────────────────────────────────────────
     11. FOOTER YEAR
  ───────────────────────────────────────────────────────────── */
  (function initFooter() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  })();

})();
