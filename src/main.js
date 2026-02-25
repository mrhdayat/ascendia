/* ===========================================
   ASCENDIA — Main Application Entry
   GSAP-powered Swiss Style Art Archive
   =========================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

/* ===========================================
   CUSTOM CURSOR
   Crosshair cursor with lerp smoothing
   =========================================== */
class Cursor {
  constructor() {
    this.el = document.getElementById('cursor');
    if (!this.el) return;
    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.lerp = 0.15;
    this.init();
  }
  init() {
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });
    // Hover states
    document.querySelectorAll('a, button, .gallery__card, .exhibition-card, .data-table__row, .filter-btn, .pagination__btn').forEach(el => {
      el.addEventListener('mouseenter', () => this.el.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => this.el.classList.remove('cursor--hover'));
    });
    document.querySelectorAll('.hero__title, .text-display, .text-h1, .manifesto__heading').forEach(el => {
      el.addEventListener('mouseenter', () => this.el.classList.add('cursor--text'));
      el.addEventListener('mouseleave', () => this.el.classList.remove('cursor--text'));
    });
    this.animate();
  }
  animate() {
    this.pos.x += (this.target.x - this.pos.x) * this.lerp;
    this.pos.y += (this.target.y - this.pos.y) * this.lerp;
    this.el.style.left = `${this.pos.x}px`;
    this.el.style.top = `${this.pos.y}px`;
    requestAnimationFrame(() => this.animate());
  }
}

/* ===========================================
   LOADING SCREEN
   Counter + red line + panel split reveal
   =========================================== */
class Loader {
  constructor(onComplete) {
    this.counter = document.getElementById('loaderCounter');
    this.line = document.getElementById('loaderLine');
    this.loader = document.getElementById('loader');
    this.titleSpans = document.querySelectorAll('#loaderTitle span');
    this.subtitleSpan = document.querySelector('#loaderSubtitle span');
    this.panelTop = document.querySelector('.loader__panel--top');
    this.panelBottom = document.querySelector('.loader__panel--bottom');
    this.mainContent = document.getElementById('mainContent');
    this.onComplete = onComplete;
    if (!this.loader) { onComplete?.(); return; }
    this.animate();
  }
  animate() {
    const tl = gsap.timeline();

    // Phase 1: Title letters stagger in
    tl.from(this.titleSpans, {
      y: 30, opacity: 0, stagger: 0.06, duration: 0.5,
      ease: 'power3.out'
    });

    // Phase 2: Counter ticks 000→100 while red line extends
    tl.to({ val: 0 }, {
      val: 100, duration: 2.2, ease: 'power2.inOut',
      onUpdate: function () {
        const v = Math.round(this.targets()[0].val);
        document.getElementById('loaderCounter').textContent =
          String(v).padStart(3, '0');
      }
    }, '-=0.2');

    tl.to(this.line, { width: '100%', duration: 2.2, ease: 'power2.inOut' }, '<');

    // Phase 3: Subtitle appears
    tl.from(this.subtitleSpan, { y: 20, opacity: 0, duration: 0.4, ease: 'power3.out' }, '-=0.8');

    // Phase 4: Panel split + content reveal
    tl.to(this.panelTop, { y: '-100%', duration: 0.9, ease: 'power3.inOut' }, '+=0.3');
    tl.to(this.panelBottom, { y: '100%', duration: 0.9, ease: 'power3.inOut' }, '<');
    tl.to([this.counter, this.titleSpans, this.subtitleSpan, this.line], {
      opacity: 0, duration: 0.3
    }, '<');

    // Phase 5: Main content fades in
    tl.to(this.mainContent, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    tl.set(this.loader, { display: 'none' });

    tl.call(() => this.onComplete?.());
  }
}

/* ===========================================
   NAVIGATION
   Floating nav + scroll-aware + hamburger
   =========================================== */
class Navigation {
  constructor() {
    this.nav = document.getElementById('nav');
    this.hamburger = document.getElementById('navHamburger');
    this.overlay = document.getElementById('navOverlay');
    if (!this.nav) return;
    this.lastScroll = 0;
    this.isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
    this.init();
  }
  init() {
    // On home page, nav starts hidden and appears after hero
    if (this.isHome) {
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'bottom 80%',
        onEnter: () => this.show(),
        onLeaveBack: () => this.hide(),
      });
    }
    // Scroll direction detection
    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        if (!this.isHome || self.scroll() > window.innerHeight * 0.8) {
          if (self.direction === 1 && self.scroll() > 200) {
            this.nav.classList.add('nav--hidden');
            this.nav.classList.remove('nav--visible');
          } else {
            this.nav.classList.remove('nav--hidden');
            this.nav.classList.add('nav--visible');
          }
        }
      }
    });
    // Hamburger
    this.hamburger?.addEventListener('click', () => this.toggleMenu());
    // Magnetic hover effect on links
    this.nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(link, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }
  show() {
    this.nav.classList.add('nav--visible');
    this.nav.classList.remove('nav--hidden');
  }
  hide() {
    this.nav.classList.remove('nav--visible');
  }
  toggleMenu() {
    this.hamburger.classList.toggle('is-open');
    this.overlay.classList.toggle('is-open');
    document.body.style.overflow = this.overlay.classList.contains('is-open') ? 'hidden' : '';
  }
}

