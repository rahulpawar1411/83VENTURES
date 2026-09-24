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

  // 2. Mobile Slider Drawer Navigation Toggle & Overlay Handler
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    if (!navMenu) return;
    navMenu.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    if (mobileToggle) {
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    if (mobileToggle) {
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('menu-open');
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (mobileDrawerClose) {
      mobileDrawerClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
      });
    }

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when clicking ANY link or button inside the nav menu (including "Partner With Us")
    const allDrawerLinks = navMenu.querySelectorAll('a');
    allDrawerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        closeMenu();

        if (href && href.startsWith('#') && href.length > 1) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
            const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Touch Swipe-Up-to-Close Gesture for Top-to-Down Slider (Mobile Friendly)
    let touchStartX = 0;
    let touchStartY = 0;

    navMenu.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    navMenu.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = Math.abs(touchEndX - touchStartX);
      const diffY = touchEndY - touchStartY;

      // Swiped upwards by more than 40px
      if (diffY < -40 && diffX < 80) {
        closeMenu();
      }
    }, { passive: true });
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

  // 5. Hero Cursor Following "Investing in Better Tomorrows" Badge
  const heroSection = document.getElementById('home');
  const heroBadge = document.getElementById('heroFollowerBadge');

  if (heroSection && heroBadge) {
    let isHoveringHero = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let initialized = false;

    function isFollowerEnabled() {
      return window.innerWidth > 768;
    }

    function getRestingPosition() {
      const heroRect = heroSection.getBoundingClientRect();
      const badgeRect = heroBadge.getBoundingClientRect();
      const badgeWidth = badgeRect.width || 230;
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
      return {
        x: Math.max(20, heroRect.width - badgeWidth - 40),
        y: navHeight + 28
      };
    }

    function initPosition() {
      if (!isFollowerEnabled()) {
        initialized = false;
        return;
      }
      const restPos = getRestingPosition();
      currentX = restPos.x;
      currentY = restPos.y;
      targetX = restPos.x;
      targetY = restPos.y;
      heroBadge.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      initialized = true;
    }

    // Initialize position after DOM layout renders
    requestAnimationFrame(() => {
      initPosition();
    });

    function animateBadge() {
      if (isFollowerEnabled() && initialized) {
        const ease = isHoveringHero ? 0.12 : 0.08;
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;
        heroBadge.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }
      requestAnimationFrame(animateBadge);
    }
    requestAnimationFrame(animateBadge);

    heroSection.addEventListener('mousemove', (e) => {
      if (!isFollowerEnabled()) return;
      isHoveringHero = true;
      if (!initialized) initPosition();

      const heroRect = heroSection.getBoundingClientRect();
      const badgeRect = heroBadge.getBoundingClientRect();
      const badgeWidth = badgeRect.width || 230;
      const badgeHeight = badgeRect.height || 36;

      let desiredX = (e.clientX - heroRect.left) + 18;
      let desiredY = (e.clientY - heroRect.top) + 18;

      const maxX = heroRect.width - badgeWidth - 20;
      const maxY = heroRect.height - badgeHeight - 20;
      const minX = 20;
      const minY = 20;

      if (desiredX > maxX) {
        desiredX = (e.clientX - heroRect.left) - badgeWidth - 14;
      }
      if (desiredY > maxY) {
        desiredY = (e.clientY - heroRect.top) - badgeHeight - 14;
      }

      targetX = Math.max(minX, Math.min(desiredX, maxX));
      targetY = Math.max(minY, Math.min(desiredY, maxY));
    });

    heroSection.addEventListener('mouseenter', () => {
      if (!isFollowerEnabled()) return;
      isHoveringHero = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      if (!isFollowerEnabled()) return;
      isHoveringHero = false;
      const restPos = getRestingPosition();
      targetX = restPos.x;
      targetY = restPos.y;
    });

    window.addEventListener('resize', () => {
      if (isFollowerEnabled()) {
        if (!initialized) {
          initPosition();
        } else if (!isHoveringHero) {
          const restPos = getRestingPosition();
          targetX = restPos.x;
          targetY = restPos.y;
        }
      } else {
        initialized = false;
      }
    });
  }

  // 6. Scroll Reveal Observer for Sections & Cards After Hero
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }
});
