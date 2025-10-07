/* main.js — interactivity for Crowsfiddled home page */

/* Utils */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* Navbar scroll behavior */
const header = $('#site-header');
const navLinks = $$('.nav-link');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled');

  // active nav link highlight based on scroll
  const fromTop = window.scrollY + 80;
  navLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    if (section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

/* Mobile nav toggle */
const mobileToggle = $('#mobile-toggle');
const nav = $('#nav');
mobileToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  mobileToggle.classList.toggle('open');
});

/* Smooth scroll for anchor links */
document.addEventListener('click', (e) => {
  const el = e.target.closest('a[href^="#"]');
  if (!el) return;
  e.preventDefault();
  const target = document.querySelector(el.getAttribute('href'));
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* Animated counters (intersection observer) */
const counters = document.querySelectorAll('.stat-value');
if (counters.length) {
  const runCounter = (el, target) => {
    const duration = 1400;
    const start = 0;
    const range = target - start;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * range + start);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count') || el.textContent || 0, 10);
        runCounter(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

/* Subscribe (placeholder) */
const subscribeForm = document.getElementById('subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('subscribe-email').value.trim();
    if (!email) { alert('Please enter an email'); return; }
    // Replace with your email API integration (EmailJS, Resend, Mailgun, etc.)
    alert('Thanks — subscription received. We will send the investment bulletin to: ' + email);
    subscribeForm.reset();
  });
}

/* Footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Accessibility: close nav when click outside (mobile) */
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target) && !mobileToggle.contains(e.target) && nav.classList.contains('open')) {
    nav.classList.remove('open');
    mobileToggle.classList.remove('open');
  }
});
