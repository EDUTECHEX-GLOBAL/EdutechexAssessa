import React, { useState } from "react";
import Close from "../assets/close.png";
import { FiBookOpen, FiBriefcase, FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Discover", href: "/" },
  { name: "Vision", href: "/vision" },
  { name: "Features", href: "/features" },
  { name: "Team", href: "/team" },
  { name: "Pricing", href: "/pricing" },
  { name: "FAQs", href: "/faqs" },
];


const MobileNavbar = ({ menuOpen, setMenuOpen }) => {
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  const closeMenuAndNavigate = (url) => {
    setMenuOpen(false);
    window.location.href = url;
  };

  const closeMenuAndScroll = (href) => {
    setMenuOpen(false);
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const toggleLoginDropdown = () => {
    setLoginDropdownOpen(!loginDropdownOpen);
  };

  return (
    <div
      className={`${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      } fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-5 z-50 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex justify-end w-full p-4">
        <img
          src={Close}
          alt="Close Menu"
          onClick={() => setMenuOpen(false)}
          width={30}
          height={30}
          className="cursor-pointer transition-transform duration-300 transform hover:scale-110"
        />
      </div>
      {navLinks.map((item, index) => (
        <Link
          key={index}
          to={item.href}
          className="text-[#36485C] font-medium hover:text-[#4b5fde] transition duration-300"
        >
          {item.name}
        </Link>
      ))}

      {/* Mobile Login Dropdown */}
      <button
        onClick={toggleLoginDropdown}
        className="font-medium text-[#ad2ec7] border border-[#ad2ec7] px-6 py-3 rounded-full transition duration-300 hover:bg-[#ad2ec7] hover:bg-opacity-20 hover:text-[#ad2ec7] text-2xl"
      >
        Login / Signup
      </button>

      {/* Mobile Login Dropdown (Same as Desktop) */}
     {/* Mobile Login Dropdown (Same as Desktop) */}
               {loginDropdownOpen && (
                 <div className="w-72 bg-white shadow-xl rounded-xl p-4 border border-gray-200 transition-all duration-300 z-50">
                   <h3 className="text-gray-600 text-sm font-semibold mb-2">
                     Continue as:
                   </h3>
     
                   <div className="flex flex-col space-y-3">
                     <a
                       href="/student-login"
                       onClick={() => closeMenuAndNavigate("/student-login")}
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                     >
                       <FiBookOpen className="text-lg text-blue-500" />
                       <span className="font-medium text-gray-700">Student</span>
                     </a>
                     <a
                       href="/teacher-login"
                       onClick={() => closeMenuAndNavigate("/teacher-login")}
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                     >
                       <FiBriefcase className="text-lg text-green-500" />
                       <span className="font-medium text-gray-700">Teacher</span>
                     </a>
                     <a
                       href="/adminpanel-login"
                       onClick={() => closeMenuAndNavigate("/adminpanel-login")}
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                     >
                       <FiSettings className="text-lg text-red-500" />
                       <span className="font-medium text-gray-700">Admin-Panel</span>
                     </a>
                   </div>
                 </div>
               )}

      {/* Mobile Request Call Back Button */}
      <Link
        to="/contact"
        onClick={() => setMenuOpen(false)}
        className="text-white bg-[#1a191a] px-6 py-3 rounded-full transition duration-300 hover:bg-[#2c3b4e] text-2xl"
      >
        Request Call Back
      </Link>
    </div>
  );
};

export default MobileNavbar;
