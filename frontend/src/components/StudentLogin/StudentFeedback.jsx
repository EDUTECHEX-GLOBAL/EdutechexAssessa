// components/StudentFeedback.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FiAlertCircle, 
  FiChevronLeft, 
  FiStar, 
  FiAward, 
  FiAlertTriangle, 
  FiBookOpen,
  FiTrendingUp,
  FiExternalLink
} from "react-icons/fi";
import { motion } from "framer-motion";

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const colorClassMap = {
  emerald: {
    from300: "from-emerald-300",
    to500: "to-emerald-500",
    from400: "from-emerald-400",
    to600: "to-emerald-600",
    bg100: "bg-emerald-100",
    text600: "text-emerald-600",
    text800: "text-emerald-800",
    bg50: "bg-emerald-50",
    border100: "border-emerald-100",
    text500: "text-emerald-500"
  },
  amber: {
    from300: "from-amber-300",
    to500: "to-amber-500",
    from400: "from-amber-400",
    to600: "to-amber-600",
    bg100: "bg-amber-100",
    text600: "text-amber-600",
    text800: "text-amber-800",
    bg50: "bg-amber-50",
    border100: "border-amber-100",
    text500: "text-amber-500"
  },
  rose: {
    from300: "from-rose-300",
    to500: "to-rose-500",
    from400: "from-rose-400",
    to600: "to-rose-600",
    bg100: "bg-rose-100",
    text600: "text-rose-600",
    text800: "text-rose-800",
    bg50: "bg-rose-50",
    border100: "border-rose-100",
    text500: "text-rose-500"
  }
};

