import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const TeacherLoginForm = ({ onSwitch, onForgot }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string().required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/teachers/login`,
        { ...values, role: "teacher" }, // ✅ Send role in request
        config
      );

      const token = data.token || data.teacher?.token;

     if (token) {
  localStorage.setItem("token", token); // <-- FIXED
  localStorage.setItem("teacherInfo", JSON.stringify(data));
  setSuccess("Logged in successfully!");
  navigate("/teacher-dashboard");
      } else {
        throw new Error("Invalid token received from server.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === "Account not approved by admin") {
        setError("Your account is awaiting admin approval. Please wait for admin to approve.");
      } else {
        setError(msg || "Something went wrong");
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome Back Educator - <span className="text-teal-500">Log in!</span>
      </h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-full max-w-md">
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-1 text-gray-500" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-3 pl-10 border border-teal-600 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-1 text-gray-500" />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full p-3 pl-10 pr-10 border border-teal-600 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-400"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                className="text-teal-500 text-sm hover:underline"
                onClick={onForgot}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-3 rounded-lg font-bold hover:bg-teal-600 transition"
              disabled={isSubmitting || loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Sign up Switch */}
            <p className="text-sm text-gray-600 mt-4 text-center">
              Don't have an account?{" "}
              <button className="text-violet-500 font-bold hover:underline" onClick={onSwitch}>
                Sign Up
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default TeacherLoginForm;