/* ===========================================
   HERO SECTION — Scroll-Scrubbed Text
   Each character opacity driven by scroll
   =========================================== */
function initHero() {
  const title = document.getElementById('heroTitle');
  const redLine = document.getElementById('heroRedLine');
  if (!title) return;

  // Split each line's text into characters
  title.querySelectorAll('.line').forEach(line => {
    const text = line.textContent;
    // Preserve child elements (like the red XX span)
    if (line.children.length > 0) {
      const parts = [];
      line.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            parts.push(span);
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Clone the element and split its text too
          const el = node.cloneNode(false);
          node.textContent.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            el.appendChild(span);
          });
          parts.push(el);
        }
      });
      line.innerHTML = '';
      parts.forEach(p => line.appendChild(p));
    } else {
      line.innerHTML = text.split('').map(char =>
        `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
    }
  });

  // Animate each char opacity on scroll
  const chars = title.querySelectorAll('.char');
  gsap.set(chars, { opacity: 0.08 });
  gsap.to(chars, {
    opacity: 1,
    stagger: 0.03,
    ease: 'none',
    scrollTrigger: {
      trigger: title,
      start: 'top 80%',
      end: 'bottom 30%',
      scrub: 1,
    }
  });

  // Red line extends on scroll
  if (redLine) {
    gsap.to(redLine, {
      width: '60%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }
}

/* ===========================================
   HORIZONTAL GALLERY — Pinned Scroll
   =========================================== */
function initGallery() {
  const track = document.getElementById('galleryTrack');
  if (!track) return;

  const cards = track.querySelectorAll('.gallery__card');
  const totalScroll = track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: () => -totalScroll,
    ease: 'none',
    scrollTrigger: {
      trigger: '#gallery',
      start: 'top top',
      end: () => `+=${totalScroll}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  });

  // Scale + fade each card on enter
  cards.forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, scale: 0.9,
      scrollTrigger: {
        trigger: card,
        containerAnimation: undefined,
        start: 'left 90%',
        end: 'left 60%',
        scrub: 1,
      }
    });
  });
}

/* ===========================================
   MANIFESTO — Character-by-Character Reveal
   =========================================== */
function initManifesto() {
  const textEl = document.getElementById('manifestoText');
  if (!textEl) return;

  const text = textEl.textContent;
  textEl.innerHTML = text.split('').map(char =>
    char === ' ' ? ' ' : `<span class="char">${char}</span>`
  ).join('');

  gsap.to(textEl.querySelectorAll('.char'), {
    opacity: 1,
    stagger: 0.008,
    ease: 'none',
    scrollTrigger: {
      trigger: textEl,
      start: 'top 75%',
      end: 'bottom 40%',
      scrub: 1,
    }
  });
}

/* ===========================================
   STATISTICS — Counter Animation
   =========================================== */
function initStats() {
  document.querySelectorAll('.stats__number').forEach(el => {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate: function () {
            const v = Math.round(this.targets()[0].val);
            el.textContent = prefix + v.toLocaleString() + suffix;
          }
        });
      }
    });
  });
}

/* ===========================================
   MARQUEE — Infinite Scroll
   =========================================== */
function initMarquee() {
  const row1 = document.getElementById('marqueeRow1');
  const row2 = document.getElementById('marqueeRow2');
  if (!row1 || !row2) return;

  // Calculate widths
  const w1 = row1.scrollWidth / 2;
  const w2 = row2.scrollWidth / 2;

  gsap.to(row1, {
    x: -w1, duration: 30, ease: 'none', repeat: -1,
    modifiers: {
      x: gsap.utils.unitize(x => parseFloat(x) % w1)
    }
  });

  gsap.to(row2, {
    x: w2, duration: 35, ease: 'none', repeat: -1,
    modifiers: {
      x: gsap.utils.unitize(x => parseFloat(x) % w2)
    }
  });
}

/* ===========================================
   REVEAL ANIMATIONS — Generic reveal on scroll
   =========================================== */
function initReveals() {
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      y: 0, opacity: 1, duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        once: true,
      }
    });
  });

  // Footer line animation
  const footerLine = document.getElementById('footerLine');
  if (footerLine) {
    gsap.to(footerLine, {
      width: '100%', duration: 1.5, ease: 'power3.out',
      scrollTrigger: {
        trigger: footerLine,
        start: 'top 90%',
        once: true,
      }
    });
  }
}

/* ===========================================
   SMOOTH SCROLL — Lenis Setup
   =========================================== */
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/* ===========================================
   INITIALIZATION
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll first
  initSmoothScroll();

  // Cursor
  new Cursor();

  // Loader → then init everything
  new Loader(() => {
    new Navigation();
    initHero();
    initGallery();
    initManifesto();
    initStats();
    initMarquee();
    initReveals();

    // Refresh ScrollTrigger after loader finishes and DOM is visible
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  });
});
