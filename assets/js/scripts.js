/* assets/js/scripts.js
   Robust global interactions: mobile nav, reveal, counters, subscribe placeholder
*/

(() => {
  // DOM helpers
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* ===== Mobile nav toggle ===== */
  const mobileToggle = $('#mobile-toggle');
  const nav = $('#nav');

  const openNav = () => {
    if (!mobileToggle || !nav) return;
    mobileToggle.classList.add('active');
    nav.classList.add('open');
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  };
  const closeNav = () => {
    if (!mobileToggle || !nav) return;
    mobileToggle.classList.remove('active');
    nav.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  };

  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.contains('open') ? closeNav() : openNav();
    });

    // Close nav on link click
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (link && window.innerWidth <= 980) {
        // close after slight delay to let anchor navigate
        setTimeout(closeNav, 160);
      }
    });

    // Close on outside click and ESC
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileToggle.contains(e.target) && nav.classList.contains('open')) {
        closeNav();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });
  }

  /* ===== Sticky header class on scroll ===== */
  const header = $('#site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 26) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  /* ===== Animated counters ===== */
  const statEls = $$('.stat-value');
  if ('IntersectionObserver' in window && statEls.length) {
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target') || el.textContent, 10) || 0;
        let start = 0, duration = 1200, startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          const prog = Math.min((ts - startTime) / duration, 1);
          el.textContent = Math.floor(prog * (target - start) + start);
          if (prog < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    statEls.forEach(e => statObserver.observe(e));
  } else {
    statEls.forEach(e => e.textContent = e.getAttribute('data-target') || e.textContent);
  }

  /* ===== Reveal on scroll (for .reveal elements) ===== */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(r => obs.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('visible'));
  }

  /* Ensure project figures have .reveal so observer picks them up */
  $$('.project').forEach(el => { if (!el.classList.contains('reveal')) el.classList.add('reveal'); });

  /* ===== Subscribe placeholder ===== */
  const subscribeForm = $('#subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (subscribeForm.querySelector('input[type="email"]') || {}).value || '';
      if (!email || !email.includes('@')) { alert('Please enter a valid email address'); return; }
      // TODO: Replace with real integration (SendGrid, Resend, etc.)
      alert('Thank you — subscription received: ' + email);
      subscribeForm.reset();
    });
  }

  /* ===== Cleanup on unload (revoke blob URLs if any) ===== */
  window.addEventListener('unload', () => {
    const links = document.querySelectorAll('a[download]');
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('blob:')) URL.revokeObjectURL(href);
    });
  });
})();

/* ======================================================
   Crowsfiddled — Hero Parallax Scroll Controller
   ====================================================== */
(() => {
  const heroVideo = document.querySelector('.hero-video');
  const heroOverlay = document.querySelector('.hero-overlay');
  let lastScrollY = 0;

  function updateParallax() {
    const scrollY = window.scrollY || window.pageYOffset;
    const translateVideo = Math.min(scrollY * 0.08, 50); // smooth offset
    const translateOverlay = Math.min(scrollY * 0.04, 25);

    if (heroVideo) heroVideo.style.transform = `translateY(${translateVideo}px) scale(1.35)`;
    if (heroOverlay) heroOverlay.style.transform = `translateY(${translateOverlay}px) scale(1.2)`;

    // toggle subtle blur as user scrolls down
    if (scrollY > 50) document.body.classList.add('scrolled');
    else document.body.classList.remove('scrolled');

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', () => requestAnimationFrame(updateParallax), { passive: true });
})();
