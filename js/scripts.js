// DM Modern homepage interactions
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

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });
  }

  // Filters
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

    // For each collection, show/hide cards by primary category
    sections.forEach(section => {
      const cards = Array.from(section.querySelectorAll('.dm-card'));
      let anyVisible = false;

      cards.forEach(card => {
        const category = normalize(card.getAttribute('data-category'));
        const show = (f === 'all') || (category === f);

        card.style.display = show ? '' : 'none';
        if (show) anyVisible = true;
      });

      // Hide entire collection if nothing in it matches the filter
      section.style.display = anyVisible ? '' : 'none';
    });
  };

  // Initial
  applyFilter('all');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // Optional: close mobile menu if you jump to #work
  if (location.hash === '#work') {
    const mm = document.querySelector('.dm-mobile-menu');
    if (mm) mm.hidden = true;
  }
});
