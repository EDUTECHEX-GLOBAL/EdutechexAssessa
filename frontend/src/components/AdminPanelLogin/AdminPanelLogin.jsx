import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "../../WebApp/Warnings/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import adminImage from "./adminpanel-login.jpeg";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/admin/login`,
        { ...values, role: "admin" }, // ✅ Add role (if your backend checks it)
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data));
      
      navigate("/admin-dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === "Account not approved by admin") {
        setError("Your admin account is awaiting approval. Please contact the system administrator.");
      } else {
        setError(msg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-poppins">
      {/* Left Side Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100">
        <img src={adminImage} alt="Admin Login" className="w-full h-full object-cover" />
      </div>

      {/* Right Side Login Form */}
      <div className="flex flex-col items-center justify-center p-8 w-full lg:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
            Secure Admin Login
          </h1>
          <h2 className="text-lg font-medium mb-6 text-center text-blue-500">
            Sign in to your account
          </h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 mb-4 rounded-lg text-center">
              {error}
            </div>
          )}

          {loading ? (
            <Loading />
          ) : (
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="w-full p-3 border border-indigo-500 rounded-lg h-12 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        className="w-full p-3 pr-12 border border-indigo-500 rounded-lg h-12 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2"
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                          size="lg"
                          className="text-gray-600"
                        />
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-900 transition duration-300 mt-6"
                  >
                    Sign In
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
