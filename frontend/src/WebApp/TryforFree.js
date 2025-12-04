import React from "react";
import { useNavigate } from "react-router-dom";
import Assessalogo from "../assets/assessaai_logo2.png";

const TryforFree = () => {
  const navigate = useNavigate();

  const handleOptionClick = (path) => {
    const absolutePath = `${window.location.origin}${path}`; // Construct full URL
    window.open(absolutePath, "_blank"); // Open in new tab
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        textAlign: "center",
        padding: "10px",
        fontFamily: "'Poppins', sans-serif",
        color: "#333",
      }}
    >
      <img
        src={Assessalogo}
        style={{ width: "150px", height: "auto" , marginBottom:"20px" }}
        alt="Assessa AI Logo"
      />

      {/* <h1
        style={{
          marginBottom: "20px",
          fontWeight: "700",
          color: "#004d40",
          fontSize: "2.5rem",
        }}
      >
        Try for Free
      </h1> */}
      <h2
        style={{
          marginBottom: "30px",
          color: "#00796b",
          fontSize: "1.0rem",
        }}
      >
        Choose how you'd like to continue:
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "450px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* AI-Enhanced Educational Resources Button */}
        <button
          style={{
            backgroundColor: "#7F56D9", // Purple theme
            color: "#fff",
            border: "none",
            padding: "15px 25px",
            fontWeight: "600",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            outline: "none",
          }}
          // onClick={() => handleOptionClick("/study-assistant")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          📚 AI-Enhanced Educational Resources
        </button>

        {/* AI-Powered Study Recommendations Button */}
        <button
          style={{
            backgroundColor: "#009688", // Teal theme
            color: "#fff",
            border: "none",
            padding: "15px 25px",
            fontWeight: "600",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            outline: "none",
          }}
          // onClick={() => handleOptionClick("/study-recommendation")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🤖 AI-Powered Study Recommendations
        </button>
      </div>
    </div>
  );
};

export default TryforFree;