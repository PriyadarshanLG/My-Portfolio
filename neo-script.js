/* ========================================
   NEO-BRUTALIST PORTFOLIO — JAVASCRIPT
   ======================================== */

// ---- LOADING SCREEN ----
(function () {
  const overlay = document.getElementById('loader-overlay');
  const bar = document.getElementById('loaderBar');
  if (!overlay || !bar) return;

  // Prevent scroll while loading
  document.body.style.overflow = 'hidden';

  let progress = 0;
  const totalMs = 2200;
  const interval = 30;
  const step = (interval / totalMs) * 100;

  const ticker = setInterval(() => {
    progress = Math.min(progress + step + (Math.random() * step * 0.5), 100);
    bar.style.width = progress + '%';

    if (progress >= 100) {
      clearInterval(ticker);
      // Small pause at 100%, then fade out
      setTimeout(() => {
        overlay.classList.add('loader-hide');
        document.body.style.overflow = '';
        // Remove from DOM after transition
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      }, 300);
    }
  }, interval);

  // Switch blocks to idle pulse after entrance animation completes
  setTimeout(() => {
    document.querySelectorAll('.loader-block').forEach(el => {
      el.classList.add('ready');
    });
  }, 700);

})();



// ---- Hamburger menu ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- Active nav on scroll ----
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navItems.forEach(a => a.classList.remove('nav-active'));
      const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('nav-active');
    }
  });
});

// ---- Scroll Reveal Animation ----
const revealElements = document.querySelectorAll('.card, .section-header, .hero-greeting, .hero-title, .hero-desc, .hero-social-row, .hero-bottom-row, .avatar-card');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ---- Language Bar Animation ----
const langObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fills = entry.target.querySelectorAll('.lang-fill');
      fills.forEach(fill => {
        const targetWidth = fill.style.width;
        fill.style.width = '0%';
        setTimeout(() => { fill.style.width = targetWidth; }, 300);
      });
      langObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const langCard = document.querySelector('.languages-card');
if (langCard) langObserver.observe(langCard);

// ---- Navbar scroll effect ----
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    // Keep it yellow, just add blur maybe?
    navbar.style.background = 'var(--yellow)';
    navbar.style.backdropFilter = 'blur(10px)';
  } else {
    navbar.style.background = 'var(--yellow)';
    navbar.style.backdropFilter = 'none';
  }
});

// ---- Contact form submission ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = '✅ Message Sent!';
    btn.style.background = '#00c853';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message ✉️';
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

// ---- Typing effect on hero subtitle ----
const highlightEl = document.querySelector('.highlight');
if (highlightEl) {
  const roles = [
    'Senior Software Engineer',
    'Full-Stack Developer',
    'Cloud Architect',
    'Open Source Builder'
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function typeRole() {
    const current = roles[roleIdx];
    if (deleting) {
      highlightEl.textContent = current.substring(0, charIdx--);
      if (charIdx < 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        charIdx = 0;
        setTimeout(typeRole, 400);
        return;
      }
    } else {
      highlightEl.textContent = current.substring(0, charIdx++);
      if (charIdx > current.length) {
        deleting = true;
        setTimeout(typeRole, 2000);
        return;
      }
    }
    setTimeout(typeRole, deleting ? 40 : 70);
  }
  typeRole();
}

// ---- Map pin hover tooltips ----
document.querySelectorAll('.map-pin').forEach(pin => {
  pin.addEventListener('mouseenter', () => {
    pin.style.transform = pin.style.transform
      ? pin.style.transform + ' scale(1.2)'
      : 'scale(1.2)';
  });
  pin.addEventListener('mouseleave', () => {
    pin.style.transform = '';
  });
});

// ---- Skill pill hover sound effect (visual only) ----
document.querySelectorAll('.skill-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    pill.style.background = '#FFD600';
    pill.style.border = '2px solid #111';
    setTimeout(() => {
      pill.style.background = '';
      pill.style.border = '';
    }, 400);
  });
});

// ---- Smooth scroll for all anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Active nav link style ----
const style = document.createElement('style');
style.textContent = `.nav-links a.nav-active { background: var(--yellow); border-color: var(--black); box-shadow: var(--shadow-sm); }`;
document.head.appendChild(style);

// ---- Cursor sparkle effect ----
document.addEventListener('mousemove', (e) => {
  if (Math.random() > 0.93) {
    const spark = document.createElement('div');
    spark.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 8px; height: 8px;
      background: #FFD600;
      border: 2px solid #111;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: sparkFade 0.6s ease forwards;
    `;
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
});

// Add spark keyframe
const sparkStyle = document.createElement('style');
sparkStyle.textContent = `
  @keyframes sparkFade {
    0% { transform: scale(1) translate(0, 0); opacity: 1; }
    100% { transform: scale(0.2) translate(${Math.random() > 0.5 ? '-' : ''}${Math.floor(Math.random() * 30) + 10}px, -${Math.floor(Math.random() * 30) + 10}px); opacity: 0; }
  }
`;
document.head.appendChild(sparkStyle);

console.log('%c MB Portfolio 🚀', 'font-size:20px; font-weight:bold; color:#FFD600; background:#111; padding:8px 16px; border-radius:4px;');
console.log('%c Built with Neo-Brutalism & ❤️', 'font-size:12px; color:#555;');
