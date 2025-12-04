import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  let isAuthenticated = false;

  if (role === "admin") {
    isAuthenticated = !!localStorage.getItem("adminInfo");
    if (!isAuthenticated) return <Navigate to="/adminpanel-login" replace />;
  }

  if (role === "teacher") {
    isAuthenticated = !!localStorage.getItem("teacherInfo");
    if (!isAuthenticated) return <Navigate to="/teacher-login" replace />;
  }

  if (role === "student") {
    isAuthenticated = !!localStorage.getItem("userInfo");
    if (!isAuthenticated) return <Navigate to="/student-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
