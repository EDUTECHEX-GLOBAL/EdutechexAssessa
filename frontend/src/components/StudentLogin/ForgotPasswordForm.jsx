import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/forgot-password/send-otp`,
        { email }
      );

      setStep(2);
      setSuccess("OTP sent successfully! Please check your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/forgot-password/verify-otp`,
        { email, otp }
      );

      setStep(3);
      setSuccess("OTP verified successfully! Please enter your new password.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/forgot-password/reset-password`,
        { email, otp, newPassword }
      );
  
      setSuccess("Password reset successfully! Redirecting to login...");
  
      setTimeout(() => {
        window.location.href = "/student-login";  // ✅ Redirecting to student login
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-16">Get Back Into Your Account</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      {/* Step 1: Email Input */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="w-full max-w-lg">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-1 text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full max-w-lg p-3 pl-10 border rounded-lg focus:outline-none  focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600 transition"
          >
            Send OTP
          </button>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Remembered?{" "}
            <button
              className="text-red-500 font-bold hover:underline"
              onClick={onSwitch}
            >
              Login
            </button>
          </p>
        </form>
      )}

      {/* Step 2: OTP Input */}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="w-full max-w-lg">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter the OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full max-w-lg p-3 pl-10 border rounded-lg focus:outline-none  focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600 transition"
          >
            Verify OTP
          </button>
        </form>
      )}

      {/* Step 3: New Password Input */}
      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-lg">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-2 text-gray-500" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full max-w-lg p-3 pl-10 border rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-2 text-gray-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full max-w-lg p-3 pl-10 border rounded-lg focus:outline-none  focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600 transition"
          >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
