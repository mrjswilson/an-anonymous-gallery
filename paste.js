const STORAGE_KEY_IMAGE = 'anonGalleryImage';

// Decide which page to initialize
document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');

  if (step1) initPastePage();
  if (step2) initCommentPage();
  if (step3) initGalleryPage();
});

// PAGE 1: upload image
function initPastePage() {
  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('preview');
  const redoBtn = document.getElementById('redo-btn');
  const nextBtn = document.getElementById('next-btn');

  let currentImageDataUrl = null;

  if (!fileInput || !preview || !redoBtn || !nextBtn) {
    console.error('InitPastePage: elements not found');
    return;
  }

  preview.style.display = 'none';

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageDataUrl = e.target.result;
      preview.src = currentImageDataUrl;
      preview.style.display = 'block';
      redoBtn.disabled = false;
      nextBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  });

  redoBtn.addEventListener('click', () => {
    currentImageDataUrl = null;
    preview.src = '';
    preview.style.display = 'none';
    redoBtn.disabled = true;
    nextBtn.disabled = true;
    fileInput.value = '';
    localStorage.removeItem(STORAGE_KEY_IMAGE);
  });

  nextBtn.addEventListener('click', () => {
    if (!currentImageDataUrl) {
      alert('Choose an image first.');
      return;
    }
    localStorage.setItem(STORAGE_KEY_IMAGE, currentImageDataUrl);
    window.location.href = 'comment.html';
  });
}

// PAGE 2: caption page
function initCommentPage() {
  const captionInput = document.getElementById('caption-input');
  const skipBtn = document.getElementById('skip-caption-btn');
  const submitBtn = document.getElementById('submit-btn');

  const imageDataUrl = localStorage.getItem(STORAGE_KEY_IMAGE);
  if (!imageDataUrl) {
    // No image stored, send back to start
    window.location.href = 'index.html';
    return;
  }

  skipBtn.addEventListener('click', () => {
    submitSubmission(imageDataUrl, '');
  });

  submitBtn.addEventListener('click', () => {
    const caption = captionInput.value.trim();
    submitSubmission(imageDataUrl, caption);
  });
}

// Send data to Netlify function, then go to gallery
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

    localStorage.removeItem(STORAGE_KEY_IMAGE);
    window.location.href = 'gallery.html';
  } catch (err) {
    console.error(err);
    alert('Network error posting image.');
  }
}

// PAGE 3: gallery page
async function initGalleryPage() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  try {
    const res = await fetch('/.netlify/functions/submissions');
    if (!res.ok) {
      console.error('Failed to load gallery');
      return;
    }
    const items = await res.json();

    grid.innerHTML
