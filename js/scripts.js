// DM Modern interactions (works on index + project pages)
document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const y = document.getElementById('dmYear');
  if (y) y.textContent = String(new Date().getFullYear());

  // Mobile menu
  const toggle = document.querySelector('.dm-nav-toggle');
  const mobileMenu = document.querySelector('.dm-mobile-menu');
  if (toggle && mobileMenu) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.hidden = !open;
    };
    setOpen(false);

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!open);
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });
  }

  // Filters (index only)
  const filterButtons = Array.from(document.querySelectorAll('.dm-filter'));
  const sections = Array.from(document.querySelectorAll('.dm-collection'));

  const normalize = (s) => (s || '').toLowerCase().trim();

  const applyFilter = (filter) => {
    const f = normalize(filter);

    // Update button states
    filterButtons.forEach(btn => {
      const active = normalize(btn.dataset.filter) === f;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // Show/hide cards + collections
    sections.forEach(section => {
      const cards = Array.from(section.querySelectorAll('.dm-card'));
      let anyVisible = false;

      cards.forEach(card => {
        const category = normalize(card.getAttribute('data-category'));
        const show = (f === 'all') || (category === f);
        card.style.display = show ? '' : 'none';
        if (show) anyVisible = true;
      });

      section.style.display = anyVisible ? '' : 'none';
    });
  };

  if (filterButtons.length && sections.length) {
    applyFilter('all');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });
  }

  // Lightbox (project pages)
  const lightbox = document.getElementById('dmLightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.dm-lightbox-img') : null;
  const closeBtn = lightbox ? lightbox.querySelector('.dm-lightbox-close') : null;

  const open = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImg) lightboxImg.src = '';
  };

  document.querySelectorAll('[data-shot]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-shot');
      const img = btn.querySelector('img');
      open(src, img ? img.alt : '');
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
});
