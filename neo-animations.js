/**
 * Premium UI: AOS, GSAP, scroll progress, cursor glow, section reveal, project preview
 */
(function () {
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ----- Smooth scrolling flag ----- */
  if (!prefersReduced) {
    document.documentElement.classList.add("premium-smooth");
  }

  /* ----- AOS: section reveal animations ----- */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 64,
      delay: 0,
      disable: prefersReduced,
    });

    var aosResizeTimer;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(aosResizeTimer);
        aosResizeTimer = setTimeout(function () {
          AOS.refresh();
        }, 200);
      },
      { passive: true }
    );
  }

  /* ----- Scroll progress bar ----- */
  var scrollProgress = document.getElementById("scrollProgress");
  var progressTicking = false;

  function updateScrollProgress() {
    if (!scrollProgress) return;
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = doc.scrollHeight - doc.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgress.style.width = pct + "%";
    scrollProgress.setAttribute("aria-valuenow", Math.round(pct));
    progressTicking = false;
  }

  function onScrollProgress() {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(updateScrollProgress);
    }
  }

  if (scrollProgress && !prefersReduced) {
    window.addEventListener("scroll", onScrollProgress, { passive: true });
    updateScrollProgress();
  }

  /* ----- Section reveal (Intersection Observer) ----- */
  if (!prefersReduced) {
    var sections = document.querySelectorAll("main > section[id]");
    if (sections.length && "IntersectionObserver" in window) {
      sections.forEach(function (section) {
        /* Home hero: no section-reveal — transform was overriding top spacing */
        if (section.id === "about") return;
        section.classList.add("section-reveal");
      });

      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-inview");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: "0px 0px -8% 0px" }
      );

      sections.forEach(function (section) {
        if (section.id === "about") return;
        revealObserver.observe(section);
      });
    }
  }

  /* ----- Cursor glow ----- */
  var cursorGlow = document.getElementById("cursorGlow");
  var cursorX = 0;
  var cursorY = 0;
  var glowX = 0;
  var glowY = 0;
  var cursorActive = false;

  function animateCursorGlow() {
    if (!cursorGlow || !cursorActive) return;
    glowX += (cursorX - glowX) * 0.14;
    glowY += (cursorY - glowY) * 0.14;
    cursorGlow.style.left = glowX + "px";
    cursorGlow.style.top = glowY + "px";
    requestAnimationFrame(animateCursorGlow);
  }

  if (cursorGlow && finePointer && !prefersReduced) {
    document.body.classList.add("is-cursor-active");
    cursorActive = true;

    document.addEventListener(
      "mousemove",
      function (e) {
        cursorX = e.clientX;
        cursorY = e.clientY;
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      cursorGlow.style.opacity = "0";
    });

    document.addEventListener("mouseenter", function () {
      cursorGlow.style.opacity = "";
    });

    requestAnimationFrame(animateCursorGlow);
  }

  /* ----- Project hover preview ----- */
  var projPreview = document.getElementById("projPreview");
  var projPreviewImg = document.getElementById("projPreviewImg");
  var projCards = document.querySelectorAll(".proj-hoverable");

  function positionProjPreview(clientX, clientY) {
    if (!projPreview) return;
    var pad = 20;
    var w = projPreview.offsetWidth || 380;
    var h = projPreview.offsetHeight || 240;
    var x = clientX + pad;
    var y = clientY + pad;

    if (x + w > window.innerWidth - pad) {
      x = clientX - w - pad;
    }
    if (y + h > window.innerHeight - pad) {
      y = clientY - h - pad;
    }
    if (x < pad) x = pad;
    if (y < pad) y = pad;

    projPreview.style.left = x + "px";
    projPreview.style.top = y + "px";
  }

  if (projPreview && projPreviewImg && finePointer && !prefersReduced) {
    projCards.forEach(function (card) {
      if (card.querySelector(".proj-visual--slideshow")) return;

      var img = card.querySelector(".proj-visual img");
      if (!img || !img.src) return;

      card.addEventListener("mouseenter", function (e) {
        projPreviewImg.src = img.src;
        projPreviewImg.alt = img.alt || "Project preview";
        projPreview.classList.add("is-visible");
        projPreview.setAttribute("aria-hidden", "false");
        positionProjPreview(e.clientX, e.clientY);
      });

      card.addEventListener("mousemove", function (e) {
        if (projPreview.classList.contains("is-visible")) {
          positionProjPreview(e.clientX, e.clientY);
        }
      });

      card.addEventListener("mouseleave", function () {
        projPreview.classList.remove("is-visible");
        projPreview.setAttribute("aria-hidden", "true");
      });
    });
  }

  if (prefersReduced || typeof gsap === "undefined") return;

  /* Run motion only after loader/skeleton — avoids hidden nav & hero CTAs */
  function initGsapMotion() {
    var intro = document.querySelector(".home-intro");
    if (intro) {
      var introTargets = intro.querySelectorAll(
        ".hero-headline, .home-desc-block, .hero-cta-row"
      );
      if (introTargets.length) {
        gsap.from(introTargets, {
          opacity: 0,
          y: 32,
          duration: 0.85,
          stagger: 0.14,
          ease: "power3.out",
          delay: 0.12,
          clearProps: "transform,opacity",
          onComplete: function () {
            intro.querySelectorAll(".cta-btn").forEach(function (btn) {
              btn.style.removeProperty("transform");
              btn.style.removeProperty("opacity");
            });
          },
        });
      }

      var deskIntern = intro.querySelector(".hero-intern--desk");
      if (deskIntern && window.matchMedia("(min-width: 769px)").matches) {
        gsap.fromTo(
          deskIntern,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: 0.55,
            clearProps: "opacity,transform",
          }
        );
      }
    }

    var stats = document.querySelectorAll(".stat-item");
    if (stats.length) {
      gsap.from(stats, {
        opacity: 0,
        x: 24,
        duration: 0.65,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.45,
        clearProps: "transform,opacity",
      });
    }

    var services = document.querySelectorAll(".service-cell");
    if (services.length) {
      gsap.from(services, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.55,
        clearProps: "transform,opacity",
      });
    }
  }

  if (document.body.classList.contains("is-ready")) {
    initGsapMotion();
  } else {
    window.addEventListener("page:ready", initGsapMotion, { once: true });
  }

  /* ----- View all: soft highlight when on screen (mobile, lightweight) ----- */
  function initAccordionNearHighlight() {
    var mobileMq = window.matchMedia("(max-width: 768px)");
    var observer = null;
    var toggleHandlers = [];

    function teardown() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      toggleHandlers.forEach(function (h) {
        h.details.removeEventListener("toggle", h.fn);
      });
      toggleHandlers = [];
      document.querySelectorAll(".section-accordion.is-scroll-near").forEach(function (el) {
        el.classList.remove("is-scroll-near");
      });
    }

    function setup() {
      teardown();
      if (prefersReduced || !mobileMq.matches || !("IntersectionObserver" in window)) {
        return;
      }

      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var details = entry.target.closest(".section-accordion");
            if (!details || details.open) {
              if (details) details.classList.remove("is-scroll-near");
              return;
            }
            details.classList.toggle("is-scroll-near", entry.isIntersecting);
          });
        },
        { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
      );

      document.querySelectorAll(".section-accordion-summary").forEach(function (summary) {
        observer.observe(summary);
        var details = summary.closest(".section-accordion");
        if (!details) return;
        var onToggle = function () {
          if (details.open) details.classList.remove("is-scroll-near");
        };
        details.addEventListener("toggle", onToggle);
        toggleHandlers.push({ details: details, fn: onToggle });
      });
    }

    setup();
    mobileMq.addEventListener("change", setup);
  }

  if (document.body.classList.contains("is-ready")) {
    initAccordionNearHighlight();
  } else {
    window.addEventListener("page:ready", initAccordionNearHighlight, { once: true });
  }
})();
