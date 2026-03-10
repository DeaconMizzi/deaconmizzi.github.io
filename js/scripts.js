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

  // Carousels (project pages)
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.dm-carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.dm-carousel-slide'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));

    if (!track || slides.length <= 1) return;

    let index = slides.findIndex(slide => slide.classList.contains('is-active'));
    if (index < 0) index = 0;

    let autoplayTimer = null;
    let touchStartX = 0;
    let touchDeltaX = 0;
    const autoplay = carousel.dataset.autoplay === 'true';

    const setSlide = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        slide.tabIndex = active ? 0 : -1;
      });

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    };

    const stopAutoplay = () => {
      if (!autoplayTimer) return;
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const startAutoplay = () => {
      if (!autoplay) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(() => {
        setSlide(index + 1);
      }, 4500);
    };

    if (prevBtn) prevBtn.addEventListener('click', () => {
      setSlide(index - 1);
      startAutoplay();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      setSlide(index + 1);
      startAutoplay();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        setSlide(Number(dot.dataset.carouselDot || 0));
        startAutoplay();
      });
    });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', () => {
      if (!carousel.contains(document.activeElement)) startAutoplay();
    });

    carousel.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchDeltaX = 0;
      stopAutoplay();
    }, { passive: true });

    carousel.addEventListener('touchmove', (event) => {
      touchDeltaX = event.changedTouches[0].clientX - touchStartX;
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
      if (Math.abs(touchDeltaX) > 40) {
        setSlide(index + (touchDeltaX < 0 ? 1 : -1));
      }
      startAutoplay();
    });

    setSlide(index);
    startAutoplay();
  });

  // Lightbox (project pages)
  const lightbox =
    document.getElementById('dmLightbox') || document.getElementById('lightbox');
  const lightboxImg = lightbox
    ? lightbox.querySelector('.dm-lightbox-img, #lightbox-img, img')
    : null;
  let closeBtn = lightbox ? lightbox.querySelector('.dm-lightbox-close') : null;
  const galleryShots = Array.from(document.querySelectorAll('[data-shot]'));
  let currentShotIndex = -1;

  if (lightbox && !closeBtn) {
    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'dm-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close image viewer');
    closeBtn.textContent = 'X';
    lightbox.appendChild(closeBtn);
  }

  let prevBtn = lightbox ? lightbox.querySelector('.dm-lightbox-nav--prev') : null;
  let nextBtn = lightbox ? lightbox.querySelector('.dm-lightbox-nav--next') : null;

  if (lightbox && !prevBtn) {
    prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'dm-lightbox-nav dm-lightbox-nav--prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.textContent = '<';
    lightbox.appendChild(prevBtn);
  }

  if (lightbox && !nextBtn) {
    nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'dm-lightbox-nav dm-lightbox-nav--next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.textContent = '>';
    lightbox.appendChild(nextBtn);
  }

  const updateLightboxNav = () => {
    const hasGallery = galleryShots.length > 1;
    if (prevBtn) prevBtn.hidden = !hasGallery;
    if (nextBtn) nextBtn.hidden = !hasGallery;
    if (prevBtn) prevBtn.disabled = !hasGallery;
    if (nextBtn) nextBtn.disabled = !hasGallery;
  };

  const showShotAt = (nextIndex) => {
    if (!lightbox || !lightboxImg || !galleryShots.length) return;
    currentShotIndex = (nextIndex + galleryShots.length) % galleryShots.length;
    const shot = galleryShots[currentShotIndex];
    const src = shot.getAttribute('data-shot');
    const img = shot.querySelector('img');
    lightboxImg.src = src || '';
    lightboxImg.alt = img ? img.alt : '';
    updateLightboxNav();
  };

  const open = (src, alt, shotIndex = -1) => {
    if (!lightbox || !lightboxImg) return;
    if (shotIndex >= 0 && galleryShots.length) {
      showShotAt(shotIndex);
    } else {
      currentShotIndex = -1;
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      updateLightboxNav();
    }
    lightbox.classList.add('is-open');
    if (lightbox.id === 'lightbox') {
      lightbox.style.display = 'flex';
    }
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    if (lightbox.id === 'lightbox') {
      lightbox.style.display = 'none';
    }
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImg) lightboxImg.src = '';
    currentShotIndex = -1;
  };

  const stepLightbox = (direction) => {
    if (!lightbox || !lightbox.classList.contains('is-open') || !galleryShots.length) return;
    const baseIndex = currentShotIndex >= 0 ? currentShotIndex : 0;
    showShotAt(baseIndex + direction);
  };

  galleryShots.forEach((btn, shotIndex) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-shot');
      const img = btn.querySelector('img');
      open(src, img ? img.alt : '', shotIndex);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    stepLightbox(-1);
  });
  if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    stepLightbox(1);
  });
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  // Back-compat for legacy inline handlers on project pages.
  window.openLightbox = (imgEl) => {
    if (!imgEl) return;
    open(imgEl.src, imgEl.alt || '');
  };
  window.closeLightbox = () => close();
});
