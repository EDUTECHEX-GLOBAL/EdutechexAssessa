// TeacherDashboard.jsx (updated)
import { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaBars, FaSearch, FaFileUpload, FaChartBar, FaUserGraduate, FaClipboardCheck, FaComments, FaFileImport, } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineAutoAwesome, MdOutlineFeedback } from 'react-icons/md';
import { BiAnalyse, BiBookAdd } from 'react-icons/bi';
import assessalogo from "./logo.png";
import AssessmentUploadForm from './AssessmentUploadForm';
import AssessmentLibrary from "./AssessmentLibrary";
import ProgressTracking from "./ProgressTracking";
import SatProgressTracking from "./SatProgressTracking";
import TeacherProfile from './TeacherProfile';
import "tailwindcss/tailwind.css";
import TeacherDashboardBot from './TeacherDashboardBot';
import FeedbackHub from "./FeedbackHub";
import SatFeedbackHub from "./SatFeedbackHub"; // <-- NEW
import UploadAssessmentModal from './UploadAssessmentModal';
import ReviewAssessmentPage from './ReviewAssessmentPage';
import { FiBookOpen } from 'react-icons/fi';

// --- DashboardHome now receives the counts as props ---
function DashboardHome({ setCurrentView, setShowUploadForm, assessmentLibraryCount, uploadAssessmentsCount, newThisWeekCount, satAssessmentCount, setSelectedAssessmentId }) {

  // Calculate standard assessments (assuming assessmentLibraryCount includes only standard assessments)
  const standardAssessmentCount = assessmentLibraryCount;

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assessment Library Card */}
        <div
          onClick={() => setCurrentView("library")}
          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-indigo-300 to-cyan-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="text-lg font-semibold mb-1">Assessment Library</p>
            <p className="text-sm">
              <span className="font-regular text-xs">Standard:</span> {standardAssessmentCount}
            </p>
            <p className="text-sm">
              <span className="font-regular text-xs">SAT:</span> {satAssessmentCount}
            </p>
            <p className="text-xs mt-2 opacity-90">+{newThisWeekCount} new this week</p>
          </div>
          <BiBookAdd className="text-4xl opacity-80" />
        </div>

        {/* Upload Assessments Card */}
        <div 
          className="bg-gradient-to-br from-red-300 to-pink-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setShowUploadForm(true)}
        >
          <div>
            <p className="text-lg font-semibold mb-1">Upload Assessments</p>
            <p className="text-sm">
              <span className="font-regular text-xs text-white">Standard:</span> {uploadAssessmentsCount}
            </p>
            <p className="text-sm">
              <span className="font-regular text-xs text-white">SAT:</span> {satAssessmentCount}
            </p>
          </div>
          <FaFileImport className="text-4xl opacity-80" />
        </div>


        <div 
            onClick={() => {
              setSelectedAssessmentId("688c8ebd4cacce66b68194f2"); // placeholder
              setCurrentView("review");
            }}

          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-teal-300 to-green-500 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="text-lg font-semibold">Review Assessments</p>
            <p className="text-xs mt-1 opacity-90">Teacher Review Portal</p>
          </div>
          <FaClipboardCheck className="text-4xl opacity-80" />
        </div>


        <div className="bg-gradient-to-br from-orange-300 to-yellow-500 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold mb-1">47</p>
            <p className="text-lg font-semibold">Pending Feedback</p>
            <p className="text-xs mt-1 opacity-90">12 high priority</p>
          </div>
          <FaComments className="text-4xl opacity-80" />
        </div>
      </section>

      <section className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recent Assessment Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-all">
            <div className="min-w-fit pt-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BiBookAdd className="text-blue-600 text-lg" />
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-800">New Template Uploaded</p>
                <span className="text-sm text-gray-500">3h ago</span>
              </div>
              <p className="text-gray-600 mt-1">Advanced Algebra - 10 Question Format</p>
              <div className="mt-2 border-t border-gray-100 pt-2">
                <span className="text-sm text-blue-600">View Template →</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-all">
            <div className="min-w-fit pt-1">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FaUserGraduate className="text-green-600 text-lg" />
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-800">Student Assessment Submitted</p>
                <span className="text-sm text-gray-500">7h ago</span>
              </div>
              <p className="text-gray-600 mt-1">Michael B. - Science Self-Assessment</p>
              <div className="mt-2 border-t border-gray-100 pt-2">
                <span className="text-sm text-blue-600">Review Assessment →</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}



