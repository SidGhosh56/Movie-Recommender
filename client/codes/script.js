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

// Manual controls (Remove or comment if no longer needed)
document.getElementById("next")?.addEventListener("click", nextSlide);
document.getElementById("prev")?.addEventListener("click", prevSlide);

// Auto slide
function startSlideShow() {
    slideInterval = setInterval(nextSlide, 10000);
}

function stopSlideShow() {
    clearInterval(slideInterval);
}

startSlideShow();

// Sidebar Toggle Code
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.querySelector('.overlay');

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open"); // Toggles the sidebar visibility
    overlay.classList.toggle('show'); // Toggles the overlay visibility
});

// Close sidebar if clicking outside of sidebar or menuToggle
document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !sidebar.contains(e.target)) {
        sidebar.classList.remove("open");
        overlay.classList.remove('show');
    }
});

// Prevent the sidebar from closing when clicking inside
sidebar.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click from propagating to the document
});
