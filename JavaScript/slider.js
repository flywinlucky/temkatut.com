let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// Clone the first and last slides
const firstSlideClone = slides[0].cloneNode(true);
const lastSlideClone = slides[totalSlides - 1].cloneNode(true);

// Append clones to the container
document.querySelector('.slides').appendChild(firstSlideClone);
document.querySelector('.slides').insertBefore(lastSlideClone, slides[0]);

const newTotalSlides = totalSlides + 2; // Update total slides count

function showSlide(index) {
    const offset = index * -100; // Negative to move slides to the left
    document.querySelector('.slides').style.transform = `translateX(${offset}%)`;
}

// Function to change the slide
function changeSlide() {
    currentIndex++;

    // If we reach the last slide (clone of the first slide)
    if (currentIndex === newTotalSlides - 1) {
        document.querySelector('.slides').style.transition = 'transform 0.5s ease-in-out';
        showSlide(currentIndex);

        // After transition ends, reset to the first slide without animation
        setTimeout(() => {
            document.querySelector('.slides').style.transition = 'none';
            currentIndex = 1;
            showSlide(currentIndex);
        }, 500);
    } else {
        document.querySelector('.slides').style.transition = 'transform 0.5s ease-in-out';
        showSlide(currentIndex);
    }
}

// Show the first image initially
showSlide(currentIndex);

// Change slide every 5 seconds
setInterval(changeSlide, 5000);

// Reset to the first slide without animation on page load
window.addEventListener('load', () => {
    document.querySelector('.slides').style.transition = 'none';
    currentIndex = 1;
    showSlide(currentIndex);
});
