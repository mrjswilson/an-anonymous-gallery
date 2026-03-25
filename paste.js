document.addEventListener('DOMContentLoaded', function() {
  console.log('paste.js loaded');
  
  const pasteArea      = document.getElementById('pasteArea');
  const previewImage   = document.getElementById('previewImage');
  const imageDataInput = document.getElementById('imageData');
  const redoButton     = document.getElementById('redoButton');
  const nextButton     = document.getElementById('nextButton');
	

  // Make the paste area focusable and show it's active
  pasteArea.addEventListener('click', function() {
    pasteArea.focus();
    console.log('Paste area clicked');
  });

  // Handle paste on the contenteditable area
  pasteArea.addEventListener('paste', function(e) {
    console.log('Paste event fired');
    e.preventDefault();

    const items = (e.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = function(event) {
          previewImage.src = event.target.result;
          previewImage.style.display = 'block';
          imageDataInput.value = event.target.result;
          
          redoButton.style.display = 'inline-block';
          nextButton.style.display = 'inline-block';
          pasteArea.querySelector('p.paste-instructions').style.display = 'none';
          
          console.log('Image preview loaded');
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
    console.log('No image found in clipboard');
  });

  // Redo button
  redoButton.onclick = function() {
    location.reload();
  };

  // Next button
  nextButton.onclick = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      canvas.width = 400;
      canvas.height = img.height * (400 / img.width);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(function(blob) {
        const reader = new FileReader();
        reader.onload = function(e) {
          localStorage.setItem('tempImageData', e.target.result);
          window.location.href = 'comment.html';
        };
        // JPEG at 70% quality
        reader.readAsDataURL(blob, 'image/jpeg', 0.7);
      }, 'image/jpeg', 0.7);
    };
    
    img.src = imageDataInput.value;
  };
});


