// PAGE 1: upload image instead of clipboard paste
function initPastePage() {
  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('preview');
  const redoBtn = document.getElementById('redo-btn');
  const nextBtn = document.getElementById('next-btn');
  document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');

  if (step1) initPastePage();
  if (step2) initCommentPage();
  if (step3) initGalleryPage();
});


  let currentImageDataUrl = null;

  // Safety: if we didn't find the elements, stop
  if (!fileInput || !preview || !redoBtn || !nextBtn) {
    console.error('InitPastePage: elements not found');
    return;
  }

  // Hide preview at start
  preview.style.display = 'none';

  // When user selects a file
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }

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

  // Redo: clear image and reset
  redoBtn.addEventListener('click', () => {
    currentImageDataUrl = null;
    preview.src = '';
    preview.style.display = 'none';
    redoBtn.disabled = true;
    nextBtn.disabled = true;
    fileInput.value = '';
    localStorage.removeItem(STORAGE_KEY_IMAGE);
  });

  // Next: store image and go to caption page
  nextBtn.addEventListener('click', () => {
    if (!currentImageDataUrl) {
      alert('Choose an image first.');
      return;
    }
    localStorage.setItem(STORAGE_KEY_IMAGE, currentImageDataUrl);
    window.location.href = 'comment.html';
  });
}