// --- Main Component ---
export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);


  const [assessmentLibraryCount, setAssessmentLibraryCount] = useState(0);
  const [uploadAssessmentsCount, setUploadAssessmentsCount] = useState(0);
  const [newThisWeekCount, setNewThisWeekCount] = useState(0);
  const [satAssessmentCount, setSatAssessmentCount] = useState(0); 
  const [progressMenuOpen, setProgressMenuOpen] = useState(false);
  const [feedbackMenuOpen, setFeedbackMenuOpen] = useState(false); // <-- NEW


  useEffect(() => {
    const storedInfo = localStorage.getItem("teacherInfo");
    if (storedInfo) {
      setTeacherInfo(JSON.parse(storedInfo));
    }
  }, []);

  useEffect(() => {
    async function fetchDashboardCounts() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.replace(/^"|"$/g, "")}`
        };

        const API_BASE_URL = process.env.REACT_APP_API_URL || "";

        const [libRes, uploadRes, newRes, satRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/assessments/library/count`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/api/assessments/uploaded/count`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/api/assessments/library/new-this-week/count`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/api/sat-assessments/library/count`, { method: "GET", headers }), // 👈 SAT count
        ]);

        const libData = await libRes.json();
        const uploadData = await uploadRes.json();
        const newData = await newRes.json();
        const satData = await satRes.json();

        setAssessmentLibraryCount(libData.count);
        setUploadAssessmentsCount(uploadData.count);
        setNewThisWeekCount(newData.count);
        setSatAssessmentCount(satData.count || 0);
      } catch (err) {
        console.error("Failed to fetch dashboard counts", err);
      }
    }
    fetchDashboardCounts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacherInfo");
    window.location.href = "/teacher-login";
  };


  
  // Render content based on currentView:
  const renderContent = () => {
    switch (currentView) {
      case "library":
        return <AssessmentLibrary onBack={() => setCurrentView("dashboard")} />;
      case "progress-standard":
        return <ProgressTracking type="standard" onBack={() => setCurrentView("dashboard")} />;
      case "progress-sat":
        return <SatProgressTracking onBack={() => setCurrentView("dashboard")} />;
      case "feedback-standard": // teacher view for standard feedbacks
        return <FeedbackHub onBack={() => setCurrentView("dashboard")} />;
      case "feedback-sat": // teacher view for SAT feedbacks
        return <SatFeedbackHub onBack={() => setCurrentView("dashboard")} />;
      case "profile":
        return (
          <TeacherProfile
            teacherInfo={teacherInfo}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "review":
        return (
          <ReviewAssessmentPage
            assessmentId={selectedAssessmentId}
            teacherInfo={teacherInfo}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardHome
            setCurrentView={setCurrentView}
            setShowUploadForm={setShowUploadForm}
            assessmentLibraryCount={assessmentLibraryCount}
            uploadAssessmentsCount={uploadAssessmentsCount}
            newThisWeekCount={newThisWeekCount}
            satAssessmentCount={satAssessmentCount}
            setSelectedAssessmentId={setSelectedAssessmentId}
          />
        );
    }
  };


  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <aside className={`fixed md:relative z-50 bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl`}>
        <button className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-blue-600 transition" onClick={() => setSidebarOpen(false)}>
          ✖
        </button>
        <div className="flex items-center justify-center mb-8">
          <img src={assessalogo} alt="Logo" className="w-32" />
        </div>
        <nav className="space-y-2">
  <button 
    onClick={() => setCurrentView("dashboard")}
    className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "dashboard" ? "bg-blue-200/50 text-blue-800" : "text-gray-700 hover:bg-blue-200/50 hover:text-blue-800"}`}
  >
    <FaHome className="text-xl" />
    <span className="text-lg font-medium">Home</span>
  </button>

  {/* Collapsible Progress Tracking Dropdown */}
