// SatFeedbackHub.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiBookOpen,
  FiUser,
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiExternalLink,
  FiStar,
  FiTrendingUp,
  FiAlertTriangle,
  FiBookmark,
  FiZap,
  FiBarChart2,
  FiCheckCircle
} from "react-icons/fi";

export default function SatFeedbackHub({ onBack }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/sat-feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Normalize server response: ensure feedbackText is an object
        const parsedData = res.data.map((fb) => {
          const feedbackText =
            typeof fb.feedbackText === "string"
              ? (() => {
                  try {
                    return JSON.parse(fb.feedbackText);
                  } catch {
                    return fb.feedbackText;
                  }
                })()
              : fb.feedbackText;

          return {
            ...fb,
            feedbackText,
          };
        });

        setFeedbacks(parsedData);
      } catch (err) {
        console.error("Error fetching SAT feedbacks", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch SAT feedback data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (activeTab === "high") return fb.percentage >= 80;
    if (activeTab === "medium") return fb.percentage >= 50 && fb.percentage < 80;
    if (activeTab === "low") return fb.percentage < 50;
    return true;
  });

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "from-teal-400 to-teal-600";
    if (percentage >= 60) return "from-blue-400 to-blue-600";
    if (percentage >= 40) return "from-amber-400 to-amber-600";
    return "from-rose-400 to-rose-600";
  };

  const getPerformanceBgColor = (percentage) => {
    if (percentage >= 80) return "bg-teal-50";
    if (percentage >= 60) return "bg-blue-50";
    if (percentage >= 40) return "bg-amber-50";
    return "bg-rose-50";
  };

  const getPerformanceTextColor = (percentage) => {
    if (percentage >= 80) return "text-teal-700";
    if (percentage >= 60) return "text-blue-700";
    if (percentage >= 40) return "text-amber-700";
    return "text-rose-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-blue-900 shadow-xl p-6 md:p-8 mb-8 text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">SAT Feedback Hub</h1>
                <p className="text-slate-200 max-w-2xl">
                  AI-powered SAT feedback for all student submissions — teacher view.
                </p>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all shadow-lg"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total SAT Feedbacks</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{feedbacks.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <FiBookOpen size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Avg. Performance</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {feedbacks.length > 0 
                    ? (feedbacks.reduce((acc, fb) => acc + (fb.percentage || 0), 0) / feedbacks.length).toFixed(1) + '%'
                    : '0%'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                <FiBarChart2 size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Latest Activity</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {feedbacks.length > 0 
                    ? new Date(feedbacks[0].createdAt || feedbacks[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <FiZap size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "all" ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              All Assessments
            </button>
            <button
              onClick={() => setActiveTab("high")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "high" ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              <FiStar className="inline mr-1" /> High Performers
            </button>
            <button
              onClick={() => setActiveTab("medium")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "medium" ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              Medium Performers
            </button>
            <button
              onClick={() => setActiveTab("low")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "low" ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              Needs Improvement
            </button>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg text-rose-700 flex items-start">
            <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0 text-rose-500" size={20} />
            <div>
              <p className="font-medium">Error loading feedback</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-5 animate-pulse h-40">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFeedbacks.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-100">
            <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FiBookOpen size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No feedback matches your criteria</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Try changing your filters or check back later for new SAT feedback.
            </p>
          </div>
        )}

        {/* Feedback Grid */}
        {!isLoading && filteredFeedbacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredFeedbacks.map((fb) => {
              const parsed = fb.feedbackText;
              const studentName = fb.studentId?.name || fb.studentId?.email || "Unnamed";
              const subject = fb.assessmentId?.satTitle || fb.assessmentId?.title || "Untitled";
              const performanceGradient = getPerformanceColor(fb.percentage);
              const performanceBgColor = getPerformanceBgColor(fb.percentage);
              const performanceTextColor = getPerformanceTextColor(fb.percentage);

              return (
                <div
                  key={fb._id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-slate-100 ${expandedId === fb._id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div 
                    className="p-5 cursor-pointer"
                    onClick={() => toggleExpand(fb._id)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`bg-gradient-to-r ${performanceGradient} w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md`}>
                          <FiAward size={15} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{studentName}</h3>
                          <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                            <FiBookOpen size={14} className="text-slate-400" />
                            {subject}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${performanceBgColor} ${performanceTextColor}`}>
                              {fb.percentage?.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                              {fb.score}/{fb.total} points
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(fb._id);
                        }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {expandedId === fb._id ? (
                          <FiChevronUp size={20} />
                        ) : (
                          <FiChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === fb._id && (
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Summary Card */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                              <FiBookOpen size={18} />
                            </div>
                            <h4 className="font-semibold text-slate-800">Assessment Summary</h4>
                          </div>
                          <p className="text-slate-700">
                            {parsed.overallSummary || "No summary provided for this assessment."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Performance Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <FiAward size={18} />
                              </div>
                              <h4 className="font-semibold text-slate-800">Performance Breakdown</h4>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-600">Score</span>
                                  <span className="font-medium">{fb.percentage?.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full bg-gradient-to-r ${performanceGradient}`} 
                                    style={{ width: `${fb.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-xs text-slate-500">Correct</p>
                                  <p className="font-bold text-slate-800">{fb.score ?? "N/A"}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-xs text-slate-500">Total</p>
                                  <p className="font-bold text-slate-800">{fb.total ?? "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Strengths Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                                <FiStar size={18} />
                              </div>
                              <h4 className="font-semibold text-slate-800">Key Strengths</h4>
                            </div>
                            <ul className="space-y-2">
                              {parsed.topicStrengths?.length > 0 ? (
                                parsed.topicStrengths.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">
                                      <FiCheckCircle size={16} />
                                    </span>
                                    <span className="text-slate-700 text-sm">{s}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-500 text-sm">No notable strengths identified</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Weaknesses Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                                <FiAlertTriangle size={18} />
                              </div>
                              <h4 className="font-semibold text-slate-800">Areas for Improvement</h4>
                            </div>
                            <ul className="space-y-2">
                              {parsed.topicWeaknesses?.length > 0 ? (
                                parsed.topicWeaknesses.map((w, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">
                                      <FiAlertTriangle size={16} />
                                    </span>
                                    <span className="text-slate-700 text-sm">{w}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-500 text-sm">No specific weaknesses identified</li>
                              )}
                            </ul>
                          </div>

                          {/* Next Steps Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                <FiTrendingUp size={18} />
                              </div>
                              <h4 className="font-semibold text-slate-800">Recommended Next Steps</h4>
                            </div>
                            <div className="space-y-3">
                              {parsed.nextSteps?.length > 0 ? (
                                parsed.nextSteps.map((step, i) => (
                                  <div key={i} className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-slate-800 text-sm mb-2">{step.action}</p>
                                    {step.resource && (
                                      <a
                                        href={
                                          step.resource.startsWith("http")
                                            ? step.resource
                                            : `https://www.google.com/search?q=${encodeURIComponent(
                                                step.resource
                                              )}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                                      >
                                        View resource <FiExternalLink className="ml-1" size={12} />
                                      </a>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-slate-500 text-sm">No specific recommendations provided</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}