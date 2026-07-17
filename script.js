const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
// Sticky header state on scroll
// ============================================
const header = document.querySelector('.site-header');
if (header) {
  const setHeaderState = () => header.classList.toggle('scrolled', window.scrollY > 12);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
}

// ============================================
// Reveal-on-scroll (supports [data-reveal] and legacy .reveal/.reveal-stagger)
// ============================================
const revealTargets = document.querySelectorAll('[data-reveal], .reveal, .reveal-stagger');

if (prefersReduced) {
  revealTargets.forEach(el => el.classList.add('in'));
} else {
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach(el => revealIO.observe(el));
}

// ============================================
// Animated stat counters
// ============================================
const counters = document.querySelectorAll('[data-count]');
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
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
// Hero parallax (subtle, disabled for reduced motion)
// ============================================
if (!prefersReduced) {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    let ticking = false;
    function updateParallax() {
      const y = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const rect = el.closest('section')?.getBoundingClientRect();
        if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }
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
// Smooth-animated FAQ accordion (single-open, accessible <details>)
// ============================================
document.querySelectorAll('.faq-list').forEach(list => {
  const items = list.querySelectorAll('.faq-item');
  items.forEach(item => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.faq-body');
    if (!summary || !body) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.hasAttribute('open');

      if (isOpen) {
        closeItem(item, body);
      } else {
        items.forEach(other => {
          if (other !== item && other.hasAttribute('open')) {
            closeItem(other, other.querySelector('.faq-body'));
          }
        });
        openItem(item, body);
      }
    });
  });

  function openItem(item, body) {
    item.setAttribute('open', '');
    const target = body.scrollHeight;
    body.style.height = '0px';
    requestAnimationFrame(() => {
      body.style.height = target + 'px';
    });
    body.addEventListener('transitionend', function onEnd() {
      body.style.height = 'auto';
      body.removeEventListener('transitionend', onEnd);
    }, { once: true });
  }

  function closeItem(item, body) {
    const current = body.scrollHeight;
    body.style.height = current + 'px';
    requestAnimationFrame(() => {
      body.style.height = '0px';
    });
    body.addEventListener('transitionend', function onEnd() {
      item.removeAttribute('open');
      body.removeEventListener('transitionend', onEnd);
    }, { once: true });
  }
});

// ============================================
// Scroll-triggered video (plays while in view, pauses otherwise)
// ============================================
document.querySelectorAll('.video-frame video').forEach(video => {
  if (prefersReduced) return;
  const frame = video.closest('.video-frame');
  const vIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
        frame.classList.add('playing');
      } else {
        video.pause();
        frame.classList.remove('playing');
      }
    });
  }, { threshold: 0.5 });
  vIo.observe(video);
});
