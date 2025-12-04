import { FaBars, FaSearch } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { Link } from "react-router-dom";
import AdminNotificationBell from './adminNotificationBell'; // Add this import

export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start md:items-center mb-8">
      <div className="flex items-center w-full md:w-auto">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-all"
        >
          <FaBars className="text-2xl" />
        </button>
        <div className="md:hidden flex-1 ml-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-1 max-w-2xl mx-4">
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Replace the existing bell button with NotificationBell component */}
        <AdminNotificationBell />
        
        <div className="flex items-center space-x-1 group cursor-pointer relative">
          <div className="text-right">
            <p className="font-bold text-gray-800">Admin</p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
          <IoPersonCircleOutline className="text-4xl text-blue-600 transition-transform hover:scale-110" />
          {/* Dropdown Menu */}
          <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-48 hidden group-hover:block">
            <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">Profile</Link>
            <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">Settings</Link>
            <Link to="/logout" className="block px-4 py-2 text-red-500 hover:bg-red-100">Logout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}