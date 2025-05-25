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
const surpriseBtn = document.getElementById("surpriseBtn");
const anotherBtn = document.getElementById("anotherBtn");
const movieCard = document.getElementById("movie-card");

surpriseBtn.addEventListener("click", fetchRandomMovie);
anotherBtn.addEventListener("click", fetchRandomMovie);

async function fetchRandomMovie() {
    try {
        const res = await fetch("http://localhost:3000/api/movies/random");
        const movie = await res.json();

        document.getElementById("movie-poster").src = movie.poster_url;
        document.getElementById("movie-title").textContent = movie.title;
        document.getElementById("movie-genre").textContent = movie.genres;
        document.getElementById("movie-description").textContent = movie.overview;

        movieCard.style.display = "block";
        document.getElementById("surpriseBtn").style.display = "none";
        
    } catch (err) {
        alert("Failed to fetch movie. Is the backend running?");
    }
}



//WATCHLIST
let watchlistHtml = ''
let watchlistArr = JSON.parse(localStorage.getItem('watchlist') || "[]")

render()

document.addEventListener('click', (e)=>{
    if(e.target.dataset.id){
        console.log(e.target.dataset.id)
        watchlistArr = watchlistArr.filter(movie => movie.imdbID !== e.target.dataset.id)
        console.log(watchlistArr)
        localStorage.setItem('watchlist', JSON.stringify(watchlistArr))
        render()
    }

})

function updateWatchlistHtml(movie){
    watchlistHtml += `
                    <div class="movie">
                        <div class="movie-poster">
                            <img src=${movie.Poster}  alt="movie-poster"> 
                        </div>
                        <div class="movie-body">
                            <div class="movie-data">
                                <h2 class="movie-title">${movie.Title}</h2>
                                <p class="movie-rating">⭐${movie.imdbRating}</p>
                            </div>
                            <div class="movie-details">
                                <p class="movie-runtime">${movie.Runtime}</p>
                                <p class="movie-genres">${movie.Genre}</p>
                                <button class="add-remove-btn" data-id=${movie.imdbID}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="https://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM5 7C4.44772 7 4 7.44772 4 8C4 8.55228 4.44772 9 5 9H11C11.5523 9 12 8.55229 12 8C12 7.44772 11.5523 7 11 7H5Z" fill="white"/>
                                    </svg>
                                    Remove
                                </button>
                            </div>
                            <p class="movie-description">
                                ${movie.Plot}
                            </p>
                        </div>
                    </div>
                    <hr>
    
     `
}

function render(){
    watchlistHtml = '';
    if(watchlistArr.length){
        watchlistArr.forEach(movie => {
            updateWatchlistHtml(movie);
        });
        renderWatchlist();
    } else {
        renderWatchlistApology();
    }
}


function renderWatchlist(){
    document.getElementById('watchlist-container').innerHTML = watchlistHtml
}

function renderWatchlistApology(){
    document.getElementById('watchlist-container').innerHTML = `
                <div class="body-wrapper">
                    <h2 class="no-data">Your watchlist is looking a little empty...</h2>
                    <a href="project.html" class="page-nav" style="text-decoration: none; display: flex; align-items: center; gap: 8px;">
                        <img id="plus-img" src="https://img.icons8.com/m_sharp/512/228BE6/plus--v2.png" style="width: 20px; height: 20px;">    
                        Let's add some movies!
                    </a>

                </div>
    `
}


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

document.getElementById('register-form').addEventListener('submit', async (e) => {
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
      window.location.href = 'login.html'; // Redirect to login page
    } else {
      // Show any error message from the backend
      alert(data.message || 'Registration failed!');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('An error occurred. Please try again later.');
  }
});
