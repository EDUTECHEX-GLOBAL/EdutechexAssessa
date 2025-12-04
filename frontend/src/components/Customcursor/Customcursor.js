import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
  const cursorSize = 40; // Outer circle size
  const dotSize = 10; // Inner dot size

  // Define colors directly in hex format
  const circleColor = "#1f618d "; // Blue
  const dotColor = "#3498db "; // Red

  // Motion values for cursor position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth animation effect
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Smooth outer circle */}
      <motion.div
        className="cursor-circle"
        style={{
          position: "fixed",
          width: `${cursorSize}px`,
          height: `${cursorSize}px`,
          borderRadius: "50%",
          border: `2px solid ${circleColor}`, // Using hex color
          left: smoothX,
          top: smoothY,
          translateX: `-50%`,
          translateY: `-50%`,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {/* Small dot following exactly */}
      <motion.div
        className="cursor-dot"
        style={{
          position: "fixed",
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: "50%",
          backgroundColor: dotColor, // Using hex color
          left: mouseX,
          top: mouseY,
          translateX: `-50%`,
          translateY: `-50%`,
          pointerEvents: "none",
          zIndex: 10000,
        }}
      />
    </>
  );
};

export default CustomCursor;
