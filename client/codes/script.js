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


//SURPRISE ME


//SETTINGS
document.getElementById("save-btn").addEventListener("click", () => {
  const email = document.getElementById("email-input").value;
  const username = document.getElementById("username-input").value;
  const darkMode = document.getElementById("darkmode-toggle").checked;
  const emailNotif = document.getElementById("email-notif").checked;
  const smsNotif = document.getElementById("sms-notif").checked;

  // Placeholder for saving logic
  console.log("Settings saved:", {
    email,
    username,
    darkMode,
    emailNotif,
    smsNotif
  });

  const status = document.getElementById("save-status");
  status.textContent = "Settings saved successfully!";
  setTimeout(() => (status.textContent = ""), 3000);
});


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

/*document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();  // Prevent default form submission

  // Get values from the form inputs
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate the form fields (you can add more checks)
  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  // Prepare the data to be sent to the server
  const userData = {
    username,
    email,
    password,
    confirmPassword
  };

  try {
    // Send a POST request to the backend API to register the user
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Parse the JSON response from the backend
    const data = await response.json();

    if (response.ok) {
      // Registration successful, show a message or redirect to login
      alert('User registered successfully!');
      window.location.href = 'prefer.html'; // Redirect to login page
    } else {
      // Show any error message from the backend
      alert(data.message || 'Registration failed!');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('An error occurred. Please try again later.');
  }
});*/

async function loadWatchedMovies() {
    const container = document.getElementById('watched-movies-list');
    try {
        const response = await fetch('http://localhost:3000/api/users/tracker', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch watched movies');

        const data = await response.json();

        if (!data.watchedMovies || data.watchedMovies.length === 0) {
            container.innerHTML = '<p class="no-data">You haven\'t tracked any movies yet. Start watching to see your stats!</p>';
            return;
        }

        container.innerHTML = '';
        data.watchedMovies.forEach(item => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `
                <img src="${item.poster_url}" alt="${item.title}" style="width:150px; height:auto; border-radius:10px;" />
                <h4>${item.title}</h4>
                <p>Watched on: ${new Date(item.watchedAt).toLocaleDateString()}</p>
                <hr>
            `;
            container.appendChild(movieItem);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="no-data">Failed to load watched movies.</p>';
    }
}

// Load the watched movies when the page loads
document.addEventListener('DOMContentLoaded', loadWatchedMovies);

