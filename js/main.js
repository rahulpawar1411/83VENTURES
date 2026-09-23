/* ==========================================================================
   Eighty Three Ventures Private Limited - Main Application Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll Effect & Active Nav Link Highlight
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ScrollSpy active indicator
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

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
});