<div className="mb-2">
  <button 
    onClick={() => setProgressMenuOpen(!progressMenuOpen)}
    className={`flex items-center justify-between w-full py-3 px-4 rounded-lg text-left transition-all duration-200 ${
      progressMenuOpen 
        ? "bg-blue-50 text-blue-800" 
        : "text-gray-700 hover:bg-blue-50/80 hover:text-blue-800"
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-1.5 rounded-lg ${
        progressMenuOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
      }`}>
        <FaChartBar className="text-lg" />
      </div>
      <span className="text-lg font-medium">Progress Tracking</span>
    </div>
    <span className={`transition-transform duration-200 ${
      progressMenuOpen ? "rotate-180 text-blue-600" : "text-gray-500"
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </span>
  </button>
  
  {progressMenuOpen && (
    <div className="ml-12 mt-1 space-y-2">
      <button 
        onClick={() => setCurrentView("progress-standard")}
        className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
          currentView === "progress-standard" 
            ? "bg-blue-100/80 text-blue-800 font-medium" 
            : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
        }`}
      >
        <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${
          currentView === "progress-standard" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-600"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span>Standard Assessments</span>
      </button>
      
      <button 
        onClick={() => setCurrentView("progress-sat")}
        className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
          currentView === "progress-sat" 
            ? "bg-blue-100/80 text-blue-800 font-medium" 
            : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
        }`}
      >
        <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${
          currentView === "progress-sat" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-600"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>SAT Assessments</span>
      </button>
    </div>
  )}
</div>

  {/* Feedback Hub Dropdown */}
  <div className="mb-2">
    <button
      onClick={() => setFeedbackMenuOpen(!feedbackMenuOpen)}
      className={`flex items-center justify-between w-full py-3 px-4 rounded-lg text-left transition-all duration-200 ${
        feedbackMenuOpen ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-blue-50/80 hover:text-blue-800"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-1.5 rounded-lg ${feedbackMenuOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
          <MdOutlineFeedback className="text-lg" />
        </div>
        <span className="text-lg font-medium">Feedback Hub</span>
      </div>
      <span className={`transition-transform duration-200 ${feedbackMenuOpen ? "rotate-180 text-blue-600" : "text-gray-500"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    </button>

    {feedbackMenuOpen && (
      <div className="ml-12 mt-1 space-y-2">
        <button
          onClick={() => setCurrentView("feedback-standard")}
          className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
            currentView === "feedback-standard" ? "bg-blue-100/80 text-blue-800 font-medium" : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
          }`}
        >
          <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${currentView === "feedback-standard" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
            <FiBookOpen size={14} />
          </div>
          <span>Standard Feedbacks</span>
        </button>

        <button
          onClick={() => setCurrentView("feedback-sat")}
          className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
            currentView === "feedback-sat" ? "bg-blue-100/80 text-blue-800 font-medium" : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
          }`}
        >
          <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${currentView === "feedback-sat" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
            <FiBookOpen size={14} />
          </div>
          <span>SAT Feedbacks</span>
        </button>
      </div>
    )}
  </div>

  <div className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700">
    <BiAnalyse className="text-xl" />
    <span className="text-lg font-medium">AI Analysis</span>
  </div>

  <button 
    onClick={() => setCurrentView("profile")}
    className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "profile" ? "bg-blue-200/50 text-blue-800" : "text-gray-700 hover:bg-blue-200/50 hover:text-blue-800"}`}
  >
    <IoPersonCircleOutline className="text-xl" />
    <span className="text-lg font-medium">My Profile</span>
  </button>
</nav>


        <div className="mt-8 border-t border-blue-200 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left text-red-500 hover:bg-red-100"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="text-lg font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
                  placeholder="Search assessments..." 
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
                placeholder="Search student assessments..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 group cursor-pointer w-full md:w-auto justify-end">
            <div className="text-right">
              <p className="font-bold text-gray-800">{teacherInfo?.name || "Loading..."}</p>
              <p className="text-sm text-gray-500">{teacherInfo?.role || "Teacher"}</p>
            </div>
            <IoPersonCircleOutline className="text-4xl text-blue-600 transition-transform hover:scale-110" />
          </div>
        </div>

        {currentView === "dashboard" && (
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-700 mb-2">
              Welcome,{" "}
              <span className="relative inline-block">
                <span className="font-sans bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {teacherInfo?.name || "Teacher"}
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></span>
              </span>
              !
            </h2>
            <p className="text-lg text-gray-600">Your AI-Powered Teaching Dashboard</p>
          </div>
        )}

        {showUploadForm && <UploadAssessmentModal onClose={() => setShowUploadForm(false)} />}
        {renderContent()}
      </main>
      {teacherInfo?._id && <TeacherDashboardBot userId={teacherInfo._id} />}

    </div>
  );
}
