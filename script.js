
const profileImg = document.getElementById("profile-img");
const dropdownMenu = document.getElementById("dropdown");

// Toggle dropdown visibility when hovering over the profile image
profileImg.addEventListener("mouseover", () => {
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

// Hide dropdown if hovered outside
document.addEventListener("mouseout", (event) => {
    if (!profileImg.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = "none";
    }
});
