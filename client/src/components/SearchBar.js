import React from "react";

const SearchBar = () => {
  return (
    <div className="search-container">
      <div className="search">
        <span className="material-symbols-outlined">search</span>
        <input className="search-input" type="search" placeholder="Search" />
      </div>
    </div>
  );
};

export default SearchBar;
