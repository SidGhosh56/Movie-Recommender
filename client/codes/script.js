const profileImg = document.getElementById("profile-img");
const dropdownMenu = document.getElementById("dropdown");
const profileContainer = document.querySelector(".profile");

profileContainer.addEventListener("mouseenter", () => {
    dropdownMenu.style.display = "block";
});

profileContainer.addEventListener("mouseleave", () => {
    dropdownMenu.style.display = "none";
});

const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Manual controls
document.getElementById("next").addEventListener("click", nextSlide);
document.getElementById("prev").addEventListener("click", prevSlide);

// Auto slide
function startSlideShow() {
    slideInterval = setInterval(nextSlide, 15000);
}

function stopSlideShow() {
    clearInterval(slideInterval);
}

const slider = document.getElementById("slider");
slider.addEventListener("mouseenter", stopSlideShow);
slider.addEventListener("mouseleave", startSlideShow);

startSlideShow();

