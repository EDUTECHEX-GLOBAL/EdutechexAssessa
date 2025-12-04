import React, { useState } from "react";
import AssessaLogo from "../assets/assessaai_logo2.png";
import TwitterXLogo from "../assets/twitter.png"; // Import your Twitter X image
import { FaFacebookF, FaYoutube, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
  };

  return (
    <footer className="bg-white text-gray-800 mt-10 py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Footer Logo */}
          <div className="flex items-start justify-center md:justify-start md:col-span-1">
            <a href="#">
              <img src={AssessaLogo} alt="Assessa Logo" width={100} height={50} />
            </a>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-1">
            <h5 className="font-semibold mb-4">Contact Details</h5>
            <p className="mt-2">
              Email:{" "}
              <a href="mailto:info@assessa.com" className="text-blue-500 hover:underline">
                info@assessa.com
              </a>
            </p>
          </div>

          {/* Useful Links */}
          <div className="md:col-span-1">
            <h5 className="font-semibold mb-4">Useful Links</h5>
            <ul className="space-y-2">
              {["About Assessa", "Visa Information", "Immigration FAQ", "Contact Us"].map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-gray-600">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="md:col-span-1">
            <h5 className="font-semibold mb-4">Stay Informed</h5>
            <p className="text-sm text-gray-800 mb-4">
              Subscribe to our newsletters to get the latest news and updates
            </p>
            <form className="flex flex-col gap-4" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                className="py-2 px-3 text-sm text-gray-800 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center mt-8 space-x-6">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition">
            <FaFacebookF size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src={TwitterXLogo} alt="Twitter X" className="w-5 h-5 hover:opacity-80 transition" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition">
            <FaYoutube size={24} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-800 transition">
            <FaLinkedinIn size={24} />
          </a>
        </div>

        {/* Copyright Text */}
        <div className="mt-8 text-center text-sm text-gray-800">
          <p>&copy; 2024 Assessa. All Rights Reserved</p>
          <p>
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <span className="mx-1">|</span>
            <a href="#" className="hover:text-gray-600">Terms and Conditions</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
