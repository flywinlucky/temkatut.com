function generateJSON() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value; // Get email value
  const photoInput = document.getElementById('photoInput');
  const photoFile = photoInput.files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email); // Add email to form data
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  // Determine the server URL based on the environment
  const serverUrl = window.location.hostname === "localhost"
    ? "http://localhost:5000/place-order"
    : "https://gifthouse.pro/PV-Games/place-order";

  // Send the data directly to the server
  fetch(serverUrl, {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(serverResponse => {
    if (serverResponse.message) {
      showNotification(serverResponse.message, 'success');
    } else {
      showNotification('Error: ' + serverResponse.error, 'error');
    }
  })
  .catch(error => {
    showNotification('Error: ' + error.message, 'error');
  });
}

let canvas = document.getElementById('photoCanvas');
let ctx = canvas.getContext('2d');
let img = new Image();
let scale = 1;
let rotation = 0;
let offsetX = 0, offsetY = 0;
let isDragging = false;
let startX, startY;
let flipHorizontal = false;

canvas.width = 380;
canvas.height = 380;

// Adjust overlay image size and position to match canvas dimensions
const overlayImage = document.getElementById('overlayImage');
function updateOverlaySize() {
  overlayImage.style.width = `${canvas.width}px`;
  overlayImage.style.height = `${canvas.height}px`;
  overlayImage.style.top = `${canvas.offsetTop}px`;
  overlayImage.style.left = `${canvas.offsetLeft}px`;
}
updateOverlaySize();

// Call updateOverlaySize whenever the canvas size or position changes
window.addEventListener('resize', updateOverlaySize);

function previewPhoto() {
  const file = document.getElementById('photoInput').files[0];
  const reader = new FileReader();
  reader.onloadend = function () {
    img.src = reader.result;
    img.onload = () => drawImage();
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}

function drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale * (flipHorizontal ? -1 : 1), scale);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
  updateDebugInfo();

  // Ensure the overlay image is visible above the canvas
  const overlayImage = document.getElementById('overlayImage');
  overlayImage.style.display = 'block';
}

function rotateImage(angle) {
  rotation += angle;
  drawImage();
}

function zoomImage(factor) {
  scale *= factor;
  drawImage();
}

function flipPhoto() {
  flipHorizontal = !flipHorizontal;
  drawImage();
}

function resetTransformations() {
  scale = 1;
  rotation = 0;
  offsetX = 0;
  offsetY = 0;
  flipHorizontal = false;
  drawImage();
  updateDebugInfo();
}

function updateDebugInfo() {
  const debugInfo = document.getElementById('debugInfo');
  debugInfo.textContent = `Debug Info: Zoom ${scale.toFixed(2)}, Rotate ${rotation}°, Flip ${flipHorizontal ? 'On' : 'Off'}`;
}

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.offsetX - offsetX;
  startY = e.offsetY - offsetY;
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    offsetX = e.offsetX - startX;
    offsetY = e.offsetY - startY;
    drawImage();
  }
});

canvas.addEventListener('mouseup', () => (isDragging = false));
canvas.addEventListener('mouseleave', () => (isDragging = false));

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.touches[0].clientX - rect.left - offsetX;
    startY = e.touches[0].clientY - rect.top - offsetY;
  }
});

canvas.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches.length === 1) {
    const rect = canvas.getBoundingClientRect();
    offsetX = e.touches[0].clientX - rect.left - startX;
    offsetY = e.touches[0].clientY - rect.top - startY;
    drawImage();
  }
});

canvas.addEventListener('touchend', () => (isDragging = false));
canvas.addEventListener('touchcancel', () => (isDragging = false));

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  zoomImage(zoomFactor);
});

let lastTouchEnd = 0;
let initialPinchDistance = null;
let initialScale = scale;
let initialPinchAngle = null;
let initialRotation = rotation;

// Disable double-tap zoom on mobile
document.addEventListener('touchend', (e) => {
  const now = new Date().getTime();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Handle pinch-to-zoom gestures
canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    const currentAngle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    );

    if (initialPinchDistance === null) {
      initialPinchDistance = currentDistance;
      initialScale = scale;
      initialPinchAngle = currentAngle;
      initialRotation = rotation;
    } else {
      const scaleFactor = currentDistance / initialPinchDistance;
      scale = initialScale * scaleFactor;

      const angleDifference = (currentAngle - initialPinchAngle) * (180 / Math.PI);
      rotation = initialRotation + angleDifference;

      drawImage();
    }
  }
});

canvas.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    initialPinchDistance = null;
    initialScale = scale;
    initialPinchAngle = null;
    initialRotation = rotation;
  }
});

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification ' + type;
  notification.style.display = 'block';
}
