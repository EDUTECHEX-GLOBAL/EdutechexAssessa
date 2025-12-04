const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");
const Teacher = require("../models/webapp-models/teacherModel");
const Admin = require("../models/webapp-models/adminModel"); // ✅ Add this import

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded._id; // This matches your generateToken payload
      // ✅ Check ALL models: Admin, Userwebapp, and Teacher
      const admin = await Admin.findById(decoded._id).select("-password");
      const user = await Userwebapp.findById(decoded._id).select("-password");
      const teacher = await Teacher.findById(decoded._id).select("-password");

      if (admin) {
        req.user = admin;
        req.user.role = "admin"; // ✅ Explicitly set role for admin
      } else if (user) {
        req.user = user;
        // user.role remains whatever it is (student/default)
      } else if (teacher) {
        req.user = teacher;
        // teacher.role remains whatever it is
      } else {
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// ✅ admin middleware - NO CHANGES HERE
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};

module.exports = { protect, admin };