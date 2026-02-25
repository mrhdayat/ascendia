/* ===========================================
   ASCENDIA — Koleksi Page JS
   Sortable table + search + detail view
   =========================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Art Collection Data ── */
const artworks = [
  { id: 1, title: 'Komposisi Diagonal No. 7', artist: 'Raden Saleh', year: 1938, media: 'Cat Minyak' },
  { id: 2, title: 'Pagi di Pelabuhan', artist: 'Affandi', year: 1954, media: 'Ekspresionisme' },
  { id: 3, title: 'Struktur Linear III', artist: 'Ahmad Sadali', year: 1967, media: 'Abstrak' },
  { id: 4, title: 'Rotasi Cahaya', artist: 'But Mochtar', year: 1972, media: 'Cat Minyak' },
  { id: 5, title: 'Bidang dan Ruang', artist: 'Popo Iskandar', year: 1961, media: 'Geometris' },
  { id: 6, title: 'Metamorfosis Kota', artist: 'Widayat', year: 1985, media: 'Dekoratif' },
  { id: 7, title: 'Horizon Merah', artist: 'Srihadi', year: 1979, media: 'Abstrak' },
  { id: 8, title: 'Perahu di Senja', artist: 'Basuki Abdullah', year: 1945, media: 'Cat Minyak' },
  { id: 9, title: 'Konstruksi Ruang', artist: 'Mochtar Apin', year: 1958, media: 'Geometris' },
  { id: 10, title: 'Wajah Kota', artist: 'Sudjojono', year: 1950, media: 'Ekspresionisme' },
  { id: 11, title: 'Gerbang Cahaya', artist: 'Fadjar Sidik', year: 1975, media: 'Abstrak' },
  { id: 12, title: 'Tarian Garis', artist: 'Umi Dachlan', year: 1982, media: 'Geometris' },
  { id: 13, title: 'Harmoni Alam', artist: 'Lee Man Fong', year: 1941, media: 'Cat Minyak' },
  { id: 14, title: 'Refleksi Biru', artist: 'Ahmad Sadali', year: 1971, media: 'Abstrak' },
  { id: 15, title: 'Bentuk dalam Ruang', artist: 'But Mochtar', year: 1968, media: 'Geometris' },
  { id: 16, title: 'Potret Diri', artist: 'Affandi', year: 1960, media: 'Ekspresionisme' },
  { id: 17, title: 'Komposisi Abstrak IX', artist: 'Srihadi', year: 1983, media: 'Abstrak' },
  { id: 18, title: 'Pemandangan Sawah', artist: 'Basuki Abdullah', year: 1952, media: 'Cat Minyak' },
  { id: 19, title: 'Motif Tradisional', artist: 'Widayat', year: 1990, media: 'Dekoratif' },
  { id: 20, title: 'Dinamika Warna', artist: 'Fadjar Sidik', year: 1978, media: 'Abstrak' },
  { id: 21, title: 'Fragmen Memori', artist: 'Popo Iskandar', year: 1969, media: 'Ekspresionisme' },
  { id: 22, title: 'Grid Hitam Putih', artist: 'Mochtar Apin', year: 1963, media: 'Geometris' },
  { id: 23, title: 'Bunga Api', artist: 'Lee Man Fong', year: 1947, media: 'Cat Minyak' },
  { id: 24, title: 'Titik Nol', artist: 'Umi Dachlan', year: 1988, media: 'Abstrak' },
  { id: 25, title: 'Irama Kampung', artist: 'Sudjojono', year: 1944, media: 'Ekspresionisme' },
  { id: 26, title: 'Labirin Geometri', artist: 'Ahmad Sadali', year: 1976, media: 'Geometris' },
  { id: 27, title: 'Lukisan Pemuda', artist: 'Raden Saleh', year: 1935, media: 'Cat Minyak' },
  { id: 28, title: 'Dekorasi Timur', artist: 'Widayat', year: 1993, media: 'Dekoratif' },
  { id: 29, title: 'Matahari Terbenam', artist: 'Srihadi', year: 1986, media: 'Abstrak' },
  { id: 30, title: 'Gejolak Warna', artist: 'Affandi', year: 1965, media: 'Ekspresionisme' },
];

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let filteredData = [...artworks];
let sortField = 'number';
let sortDir = 1;

/* ── Custom Cursor ── */
class Cursor {
  constructor() {
    this.el = document.getElementById('cursor');
    if (!this.el) return;
    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });
    this.animate();
  }
  animate() {
    this.pos.x += (this.target.x - this.pos.x) * 0.15;
    this.pos.y += (this.target.y - this.pos.y) * 0.15;
    this.el.style.left = `${this.pos.x}px`;
    this.el.style.top = `${this.pos.y}px`;
    requestAnimationFrame(() => this.animate());
  }
  bindHovers() {
    document.querySelectorAll('a, button, .data-table__row, .filter-btn, .pagination__btn').forEach(el => {
      el.addEventListener('mouseenter', () => this.el.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => this.el.classList.remove('cursor--hover'));
    });
  }
}

