// paste.js

const STORAGE_KEY_IMAGE = 'anonGalleryImage';
const STORAGE_KEY_CAPTION = 'anonGalleryCaption';

// Detect which page we are on by which element exists
document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');

  if (step1) initPastePage();
  if (step2) initCommentPage();
  if (step3) initGalleryPage();
});

// PAGE 1: paste image
function initPastePage() {
  const pasteArea = document.getElementById('paste-area');
  const preview = document.getElementById('preview');
  const redoBtn = document.getElementById('redo-btn');
  const nextBtn = document.getElementById('next-btn');
  const hint = pasteArea.querySelector('.paste-hint');

  let currentImageDataUrl = null;

  window.addEventListener('load', () => {
    pasteArea.focus();
  });

  pasteArea.addEventListener('click', () => {
    pasteArea.focus();
  });

  pasteArea.addEventListener('paste', (event) => {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') === 0) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          currentImageDataUrl = e.target.result;
          preview.src = currentImageDataUrl;
          preview.style.display = 'block';
          hint.style.display = 'none';
          redoBtn.disabled = false;
          nextBtn.disabled = false;
        };
        reader.readAsDataURL(blob);
        event.preventDefault();
        return;
      }
    }

    alert('Clipboard did not contain an image. Copy an image, then paste again.');
  });

  redoBtn.addEventListener('click', () => {
    currentImageDataUrl = null;
    preview.src = '';
    preview.style.display = 'none';
    hint.style.display = 'block';
    redoBtn.disabled = true;
    nextBtn.disabled = true;
    localStorage.removeItem(STORAGE_KEY_IMAGE);
  });

  nextBtn.addEventListener('click', () => {
    if (!currentImageDataUrl) {
      alert('Paste an image first.');
      return;
    }
    localStorage.setItem(STORAGE_KEY_IMAGE, currentImageDataUrl);
    window.location.href = 'comment.html';
  });
}

// PAGE 2: caption
function initCommentPage() {
  const captionInput = document.getElementById('caption-input');
  const skipBtn = document.getElementById('skip-caption-btn');
  const submitBtn = document.getElementById('submit-btn');

  const imageDataUrl = localStorage.getItem(STORAGE_KEY_IMAGE);
  if (!imageDataUrl) {
    // No image stored, go back to start
    window.location.href = 'index.html';
    return;
  }

  skipBtn.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY_CAPTION, '');
    submitSubmission(imageDataUrl, '');
  });

  submitBtn.addEventListener('click', () => {
    const caption = captionInput.value.trim();
    localStorage.setItem(STORAGE_KEY_CAPTION, caption);
    submitSubmission(imageDataUrl, caption);
  });
}

// Send data to Netlify function and then go to gallery
async function submitSubmission(imageDataUrl, caption) {
  try {
    const res = await fetch('/.netlify/functions/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: imageDataUrl,
        comment: caption || null,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      alert('Error posting image.');
      return;
    }

    // Clear local storage and go to gallery
    localStorage.removeItem(STORAGE_KEY_IMAGE);
    localStorage.removeItem(STORAGE_KEY_CAPTION);
    window.location.href = 'gallery.html';
  } catch (err) {
    console.error(err);
    alert('Network error posting image.');
  }
}

// PAGE 3: gallery
async function initGalleryPage() {
  const grid = document.getElementById('gallery-grid');

  try {
    const res = await fetch('/.netlify/functions/submissions');
    if (!res.ok) {
      console.error('Failed to load gallery');
      return;
    }
    const items = await res.json();

    grid.innerHTML = '';

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      const img = document.createElement('img');
      img.src = item.imageUrl;
      img.alt = 'Anonymous submission';
      card.appendChild(img);

      if (item.comment) {
        const p = document.createElement('p');
        p.className = 'gallery-caption';
        p.textContent = item.comment;
        card.appendChild(p);
      }

      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}
