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
    slideInterval = setInterval(nextSlide, 40000);
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


document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId"); // Make sure this exists

  if (!userId) {
    console.error("No user ID found.");
    return;
  }

  loadUserData(userId);

});

function loadUserData(userId) {
  fetch(`http://localhost:5000/api/users/${userId}`)
    .then(response => response.json())
    .then(user => {
      // Fill in email and username
      document.getElementById("email-input").value = user.email;
      document.getElementById("username-input").value = user.username;

      // Display favorite movies
      const favList = document.getElementById("favorite-movie-list");
      favList.innerHTML = ''; // clear existing

      if (user.favoriteMovies.length === 0) {
        favList.innerHTML = '<li>No favorite movies yet.</li>';
      } else {
        user.favoriteMovies.forEach(movie => {
          const li = document.createElement("li");
          li.textContent = movie.title;
          favList.appendChild(li);
        });
      }
    })
    .catch(error => {
      console.error("Failed to load user data:", error);
    });
}

function saveChanges(userId) {
  const updatedEmail = document.getElementById("email-input").value;
  const updatedUsername = document.getElementById("username-input").value;

  fetch(`http://localhost:5000/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: updatedEmail,
      username: updatedUsername
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("save-status").textContent = "Changes saved successfully!";
    })
    .catch(error => {
      console.error("Failed to save changes:", error);
      document.getElementById("save-status").textContent = "Failed to save changes.";
    });
}

//PROFILE 
const editBtn = document.getElementById('edit-profile-btn');
const saveBtn = document.getElementById('save-profile-btn');
const bioInput = document.getElementById('user-bio');
const genresInput = document.getElementById('user-genres');

// Disable inputs by default
bioInput.disabled = true;
genresInput.disabled = true;

editBtn.addEventListener('click', () => {
  bioInput.disabled = false;
  genresInput.disabled = false;
  saveBtn.style.display = 'inline-block';
  editBtn.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
  bioInput.disabled = true;
  genresInput.disabled = true;
  editBtn.style.display = 'inline-block';
  saveBtn.style.display = 'none';

  // Simulate save action
  alert('Profile updated!');
});

document.addEventListener('DOMContentLoaded', () => {
  const daySelect = document.getElementById('dob-day');
  const monthSelect = document.getElementById('dob-month');
  const yearSelect = document.getElementById('dob-year');

  // Populate days (1-31)
  for (let d = 1; d <= 31; d++) {
    const option = document.createElement('option');
    option.value = d;
    option.textContent = d;
    daySelect.appendChild(option);
  }

  // Populate months (January to December)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;  // Month starts from 1 (January = 1)
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Populate years (from current year back to 1900)
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1900; y--) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }
});

document.getElementById("darkmode-toggle").addEventListener("change", function () {
  document.body.classList.toggle("dark-mode", this.checked);
});
