import React from "react";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropdown";
import "./Header.css";

const Header = () => {
  return (
    <div className="heading">
      <h1>CineVortex</h1>
      <SearchBar />
      <ProfileDropdown />
    </div>
  );
};

export default Header;

