/* ==========================================================================
   Eighty Three Ventures Private Limited - Main Application Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Site Preloader Dismiss Handler
  const preloader = document.getElementById('sitePreloader');
  if (preloader) {
    document.body.classList.add('is-loading');
    window.scrollTo(0, 0);
    const startTime = Date.now();
    const minDisplayTime = 1300; // Let the luxury animation complete smoothly

    function dismissPreloader() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        preloader.classList.add('fade-out');
        document.body.classList.remove('is-loading');
        document.body.classList.add('page-loaded');
        setTimeout(() => {
          if (preloader.parentNode) {
            preloader.style.display = 'none';
          }
        }, 700);
      }, remaining);
    }

    if (document.readyState === 'complete') {
      dismissPreloader();
    } else {
      window.addEventListener('load', dismissPreloader);
      // Fallback timeout
      setTimeout(dismissPreloader, 2800);
    }
  } else {
    document.body.classList.remove('is-loading');
    document.body.classList.add('page-loaded');
  }

  // 1. Header Scroll Effect & Active Nav Link Highlight (ScrollSpy)
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const isHomePage = sections.length > 0;

  function updateActiveNav() {
    if (window.scrollY > 20) {
      if (header) header.classList.add('scrolled');
    } else {
      if (header) header.classList.remove('scrolled');
    }

    // ScrollSpy active indicator (only on pages where sections exist)
    if (isHomePage) {
      let current = 'home';
      const scrollPos = window.scrollY + 180;

      sections.forEach(section => {
        const top = section.offsetTop;
        if (scrollPos >= top) {
          current = section.getAttribute('id');
        }
      });

      // Bottom of page activates Contact
      if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50)) {
        current = 'contact';
      }

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${current}` || href === `index.html#${current}`) {
          link.classList.add('active');
        } else if (href && (href.startsWith('#') || href.startsWith('index.html#'))) {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // 2. Mobile Menu Navigation Toggle & Overlay Handler
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    if (!navMenu) return;
    navMenu.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    if (mobileToggle) {
      mobileToggle.innerHTML = '✕';
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    if (mobileToggle) {
      mobileToggle.innerHTML = '☰';
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('menu-open');
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // 3. Stats Counter Animation on Scroll
  const statNumbers = document.querySelectorAll('.stat-number');
  let animatedStats = false;

  function animateCounters() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target') || '0', 10);
      const isPercentage = stat.innerText.includes('%');
      const prefix = stat.innerText.startsWith('+') ? '+' : '';
      let count = 0;
      const speed = target / 50;

      const updateCount = () => {
        count += speed;
        if (count < target) {
          stat.innerText = `${prefix}${Math.ceil(count)}${isPercentage ? '%' : '+'}`;
          setTimeout(updateCount, 30);
        } else {
          stat.innerText = `${prefix}${target}${isPercentage ? '%' : '+'}`;
        }
      };

      updateCount();
    });
  }

  // Intersection Observer for Counters
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animatedStats) {
        animatedStats = true;
        animateCounters();
      }
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

  // 4. Pitch Form Submission & Validation Handler
  const pitchForm = document.getElementById('pitchForm');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  if (pitchForm) {
    pitchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();

      if (!name || !email) {
        showToast('Please fill in your name and email address.');
        return;
      }

      // Simulate successful submission
      const submitBtn = pitchForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting Deck...';

      setTimeout(() => {
        pitchForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showToast('Thank you! Your pitch submission has been received by 83 Ventures.');
      }, 1500);
    });
  }

  function showToast(message) {
    if (!toastNotification) return;
    if (toastMessage) toastMessage.innerText = message;
    
    toastNotification.classList.add('active');
    setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 4500);
  }

  // 5. Desktop-Only Cursor Following "Investing in Better Tomorrows" (Hero Section Only)
  const heroSection = document.getElementById('home');
  const heroBadge = document.getElementById('heroFollowerBadge');

  if (heroSection && heroBadge) {
    let isHoveringHero = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let initialized = false;

    function isDesktop() {
      return window.innerWidth > 1024 && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    function getRestingPosition() {
      const heroRect = heroSection.getBoundingClientRect();
      const badgeRect = heroBadge.getBoundingClientRect();
      return {
        x: Math.max(20, heroRect.width - (badgeRect.width || 230) - 40),
        y: 85
      };
    }

    function initPosition() {
      if (!isDesktop()) {
        heroBadge.style.transform = '';
        heroBadge.style.left = '';
        heroBadge.style.top = '';
        heroBadge.style.right = '';
        initialized = false;
        return;
      }
      const restPos = getRestingPosition();
      currentX = restPos.x;
      currentY = restPos.y;
      targetX = restPos.x;
      targetY = restPos.y;
      heroBadge.style.left = '0px';
      heroBadge.style.top = '0px';
      heroBadge.style.right = 'auto';
      heroBadge.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      initialized = true;
    }

    requestAnimationFrame(initPosition);

    function animateBadge() {
      if (isDesktop() && initialized) {
        const ease = isHoveringHero ? 0.12 : 0.07;
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;
        heroBadge.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }
      requestAnimationFrame(animateBadge);
    }
    requestAnimationFrame(animateBadge);

    heroSection.addEventListener('mousemove', (e) => {
      if (!isDesktop()) return;
      isHoveringHero = true;
      const heroRect = heroSection.getBoundingClientRect();
      const badgeRect = heroBadge.getBoundingClientRect();
      const badgeWidth = badgeRect.width || 230;
      const badgeHeight = badgeRect.height || 36;

      let desiredX = (e.clientX - heroRect.left) + 20;
      let desiredY = (e.clientY - heroRect.top) + 20;

      const maxX = heroRect.width - badgeWidth - 20;
      const maxY = heroRect.height - badgeHeight - 20;
      const minX = 20;
      const minY = 20;

      if (desiredX > maxX) {
        desiredX = (e.clientX - heroRect.left) - badgeWidth - 16;
      }
      if (desiredY > maxY) {
        desiredY = (e.clientY - heroRect.top) - badgeHeight - 16;
      }

      targetX = Math.max(minX, Math.min(desiredX, maxX));
      targetY = Math.max(minY, Math.min(desiredY, maxY));
    });

    heroSection.addEventListener('mouseenter', () => {
      if (!isDesktop()) return;
      isHoveringHero = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      if (!isDesktop()) return;
      isHoveringHero = false;
      const restPos = getRestingPosition();
      targetX = restPos.x;
      targetY = restPos.y;
    });

    window.addEventListener('resize', () => {
      if (!isDesktop()) {
        heroBadge.style.left = '';
        heroBadge.style.top = '';
        heroBadge.style.right = '';
        heroBadge.style.transform = '';
        initialized = false;
      } else if (!initialized) {
        initPosition();
      }
    });
  }
});
