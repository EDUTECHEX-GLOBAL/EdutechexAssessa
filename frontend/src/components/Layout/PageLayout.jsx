// src/components/PageLayout.jsx
import React from "react";

const PageLayout = ({ children }) => {
  return (
    <div className="lg:container lg:mx-auto px-5 lg:px-20 py-16">
      {children}
    </div>
  );
};

export default PageLayout;
