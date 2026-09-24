/* ==========================================================================
   Eighty Three Ventures Private Limited - Main Application Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Site Preloader — show on load + every menu / page change
  const preloader = document.getElementById('sitePreloader');
  const MIN_PRELOADER_MS = 1100;

  function showPageLoader() {
    if (!preloader) return;
    preloader.style.display = 'flex';
    preloader.classList.remove('fade-out');
    // Restart line animation
    const fill = preloader.querySelector('.preloader-line-fill');
    if (fill) {
      fill.style.animation = 'none';
      // force reflow
      void fill.offsetWidth;
      fill.style.animation = '';
    }
    document.body.classList.add('is-loading');
    document.body.classList.remove('page-loaded', 'menu-open');
    window.scrollTo(0, 0);
  }

  function hidePageLoader() {
    if (!preloader) {
      document.body.classList.remove('is-loading');
      document.body.classList.add('page-loaded');
      return;
    }
    preloader.classList.add('fade-out');
    document.body.classList.remove('is-loading');
    document.body.classList.add('page-loaded');
    setTimeout(() => {
      if (preloader.parentNode) preloader.style.display = 'none';
    }, 700);
  }

  if (preloader) {
    document.body.classList.add('is-loading');
    window.scrollTo(0, 0);
    const startTime = Date.now();

    function dismissPreloader() {
      const remaining = Math.max(0, MIN_PRELOADER_MS - (Date.now() - startTime));
      setTimeout(hidePageLoader, remaining);
    }

    if (document.readyState === 'complete') {
      dismissPreloader();
    } else {
      window.addEventListener('load', dismissPreloader);
      setTimeout(dismissPreloader, 2800);
    }
  } else {
    document.body.classList.remove('is-loading');
    document.body.classList.add('page-loaded');
  }

  // Show loader again when returning via browser back/forward cache
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && preloader) {
      showPageLoader();
      setTimeout(hidePageLoader, MIN_PRELOADER_MS);
    }
  });

  function currentPageFile() {
    return (window.location.pathname.split('/').pop() || 'index.html').toLowerCase() || 'index.html';
  }

  function resolveInternalNav(href) {
    if (!href) return null;
    const trimmed = href.trim();
    if (
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('tel:') ||
      trimmed.startsWith('javascript:') ||
      trimmed === '#'
    ) {
      return null;
    }
    // External absolute URLs
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const url = new URL(trimmed);
        if (url.origin !== window.location.origin) return null;
        return { type: 'page', href: trimmed };
      } catch {
        return null;
      }
    }

    // Same-page hash: #about, #portfolio
    if (trimmed.startsWith('#')) {
      return { type: 'hash', hash: trimmed };
    }

    // index.html#contact or about.html
    const hashIndex = trimmed.indexOf('#');
    const filePart = (hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed).split('/').pop().toLowerCase();
    const hashPart = hashIndex >= 0 ? trimmed.slice(hashIndex) : '';
    const current = currentPageFile();

    if (!filePart || filePart === current || (filePart === 'index.html' && (current === '' || current === 'index.html'))) {
      if (hashPart) return { type: 'hash', hash: hashPart };
      // Same page, no hash — still show loader briefly then stay
      return { type: 'reload', href: trimmed };
    }

    return { type: 'page', href: trimmed };
  }

  function goWithLoader(target) {
    showPageLoader();

    if (target.type === 'page' || target.type === 'reload') {
      setTimeout(() => {
        window.location.href = target.href;
      }, 280);
      return;
    }

    if (target.type === 'hash') {
      setTimeout(() => {
        hidePageLoader();
        const el = document.querySelector(target.hash);
        if (el) {
          const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
          const top = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
          if (history.pushState) {
            history.pushState(null, '', target.hash);
          }
        }
      }, MIN_PRELOADER_MS);
    }
  }

  // Intercept menu + internal site links for loading transition
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const href = link.getAttribute('href');
    const nav = resolveInternalNav(href);
    if (!nav) return;

    const inChrome = !!(
      link.closest('.header') ||
      link.closest('.footer') ||
      link.closest('.nav-menu') ||
      link.closest('.brand-logo') ||
      link.classList.contains('nav-link') ||
      link.classList.contains('mobile-drawer-partner-btn')
    );

    // Always loader when leaving to another HTML page; hash menus only from header/footer nav
    if (nav.type === 'hash' && !inChrome) return;
    if (nav.type === 'reload' && !inChrome) return;

    e.preventDefault();
    goWithLoader(nav);
  }, true);

  // 1. Header Scroll Effect & Active Nav Link Highlight (ScrollSpy)
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const pathFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  // ScrollSpy only on the landing page — never override Why Us / Careers / Profile active states
  const isHomePage = (pathFile === '' || pathFile === 'index.html' || !pathFile.includes('.html'))
    && !!document.getElementById('home');

  function updateActiveNav() {
    if (window.scrollY > 20) {
      if (header) header.classList.add('scrolled');
    } else {
      if (header) header.classList.remove('scrolled');
    }

    // ScrollSpy active indicator (home page only)
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
        const href = link.getAttribute('href') || '';
        const isMatch = href === `#${current}` || href === `index.html#${current}`;
        if (isMatch) {
          link.classList.add('active');
        } else {
          // Clear other actives so Why Us / Careers never double-underline with Home
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
