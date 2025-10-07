// ================================
// GLOBAL INTERACTIONS - CROWSFIDDLED
// ================================

// Mobile menu toggle
const toggle = document.getElementById("mobile-toggle");
const nav = document.getElementById("nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.classList.toggle("active");
  });
}

// Dynamic copyright year
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// Scroll fade-in animation
const revealElements = document.querySelectorAll(".section, .card, .invest-card, .partner-card");
window.addEventListener("scroll", () => {
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
});

// Initial state
revealElements.forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(40px)";
  el.style.transition = "all 0.9s ease";
});
