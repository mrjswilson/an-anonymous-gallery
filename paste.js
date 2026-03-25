nextButton.onclick = function() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = function() {
    const targetWidth = 400;
    const targetHeight = Math.round(img.height * (targetWidth / img.width));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(function(blob) {
      const reader = new FileReader();
      reader.onload = function(e) {
        localStorage.setItem('tempImageData', e.target.result);
        window.location.href = 'comment.html';
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.7);
  };

  img.src = imageDataInput.value;
};
