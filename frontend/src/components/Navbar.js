import React, { useState, useEffect, useRef } from "react";
import AssessaLogo from "../assets/assessaai_logo2.png";
import Menu from "../assets/Menu.svg";
import Close from "../assets/close.png";
import { FiUser, FiBookOpen, FiBriefcase, FiSettings } from "react-icons/fi";
import MobileNavbar from "./MobileNavbar"; // Import MobileNavbar component
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


const navLinks = [
  { name: "Discover", href: "/" },
  { name: "Vision", href: "/vision" },
  { name: "Features", href: "/features" },
  { name: "Team", href: "/team" },
  { name: "Pricing", href: "/pricing" },
  { name: "FAQs", href: "/faqs" },
];


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setLoginDropdownOpen(false);
  };

  const toggleLoginDropdown = () => {
    setLoginDropdownOpen(!loginDropdownOpen);
  };
  const navigate = useNavigate();

const handleRoleNavigation = (role) => {
  const routeMap = {
    student: "/student-login",
    teacher: "/teacher-login",
    admin: "/adminpanel-login",
  };

  navigate(routeMap[role], { state: { role } });
  setLoginDropdownOpen(false); // Close dropdown after clicking
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 lg:container lg:mx-auto lg:px-20">
        <div className="flex items-center gap-x-5">
          <a href="/" aria-label="Home" className="mr-4">
            <img className="w-[100px]" src={AssessaLogo} alt="Assessa Logo" />
          </a>
          <div className="hidden lg:flex gap-x-8 ml-8">
            {navLinks.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="text-[#36485C] font-medium hover:text-[#4b5fde] transition duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex items-center gap-x-4 relative">
          {/* Login Button with Modern Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleLoginDropdown}
              className="hidden lg:flex items-center gap-2 font-medium text-[#ad2ec7] border border-[#ad2ec7] px-5 py-2 rounded-full transition duration-300 hover:bg-[#ad2ec7] hover:bg-opacity-20 hover:text-[#ad2ec7]"
            >
              <FiUser className="text-lg" />
              Login / Signup
            </button>

            {loginDropdownOpen && (
              <div className="absolute left-10 mt-3 w-72 bg-white backdrop-blur-lg bg-opacity-80 shadow-xl rounded-xl p-4 border border-gray-200 transform transition-all duration-300">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Continue as:
                </h3>

                <div className="flex flex-col space-y-3">
                <div
                  onClick={() => handleRoleNavigation("student")}
                  className="cursor-pointer flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:shadow-md hover:scale-[1.02] transition transform"
                >

                    <div className="p-2 bg-blue-500 text-white rounded-full">
                      <FiBookOpen className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Student</p>
                      <p className="text-sm text-gray-500">
                        Access learning materials & resources
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleRoleNavigation("teacher")}
                    className="cursor-pointer flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 hover:shadow-md hover:scale-[1.02] transition transform"
                  >

                    <div className="p-2 bg-green-500 text-white rounded-full">
                      <FiBriefcase className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Teacher</p>
                      <p className="text-sm text-gray-500">
                        Manage courses and student progress
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleRoleNavigation("admin")}
                    className="cursor-pointer flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-100 hover:shadow-md hover:scale-[1.02] transition transform"
                  >

                    <div className="p-2 bg-red-500 text-white rounded-full">
                      <FiSettings className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Admin-Panel</p>
                      <p className="text-sm text-gray-500">
                        Manage platform users and settings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Request Call Back Button */}
          <Link
            to="/contact"
            className="hidden lg:block font-medium text-white bg-[#1a191a] px-5 py-2 rounded-full transition duration-300 hover:bg-[#2c3b4e]"
          >
            Request Call Back
          </Link>

          {/* Mobile Menu Icon */}
          <div className="lg:hidden" onClick={toggleMenu}>
            <img
              src={menuOpen ? Close : Menu}
              alt="Menu Button"
              width={30}
              height={30}
              className="cursor-pointer transition-transform duration-300 transform hover:scale-110"
            />
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </nav>
  );
};

export default Navbar;
