(() => {
  'use strict';

  // Gallery collections. Replace each demonstration image with your own artwork.
  // Paths are relative to index.html.
  const demoImage = 'assets/temple-hall.png';
  const artworks = {
    occult: [
        { src: "images_galeries/occult/image01.webp" },
    { src: "images_galeries/occult/image02.webp" }
    ],
    creatures: [
        { src: "images_galeries/creatures/1000031494.jpg" },
    { src: "images_galeries/creatures/image02.webp" }
    ],
    medical: [
       { src: "images_galeries/medical/1000031491.jpg" },
    { src: "images_galeries/medical/1000031493.jpg" }
    ],
    aquatic: [
        { src: "images_galeries/aquatic/1000031496.jpg" },
    { src: "images_galeries/aquatic/image02.webp" }
    ],
    nightmares: [
       { src: "images_galeries/nightmares/1000031232.png" },
    { src: "images_galeries/nightmares/1000031244.jpg" },
     { src: "images_galeries/nightmares/1000031495.jpg" }
    ]
  };
  const galleryNames = { occult: 'Occult', creatures: 'Creatures', medical: 'Medical', aquatic: 'Aquatic', nightmares: 'Nightmares' };
  const $ = selector => document.querySelector(selector);
  const gate = $('#age-gate');
  const overlay = $('#gallery-overlay');
  const lightbox = $('#image-lightbox');
  const menu = $('#main-nav');
  const menuToggle = $('.menu-toggle');
  let currentGallery = 'occult';
  let currentIndex = 0;
  let lastFocus = null;

  if (sessionStorage.getItem('temple-age-confirmed') !== 'yes') {
    gate.hidden = false;
    $('#age-enter').focus();
  }
  $('#age-enter').addEventListener('click', () => {
    sessionStorage.setItem('temple-age-confirmed', 'yes');
    gate.hidden = true;
    $('.brand').focus();
  });
  $('#age-leave').addEventListener('click', () => { window.location.href = 'about:blank'; });

  function renderGallery() {
    const works = artworks[currentGallery] || [];
    const hasWorks = works.length > 0;
    $('.viewer-stage').hidden = !hasWorks;
    $('.viewer-details').hidden = !hasWorks;
    $('#gallery-items').hidden = !hasWorks;
    $('#gallery-empty').hidden = hasWorks;
    $('#gallery-items').replaceChildren();
    if (!hasWorks) return;

    const work = works[currentIndex];
    $('#gallery-image').src = work.src;
    $('#gallery-image').alt = work.title || galleryNames[currentGallery];
    $('#gallery-caption').textContent = work.title || '';
    $('#gallery-count').textContent = `${currentIndex + 1} / ${works.length}`;
    $('#gallery-prev').disabled = works.length < 2;
    $('#gallery-next').disabled = works.length < 2;

    works.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'viewer-thumb' + (index === currentIndex ? ' active' : '');
      button.setAttribute('aria-label', `View artwork ${index + 1}: ${item.title || ''}`);
      button.setAttribute('aria-pressed', String(index === currentIndex));
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.title || '';
      img.loading = 'lazy';
      button.append(img);
      button.addEventListener('click', () => { currentIndex = index; renderGallery(); });
      $('#gallery-items').append(button);
    });
  }

  function openGallery(key, origin) {
    currentGallery = key;
    currentIndex = 0;
    lastFocus = origin;
    $('#gallery-title').textContent = galleryNames[key] || 'Gallery';
    renderGallery();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#gallery-close').focus();
  }
  function closeGallery() {
    if (!lightbox.hidden) closeZoom();
    overlay.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus();
  }
  function changeArtwork(step) {
    const length = (artworks[currentGallery] || []).length;
    if (length < 2) return;
    currentIndex = (currentIndex + step + length) % length;
    renderGallery();
  }
  function openZoom() {
    const work = (artworks[currentGallery] || [])[currentIndex];
    if (!work) return;
    $('#lightbox-image').src = work.src;
    $('#lightbox-image').alt = work.title || '';
    lightbox.hidden = false;
    $('#lightbox-close').focus();
  }
  function closeZoom() {
    lightbox.hidden = true;
    $('#gallery-zoom').focus();
  }

  document.querySelectorAll('.door').forEach(door => {
    door.addEventListener('click', () => {
      const key = door.dataset.gallery;
      if (key === 'music') {
        $('#music').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      openGallery(key, door);
    });
  });
  $('#gallery-close').addEventListener('click', closeGallery);
  $('#gallery-back').addEventListener('click', closeGallery);
  $('#gallery-prev').addEventListener('click', () => changeArtwork(-1));
  $('#gallery-next').addEventListener('click', () => changeArtwork(1));
  $('#gallery-zoom').addEventListener('click', openZoom);
  $('#lightbox-close').addEventListener('click', closeZoom);
  $('#lightbox-image').addEventListener('click', closeZoom);
  overlay.addEventListener('click', event => { if (event.target === overlay) closeGallery(); });
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeZoom(); });
  document.addEventListener('keydown', event => {
    if (!lightbox.hidden) {
      if (event.key === 'Escape') closeZoom();
      return;
    }
    if (overlay.hidden) return;
    if (event.key === 'Escape') closeGallery();
    if (event.key === 'ArrowLeft') changeArtwork(-1);
    if (event.key === 'ArrowRight') changeArtwork(1);
  });

  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
  $('#year').textContent = new Date().getFullYear();

  const musicButton = $('#music-toggle');
  const ambientAudio = $('#ambient-audio');
  musicButton.addEventListener('click', async () => {
    if (ambientAudio.paused) {
      try { await ambientAudio.play(); }
      catch (error) { console.error('Audio playback failed:', error); }
    } else {
      ambientAudio.pause();
    }
  });
  ambientAudio.addEventListener('play', () => {
    musicButton.textContent = '⏸';
    musicButton.classList.add('playing');
    musicButton.setAttribute('aria-label', 'Pause ambient music');
  });
  ambientAudio.addEventListener('pause', () => {
    musicButton.textContent = '♪';
    musicButton.classList.remove('playing');
    musicButton.setAttribute('aria-label', 'Play ambient music');
  });
})();
