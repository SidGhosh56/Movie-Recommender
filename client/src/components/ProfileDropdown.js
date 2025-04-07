import React, { useState, useRef, useEffect } from "react";

const ProfileDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="profile" ref={profileRef} onClick={() => setShowDropdown(!showDropdown)}>
      <img
        id="profile-img"
        src="https://cdn-icons-png.flaticon.com/512/6522/6522516.png"
        alt="profile"
      />
      {showDropdown && (
        <div id="dropdown" className="dropdown-menu">
          <ul>
            <li>Profile</li>
            <li>Settings</li>
            <li>Logout</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
