import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const SignupForm = ({ onSwitch }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { confirmPassword, ...formData } = values; // remove confirmPassword
      const { data } = await axios.post("/api/users/register", formData);
      console.log("Signup Successful:", data);
      alert("Signup successful! Please wait for admin approval.");
      onSwitch(); // Switch to login
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Signup failed. Try again.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Smarter Path Begins – <span className="text-purple-600">Sign Up!</span>
      </h2>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <Formik
        initialValues={{
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "student", // ✅ Add this!
          pic: "",         // ✅ Add this too (optional profile pic)
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-full max-w-md">
            {/* Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="w-full p-3 pl-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-3 pl-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  className="w-full p-3 pl-10 pr-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="w-full p-3 pl-10 pr-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
            </div>

            {/* Hidden Role Field (student) */}
            <Field type="hidden" name="role" />

            {/* Optional Profile Pic */}
            <Field type="hidden" name="pic" value="https://example.com/default-pic.png" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-500 text-white p-3 rounded-lg font-bold hover:bg-purple-600 transition"
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>

            <p className="text-sm text-gray-600 mt-4 text-center">
              Already have an account?{" "}
              <button className="text-teal-500 font-bold hover:underline" onClick={onSwitch}>
                Login
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default SignupForm;
