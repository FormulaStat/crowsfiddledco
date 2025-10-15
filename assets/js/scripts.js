/* ==========================================================================
   Crowsfiddled — Global JavaScript
   Author: Kasky | Version: Final Production
   Purpose: Navigation, Scroll Animations, Counters, Parallax, UI
   ========================================================================== */

(() => {
  /* Utility Shortcuts */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------------------------
     1. MOBILE NAVIGATION
     --------------------------- */
  const mobileToggle = $('#mobile-toggle');
  const nav = $('#nav');

  if (mobileToggle && nav) {
    const openNav = () => {
      mobileToggle.classList.add('active');
      nav.classList.add('open');
      mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeNav = () => {
      mobileToggle.classList.remove('active');
      nav.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    mobileToggle.addEventListener('click', e => {
      e.stopPropagation();
      nav.classList.contains('open') ? closeNav() : openNav();
    });

    // Close menu on outside click or ESC key
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !mobileToggle.contains(e.target) && nav.classList.contains('open')) {
        closeNav();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });

    // Auto-close when clicking a link on mobile
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 980) closeNav();
      });
    });
  }

  /* ---------------------------
     2. STICKY HEADER SHADOW
     --------------------------- */
  const header = $('#site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    window.scrollY > 26 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
  });

  /* ---------------------------
     3. STAT COUNTERS (Hero)
     --------------------------- */
  const statEls = $$('.stat-value');
  if ('IntersectionObserver' in window && statEls.length) {
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target || 0);
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();

        function animateCounter(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          el.textContent = Math.floor(progress * (target - start) + start);
          if (progress < 1) requestAnimationFrame(animateCounter);
        }
        requestAnimationFrame(animateCounter);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.6 });
    statEls.forEach(el => statObserver.observe(el));
  }

  /* ---------------------------
     4. REVEAL ON SCROLL
     --------------------------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------------------------
     5. HERO PARALLAX EFFECT
     --------------------------- */
  const heroVideo = $('.hero-video');
  const heroOverlay = $('.hero-overlay');

  let ticking = false;
  function handleParallax() {
    const scrollY = window.scrollY;
    if (heroVideo) heroVideo.style.transform = `translateY(${scrollY * 0.08}px) scale(1.35)`;
    if (heroOverlay) heroOverlay.style.transform = `translateY(${scrollY * 0.04}px) scale(1.2)`;
    if (scrollY > 50) document.body.classList.add('scrolled');
    else document.body.classList.remove('scrolled');
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleParallax);
      ticking = true;
    }
  }, { passive: true });

  /* ---------------------------
     6. SUBSCRIBE FORM (Mock)
     --------------------------- */
  const subscribeForm = $('#subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailField = $('#subscribe-email');
      const email = emailField.value.trim();
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      alert(`Thank you for subscribing, ${email}!`);
      subscribeForm.reset();
    });
  }

  /* ---------------------------
     7. FOOTER YEAR AUTO-UPDATE
     --------------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------
     8. ACCESSIBILITY: Focus Skip-Link
     --------------------------- */
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('focus', () => skipLink.style.position = 'static');
    skipLink.addEventListener('blur', () => skipLink.style.position = 'absolute');
  }

  /* ---------------------------
     9. PERFORMANCE CLEANUP
     --------------------------- */
  window.addEventListener('unload', () => {
    document.querySelectorAll('a[download]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('blob:')) URL.revokeObjectURL(href);
    });
  });
})();
