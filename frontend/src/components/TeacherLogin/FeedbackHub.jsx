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

export default function FeedbackHub({ onBack }) {
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

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const parsedData = res.data.map((fb) => ({
          ...fb,
          feedbackText:
            typeof fb.feedbackText === "string"
              ? JSON.parse(fb.feedbackText)
              : fb.feedbackText,
        }));

        setFeedbacks(parsedData);
      } catch (err) {
        console.error("Error fetching feedbacks", err);
        setError(err.response?.data?.message || "Failed to fetch feedback data.");
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
    if (percentage >= 80) return "from-emerald-400 to-emerald-600";
    if (percentage >= 60) return "from-blue-400 to-blue-600";
    if (percentage >= 40) return "from-amber-400 to-amber-600";
    return "from-red-400 to-red-600";
  };

  const getPerformanceBgColor = (percentage) => {
    if (percentage >= 80) return "bg-emerald-100";
    if (percentage >= 60) return "bg-blue-100";
    if (percentage >= 40) return "bg-amber-100";
    return "bg-red-100";
  };

  const getPerformanceTextColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 shadow-xl p-6 md:p-8 mb-8 text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Feedback Intelligence Hub</h1>
                <p className="text-indigo-100 max-w-2xl">
                  AI-powered insights with stunning visualizations to track student progress and performance
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
          <div className="bg-white rounded-xl shadow-lg p-5 border border-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Feedbacks</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">{feedbacks.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 shadow-inner">
                <FiBookOpen size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-5 border border-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg. Performance</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1">
                  {feedbacks.length > 0 
                    ? (feedbacks.reduce((acc, fb) => acc + fb.percentage, 0) / feedbacks.length).toFixed(1) + '%'
                    : '0%'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600 shadow-inner">
                <FiBarChart2 size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-5 border border-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Latest Activity</p>
                <p className="text-2xl font-bold text-purple-800 mt-1">
                  {feedbacks.length > 0 
                    ? new Date(feedbacks[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 shadow-inner">
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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "all" ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              All Assessments
            </button>
            <button
              onClick={() => setActiveTab("high")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "high" ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <FiStar className="inline mr-1" /> High Performers
            </button>
            <button
              onClick={() => setActiveTab("medium")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "medium" ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Medium Performers
            </button>
            <button
              onClick={() => setActiveTab("low")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === "low" ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Needs Improvement
            </button>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-start">
            <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0 text-red-500" size={20} />
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
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFeedbacks.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <FiBookOpen size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No feedback matches your criteria</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try changing your filters or check back later for new assessments.
            </p>
          </div>
        )}

        {/* Feedback Grid */}
        {!isLoading && filteredFeedbacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredFeedbacks.map((fb) => {
              const parsed = fb.feedbackText;
              const studentName = fb.studentId?.name || "Unnamed";
              const subject = fb.assessmentId?.assessmentName || "Untitled";
              const performanceGradient = getPerformanceColor(fb.percentage);
              const performanceBgColor = getPerformanceBgColor(fb.percentage);
              const performanceTextColor = getPerformanceTextColor(fb.percentage);

              return (
                <div
                  key={fb._id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${expandedId === fb._id ? 'ring-2 ring-indigo-500' : ''}`}
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
                          <h3 className="font-bold text-gray-900">{studentName}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                            <FiBookOpen size={14} className="text-gray-400" />
                            {subject}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${performanceBgColor} ${performanceTextColor}`}>
                              {fb.percentage?.toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
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
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Summary Card */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                              <FiBookOpen size={18} />
                            </div>
                            <h4 className="font-semibold text-gray-800">Assessment Summary</h4>
                          </div>
                          <p className="text-gray-700">
                            {parsed.overallSummary || "No summary provided for this assessment."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Performance Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <FiAward size={18} />
                              </div>
                              <h4 className="font-semibold text-gray-800">Performance Breakdown</h4>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Score</span>
                                  <span className="font-medium">{fb.percentage?.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full bg-gradient-to-r ${performanceGradient}`} 
                                    style={{ width: `${fb.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500">Correct</p>
                                  <p className="font-bold text-gray-800">{fb.score}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500">Total</p>
                                  <p className="font-bold text-gray-800">{fb.total}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Strengths Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                <FiStar size={18} />
                              </div>
                              <h4 className="font-semibold text-gray-800">Key Strengths</h4>
                            </div>
                            <ul className="space-y-2">
                              {parsed.topicStrengths?.length > 0 ? (
                                parsed.topicStrengths.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">
                                      <FiCheckCircle size={16} />
                                    </span>
                                    <span className="text-gray-700 text-sm">{s}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500 text-sm">No notable strengths identified</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Weaknesses Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                <FiAlertTriangle size={18} />
                              </div>
                              <h4 className="font-semibold text-gray-800">Areas for Improvement</h4>
                            </div>
                            <ul className="space-y-2">
                              {parsed.topicWeaknesses?.length > 0 ? (
                                parsed.topicWeaknesses.map((w, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">
                                      <FiAlertTriangle size={16} />
                                    </span>
                                    <span className="text-gray-700 text-sm">{w}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500 text-sm">No specific weaknesses identified</li>
                              )}
                            </ul>
                          </div>

                          {/* Next Steps Card */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <FiTrendingUp size={18} />
                              </div>
                              <h4 className="font-semibold text-gray-800">Recommended Next Steps</h4>
                            </div>
                            <div className="space-y-3">
                              {parsed.nextSteps?.length > 0 ? (
                                parsed.nextSteps.map((step, i) => (
                                  <div key={i} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-800 text-sm mb-2">{step.action}</p>
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
                                        className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 hover:underline"
                                      >
                                        View resource <FiExternalLink className="ml-1" size={12} />
                                      </a>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm">No specific recommendations provided</p>
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