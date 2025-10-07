/* scripts.js — Crowsfiddled: interactions */

/* Elements */
const header = document.getElementById('site-header');
const mobileToggle = document.getElementById('mobile-toggle');
const nav = document.getElementById('nav');
const yearEl = document.getElementById('year');
const subscribeForm = document.getElementById('subscribe-form');

/* Mobile nav toggle */
if (mobileToggle && nav) {
  mobileToggle.addEventListener('click', () => {
    const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    mobileToggle.classList.toggle('active');
  });
}

/* Sticky header change on scroll */
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) header.classList.add('scrolled'); else header.classList.remove('scrolled');
});

/* Animated counters */
function animateCount(el, target) {
  let start = 0;
  const duration = 1400;
  const step = (timestamp, startTime = null) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(progress * (target - start) + start);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame((t) => step(t, startTime));
  };
  requestAnimationFrame(step);
}

const statEls = document.querySelectorAll('.stat-value');
if ('IntersectionObserver' in window && statEls.length) {
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target') || el.textContent, 10);
        animateCount(el, target);
        statObserver.unobserve(el);
      }
    });
  }, {threshold: 0.5});
  statEls.forEach(e => statObserver.observe(e));
} else { /* fallback */ statEls.forEach(e => e.textContent = e.getAttribute('data-target')); }

/* Scroll reveal */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});
  reveals.forEach(r => obs.observe(r));
} else { reveals.forEach(r => r.classList.add('visible')); }

/* Subscribe form placeholder */
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('subscribe-email').value.trim();
    if (!email) { alert('Enter a valid email'); return; }
    // Integrate real email API here (Resend/Mailgun/SendGrid).
    alert('Thanks — subscription received: ' + email);
    subscribeForm.reset();
  });
}

/* Footer year */
if (yearEl) yearEl.textContent = new Date().getFullYear();
