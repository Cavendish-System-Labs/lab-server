/* ====================================================
   FINSKY LAB — script.js
   Pure Vanilla JavaScript — No dependencies
   ====================================================
   TABLE OF CONTENTS:
   1.  Live Clock
   2.  Mobile Navigation Toggle
   3.  Smooth Active Nav Link Highlighting
   4.  Recon Table Search / Filter
   5.  Hero Stats Counter Animation
   6.  Scroll-triggered Card Entrance
   7.  Footer: Current Year & Uptime Display
   8.  Init
==================================================== */

'use strict';

/* ====================================================
   1. LIVE CLOCK
   Updates the HH:MM:SS clock in the header status bar
==================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }

  updateClock(); // Run immediately so there's no 1s blank gap
  setInterval(updateClock, 1000);
}


/* ====================================================
   2. MOBILE NAVIGATION TOGGLE
   Hamburger menu button shows/hides the nav list
==================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navList   = document.querySelector('.nav-list');
  if (!toggleBtn || !navList) return;

  toggleBtn.addEventListener('click', function () {
    const isOpen = navList.classList.toggle('is-open');
    toggleBtn.classList.toggle('is-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is clicked (smooth UX on mobile)
  navList.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navList.classList.remove('is-open');
      toggleBtn.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav when clicking outside of it
  document.addEventListener('click', function (e) {
    if (!toggleBtn.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('is-open');
      toggleBtn.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ====================================================
   3. SMOOTH ACTIVE NAV LINK HIGHLIGHTING
   Adds 'is-active' class to nav link for the section
   currently in view, using IntersectionObserver.
==================================================== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10
  ) || 60;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            const isActive = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', isActive);
            // ===== OPTIONAL: Add CSS for .nav-link.is-active in style.css =====
          });
        }
      });
    },
    {
      rootMargin: `-${headerHeight + 20}px 0px -60% 0px`,
      threshold: 0
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
}


/* ====================================================
   4. RECON TABLE SEARCH / FILTER
   Filters table rows in real-time as the user types.
   Matches against all cell text content.
==================================================== */
function initReconSearch() {
  const searchInput = document.getElementById('recon-search');
  const tbody       = document.getElementById('recon-tbody');
  const rowCountEl  = document.getElementById('row-count');
  const emptyState  = document.getElementById('table-empty');

  if (!searchInput || !tbody) return;

  // Cache all rows once — avoids repeated DOM queries on every keystroke
  const allRows = Array.from(tbody.querySelectorAll('tr'));

  searchInput.addEventListener('input', function () {
    // ===== SEARCH LOGIC: Modify this if you want to restrict search to specific columns =====
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    allRows.forEach(function (row) {
      const rowText = row.textContent.toLowerCase();
      const isMatch = query === '' || rowText.includes(query);
      row.classList.toggle('is-hidden', !isMatch);
      if (isMatch) visibleCount++;
    });

    // Update the entry counter
    if (rowCountEl) {
      rowCountEl.textContent = visibleCount;
    }

    // Show/hide empty state message
    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  });

  // Allow clearing with Escape key
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
      searchInput.blur();
    }
  });
}


/* ====================================================
   5. HERO STATS COUNTER ANIMATION
   Animates numbers from 0 to their target value on
   first scroll into view. Targets [data-target] spans.
==================================================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  // ===== COUNTER CONFIG: Adjust duration and easing here =====
  const DURATION = 1200; // milliseconds

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const start    = performance.now();

    function frame(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const current  = Math.floor(easeOutQuart(progress) * target);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toLocaleString(); // ensure exact end value
      }
    }

    requestAnimationFrame(frame);
  }

  // Trigger on first intersection only
  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(function (el) {
    observer.observe(el);
  });
}


/* ====================================================
   6. SCROLL-TRIGGERED CARD ENTRANCE
   Adds .is-visible class to cards when they enter
   the viewport, triggering the CSS card-appear animation
   with a small stagger delay per card.
==================================================== */
function initCardAnimations() {
  // ===== CARD SELECTORS: Add any new card types here =====
  const cards = document.querySelectorAll('.tool-card, .experiment-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          const card = entry.target;

          // Find the index among visible siblings for stagger
          const siblings = Array.from(
            card.parentElement.querySelectorAll(card.tagName + '.tool-card, ' + card.tagName + '.experiment-card')
          );
          const index = siblings.indexOf(card);

          // ===== STAGGER CONFIG: Change 80 to adjust delay between cards =====
          card.style.animationDelay = (index * 80) + 'ms';
          card.classList.add('is-visible');
          obs.unobserve(card);
        }
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach(function (card) {
    observer.observe(card);
  });
}


/* ====================================================
   7. FOOTER: CURRENT YEAR & UPTIME DISPLAY
   Auto-updates the copyright year and shows a
   simulated uptime since a hardcoded start date.
==================================================== */
function initFooter() {
  // Update copyright year automatically
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Simulated uptime display in footer terminal line
  const uptimeEl = document.getElementById('uptime-display');
  if (!uptimeEl) return;

  // ===== UPTIME START DATE: Change this to your server's actual start date =====
  const SERVER_START = new Date('2024-11-01T00:00:00');

  function formatUptime() {
    const now     = new Date();
    const diffMs  = now - SERVER_START;
    const totalSec = Math.floor(diffMs / 1000);
    const days     = Math.floor(totalSec / 86400);
    const hours    = Math.floor((totalSec % 86400) / 3600);
    const minutes  = Math.floor((totalSec % 3600) / 60);
    const seconds  = totalSec % 60;

    return `uptime --since // ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  uptimeEl.textContent = formatUptime();
  setInterval(function () {
    uptimeEl.textContent = formatUptime();
  }, 1000);
}


/* ====================================================
   8. INIT
   Wait for DOM to be fully parsed, then run all modules.
==================================================== */
document.addEventListener('DOMContentLoaded', function () {
  initLiveClock();
  initMobileNav();
  initActiveNav();
  initReconSearch();
  initStatsCounter();
  initCardAnimations();
  initFooter();

  /* ===== ADD YOUR OWN INIT FUNCTIONS HERE ===== */
});
