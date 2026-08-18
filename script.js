const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsIO = 'IntersectionObserver' in window;

// ============================================
// Mobile nav toggle
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  const setNav = (open) => {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.textContent = open ? '✕' : '☰';
  };

  navToggle.addEventListener('click', () => setNav(!navLinks.classList.contains('open')));

  // Closing via a link used to reset the label but leave aria-expanded="true",
  // so screen readers kept announcing the menu as open.
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setNav(false);
      navToggle.focus();
    }
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
// Reveal-on-scroll
// ============================================
const revealTargets = document.querySelectorAll('[data-reveal], .reveal-stagger');

if (prefersReduced || !supportsIO) {
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
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  if (prefersReduced) {
    el.textContent = target + suffix;
  } else {
    requestAnimationFrame(tick);
  }
}
if (counters.length) {
  if (!supportsIO) {
    // Never leave a stat reading "0" just because the observer is unavailable.
    counters.forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  } else {
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
}

// ============================================
// Hero parallax (subtle, disabled for reduced motion)
// ============================================
if (!prefersReduced) {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    // Resolve the section and speed once instead of on every scroll frame.
    const layers = Array.from(parallaxEls).map(el => ({
      el,
      section: el.closest('section'),
      speed: parseFloat(el.dataset.parallax) || 0.15,
    }));
    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY;
      layers.forEach(({ el, section, speed }) => {
        const rect = section?.getBoundingClientRect();
        if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
      ticking = false;
    };
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
  if (!track) return;
  const slides = track.children;
  const dotsWrap = carousel.parentElement.querySelector('.carousel-dots');
  let index = 0;
  let timer = null;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((d, di) => d.classList.toggle('active', di === index));
    }
  }

  function stop() { clearInterval(timer); timer = null; }
  function play() {
    stop(); // never stack intervals
    // document.hidden covers loading straight into a background tab, where the
    // visibilitychange event never fires.
    if (!prefersReduced && !document.hidden && slides.length > 1) {
      timer = setInterval(() => goTo(index + 1), 4200);
    }
  }

  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    Array.from(slides).forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (i === 0) b.classList.add('active');
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      // A manual pick shouldn't be yanked away by autoplay a moment later.
      b.addEventListener('click', () => { goTo(i); play(); });
      dotsWrap.appendChild(b);
    });
  }

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', play);
  if (dotsWrap) {
    dotsWrap.addEventListener('focusin', stop);
    dotsWrap.addEventListener('focusout', play);
  }
  // A background tab shouldn't keep advancing slides.
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

  play();
});

// ============================================
// Smooth-animated FAQ accordion (single-open, accessible <details>)
// ============================================
document.querySelectorAll('.faq-list').forEach(list => {
  const items = Array.from(list.querySelectorAll('.faq-item'));

  // The [open] attribute is NOT the source of truth. It has to linger through
  // the collapse animation (<details> stops rendering its content the moment it
  // goes away), so reading it to decide what a click means made a click during a
  // close read as "close again" — the panel just stayed shut. Intent is tracked
  // separately and flips immediately.
  const openState = new WeakMap();
  const isOpen = (item) => openState.get(item) === true;

  // At most one pending settle per item, so an interrupted animation can't leave
  // a stale handler behind that later clobbers the state the user just chose.
  const pending = new WeakMap();

  function clearPending(item, body) {
    const p = pending.get(item);
    if (!p) return;
    body.removeEventListener('transitionend', p.handler);
    clearTimeout(p.timer);
    pending.delete(item);
  }

  // transitionend is the normal signal, but it never arrives if the transition
  // is skipped entirely — height unchanged, document hidden, motion reduced.
  // The timer guarantees the item still reaches a consistent resting state.
  function onSettle(item, body, done) {
    const finish = () => { clearPending(item, body); done(); };
    const handler = (e) => {
      if (e.target !== body || e.propertyName !== 'height') return;
      finish();
    };
    const timer = setTimeout(finish, 600);
    pending.set(item, { handler, timer });
    body.addEventListener('transitionend', handler);
  }

  function openItem(item, body) {
    // Mid-close? Start from wherever the height currently sits, not from 0.
    const from = item.hasAttribute('open') ? getComputedStyle(body).height : '0px';
    clearPending(item, body);
    openState.set(item, true);
    item.setAttribute('open', '');
    body.style.height = from;
    const target = body.scrollHeight;
    requestAnimationFrame(() => { body.style.height = target + 'px'; });
    onSettle(item, body, () => { if (isOpen(item)) body.style.height = 'auto'; });
  }

  function closeItem(item, body) {
    clearPending(item, body);
    openState.set(item, false);
    body.style.height = getComputedStyle(body).height; // resolve 'auto' to px
    void body.offsetHeight;                            // force reflow
    requestAnimationFrame(() => { body.style.height = '0px'; });
    onSettle(item, body, () => { if (!isOpen(item)) item.removeAttribute('open'); });
  }

  items.forEach(item => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.faq-body');
    if (!summary || !body) return;
    openState.set(item, item.hasAttribute('open'));

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (isOpen(item)) {
        closeItem(item, body);
      } else {
        items.forEach(other => {
          if (other !== item && isOpen(other)) {
            closeItem(other, other.querySelector('.faq-body'));
          }
        });
        openItem(item, body);
      }
    });
  });

  // An open panel's content can reflow (font swap, resize) while pinned to a
  // fixed px height; 'auto' after settling covers most of it, but a resize
  // mid-animation would strand it. Re-measure on resize.
  window.addEventListener('resize', () => {
    items.forEach(item => {
      const body = item.querySelector('.faq-body');
      if (body && isOpen(item) && !pending.has(item)) body.style.height = 'auto';
    });
  }, { passive: true });
});

// ============================================
// Scroll-triggered video (plays while in view, pauses otherwise)
// ============================================
document.querySelectorAll('.video-frame video').forEach(video => {
  if (prefersReduced || !supportsIO) {
    // No autoplay here, so give people a way to start it themselves rather
    // than leaving an unplayable poster frame.
    video.controls = true;
    return;
  }
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
