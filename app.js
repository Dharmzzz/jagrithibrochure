/* =========================================================
   JAGRUTHI MELA — INTERACTIVE BROCHURE SCRIPT
   ========================================================= */

(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsFinePointer =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function assignStaggerIndices(elements) {
    elements.forEach((el, idx) => {
      el.style.setProperty("--stagger", String(idx));
    });
  }

  // 1. Accessibility & Print Controls
  const fontScaleBtn = document.getElementById("fontScaleBtn");
  const contrastBtn = document.getElementById("contrastBtn");
  const printBrochureBtn = document.getElementById("printBrochureBtn");
  const invitationPrintBtn = document.getElementById("invitationPrintBtn");
  const footerPrintBtn = document.getElementById("footerPrintBtn");

  if (fontScaleBtn) {
    fontScaleBtn.addEventListener("click", () => {
      const enabled = document.documentElement.classList.toggle("text-lg");
      fontScaleBtn.setAttribute("aria-pressed", String(enabled));
      if (window.ScrollTrigger) {
        window.requestAnimationFrame(() => window.ScrollTrigger.refresh());
      }
    });
  }

  if (contrastBtn) {
    contrastBtn.addEventListener("click", () => {
      const enabled = document.documentElement.classList.toggle("high-contrast");
      contrastBtn.setAttribute("aria-pressed", String(enabled));
    });
  }

  const triggerPrint = () => {
    if (
      window.JagruthiUmbrella &&
      typeof window.JagruthiUmbrella.capturePrintSnapshot === "function"
    ) {
      window.JagruthiUmbrella.capturePrintSnapshot();
    }
    window.print();
  };
  if (printBrochureBtn) printBrochureBtn.addEventListener("click", triggerPrint);
  if (invitationPrintBtn) invitationPrintBtn.addEventListener("click", triggerPrint);
  if (footerPrintBtn) footerPrintBtn.addEventListener("click", triggerPrint);

  window.addEventListener("beforeprint", () => {
    if (
      window.JagruthiUmbrella &&
      typeof window.JagruthiUmbrella.capturePrintSnapshot === "function"
    ) {
      window.JagruthiUmbrella.capturePrintSnapshot();
    }
  });

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mobileDrawer = document.getElementById("mobileNavDrawer");

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = !mobileDrawer.hidden;
      mobileDrawer.hidden = isOpen;
      mobileToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileDrawer.hidden = true;
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Assign base stagger delays across card groups
  assignStaggerIndices(document.querySelectorAll(".testimonials-grid .testimonial-card"));
  assignStaggerIndices(document.querySelectorAll(".support-grid .support-card"));

  // 3. Scroll Progress Bar & Sticky Glass Header State
  const siteHeader = document.getElementById("top");
  const scrollProgress = document.getElementById("scrollProgress");
  let scrollRafPending = false;

  function updateScrollChrome() {
    scrollRafPending = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    if (scrollProgress) {
      scrollProgress.style.setProperty("--scroll-progress", ratio.toFixed(4));
    }
    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", scrollTop > 12);
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollRafPending) {
        scrollRafPending = true;
        window.requestAnimationFrame(updateScrollChrome);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateScrollChrome, { passive: true });
  updateScrollChrome();

  // 8. Hero Visual Subtle 3D Tilt & Specular Glare (Desktop Fine Pointer)
  const heroVisual = document.querySelector(".hero-visual");
  const heroFrame = document.querySelector(".hero-frame");
  if (heroVisual && heroFrame && supportsFinePointer && !prefersReducedMotion) {
    heroVisual.addEventListener("pointermove", (e) => {
      const rect = heroFrame.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const tiltY = (px - 0.5) * 4.5;
      const tiltX = (0.5 - py) * 4.0;

      heroFrame.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
      heroFrame.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
      heroFrame.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      heroFrame.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    });

    heroVisual.addEventListener("pointerleave", () => {
      heroFrame.style.setProperty("--tilt-x", "0deg");
      heroFrame.style.setProperty("--tilt-y", "0deg");
    });
  }

  // 9. GarvSe Reach Stat Counters
  const statsRow = document.querySelector(".garvse-stats-row");
  const countEls = document.querySelectorAll("[data-count]");

  function animateCounters() {
    countEls.forEach((el) => {
      if (el.dataset.counted === "true") return;
      el.dataset.counted = "true";

      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || "";
      if (prefersReducedMotion || !target) {
        el.textContent = `${target}${suffix}`;
        return;
      }

      const startVal = target > 500 ? target - 60 : 0;
      const duration = 850;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startVal + (target - startVal) * eased);
        el.textContent = `${current}${suffix}`;
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          el.textContent = `${target}${suffix}`;
        }
      }

      window.requestAnimationFrame(tick);
    });
  }

  if (statsRow && countEls.length) {
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounters();
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      counterObserver.observe(statsRow);
    } else {
      animateCounters();
    }
  }

  // 10. Lenis Smooth Scrolling + GSAP ScrollTrigger Motion Engine
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  const hasLenis = Boolean(window.Lenis);
  const revealEls = document.querySelectorAll(".reveal");
  let lenis = null;

  if (hasLenis && !prefersReducedMotion) {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95
    });
    window.JagruthiLenis = lenis;

    lenis.on("scroll", () => {
      updateScrollChrome();
      if (hasGsap) {
        window.ScrollTrigger.update();
      }
    });

    if (hasGsap) {
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const rafLoop = (time) => {
        lenis.raf(time);
        window.requestAnimationFrame(rafLoop);
      };
      window.requestAnimationFrame(rafLoop);
    }

    // Intercept internal anchor links with Lenis inertial scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        if (href === "#top") {
          e.preventDefault();
          lenis.scrollTo(0, {
            duration: 0.75,
            onComplete: () => hasGsap && window.ScrollTrigger.update()
          });
          return;
        }
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, {
            offset: -74,
            duration: 0.72,
            onComplete: () => hasGsap && window.ScrollTrigger.update()
          });
        }
      });
    });
  }

  if (hasGsap && !prefersReducedMotion) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("gsap-ready");

    // Mark reveal elements visible immediately when ScrollTrigger handles motion
    revealEls.forEach((el) => el.classList.add("is-visible"));

    // Resilient section entrance helper that never leaves visible sections stuck at opacity 0
    function bindSectionEntrance(targetSelector, triggerSelector, fromVars, toVars, startPos = "top 90%") {
      const targets = gsap.utils.toArray(targetSelector);
      const triggerEl = document.querySelector(triggerSelector);
      if (!targets.length || !triggerEl) return;

      let played = false;
      const playNow = (immediate = false) => {
        if (played) return;
        played = true;
        if (immediate) {
          gsap.set(targets, { opacity: 1, clearProps: "opacity,transform" });
        } else {
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            scale: 1,
            ...toVars,
            clearProps: "opacity,transform"
          });
        }
      };

      const checkBounds = () => {
        if (played) return;
        const rect = triggerEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.97 && rect.bottom >= 0) {
          playNow(false);
        } else if (rect.bottom < 0) {
          playNow(true);
        }
      };

      gsap.set(targets, fromVars);

      ScrollTrigger.create({
        trigger: triggerEl,
        start: startPos,
        once: true,
        onEnter: () => playNow(false),
        onEnterBack: () => playNow(false),
        onRefresh: checkBounds
      });

      // Defer one tick after initial layout to handle already-visible sections cleanly
      window.requestAnimationFrame(checkBounds);
    }

    // Overview band choreography
    bindSectionEntrance(
      ".purpose-col, .purpose-col-right",
      "#overview",
      { opacity: 0, y: 26 },
      { duration: 0.72, stagger: 0.14, ease: "power3.out" },
      "top 88%"
    );

    bindSectionEntrance(
      ".garvse-stat",
      ".garvse-stats-row",
      { opacity: 0, y: 18, scale: 0.96 },
      { duration: 0.55, stagger: 0.08, ease: "back.out(1.4)" },
      "top 92%"
    );

    // About GarvSe Programme entrance
    bindSectionEntrance(
      ".garvse-overview-card, .garvse-kerala-card, .garvse-aims-card",
      "#garvse",
      { opacity: 0, y: 22 },
      { duration: 0.62, stagger: 0.1, ease: "power3.out" },
      "top 92%"
    );

    // 3D Umbrella bloom on arrival
    ScrollTrigger.create({
      trigger: ".umbrella-canopy-panel",
      start: "top 86%",
      once: true,
      onEnter: () => {
        window.dispatchEvent(new CustomEvent("jm:umbrella-enter"));
      }
    });

    // Voices of Impact staggered cards
    bindSectionEntrance(
      ".testimonials-grid .testimonial-card",
      ".testimonials-grid",
      { opacity: 0, y: 26 },
      { duration: 0.65, stagger: 0.11, ease: "power3.out" },
      "top 88%"
    );

    // Partnership Support avenues & stakeholder pills
    bindSectionEntrance(
      ".support-grid .support-card",
      ".support-grid",
      { opacity: 0, y: 22 },
      { duration: 0.58, stagger: 0.07, ease: "power3.out" },
      "top 90%"
    );

    bindSectionEntrance(
      ".stakeholder-tags span",
      ".stakeholder-banner",
      { opacity: 0, scale: 0.9 },
      { duration: 0.42, stagger: 0.045, ease: "back.out(1.6)" },
      "top 96%"
    );

    // Open Invitation card entrance
    bindSectionEntrance(
      ".invitation-card",
      "#invitation",
      { opacity: 0, y: 22 },
      { duration: 0.62, ease: "power3.out" },
      "top 90%"
    );

    // Event Venue & Map entrance
    bindSectionEntrance(
      ".venue-details-card, .venue-map-card",
      "#venue",
      { opacity: 0, y: 22 },
      { duration: 0.6, stagger: 0.12, ease: "power3.out" },
      "top 90%"
    );

    const mainEl = document.querySelector("main");
    if (mainEl && "ResizeObserver" in window) {
      let refreshQueued = false;
      const layoutObserver = new ResizeObserver(() => {
        if (refreshQueued) return;
        refreshQueued = true;
        window.requestAnimationFrame(() => {
          refreshQueued = false;
          ScrollTrigger.refresh();
        });
      });
      layoutObserver.observe(mainEl);
    }

    window.addEventListener("load", () => ScrollTrigger.refresh());
    window.addEventListener("beforeprint", () => {
      gsap.globalTimeline.progress(1);
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (entry.target.classList.contains("umbrella-canopy-panel")) {
              window.dispatchEvent(new CustomEvent("jm:umbrella-enter"));
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px -24px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const navLinks = document.querySelectorAll(".main-nav a");
  const sections = Array.from(navLinks)
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetId = `#${entry.target.id}`;
            navLinks.forEach((a) => {
              a.classList.toggle("is-current", a.getAttribute("href") === targetId);
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach((sec) => navObserver.observe(sec));
  }
})();
