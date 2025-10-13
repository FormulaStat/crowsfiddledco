/* scripts.js — Crowsfiddled: global interactions + Investments page logic */

/* -------------------------
   Basic DOM helpers
   ------------------------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ---------- MOBILE NAV TOGGLE — robust version ---------- */
(function () {
  const mobileToggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('nav');
  const navList = nav ? nav.querySelector('.nav-list') : null;

  if (!mobileToggle || !nav) return;

  function openNav() {
    mobileToggle.classList.add('active');
    nav.classList.add('open');
    mobileToggle.setAttribute('aria-expanded', 'true');
    // prevent background scroll when menu open
    document.documentElement.style.overflow = 'hidden';
  }

  function closeNav() {
    mobileToggle.classList.remove('active');
    nav.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  }

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.contains('open');
    if (isOpen) closeNav(); else openNav();
  });

  // close when any navigation link is clicked (mobile)
  if (navList) {
    navList.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.classList && target.classList.contains('nav-link')) {
        // small delay to allow link activation on single-page anchors
        setTimeout(closeNav, 160);
      }
    });
  }

  // close on outside click / tap
  document.addEventListener('click', (e) => {
    // if click is inside nav or toggle, ignore
    if (nav.contains(e.target) || mobileToggle.contains(e.target)) return;
    if (nav.classList.contains('open')) closeNav();
  });

  // close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
  });

})();

/* -------------------------
   Animated counters
   ------------------------- */
const statEls = document.querySelectorAll('.stat-value');
function animateCount(el, target) {
  let start = 0;
  const duration = 1400;
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(progress * (target - start) + start);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window && statEls.length) {
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target') || el.textContent, 10) || 0;
        animateCount(el, target);
        statObserver.unobserve(el);
      }
    });
  }, {threshold: 0.5});
  statEls.forEach(e => statObserver.observe(e));
} else {
  statEls.forEach(e => e.textContent = e.getAttribute('data-target') || e.textContent);
}

/* -------------------------
   Reveal on scroll
   ------------------------- */
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
} else {
  reveals.forEach(r => r.classList.add('visible'));
}

/* -------------------------
   Subscribe (placeholder)
   ------------------------- */
const subscribeForm = $('#subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#subscribe-email') ? $('#subscribe-email').value.trim() : null;
    if (!email) { alert('Please enter an email address'); return; }
    alert('Thanks — subscription received: ' + email);
    subscribeForm.reset();
  });
}

/* -------------------------
   Footer Year
   ------------------------- */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* -------------------------
   ROI Calculator Logic
   ------------------------- */
const segments = {
  land: { roiMin: 0.18, roiMax: 0.30, duration: '6–12 months' },
  residential: { roiMin: 0.22, roiMax: 0.35, duration: '12–24 months' },
  commercial: { roiMin: 0.12, roiMax: 0.20, duration: 'Ongoing' },
  shortlet: { roiMin: 0.20, roiMax: 0.40, duration: 'Ongoing' },
  institutional: { roiMin: 0.00, roiMax: 0.00, duration: 'Project-based' } // Negotiated
};

// Simple currency rates (static). Replace with API if required.
const currencyRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79
};

