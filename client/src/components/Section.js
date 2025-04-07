import React from 'react';

const Section = ({ title, content }) => {
  return (
    <div className="section-1">
      <h2>{title}</h2>
      <pre>{content}</pre>
    </div>
  );
};

export default Section;