const FeedbackCard = ({ feedback, index }) => {
  const [expanded, setExpanded] = useState(false);

  const performanceCategory = feedback.percentage >= 70 ? "Excellent"
    : feedback.percentage >= 50 ? "Good"
    : "Needs Work";

  const performanceColor = feedback.percentage >= 70 ? "emerald"
    : feedback.percentage >= 50 ? "amber"
    : "rose";

  const cls = colorClassMap[performanceColor];

  const formatURL = (input) => {
    if (!input || typeof input !== "string") return "#";
    const trimmed = input.trim();
    try {
      const hasProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://");
      const prefixed = hasProtocol ? trimmed : `https://${trimmed}`;
      const parsed = new URL(prefixed);
      const invalidHostname = /[^a-zA-Z0-9.-]/.test(parsed.hostname);
      if (invalidHostname) throw new Error("Invalid domain");
      return parsed.href;
    } catch (e) {
      return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-white p-6 rounded-2xl shadow-lg mb-6 overflow-hidden transition-all duration-300 ${expanded ? "ring-2 ring-indigo-100" : ""}`}
    >
      {/* Performance bar */}
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${cls.from300} ${cls.to500}`}></div>

      {/* Glow background */}
      <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity opacity-0 ${expanded ? "opacity-100" : ""} bg-gradient-to-br ${cls.bg50} to-white`}></div>

      <div className="relative z-10">
        <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-800 mb-1 truncate">{feedback.assessmentName}</h2>
              <div className="flex items-center mb-3">
                <div className="w-full bg-gray-100 rounded-full h-2.5 mr-3">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${cls.from400} ${cls.to600}`}
                    style={{ width: `${feedback.percentage}%` }}
                  ></div>
                </div>
                <span className={`font-semibold ${cls.text600}`}>
                  {typeof feedback.percentage === "number"
  ? feedback.percentage.toFixed(1) + "%"
  : "N/A"}

                </span>
              </div>
            </div>

            <div className="flex flex-col items-end ml-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls.bg100} ${cls.text800}`}>
                {performanceCategory}
              </span>
              <div className="text-sm text-gray-500 mt-2 whitespace-nowrap">
                {new Date(feedback.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </div>
            </div>
          </div>
        </div>

        {expanded && feedback.feedbackText && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="mt-6 pt-6 border-t border-gray-100"
          >
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${cls.bg100} ${cls.text600} mr-3`}>
                  <FiBookOpen size={18} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Summary</h3>
              </div>
              <p className={`text-gray-700 ${cls.bg50} p-4 rounded-xl border ${cls.border100}`}>
                {feedback.feedbackText.overallSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`bg-gradient-to-br ${cls.bg50} to-white p-5 rounded-2xl border ${cls.border100} shadow-sm`}>
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg ${cls.bg100} ${cls.text600} mr-3`}>
                    <FiAward size={18} />
                  </div>
                  <h4 className="font-bold text-gray-800">Strengths</h4>
                </div>
                <ul className="space-y-3">
                  {feedback.feedbackText.topicStrengths?.length > 0 ? (
                    feedback.feedbackText.topicStrengths.map((t, i) => (
                      <motion.li key={i} className="flex items-start" variants={slideUp}>
                        <div className={`p-1 rounded-full ${cls.bg100} mr-3 mt-0.5`}>
                          <FiStar className={`${cls.text500}`} size={14} />
                        </div>
                        <span className="text-gray-700">{t}</span>
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">No specific strengths noted</li>
                  )}
                </ul>
              </div>

              {/* Leave this as-is (amber always for weaknesses) */}
              <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600 mr-3">
                    <FiAlertTriangle size={18} />
                  </div>
                  <h4 className="font-bold text-gray-800">Areas for Improvement</h4>
                </div>
                <ul className="space-y-3">
                  {feedback.feedbackText.topicWeaknesses?.length > 0 ? (
                    feedback.feedbackText.topicWeaknesses.map((w, i) => (
                      <motion.li key={i} className="flex items-start" variants={slideUp}>
                        <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center mr-3 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        </div>
                        <span className="text-gray-700">{w}</span>
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">No specific weaknesses noted</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Next steps remains same */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                  <FiTrendingUp size={18} />
                </div>
                <h4 className="font-bold text-gray-800">Recommended Actions</h4>
              </div>
              <motion.ul className="space-y-4" variants={stagger}>
                {feedback.feedbackText.nextSteps?.length > 0 ? (
                  feedback.feedbackText.nextSteps.map((step, i) => (
                    <motion.li key={i} className="flex items-start" variants={slideUp}>
                      <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mr-3 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{step.action}</p>
                        {step.resource && (
                          <a
                            href={formatURL(step.resource)}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-1 group"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="border-b border-transparent group-hover:border-blue-600 transition-colors">
                              View Resource
                            </span>
                            <FiExternalLink className="ml-1" size={14} />
                          </a>
                        )}
                      </div>
                    </motion.li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">No specific next steps recommended</li>
                )}
              </motion.ul>
            </div>
          </motion.div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-4 text-sm font-medium flex items-center group ${expanded ? cls.text600 : "text-indigo-600 hover:text-indigo-800"}`}
        >
          {expanded ? "Show less" : "Show detailed feedback"}
          <svg
            className={`ml-2 w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""} group-hover:translate-y-0.5`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default function StudentFeedback({ onBackHome }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const assessmentType = "standard";


  useEffect(() => {
    const fetchFeedback = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ Token is missing in localStorage.");
        setError("You are not logged in. Please login to view feedback.");
        setLoading(false);
        return;
      }

      try {
        const endpoint =
  assessmentType === "sat"
    ? `${REACT_APP_API_URL}/api/sat-feedback/student`
    : `${REACT_APP_API_URL}/api/feedback/student`;

const res = await axios.get(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setFeedbacks(res.data);
      } catch (err) {
        console.error("❌ Axios error:", err);
        const message =
          err?.response?.data?.message ||
          "Failed to load feedbacks. Please try again later.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [assessmentType]);

  // Filter feedbacks based on active filter
  const filteredFeedbacks = feedbacks.filter(fb => {
    if (activeFilter === "all") return true;
    if (activeFilter === "excellent") return fb.percentage >= 70;
    if (activeFilter === "good") return fb.percentage >= 50 && fb.percentage < 70;
    if (activeFilter === "needs-work") return fb.percentage < 50;
    return true;
  });

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-10"
        >
          <button
            onClick={onBackHome}
            className="flex items-center text-sm px-4 py-2.5 bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all mb-4 border border-gray-200"
          >
            <FiChevronLeft className="mr-1" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-3xl font-bold text-purple-600 mb-2">Feedback Hub</h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Review your performance, strengths, and personalized improvement suggestions
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Assessments</div>
                  <div className="text-2xl font-bold text-violet-600">
                    {feedbacks.length}
                  </div>
                </div>
                <div className="ml-6 pl-6 border-l border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Average Score</div>
                  <div className="text-2xl font-bold text-green-500">
                    {feedbacks.length > 0 
                      ? (feedbacks.reduce((sum, fb) => sum + fb.percentage, 0) / feedbacks.length).toFixed(1) + '%'
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
   
          {/* Filter tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All Feedback" },
              { id: "excellent", label: "Excellent (70%+)" },
              { id: "good", label: "Good (50-69%)" },
              { id: "needs-work", label: "Needs Work (<50%)" }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex justify-center items-center py-20"
          >
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <div className="text-gray-600">Loading your feedback...</div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="flex items-start bg-rose-50 text-rose-700 p-4 rounded-xl mb-6 shadow-sm border border-rose-100"
          >
            <FiAlertCircle className="mr-3 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-medium mb-1">Error loading feedback</div>
              <div className="text-sm">{error}</div>
            </div>
          </motion.div>
        )}

        {!loading && filteredFeedbacks.length === 0 && !error && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
              <FiBookOpen className="text-indigo-500" size={32} />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              {activeFilter === "all" 
                ? "No feedback available yet" 
                : `No ${activeFilter.replace('-', ' ')} feedback`}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeFilter === "all" 
                ? "Your submitted assessments will appear here once they've been reviewed by your instructor."
                : "You don't have any feedback in this category yet."}
            </p>
          </motion.div>
        )}

        <motion.div 
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {filteredFeedbacks.map((fb, index) => (
            <FeedbackCard key={index} feedback={fb} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}