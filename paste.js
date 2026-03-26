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

// PAGE 1: upload image instead of clipboard paste
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

// PAGE 2: caption page (placeholder so file loads without errors)
function initCommentPage() {
  // we can fill this later if needed
}

// PAGE 3: gallery page (placeholder so file loads without errors)
function initGalleryPage() {
  // we can fill this later if needed
}
