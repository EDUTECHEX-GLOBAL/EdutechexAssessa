import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiArrowBack, BiDownload, BiTrash } from "react-icons/bi";
import { FiFileText, FiAward } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const AssessmentLibrary = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("standard");
  const [standardAssessments, setStandardAssessments] = useState([]);
  const [satAssessments, setSatAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo"));
      const token = teacherInfo?.token;

      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const [standardRes, satRes] = await Promise.all([
          axios.get("/api/assessments/my", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/sat-assessments/library", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStandardAssessments(standardRes.data);
        setSatAssessments(satRes.data);
      } catch (error) {
        console.error("Error fetching assessments", error);
        toast.error("Failed to load assessments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [navigate]);

  const handleDeleteAssessment = async (assessmentId, isSAT = false) => {
    if (isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo"));
    const token = teacherInfo?.token;

    try {
      const url = isSAT
        ? `/api/sat-assessments/${assessmentId}`
        : `/api/assessments/${assessmentId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isSAT) {
        setSatAssessments(prev => prev.filter(a => a._id !== assessmentId));
      } else {
        setStandardAssessments(prev => prev.filter(a => a._id !== assessmentId));
      }

      toast.success("Assessment deleted successfully");
    } catch (error) {
      console.error("Error deleting assessment", error);
      toast.error("Failed to delete assessment");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderAssessmentCard = (a, isSAT = false) => (
    <div
      key={a._id}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden"
    >
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">
          {isSAT ? a.satTitle : a.assessmentName}
        </h2>
        <p className="text-sm text-gray-600 mb-3 truncate">
          {isSAT ? a.sectionType : a.subject}
        </p>
        {!isSAT && (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-800">
            Grade {a.gradeLevel}
          </span>
        )}
      </div>
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => handleDeleteAssessment(a._id, isSAT)}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          title="Delete assessment"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>
        <a
          href={a.signedUrl}
          download
          className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 text-white rounded-lg text-sm font-medium hover:bg-${isSAT ? 'purple' : 'indigo'}-700 transition-colors ${
            isSAT ? 'bg-purple-600' : 'bg-indigo-600'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download
        </a>
      </div>
    </div>
  );

  const displayedAssessments =
    activeTab === "standard" ? standardAssessments : satAssessments;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-500 font-medium"
        >
          <BiArrowBack className="text-xl" />
          Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold bg-clip-text text-transparent ${
            activeTab === "sat" 
              ? "bg-gradient-to-r from-purple-700 to-purple-500" 
              : "bg-gradient-to-r from-indigo-700 to-indigo-500"
          }`}>
            Assessment Library
          </h1>
          <p className="text-gray-600 mt-1">Manage and access all your assessment templates</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "standard"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
            onClick={() => setActiveTab("standard")}
          >
            Standard
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "sat"
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
            onClick={() => setActiveTab("sat")}
          >
            SAT
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : displayedAssessments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No {activeTab === "sat" ? "SAT" : "Standard"} assessments found
          </h3>
          <p className="mt-1 text-gray-500">Upload to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedAssessments.map((a) => renderAssessmentCard(a, activeTab === "sat"))}
        </div>
      )}
    </div>
  );
};

export default AssessmentLibrary;