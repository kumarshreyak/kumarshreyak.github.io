/**
 * Shreyak Kumar — Personal Website
 * Vanilla JS: theme toggle, scroll reveals, active nav tracking, mobile menu
 */

(function () {
  'use strict';

  /* ─── Theme Toggle ───────────────────────────────────────── */
  const THEME_KEY    = 'sk-theme';
  const toggleBtns   = document.querySelectorAll('.theme-toggle');
  const metaThemeEl  = document.getElementById('metaThemeColor');

  /**
   * Apply a theme ('dark' | 'light') to the root element, persist to
   * localStorage, and update the meta theme-color for mobile browsers.
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    if (metaThemeEl) {
      metaThemeEl.content = theme === 'light' ? '#F8F7F4' : '#0A0A0F';
    }
    // Sync aria-label on all toggle buttons
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Apply saved theme on load (FOUC guard in <head> handles the very first paint;
  // this call ensures aria-labels and meta are in sync once the DOM is ready).
  (function initTheme() {
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved === 'light' ? 'light' : 'dark');
  })();

  toggleBtns.forEach(btn => btn.addEventListener('click', toggleTheme));

  /* ─── Mobile Nav ─────────────────────────────────────────── */
  const hamburgerBtn      = document.getElementById('hamburgerBtn');
  const mobileNavOverlay  = document.getElementById('mobileNavOverlay');
  const mobileNavClose    = document.getElementById('mobileNavClose');
  const mobileNavLinks    = document.querySelectorAll('.mobile-nav-link');

  function openMobileNav() {
    mobileNavOverlay.classList.add('open');
    mobileNavOverlay.setAttribute('aria-hidden', 'false');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNavOverlay.classList.remove('open');
    mobileNavOverlay.setAttribute('aria-hidden', 'true');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileNavOverlay.classList.contains('open');
      isOpen ? closeMobileNav() : openMobileNav();
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on backdrop click
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', (e) => {
      if (e.target === mobileNavOverlay) closeMobileNav();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ─── Scroll Reveal ──────────────────────────────────────── */
  const revealItems = document.querySelectorAll('.reveal-item');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger sibling items in the same parent
            const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal-item:not(.revealed)'));
            const siblingIndex = siblings.indexOf(entry.target);
            const delay = Math.min(siblingIndex * 80, 400);

            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);

            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    // Fallback: reveal all immediately
    revealItems.forEach(item => item.classList.add('revealed'));
  }

  /* ─── Active Nav Tracking ────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');

  function getActiveSection() {
    const scrollY   = window.scrollY;
    const threshold = window.innerHeight * 0.4;

    let active = null;
    sections.forEach(section => {
      const top = section.offsetTop - threshold;
      if (scrollY >= top) active = section.id;
    });
    return active;
  }

  function updateActiveNav() {
    const activeSectionId = getActiveSection();
    navLinks.forEach(link => {
      const section = link.dataset.section;
      if (section === activeSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Debounced scroll handler
  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    if (scrollTimer) return;
    scrollTimer = requestAnimationFrame(() => {
      updateActiveNav();
      scrollTimer = null;
    });
  }, { passive: true });

  updateActiveNav(); // run once on load

  /* ─── Smooth anchor scroll (for older browsers) ──────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── Hero entrance animation ────────────────────────────── */
  // Stagger the sidebar hero items on first load
  const heroItems = document.querySelectorAll('.hero-block .mono-label, .hero-block .site-name, .hero-block .site-role, .hero-block .site-tagline, .hero-block .hero-ctas, .desktop-nav, .social-links');

  heroItems.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 500ms cubic-bezier(0,0,0.2,1) ${i * 80 + 100}ms, transform 500ms cubic-bezier(0,0,0.2,1) ${i * 80 + 100}ms`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });

  /* ─── Tag hover interaction ──────────────────────────────── */
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.color = 'var(--accent-primary)';
      tag.style.borderColor = 'rgba(124, 106, 247, 0.4)';
      tag.style.background = 'var(--accent-subtle)';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.color = '';
      tag.style.borderColor = '';
      tag.style.background = '';
    });
  });

  /* ─── Year in footer ─────────────────────────────────────── */
  const yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(el => { el.textContent = new Date().getFullYear(); });

})();
