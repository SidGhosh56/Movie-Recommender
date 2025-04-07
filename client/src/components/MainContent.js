import React, { useEffect, useState } from 'react';
import Section from './Section';

const MainContent = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/movies")
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        console.log("Movies:", data);
      });
  }, []);

  return (
    <div className="main-content">
      <Section title="Slider" content={"This could show featured movies."} />
      <Section title="User Taste" content={"Recommended based on your history."} />
      <Section title="Others" content={JSON.stringify(movies.slice(0, 3), null, 2)} />
    </div>
  );
};

export default MainContent;
