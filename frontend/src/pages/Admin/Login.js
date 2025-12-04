import React, { useState } from "react";
import { useDispatch } from "react-redux";
import AssessaLogo from "../../assets/assessaai_logo2.png";
import axios from "axios";
import { message } from "antd";
import { ShowLoading, HideLoading } from "../../redux/rootSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login();
  };

  const login = async () => {
    try {
      dispatch(ShowLoading());
      const response = await axios.post("/api/skillnaav/admin-login", user);
      dispatch(HideLoading());

      if (response.data.success) {
        message.success(response.data.message);
        localStorage.setItem("token", JSON.stringify(response.data));
        window.location.href = "/admin"; // Redirect to admin page on successful login
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response.data.message || error.message);
      dispatch(HideLoading());
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-96 p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-8">
          <img src={AssessaLogo} alt="logo" className="w-36 h-25" />
        </div>
        <h1 className="text-2xl text-center text-red-700 mb-8 font-semibold">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-semibold"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={user.username}
              onChange={(e) =>
                setUser({ ...user, username: e.target.value.trim() })
              }
              placeholder="Enter your username"
              className="px-4 py-3 rounded-lg border border-gray-300 w-full focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder="Enter your password"
                className="px-4 py-3 rounded-lg border border-gray-300 w-full focus:outline-none focus:border-blue-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 pt-5 flex justify-center items-center text-gray-500"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:bg-red-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
