// ============================================
// Mobile nav toggle
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.textContent = open ? '✕' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.textContent = '☰';
    });
  });
}

// ============================================
// Scroll reveal
// ============================================
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  revealEls.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));
}

// ============================================
// Animated stat counters
// ============================================
const counters = document.querySelectorAll('[data-count]');
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  if (prefersReduced) {
    el.textContent = target + suffix;
  } else {
    requestAnimationFrame(tick);
  }
}
if (counters.length) {
  const cIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        cIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => cIo.observe(el));
}

// ============================================
// Simple carousel
// ============================================
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = track.children;
  const dotsWrap = carousel.parentElement.querySelector('.carousel-dots');
  let index = 0;
  let timer;

  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    Array.from(slides).forEach((_, i) => {
      const b = document.createElement('button');
      if (i === 0) b.classList.add('active');
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((d, di) => d.classList.toggle('active', di === index));
    }
  }

  function autoplay() {
    timer = setInterval(() => goTo(index + 1), 4200);
  }
  if (!prefersReduced && slides.length > 1) autoplay();

  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => { if (!prefersReduced) autoplay(); });
});

// ============================================
// Header shadow on scroll
// ============================================
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 12 ? '0 6px 20px rgba(0,0,0,0.25)' : 'none';
  }, { passive: true });
}
