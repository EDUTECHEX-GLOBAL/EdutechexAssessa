import React, { useEffect, useState, lazy, useMemo, Suspense } from "react";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaEye,
  FaCog,
  FaUsers,
  FaDollarSign,
  FaQuestionCircle,
  FaEnvelope,
  FaSpinner,
  FaBars,
} from "react-icons/fa";
import AssessaLogo from "../../assets/assessaai_logo2.png";

// Lazy-loaded components
const AdminDiscover = lazy(() => import("./AdminDiscover"));
const AdminVision = lazy(() => import("./AdminVision"));
const AdminFeatures = lazy(() => import("./AdminFeatures"));
const AdminTeam = lazy(() => import("./AdminTeam"));
const AdminPricing = lazy(() => import("./AdminPricing"));
const AdminFaqs = lazy(() => import("./AdminFaqs"));
const AdminContact = lazy(() => import("./AdminContact"));

// Loader component for suspense fallback
const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <FaSpinner className="animate-spin text-4xl text-blue-500" />
  </div>
);

const Admin = () => {
  const { assessaData } = useSelector((state) => state.root);
  const [selectedTab, setSelectedTab] = useState("Discover");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { label: "Discover", component: <AdminDiscover />, icon: <FaHome /> },
      { label: "Vision", component: <AdminVision />, icon: <FaEye /> },
      { label: "Features", component: <AdminFeatures />, icon: <FaCog /> },
      { label: "Team", component: <AdminTeam />, icon: <FaUsers /> },
      { label: "Pricing", component: <AdminPricing />, icon: <FaDollarSign /> },
      { label: "FAQs", component: <AdminFaqs />, icon: <FaQuestionCircle /> },
      { label: "Contact", component: <AdminContact />, icon: <FaEnvelope /> },
    ],
    []
  );

  const handleTabSelect = (label) => {
    setSelectedTab(label);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/admin-login";
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center">
            <img
              src={AssessaLogo}
              alt="Assessa Logo"
              className="w-28 h-auto md:w-20 md:h-auto mr-6"
            />
            <span className="text-gray-800 text-base md:text-xl font-semibold">
              Admin Panel
            </span>
          </div>
          <span
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/admin-login";
            }}
            className="text-red-700 text-base md:text-xl font-semibold cursor-pointer hover:underline"
          >
            Logout
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-gray-800 text-gray-200 fixed inset-y-0 left-0 z-50 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 w-60 py-6 shadow-lg`}
        >
          <div className="flex justify-end px-4 mb-6 md:hidden">
            <FaBars
              className="cursor-pointer text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          <ul>
            {navItems.map((item, index) => (
              <li
                key={index}
                className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-700 transition ${
                  selectedTab === item.label ? "bg-gray-900" : ""
                }`}
                onClick={() => {
                  handleTabSelect(item.label);
                  setSidebarOpen(false); // Close sidebar after selection on mobile
                }}
              >
                <span className="mr-2 text-lg">{item.icon}</span>
                <span className="ml-2 text-md font-medium">{item.label}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-white overflow-y-auto shadow-inner">
          <div className="md:hidden flex justify-end px-4 mb-6">
            <FaBars
              className="cursor-pointer text-gray-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          <Suspense fallback={<Loader />}>
            {navItems.map((item) =>
              item.label === selectedTab ? (
                <div key={item.label} className="mb-4">
                  {item.component}
                </div>
              ) : null
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default React.memo(Admin);