/* ── Navigation ── */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('navHamburger');
  const overlay = document.getElementById('navOverlay');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top top', end: 'max',
    onUpdate: (self) => {
      if (self.direction === 1 && self.scroll() > 200) {
        nav.classList.add('nav--hidden');
        nav.classList.remove('nav--visible');
      } else {
        nav.classList.remove('nav--hidden');
        nav.classList.add('nav--visible');
      }
    }
  });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('is-open');
    overlay.classList.toggle('is-open');
    document.body.style.overflow = overlay.classList.contains('is-open') ? 'hidden' : '';
  });

  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      gsap.to(link, {
        x: (e.clientX - rect.left - rect.width / 2) * 0.3,
        y: (e.clientY - rect.top - rect.height / 2) * 0.3,
        duration: 0.3, ease: 'power2.out'
      });
    });
    link.addEventListener('mouseleave', () => {
      gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ── Table Rendering ── */
function renderTable(searchQuery = '') {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filteredData.slice(start, start + ITEMS_PER_PAGE);

  tbody.innerHTML = pageData.map((item, i) => {
    const highlight = (text) => {
      if (!searchQuery) return text;
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      return text.replace(regex, '<span class="highlight">$1</span>');
    };
    return `
      <div class="data-table__row" data-id="${item.id}">
        <span class="data-table__row-number">${String(start + i + 1).padStart(2, '0')}</span>
        <span class="data-table__row-title">${highlight(item.title)}</span>
        <span class="data-table__row-artist">${highlight(item.artist)}</span>
        <span class="data-table__row-year">${item.year}</span>
        <span class="data-table__row-media">${highlight(item.media)}</span>
      </div>
    `;
  }).join('');

  // Animate rows in
  gsap.from(tbody.querySelectorAll('.data-table__row'), {
    y: 20, opacity: 0, stagger: 0.05, duration: 0.4,
    ease: 'power3.out'
  });

  // Row click → detail
  tbody.querySelectorAll('.data-table__row').forEach(row => {
    row.addEventListener('click', () => openDetail(parseInt(row.dataset.id)));
  });

  renderPagination();
  cursor?.bindHovers();
}

function renderPagination() {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  let html = `<button class="pagination__btn" data-page="prev">←</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination__btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="pagination__btn" data-page="next">→</button>`;
  pag.innerHTML = html;

  pag.querySelectorAll('.pagination__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'prev') currentPage = Math.max(1, currentPage - 1);
      else if (page === 'next') currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = parseInt(page);
      renderTable(document.getElementById('searchInput')?.value || '');
    });
  });
}

/* ── Detail Overlay ── */
function openDetail(id) {
  const item = artworks.find(a => a.id === id);
  if (!item) return;

  const overlay = document.getElementById('detailOverlay');
  const imageDiv = document.getElementById('detailImage');
  const infoDiv = document.getElementById('detailInfo');

  // Cycle through art styles
  const artStyles = ['art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6'];
  const style = artStyles[(id - 1) % artStyles.length];
  imageDiv.innerHTML = `<div class="gallery__card-image ${style}" style="width:100%;height:100%;aspect-ratio:auto;"></div>`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-overlay__close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeDetail);

  infoDiv.innerHTML = '';
  infoDiv.appendChild(closeBtn);
  infoDiv.innerHTML += `
    <div style="padding-top:80px;">
      <p class="section__label">${item.media}</p>
      <h2 class="text-h2" style="margin-bottom:var(--space-5);">${item.title}</h2>
      <div class="accent-line"></div>
      <div style="margin-top:var(--space-6);">
        <p style="font-size:var(--text-sm);color:var(--grey-400);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:var(--space-2);">Seniman</p>
        <p style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-5);">${item.artist}</p>
        <p style="font-size:var(--text-sm);color:var(--grey-400);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:var(--space-2);">Tahun</p>
        <p style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-5);">${item.year}</p>
        <p style="font-size:var(--text-sm);color:var(--grey-400);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:var(--space-2);">Deskripsi</p>
        <p style="font-size:var(--text-base);line-height:1.7;color:var(--grey-500);">
          Karya ini merupakan salah satu representasi penting dari gerakan seni modern Indonesia 
          yang menggabungkan teknik ${item.media.toLowerCase()} dengan ekspresi budaya lokal. 
          Tersimpan dalam arsip digital yayasan sejak proses digitalisasi tahun 2000.
        </p>
      </div>
    </div>
  `;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  const overlay = document.getElementById('detailOverlay');
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ── Search ── */
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    filteredData = artworks.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.artist.toLowerCase().includes(q) ||
      a.media.toLowerCase().includes(q) ||
      String(a.year).includes(q)
    );
    currentPage = 1;
    renderTable(input.value);
  });
}

/* ── Filters ── */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      if (filter === 'all') {
        filteredData = [...artworks];
      } else {
        filteredData = artworks.filter(a =>
          a.media.toLowerCase().includes(filter.toLowerCase())
        );
      }
      currentPage = 1;
      renderTable();
    });
  });
}

/* ── Sort ── */
function initSort() {
  document.querySelectorAll('.data-table__header-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const field = cell.dataset.sort;
      if (sortField === field) sortDir *= -1;
      else { sortField = field; sortDir = 1; }

      filteredData.sort((a, b) => {
        let va = field === 'number' ? a.id : a[field];
        let vb = field === 'number' ? b.id : b[field];
        if (typeof va === 'string') return va.localeCompare(vb) * sortDir;
        return (va - vb) * sortDir;
      });

      document.querySelectorAll('.data-table__header-cell').forEach(c => c.classList.remove('sorted'));
      cell.classList.add('sorted');
      renderTable();
    });
  });
}

/* ── Detail Close Handlers ── */
function initDetailClose() {
  document.getElementById('detailClose')?.addEventListener('click', closeDetail);
  document.getElementById('detailCloseBtn')?.addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });
}

/* ── Reveals ── */
function initReveals() {
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });
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
}

/* ── Init ── */
let cursor;
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  cursor = new Cursor();
  initNav();
  initReveals();
  initSearch();
  initFilters();
  initSort();
  initDetailClose();
  renderTable();
});
