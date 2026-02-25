/* ===========================================
   ASCENDIA — Subpage Shared JS
   Cursor + Navigation + Reveals for non-home pages
   =========================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Custom Cursor ── */
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
    document.querySelectorAll('a, button, .gallery__card, .exhibition-card, .data-table__row, .filter-btn, .pagination__btn, .team-card, .social-link').forEach(el => {
      el.addEventListener('mouseenter', () => this.el.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => this.el.classList.remove('cursor--hover'));
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

/* ── Navigation ── */
class Navigation {
  constructor() {
    this.nav = document.getElementById('nav');
    this.hamburger = document.getElementById('navHamburger');
    this.overlay = document.getElementById('navOverlay');
    if (!this.nav) return;
    this.init();
  }
  init() {
    // Scroll hide/show
    ScrollTrigger.create({
      start: 'top top', end: 'max',
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 200) {
          this.nav.classList.add('nav--hidden');
          this.nav.classList.remove('nav--visible');
        } else {
          this.nav.classList.remove('nav--hidden');
          this.nav.classList.add('nav--visible');
        }
      }
    });
    // Hamburger
    this.hamburger?.addEventListener('click', () => {
      this.hamburger.classList.toggle('is-open');
      this.overlay.classList.toggle('is-open');
      document.body.style.overflow = this.overlay.classList.contains('is-open') ? 'hidden' : '';
    });
    // Magnetic hover
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
}

/* ── Smooth Scroll ── */
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* ── Generic Reveals ── */
function initReveals() {
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });
}

/* ── Timeline (Pameran page) ── */
function initTimeline() {
  const progress = document.getElementById('timelineProgress');
  const events = document.querySelectorAll('.timeline__event');
  if (!progress || events.length === 0) return;

  ScrollTrigger.create({
    trigger: '#timeline',
    start: 'top 60%',
    end: 'bottom 40%',
    scrub: 1,
    onUpdate: (self) => {
      gsap.set(progress, { height: `${self.progress * 100}%` });
      events.forEach((ev, i) => {
        if (self.progress > (i / events.length)) {
          ev.classList.add('is-active');
        }
      });
    }
  });

  events.forEach((ev, i) => {
    const content = ev.querySelector('.timeline__event-content');
    if (content) {
      gsap.set(content, { opacity: 0, x: i % 2 === 0 ? -60 : 60 });
      gsap.to(content, {
        x: 0, opacity: 1, duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: ev, start: 'top 85%', once: true }
      });
    }
  });
}

/* ── Story Parallax (Tentang page) ── */
function initStoryParallax() {
  const bgText = document.getElementById('storyBgText');
  if (!bgText) return;

  gsap.to(bgText, {
    x: '-20%', ease: 'none',
    scrollTrigger: {
      trigger: '#story', start: 'top bottom', end: 'bottom top', scrub: 1
    }
  });
}

/* ── Mission Word-by-Word Reveal (Tentang page) ── */
function initMissionReveal() {
  ['missionText', 'visionText'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="mission__word">${w}</span>`).join(' ');

    const wordEls = el.querySelectorAll('.mission__word');
    gsap.set(wordEls, { opacity: 0.08 });
    gsap.to(wordEls, {
      opacity: 1, stagger: 0.03, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: 1 }
    });
  });
}

/* ── Contact Form (Kontak page) ── */
function initContactForm() {
  // Floating labels
  document.querySelectorAll('.form__input, .form__textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.toggle('has-value', input.value.length > 0);
    });
  });

  // Magnetic submit button
  const submit = document.querySelector('.form__submit');
  if (submit) {
    submit.addEventListener('mousemove', (e) => {
      const rect = submit.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(submit, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
    });
    submit.addEventListener('mouseleave', () => {
      gsap.to(submit, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  }

  // Form submit handler
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      gsap.to(submit, {
        scale: 0.95, duration: 0.1, yoyo: true, repeat: 1,
        onComplete: () => {
          submit.querySelector('span').textContent = 'Terkirim ✓';
          gsap.to(submit, { backgroundColor: '#00A651', duration: 0.4 });
        }
      });
    });
  }
}

/* ── Initialize ── */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  new Cursor();
  new Navigation();
  initReveals();
  initTimeline();
  initStoryParallax();
  initMissionReveal();
  initContactForm();
});
