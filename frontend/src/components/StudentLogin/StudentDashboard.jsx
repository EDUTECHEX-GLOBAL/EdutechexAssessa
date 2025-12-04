import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FaHome, FaBook, FaChartBar, FaTasks, FaSignOutAlt, FaBars, FaBell, FaSearch, FaRobot, FaTimes
} from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdSchool, MdQuiz, MdMenuBook, MdFeedback } from 'react-icons/md';
import assessalogo from "./logo.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import Progress from "./Progress";
import StudentFeedback from './StudentFeedback';
import AssessmentsPage from './AssessmentsPage';
import UserProfile from './UserProfile';
import StudentStudyPlan from './StudentStudyPlan';
import StudentDashboardBot from './studentdashboardbot';
import { Modal, Button } from "antd";
import SatStudentStudyPlan from "./SatStudentStudyPlan"; 
import SatStudentFeedback from './SatStudentFeedback';
import SatProgress from './SatProgress';
import SubscriptionBadge from './SubscriptionBadge'; // ✅ ADD THIS IMPORT

const data = [
  { name: 'January', value: 20 },
  { name: 'March', value: 35 },
  { name: 'May', value: 60 },
  { name: 'July', value: 90 },
  { name: 'September', value: 50 },
  { name: 'December', value: 70 },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedSection, setSelectedSection] = useState("home");
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [studyPlanModalVisible, setStudyPlanModalVisible] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [selectedProgressType, setSelectedProgressType] = useState("standard"); // default


  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log("User Info from localStorage:", userInfo);
    if (userInfo && userInfo.name) {
      setUsername(userInfo.name);
      setUserId(userInfo._id);
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      toast.success("Logged out successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-teal-400 to-purple-500">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 bg-white text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl`}>
        <button 
          className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-teal-600 transition" 
          onClick={() => setSidebarOpen(false)}
        >
          ✖
        </button>
        <div className="flex justify-center mb-6">
          <img src={assessalogo} alt="Assessa Logo" className="w-28" />
        </div>

        <nav className="space-y-2">
          <div
            onClick={() => setSelectedSection("home")}
            className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
              ${
                selectedSection === "home"
                  ? "bg-teal-100 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
              }`}
          >
            <FaHome className="text-xl" />
            <span className="text-lg font-medium">Home</span>
          </div>

          <div
            onClick={() => setSelectedSection("assessments")}
            className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
              ${
                selectedSection === "assessments"
                  ? "bg-teal-100 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
              }`}
          >
            <FaBook className="text-xl" />
            <span className="text-lg font-medium">Assessments</span>
          </div>

          {/* Progress dropdown */}
<div className="w-full">
            <div
              onClick={() => setProgressOpen(!progressOpen)}
              className={`flex items-center justify-between py-3 px-4 rounded-lg transition-all cursor-pointer ${
                selectedSection === "progress"
                  ? "bg-teal-100 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
              } ${progressOpen ? "rounded-b-none" : ""}`}
            >
              <div className="flex items-center space-x-2">
                <FaChartBar className="text-xl" />
                <span className="text-lg font-medium">Progress</span>
              </div>
              <div className={`transform transition-transform duration-300 ${progressOpen ? "rotate-180" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {progressOpen && (
              <div className="bg-white border border-t-0 border-teal-100 rounded-b-lg overflow-hidden shadow-sm">
                <div
                  className={`flex items-center px-6 py-3 cursor-pointer transition-all ${
                    selectedSection === "progress" && selectedProgressType === "standard"
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedProgressType("standard");
                    setSelectedSection("progress");
                  }}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    selectedSection === "progress" && selectedProgressType === "standard" 
                    ? "bg-teal-500" 
                    : "bg-gray-300"
                  }`}></div>
                  <span>Standard</span>
                  {selectedSection === "progress" && selectedProgressType === "standard" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div
                  className={`flex items-center px-6 py-3 cursor-pointer transition-all ${
                    selectedSection === "progress" && selectedProgressType === "sat"
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedProgressType("sat");
                    setSelectedSection("progress");
                  }}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    selectedSection === "progress" && selectedProgressType === "sat" 
                    ? "bg-teal-500" 
                    : "bg-gray-300"
                  }`}></div>
                  <span>SAT</span>
                  {selectedSection === "progress" && selectedProgressType === "sat" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>



          <div
            onClick={() => setSelectedSection("profile")}
            className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
              ${
                selectedSection === "profile"
                  ? "bg-teal-100 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
              }`}
          >
            <IoPersonCircleOutline className="text-xl" />
            <span className="text-lg font-medium">My Profile</span>
          </div>
        </nav>

        <div className="flex-grow"></div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 py-3 px-4 rounded-lg text-red-500 hover:bg-red-100 transition w-full"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="text-lg font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-white rounded-tl-lg shadow-inner">
        {selectedSection === "home" && (
          <>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start md:items-center mb-8">
              <div className="flex items-center w-full md:w-auto">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-teal-600 transition-all"
                >
                  <FaBars className="text-2xl" />
                </button>
                <div className="md:hidden flex-1 ml-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search your course"
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search your course"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-teal-600 transition-all">
                  <FaBell className="text-2xl" />
                </button>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{username || "Student"}</p>
                    <div className="flex items-center justify-end">
                      <p className="text-sm text-gray-500 mr-2">Student</p>
                      <SubscriptionBadge /> {/* ✅ SUBSCRIPTION BADGE ADDED HERE */}
                    </div>
                  </div>
                  <IoPersonCircleOutline className="text-4xl text-teal-600 transition-transform hover:scale-110" />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-700 mb-2">
                Welcome,{" "}
                <span className="relative inline-block">
                  <span className="font-sans bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                    {username || "Student"}
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-purple-600"></span>
                </span>
                !
              </h2>
              <p className="text-lg text-gray-600">
                Your AI-Powered Assessment Dashboard
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-8">
              <div
                onClick={() => setFeedbackModalVisible(true)}
                className="cursor-pointer bg-gradient-to-br from-purple-300 to-purple-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform"
              >
                <MdSchool className="text-white text-[40px] mb-[10px]" />
                <p className="text-3xl font-bold">1</p>
                <p className="text-lg font-semibold">Feedback Hub</p>
              </div>

              <div
                onClick={() => setStudyPlanModalVisible(true)}
                className="cursor-pointer bg-gradient-to-br from-teal-300 to-teal-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform"
              >
                <MdMenuBook className="text-white text-[40px] mb-[6px]" />
                <p className="text-lg font-semibold">Study Plan</p>
                <p className="text-sm text-white/90 mt-1">Your weekly plan is ready</p>
              </div>

              <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
                <FaRobot className="text-white text-[40px] mb-[10px]" />
                <p className="text-lg font-semibold">Problem Solving Agent</p>
                <button
                  onClick={() => navigate("/problemsolving-agent")}
                  className="mt-4 px-4 py-2 bg-white text-amber-600 font-bold rounded-full hover:bg-amber-300 hover:text-white transition"
                >
                  Try AI Agent
                </button>
              </div>
              <div className="bg-gradient-to-br from-lime-300 to-lime-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
                <MdQuiz className="text-white text-[40px] mb-[10px]" />
                <p className="text-3xl font-bold">10</p>
                <p className="text-lg font-semibold">Quiz Quest</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white shadow-md p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">Assessment Activity</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-sky-700 shadow-md p-6 rounded-lg flex items-center justify-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">AI Challenge of the Day</h3>
                  <p className="text-3xl font-bold text-blue-800 pl-10">3h 20m</p>
                  <p className="text-sm text-gray-500">Time left to complete</p>
                  <div className="w-full mt-4">
                    <div className="bg-rose-100 h-2 rounded-full relative">
                      <div className="bg-indigo-600 h-2 w-2/3 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedSection === "assessments" && (
          <AssessmentsPage onBackHome={() => setSelectedSection("home")} />
        )}
        {selectedSection === "profile" && (
          <UserProfile onBackHome={() => setSelectedSection("home")} />
        )}
        {selectedSection === "progress" && (
  selectedProgressType === "standard" ? (
    <Progress onBack={() => setSelectedSection("home")} />
  ) : (
    <SatProgress onBack={() => setSelectedSection("home")} />
  )
)}

        {selectedSection === "feedback" && selectedFeedbackType === "standard" && (
          <StudentFeedback onBackHome={() => setSelectedSection("home")} />
        )}

        {selectedSection === "feedback" && selectedFeedbackType === "sat" && (
          <SatStudentFeedback onBackHome={() => setSelectedSection("home")} />
        )}

        {selectedSection === "studyPlan" && selectedPlanType === "standard" && (
          <StudentStudyPlan onBackHome={() => setSelectedSection("home")} />
        )}
        {selectedSection === "studyPlan" && selectedPlanType === "sat" && (
          <SatStudentStudyPlan onBackHome={() => setSelectedSection("home")} />
        )}
      </main>

      {/* Study Plan Modal - Keeping the original design */}
      <Modal
        open={studyPlanModalVisible}
        onCancel={() => setStudyPlanModalVisible(false)}
        footer={null}
        className="study-plan-modal rounded-2xl"
        width={520}
        closable={false}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Choose Your Study Plan
            </h2>
            <p className="text-gray-600">Select the type of study plan that best fits your needs</p>
          </div>

          <div className="space-y-4">
            <div 
              className="relative p-5 rounded-xl backdrop-blur-md bg-blue-50/70 border-2 border-blue-300 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => {
                setSelectedPlanType("standard");
                setStudyPlanModalVisible(false);
                setSelectedSection("studyPlan");
              }}
            >
              <div className="flex items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-200/40 text-indigo-600 mr-4 flex-shrink-0">
                  <MdMenuBook className="text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-1">Standard Study Plan</h3>
                  <p className="text-sm text-gray-600">Comprehensive curriculum-based learning with personalized recommendations</p>
                </div>
              </div>
              <div className="absolute top-5 right-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div 
              className="relative p-5 rounded-xl backdrop-blur-md bg-purple-50/70 border-2 border-purple-300 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => {
                setSelectedPlanType("sat");
                setStudyPlanModalVisible(false);
                setSelectedSection("studyPlan");
              }}
            >
              <div className="flex items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-200/40 text-purple-600 mr-4 flex-shrink-0">
                  <MdSchool className="text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-800 mb-1">SAT Study Plan</h3>
                  <p className="text-sm text-gray-600">Specialized preparation for SAT exams with practice tests and strategies</p>
                </div>
              </div>
              <div className="absolute top-5 right-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-500">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setStudyPlanModalVisible(false)}
              className="px-6 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-all shadow-sm hover:shadow"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>


{/* Feedback Hub Modal */}
<Modal
  open={feedbackModalVisible}
  onCancel={() => setFeedbackModalVisible(false)}
  footer={null}
  className="feedback-modal"
  width={600}
  closable={false}
  style={{ top: 20 }}
>
  <div className="relative">
    {/* Header with teal gradient background */}
    <div className="bg-gradient-to-r from-teal-400 to-emerald-500 p-6 rounded-t-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Feedback Hub</h2>
            <p className="text-teal-100">Select your feedback destination</p>
          </div>
        </div>
        <button 
          onClick={() => setFeedbackModalVisible(false)}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>
    </div>
    
    {/* Content area */}
    <div className="p-6 bg-cyan-50 rounded-b-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Standard Feedback */}
        <div 
          className="bg-white rounded-xl p-5 shadow-md border border-cyan-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
          onClick={() => {
            setSelectedFeedbackType("standard");
            setFeedbackModalVisible(false);
            setSelectedSection("feedback");
          }}
        >
          {/* Decorative circles - positioned to not interfere with content */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100 rounded-bl-full overflow-hidden -mr-4 -mt-4 opacity-60">
            <div className="absolute top-4 -right-4 w-16 h-16 bg-cyan-200 rounded-full"></div>
          </div>
          
          <div className="flex items-start mb-4 relative z-10">
            <div className="bg-cyan-100 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="pr-8"> {/* Added padding to prevent text overlap */}
              <h3 className="text-lg font-semibold text-gray-700">Standard Feedback</h3>
            </div>
          </div>
          <div className="flex items-center text-cyan-600 group-hover:translate-x-1 transition-transform relative z-10">
            <span className="text-sm font-medium mr-2">View Feedback</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* SAT Feedback */}
        <div 
          className="bg-white rounded-xl p-5 shadow-md border border-violet-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
          onClick={() => {
            setSelectedFeedbackType("sat");
            setFeedbackModalVisible(false);
            setSelectedSection("feedback");
          }}
        >
          {/* Decorative circles - positioned to not interfere with content */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-100 rounded-bl-full overflow-hidden -mr-4 -mt-4 opacity-60">
            <div className="absolute top-4 -right-4 w-16 h-16 bg-violet-200 rounded-full"></div>
          </div>
          
          <div className="flex items-start mb-4 relative z-10">
            <div className="bg-violet-100 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="pr-8"> {/* Added padding to prevent text overlap */}
              <h3 className="text-lg font-semibold text-gray-700">SAT Feedback</h3>
            </div>
          </div>
          <div className="flex items-center text-violet-600 group-hover:translate-x-1 transition-transform relative z-10">
            <span className="text-sm font-medium mr-2">View Feedback</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-100 rounded-lg p-4 border border-amber-200">
        <div className="flex">
          <div className="flex-shrink-0 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-amber-800">
            Your feedback is updated after each assessment. Check back regularly to track your progress!
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setFeedbackModalVisible(false)}
          className="px-6 py-2.5 bg-fuchsia-100 text-gray-700 hover:bg-fuchsia-200 font-medium rounded-lg transition-all"
        >
          Maybe Later
        </button>
      </div>
    </div>
  </div>
</Modal>

      {userId && <StudentDashboardBot userId={userId} />}
    </div>
  );
}