/**
 * Portfolio: sticky nav, mobile menu, smooth scroll, contact form (Formspree + toast)
 */

(function () {
  /* ----- Start at header/top on every load, refresh, or reopen ----- */
  (function initScrollToTop() {
    function scrollToTop() {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    function clearHashOnLoad() {
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    scrollToTop();
    clearHashOnLoad();

    window.addEventListener("pageshow", function () {
      scrollToTop();
      clearHashOnLoad();
    });

    window.addEventListener("load", function () {
      scrollToTop();
      clearHashOnLoad();
    });

    window.addEventListener("page:ready", scrollToTop);
  })();

  /* ----- iOS / Android: real viewport height + scroll lock ----- */
  (function initMobilePlatform() {
    var scrollLockY = 0;

    function setViewportHeight() {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty("--vh", height * 0.01 + "px");
    }

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight, { passive: true });
    window.addEventListener("orientationchange", function () {
      window.setTimeout(setViewportHeight, 120);
      window.setTimeout(setViewportHeight, 400);
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setViewportHeight, { passive: true });
    }

    window.lockBodyScroll = function () {
      scrollLockY = window.scrollY || window.pageYOffset || 0;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = "-" + scrollLockY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    };

    window.unlockBodyScroll = function () {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLockY);
    };
  })();

  /* ----- LG. splash + skeleton + content reveal ----- */
  (function initPageLoading() {
    var loader = document.getElementById("pageLoader");
    var skeleton = document.getElementById("pageSkeleton");
    var body = document.body;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var SPLASH_MS = reducedMotion ? 400 : 1000;
    var FADE_MS = reducedMotion ? 150 : 280;
    var MIN_SKELETON_MS = reducedMotion ? 120 : 320;
    var MAX_WAIT_MS = 2200;

    var splashDone = false;
    var assetsDone = false;
    var skeletonShownAt = 0;
    var revealed = false;

    body.classList.add("is-loading");

    if (loader) {
      loader.style.setProperty("--splash-ms", SPLASH_MS + "ms");
    }

    function preloadAssets() {
      var urls = ["assets/profile.jpg"];
      var imgs = document.querySelectorAll(".photo-frame img");
      imgs.forEach(function (img) {
        if (img.src && urls.indexOf(img.getAttribute("src") || img.src) === -1) {
          urls.push(img.getAttribute("src") || img.src);
        }
      });

      var promises = urls.map(function (src) {
        return new Promise(function (resolve) {
          var image = new Image();
          image.onload = image.onerror = resolve;
          image.src = src;
        });
      });

      var fontReady = document.fonts && document.fonts.ready
        ? document.fonts.ready.catch(function () {})
        : Promise.resolve();

      return Promise.all(promises.concat([fontReady]));
    }

    function showSkeleton() {
      splashDone = true;
      skeletonShownAt = Date.now();
      body.classList.remove("is-loading");
      body.classList.add("is-skeleton");
      if (skeleton) {
        skeleton.setAttribute("aria-hidden", "false");
      }
      tryReveal();
    }

    function hideSplash() {
      if (!loader) {
        showSkeleton();
        return;
      }
      loader.classList.add("is-hidden");
      loader.setAttribute("aria-hidden", "true");
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
        showSkeleton();
      }, FADE_MS);
    }

    function clearRevealInlineStyles() {
      var nav = document.getElementById("siteNav");
      if (nav) {
        nav.style.removeProperty("opacity");
        nav.style.removeProperty("transform");
      }
      document
        .querySelectorAll(
          ".hero-headline, .home-desc-block, .hero-cta-row, .hero-cta-row .cta-btn, .stat-item"
        )
        .forEach(function (el) {
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
        });
    }

    function revealPage() {
      if (revealed) return;
      revealed = true;
      body.classList.remove("is-skeleton", "is-loading");
      body.classList.add("is-ready");
      clearRevealInlineStyles();
      window.dispatchEvent(new CustomEvent("page:ready"));
      if (skeleton) {
        skeleton.classList.add("is-hidden");
        skeleton.setAttribute("aria-hidden", "true");
        window.setTimeout(function () {
          if (skeleton.parentNode) skeleton.parentNode.removeChild(skeleton);
        }, FADE_MS);
      }
    }

    function tryReveal() {
      if (!splashDone || !assetsDone || revealed) return;
      var elapsed = Date.now() - skeletonShownAt;
      var delay = Math.max(0, MIN_SKELETON_MS - elapsed);
      window.setTimeout(revealPage, delay);
    }

    preloadAssets().then(function () {
      assetsDone = true;
      tryReveal();
    });

    window.setTimeout(function () {
      assetsDone = true;
      tryReveal();
    }, MAX_WAIT_MS);

    window.setTimeout(hideSplash, SPLASH_MS);
  })();

  var menuBtn = document.getElementById("menuBtn");
  var navPanel = document.getElementById("navPanel");
  var navClose = document.getElementById("navClose");
  var panelLinks = document.querySelectorAll(".nav-panel-links a");
  var navLinks = document.querySelectorAll(
    '.site-nav-links a[href^="#"], .footer-links a[href^="#"]'
  );
  var contactForm = document.getElementById("contactForm");
  var contactSubmit = document.getElementById("contactSubmit");
  var toast = document.getElementById("toast");
  var toastTitle = document.getElementById("toastTitle");
  var toastMsg = document.getElementById("toastMsg");
  var toastClose = document.getElementById("toastClose");
  var toastTimer = null;

  function getNavOffset() {
    var nav = document.getElementById("siteNav");
    return nav ? nav.offsetHeight + 12 : 0;
  }

  function setMenuBtnState(isOpen) {
    if (!menuBtn) return;
    var text = menuBtn.querySelector(".nav-toggle-text");
    menuBtn.classList.toggle("is-open", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    if (text) text.textContent = isOpen ? "Close" : "Menu";
    document.body.classList.toggle("nav-menu-open", isOpen);
  }

  function openMenu() {
    navPanel.classList.add("is-open");
    navPanel.setAttribute("aria-hidden", "false");
    setMenuBtnState(true);
    if (typeof window.lockBodyScroll === "function") {
      window.lockBodyScroll();
    } else {
      document.body.style.overflow = "hidden";
    }
  }

  function closeMenu() {
    navPanel.classList.remove("is-open");
    navPanel.setAttribute("aria-hidden", "true");
    setMenuBtnState(false);
    if (typeof window.unlockBodyScroll === "function") {
      window.unlockBodyScroll();
    } else {
      document.body.style.overflow = "";
    }
  }

  function setActiveNav() {
    var sections = document.querySelectorAll("main section[id]");
    var scrollY = window.scrollY + getNavOffset() + 40;
    var current = "";

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      link.classList.toggle("is-active", id === current);
    });
  }

  /** Show success or error toast with slide-in + checkmark draw */
  function showToast(title, message, isError) {
    if (!toast) return;
    if (toastTimer) clearTimeout(toastTimer);

    toastTitle.textContent = title;
    toastMsg.textContent = message;
    toast.classList.toggle("is-error", !!isError);
    toast.classList.add("is-visible");
    toast.setAttribute("aria-hidden", "false");

    toastTimer = setTimeout(hideToast, isError ? 6000 : 5000);
  }

  function hideToast() {
    if (!toast) return;
    toast.classList.remove("is-visible", "is-error");
    toast.setAttribute("aria-hidden", "true");
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
  }

  function setFormLoading(loading) {
    if (!contactSubmit) return;
    contactSubmit.disabled = loading;
    contactSubmit.classList.toggle("is-loading", loading);
  }

  function isFormspreeConfigured(endpoint) {
    return endpoint && endpoint.indexOf("YOUR_FORM_ID") === -1;
  }

  function submitViaMailto(name, email, message) {
    var subject = encodeURIComponent("Portfolio contact from " + name);
    var body = encodeURIComponent(
      "Name: " + name + "\nEmail: " + email + "\n\n" + message
    );
    window.location.href =
      "mailto:priyadarshanplg@gmail.com?subject=" + subject + "&body=" + body;
    showToast(
      "Opening email client",
      "Formspree is not set up yet. Configure your form ID in neo-portfolio.html, or send via your mail app.",
      false
    );
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      if (navPanel.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }
  if (navClose) navClose.addEventListener("click", closeMenu);
  if (toastClose) toastClose.addEventListener("click", hideToast);

  panelLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      var top = target.getBoundingClientRect().top + window.scrollY - getNavOffset();
      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", link.getAttribute("href"));
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navPanel.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = contactForm.name.value.trim();
      var email = contactForm.email.value.trim();
      var message = contactForm.message.value.trim();
      var honeypot = contactForm.querySelector('[name="_gotcha"]');

      if (honeypot && honeypot.value) return;

      if (!name || !email || !message) {
        showToast("Missing fields", "Please fill in your name, email, and message.", true);
        return;
      }

      var endpoint = contactForm.getAttribute("data-formspree");

      if (!isFormspreeConfigured(endpoint)) {
        submitViaMailto(name, email, message);
        return;
      }

      setFormLoading(true);

      fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: "Portfolio contact from " + name,
          _replyto: email,
        }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Form submission failed");
          contactForm.reset();
          if (contactSubmit) contactSubmit.classList.add("is-success");
          showToast(
            "Message sent!",
            "Thanks for reaching out. I'll get back to you soon.",
            false
          );
          setTimeout(function () {
            if (contactSubmit) contactSubmit.classList.remove("is-success");
          }, 600);
        })
        .catch(function () {
          showToast(
            "Could not send",
            "Something went wrong. Try again or email priyadarshanplg@gmail.com directly.",
            true
          );
        })
        .finally(function () {
          setFormLoading(false);
        });
    });
  }
  /* Desktop: keep section accordions expanded; mobile: collapsed to save scroll */
  function syncAccordions() {
    var mobile = window.matchMedia("(max-width: 768px)").matches;
    document
      .querySelectorAll(
        ".cert-accordion, .exp-accordion, .edu-accordion, .skills-accordion, .proj-accordion"
      )
      .forEach(function (el) {
      if (mobile) {
        el.removeAttribute("open");
      } else {
        el.setAttribute("open", "");
      }
    });
  }

  syncAccordions();
  window.addEventListener("resize", syncAccordions, { passive: true });

  /* Certification preview — View opens image; tap outside image closes */
  (function initCertLightbox() {
    var lightbox = document.getElementById("certLightbox");
    var lightboxImg = document.getElementById("certLightboxImg");
    if (!lightbox || !lightboxImg) return;

    function openCertPreview(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "Certificate";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeCertPreview() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".cert-view-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var src = btn.getAttribute("data-cert-src");
        var alt = btn.getAttribute("data-cert-alt");
        if (src) openCertPreview(src, alt);
      });
    });

    lightboxImg.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    lightbox.addEventListener("click", closeCertPreview);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeCertPreview();
      }
    });
  })();

  /* Project screenshot slideshow — auto-advance + dots, arrows, swipe */
  document.querySelectorAll("[data-proj-slideshow]").forEach(function (slideshow) {
    var imgs = slideshow.querySelectorAll(".proj-slideshow-img");
    var wrap = slideshow.closest(".proj-visual--slideshow");
    var dots = wrap ? wrap.querySelectorAll(".proj-slideshow-dots button") : [];
    var index = 0;
    var timer = null;
    var delay = 1500;
    var swipeMin = 40;
    var touchStartX = 0;
    var touchStartY = 0;

    function showSlide(n) {
      index = (n + imgs.length) % imgs.length;
      imgs.forEach(function (img, i) {
        img.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, delay);
    }

    function stopAuto() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function goPrev() {
      showSlide(index - 1);
      startAuto();
    }

    function goNext() {
      showSlide(index + 1);
      startAuto();
    }

    function addNavBtn(label, className, onClick) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "proj-slideshow-nav " + className;
      btn.setAttribute("aria-label", label);
      btn.textContent = className.indexOf("prev") >= 0 ? "\u2039" : "\u203A";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        onClick();
      });
      return btn;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startAuto();
      });
    });

    if (imgs.length > 1 && wrap) {
      wrap.classList.add("has-proj-slideshow-nav");
      wrap.appendChild(addNavBtn("Previous screenshot", "proj-slideshow-prev", goPrev));
      wrap.appendChild(addNavBtn("Next screenshot", "proj-slideshow-next", goNext));

      wrap.addEventListener("touchstart", function (e) {
        if (!e.changedTouches[0]) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        stopAuto();
      }, { passive: true });

      wrap.addEventListener("touchend", function (e) {
        if (!e.changedTouches[0]) return;
        var dx = e.changedTouches[0].screenX - touchStartX;
        var dy = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(dx) >= swipeMin && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) goNext();
          else goPrev();
        } else {
          startAuto();
        }
      }, { passive: true });

      startAuto();
      slideshow.addEventListener("mouseenter", stopAuto);
      slideshow.addEventListener("mouseleave", startAuto);
    }
  });
})();
