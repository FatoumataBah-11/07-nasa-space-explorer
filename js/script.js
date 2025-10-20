// script.js
// Replace with your real NASA API key
const API_KEY = "gCnOCcafSKV9ABK2nBR4W0RumNWOflTQqhXPragz"; // <-- real key

const getBtn = document.getElementById('getBtn');
const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');
const factBox = document.getElementById('factBox');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

// Grab date inputs ONCE (only declared here)
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call setupDateInputs from dateRange.js to initialize the date pickers
if (typeof setupDateInputs === 'function') {
  setupDateInputs(startInput, endInput);
}

// RANDOM SPACE FACTS (LevelUp)
const spaceFacts = [
  "There are more stars in the observable universe than grains of sand on all Earth's beaches combined (estimated).",
  "A day on Venus is longer than a year on Venus — it rotates very slowly.",
  "Neutron stars can spin hundreds of times per second and are so dense a teaspoon would weigh billions of tons.",
  "Jupiter creates its own lightning storms and has powerful auroras at its poles.",
  "The Moon is moving away from Earth at a rate of about 1.5 inches (3.8 cm) per year.",
  "Saturn isn’t the only ringed planet — all gas giants in our solar system have ring systems.",
  "The largest volcano in the solar system is Olympus Mons on Mars; it's nearly three times the height of Mount Everest."
];

// choose and display a random fact on load
function showRandomFact() {
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  if (factBox) factBox.textContent = `🚀 Did you know? ${fact}`;
}
showRandomFact();

// helper: parse date to YYYY-MM-DD
function formatDate(d) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// show loading
function setLoading(on) {
  if (!loading) return;
  loading.hidden = !on;
  if (on) {
    gallery.innerHTML = '';
  }
}

// Create gallery item (handles images and videos)
function createGalleryItem(item) {
  const wrap = document.createElement('article');
  wrap.className = 'gallery-item';
  const imageWrap = document.createElement('div');
  imageWrap.className = 'image-wrap';

  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.title || 'NASA APOD image';
    img.loading = 'lazy';
    imageWrap.appendChild(img);
    imageWrap.addEventListener('click', () => openModal(item));
  } else if (item.media_type === 'video') {
    const isYouTube = (item.url && item.url.includes('youtube.com')) || (item.url && item.url.includes('youtu.be'));
    if (isYouTube) {
      const iframe = document.createElement('iframe');
      iframe.src = item.url.replace('watch?v=', 'embed/');
      iframe.title = item.title || 'APOD video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.loading = 'lazy';
      iframe.setAttribute('aria-hidden', 'false');
      imageWrap.appendChild(iframe);
      imageWrap.addEventListener('click', () => openModal(item));
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.padding = '40px';
      placeholder.style.textAlign = 'center';
      placeholder.innerHTML = `<strong>Video:</strong> <div style="margin-top:8px;">${item.title || 'Video'}</div><div style="font-size:13px;color:#6b7280;margin-top:6px;">Click to open video</div>`;
      imageWrap.appendChild(placeholder);
      imageWrap.addEventListener('click', () => openModal(item));
    }
  } else {
    const p = document.createElement('p');
    p.textContent = 'Unsupported media type';
    imageWrap.appendChild(p);
  }

  const body = document.createElement('div');
  body.className = 'card-body';
  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = item.title || 'Untitled';
  const date = document.createElement('div');
  date.className = 'card-date';
  date.textContent = item.date || '';
  body.appendChild(title);
  body.appendChild(date);

  wrap.appendChild(imageWrap);
  wrap.appendChild(body);
  return wrap;
}

// open modal
function openModal(item) {
  if (!modal || !modalBody) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  let html = `<h2 id="modalTitle">${escapeHTML(item.title || '')}</h2>`;
  html += `<p style="color:#475569;margin-bottom:8px;">${escapeHTML(item.date || '')}</p>`;

  if (item.media_type === 'image') {
    html += `<img src="${escapeAttr(item.hdurl || item.url)}" alt="${escapeAttr(item.title || 'APOD image')}" />`;
  } else if (item.media_type === 'video') {
    const isYouTube = item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be'));
    if (isYouTube) {
      const embed = (item.url.indexOf('watch?v=') !== -1)
        ? item.url.replace('watch?v=', 'embed/')
        : item.url.replace('youtu.be/', 'www.youtube.com/embed/');
      html += `<iframe src="${escapeAttr(embed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="${escapeAttr(item.title)}"></iframe>`;
    } else {
      html += `<p><a href="${escapeAttr(item.url)}" target="_blank" rel="noopener">Open video</a></p>`;
    }
  }
  html += `<div style="margin-top:12px;color:#334155;">${escapeHTML(item.explanation || '')}</div>`;

  modalBody.innerHTML = html;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
function escapeAttr(str) {
  if (!str) return '';
  return escapeHTML(str).replaceAll('"', '&quot;');
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
}

// fetch APOD data for the date range
async function fetchAPOD(startDate, endDate) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`API error: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.reverse().slice(0, 9) : [data];
}

// main function to load images and render
async function loadGallery() {
  try {
    setLoading(true);
    const start = startInput.value;
    const end = endInput.value;
    if (!start || !end) throw new Error('Please choose a valid start and end date.');

    if (new Date(start) > new Date(end)) {
      throw new Error('Start date must be before or equal to end date.');
    }

    const items = await fetchAPOD(start, end);
    if (!items || items.length === 0) {
      gallery.innerHTML = `<div class="placeholder"><p>No images found for that range.</p></div>`;
      return;
    }

    gallery.innerHTML = '';
    items.forEach(it => {
      const itemEl = createGalleryItem(it);
      gallery.appendChild(itemEl);
    });

  } catch (err) {
    gallery.innerHTML = `<div class="placeholder"><p>Error loading images: ${escapeHTML(err.message || 'unknown')}</p></div>`;
    console.error(err);
  } finally {
    setLoading(false);
  }
}

// events
if (getBtn) getBtn.addEventListener('click', loadGallery);
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (startInput && endInput) {
      loadGallery();
    }
  } catch (e) { console.error(e); }
});