function formatMoney(amount, currency = 'USD') {
  const locales = { USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB' };
  const symbol = { USD: 'USD', EUR: 'EUR', GBP: 'GBP' }[currency] || currency;
  return new Intl.NumberFormat(locales[currency] || 'en-US', { style: 'currency', currency }).format(amount);
}

function calculateROI(amountUSD, segmentKey) {
  const seg = segments[segmentKey];
  if (!seg) return null;
  if (segmentKey === 'institutional') {
    return {
      roiMinPercent: null,
      roiMaxPercent: null,
      profitMin: null,
      profitMax: null,
      duration: seg.duration,
      totalMin: null,
      totalMax: null
    };
  }
  const profitMin = amountUSD * seg.roiMin;
  const profitMax = amountUSD * seg.roiMax;
  return {
    roiMinPercent: Math.round(seg.roiMin * 100),
    roiMaxPercent: Math.round(seg.roiMax * 100),
    profitMin,
    profitMax,
    duration: seg.duration,
    totalMin: amountUSD + profitMin,
    totalMax: amountUSD + profitMax
  };
}

/* ROI form elements */
const form = $('#roi-form');
const amountInput = $('#inv-amount');
const segmentSelect = $('#inv-segment');
const currencySelect = $('#currency-select');
const calcBtn = $('#calc-btn');
const resetBtn = $('#reset-btn');

const resultSegment = $('#result-segment');
const resultRoi = $('#result-roi');
const resultProfit = $('#result-profit');
const resultDuration = $('#result-duration');
const resultTotal = $('#result-total');
const downloadReport = $('#download-report');

function renderResults(amount, segmentKey, currency) {
  const data = calculateROI(amount, segmentKey);
  // currency conversion
  const rate = currencyRates[currency] || 1;
  if (!data) {
    resultSegment.textContent = 'Segment: Institutional / Negotiated';
    resultRoi.textContent = 'ROI: Negotiated per project';
    resultProfit.textContent = 'Projected Profit: Negotiated';
    resultDuration.textContent = 'Duration: Project-based';
    resultTotal.textContent = '—';
    downloadReport.setAttribute('href', '#');
    downloadReport.setAttribute('download', '');
    return;
  }

  const profitMinC = data.profitMin * rate;
  const profitMaxC = data.profitMax * rate;
  const totalMinC = data.totalMin * rate;
  const totalMaxC = data.totalMax * rate;

  resultSegment.textContent = 'Segment: ' + (segmentSelect.options[segmentSelect.selectedIndex].text || segmentKey);
  resultRoi.textContent = `ROI: ${data.roiMinPercent}% — ${data.roiMaxPercent}%`;
  resultProfit.textContent = `Projected Profit: ${formatMoney(profitMinC, currency)} — ${formatMoney(profitMaxC, currency)}`;
  resultDuration.textContent = `Duration: ${data.duration}`;
  resultTotal.textContent = `${formatMoney(totalMinC, currency)} — ${formatMoney(totalMaxC, currency)}`;

  // Create a simple text mini-report for download
  const reportLines = [
    `Crowsfiddled — ROI Mini-Report`,
    `Date: ${new Date().toLocaleString()}`,
    `Segment: ${segmentSelect.options[segmentSelect.selectedIndex].text}`,
    `Investment Amount: ${formatMoney(amount * rate, currency)}`,
    `Projected ROI: ${data.roiMinPercent}% — ${data.roiMaxPercent}%`,
    `Projected Profit: ${formatMoney(profitMinC, currency)} — ${formatMoney(profitMaxC, currency)}`,
    `Projected Total (Principal + Profit): ${formatMoney(totalMinC, currency)} — ${formatMoney(totalMaxC, currency)}`,
    `Estimated Duration: ${data.duration}`,
    '',
    `Disclaimer: This is an indicative projection and not an offer. All investments are subject to due diligence and legal documentation.`
  ];
  const blob = new Blob([reportLines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  downloadReport.setAttribute('href', url);
  downloadReport.setAttribute('download', `Crowsfiddled_ROI_${segmentKey}_${Date.now()}.txt`);
}

/* Attach events */
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const amountUSD = parseFloat(amountInput.value) || 0;
    const segmentKey = segmentSelect.value;
    const currency = currencySelect.value || 'USD';
    if (amountUSD < 3000) { alert('Minimum investment for our offerings starts at USD $3,000.'); return; }
    renderResults(amountUSD, segmentKey, currency);
    // reveal results if not visible
    const resultsEl = document.querySelector('.roi-results');
    if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    amountInput.value = 3000;
    segmentSelect.value = 'land';
    currencySelect.value = 'USD';
    resultSegment.textContent = 'Segment: —';
    resultRoi.textContent = 'ROI: —';
    resultProfit.textContent = 'Projected Profit: —';
    resultDuration.textContent = 'Duration: —';
    resultTotal.textContent = '—';
    downloadReport.setAttribute('href', '#');
    downloadReport.setAttribute('download', '');
  });
}

/* Currency selector live preview: update display labels (optional) */
if (currencySelect) {
  currencySelect.addEventListener('change', () => {
    // If results already present, re-render to reflect rate
    const amountUSD = parseFloat(amountInput.value) || 0;
    const segmentKey = segmentSelect.value;
    const currency = currencySelect.value || 'USD';
    if (resultTotal && resultTotal.textContent.trim() !== '—') {
      renderResults(amountUSD, segmentKey, currency);
    }
  });
}

/* -------------------------
   Clean up object URLs on page unload
   ------------------------- */
window.addEventListener('unload', () => {
  const links = document.querySelectorAll('a[download]');
  links.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('blob:')) {
      URL.revokeObjectURL(href);
    }
  });
});

/* -------------------------
   Accessibility: close nav on outside click
   ------------------------- */
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target) && !mobileToggle.contains(e.target) && nav.classList.contains('open')) {
    nav.classList.remove('open');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }
});
