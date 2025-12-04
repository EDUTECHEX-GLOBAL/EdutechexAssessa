import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiSend, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser,
  FiBook,
  FiAward,
  FiCalendar,
  FiBarChart2,
  FiInfo
} from "react-icons/fi";

export default function SatProgressTracking({ onBack }) {
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [feedbackObj, setFeedbackObj] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchProgressData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/sat-assessments/teacher/student-progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (Array.isArray(res.data)) {
        setProgressData(res.data); // don't override feedbackSent here
      } else {
        throw new Error("Unexpected response format");
      }

    } catch (err) {
      console.error("Error fetching SAT progress:", err);
      setError("Failed to load SAT student progress data.");
    } finally {
      setIsLoading(false);
    }
  };

//   const fetchSavedFeedbacks = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     const res = await axios.get(
//       `${API_BASE_URL}/api/sat-feedback/student`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     if (Array.isArray(res.data)) {
//       setProgressData(prev =>
//         prev.map(item => ({
//           ...item,
//           feedbackSent: res.data.some(
//             fb => fb.submissionId === item.submissionId
//           )
//         }))
//       );
//     }
//   } catch (err) {
//     console.error("Error fetching saved SAT feedback:", err);
//   }
// };


  const fetchFeedback = async (entry) => {
  // If already sent: open modal with info, don't call API
  if (entry.feedbackSent) {
    setSelectedEntry(entry);
    setFeedbackObj(null);
    setFeedbackError("Feedback already exists for this submission.");
    setFeedbackSuccess(false);
    setLoadingFeedback(false);
    return;
  }

  setLoadingFeedback(true);
  setFeedbackObj(null);
  setFeedbackError(null);
  setFeedbackSuccess(false);
  setSelectedEntry(entry);

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE_URL}/api/sat-feedback/send`,
      { studentId: entry.studentId, submissionId: entry.submissionId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.feedbackText) {
      setFeedbackObj(
        typeof res.data.feedbackText === "string"
          ? JSON.parse(res.data.feedbackText)
          : res.data.feedbackText
      );
    } else {
      throw new Error("No feedback content received");
    }
  } catch (err) {
    console.error("Error generating SAT feedback:", err);
    setFeedbackError(
      err.response?.data?.message || "Failed to generate SAT feedback."
    );
  } finally {
    setLoadingFeedback(false);
  }
};


  const sendFeedback = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_BASE_URL}/api/sat-feedback/save`,
      {
        studentId: selectedEntry.studentId,
        submissionId: selectedEntry.submissionId,
        feedbackText: feedbackObj,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Mark the row as sent
    setProgressData((prev) =>
      prev.map((it) =>
        it.submissionId === selectedEntry.submissionId
          ? { ...it, feedbackSent: true }
          : it
      )
    );

    setFeedbackError(null);
    setFeedbackSuccess(true);

    // brief success then close
    setTimeout(() => {
      setSelectedEntry(null);
      setFeedbackSuccess(false);
    }, 1200);
  } catch (err) {
    if (err.response?.status === 409) {
      // ✅ Treat conflict as success since feedback was already submitted
      setProgressData((prev) =>
        prev.map((it) =>
          it.submissionId === selectedEntry.submissionId
            ? { ...it, feedbackSent: true }
            : it
        )
      );
      setFeedbackSuccess(true);
    } else {
      setFeedbackError("Failed to send feedback. Please try again.");
    }
  }
};


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = progressData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(progressData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
  const loadData = async () => {
    await fetchProgressData();
    // await fetchSavedFeedbacks();
  };
  loadData();
}, []);


  useEffect(() => {
    if (feedbackSuccess) {
      const timer = setTimeout(() => {
        setSelectedEntry(null);
        setFeedbackSuccess(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [feedbackSuccess]);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "bg-emerald-100 text-emerald-800";
    if (percentage >= 50) return "bg-amber-100 text-amber-800";
    return "bg-rose-100 text-rose-800";
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-lg bg-white/70 rounded-xl shadow-lg p-6 mb-8 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                SAT Student Progress Dashboard
              </h2>
              <p className="text-gray-600 mt-1">
                Track and analyze SAT student performance with detailed insights
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 backdrop-blur-sm bg-indigo-100/30 text-indigo-800 rounded-lg border border-indigo-200/50 hover:bg-indigo-100/50 transition-all shadow-sm hover:shadow-md"
              >
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r backdrop-blur-sm">
            <div className="flex items-center">
              <FiAlertCircle className="text-rose-500 mr-2" />
              <p className="text-rose-700">{error}</p>
            </div>
          </div>
        )}

        <div className="backdrop-blur-lg bg-white/70 rounded-xl shadow-lg overflow-hidden border border-white/30">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-blue-400 text-white">
                    <tr>
                      <th className="p-4 text-left font-medium">
                        <FiUser className="inline mr-2" />
                        Student
                      </th>
                      <th className="p-4 text-left font-medium">Class</th>
                      <th className="p-4 text-left font-medium">
                        <FiBook className="inline mr-2" />
                        SAT Assessment
                      </th>
                      <th className="p-4 text-left font-medium">
                        <FiAward className="inline mr-2" />
                        Score
                      </th>
                      <th className="p-4 text-left font-medium">
                        <FiBarChart2 className="inline mr-2" />
                        Percentage
                      </th>
                      <th className="p-4 text-left font-medium">
                        <FiClock className="inline mr-2" />
                        Duration
                      </th>
                      <th className="p-4 text-left font-medium">
                        <FiCalendar className="inline mr-2" />
                        Submitted
                      </th>
                      <th className="p-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {currentItems.map((item, index) => (
                      <tr key={index} className="hover:bg-white/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{item.studentName}</td>
                        <td className="p-4 text-gray-600">{item.className}</td>
                        <td className="p-4 text-gray-700">{item.assessmentTitle}</td>
                        <td className="p-4">
                          <span className="font-medium">
                            {item.score} / {item.totalMarks}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(item.percentage)}`}>
                            {item.percentage?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.timeTaken
                            ? `${Math.floor(item.timeTaken / 60)}m ${item.timeTaken % 60}s`
                            : "N/A"}
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.submittedDate 
  ? new Date(item.submittedDate).toLocaleDateString() 
  : "N/A"}

                        </td>
                        <td className="p-4">
                          {item.feedbackSent ? (
                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-md text-sm font-medium shadow-sm">
                              Feedback Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => fetchFeedback(item)}
                              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors shadow-sm"
                            >
                              Give Feedback
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {progressData.length === 0 && !error && (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-500">
                          No SAT submissions found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {progressData.length > 0 && (
                <div className="backdrop-blur-md bg-white/50 px-4 py-3 border-t border-gray-200/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, progressData.length)}
                    </span>{" "}
                    of <span className="font-medium">{progressData.length}</span> results
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-indigo-600 hover:bg-indigo-50"}`}
                    >
                      <FiChevronLeft size={18} />
                    </button>

                    <button
                      onClick={() => paginate(1)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentPage === 1
                          ? "bg-gradient-to-r from-indigo-400 to-blue-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-indigo-50"
                      }`}
                    >
                      1
                    </button>

                    {currentPage > 3 && <span className="px-1">...</span>}

                    {Array.from({ length: Math.min(3, totalPages - 2) }, (_, i) => {
                      let pageNum;
                      if (currentPage <= 2) {
                        pageNum = i + 2;
                      } else if (currentPage >= totalPages - 1) {
                        pageNum = totalPages - 3 + i;
                      } else {
                        pageNum = currentPage - 1 + i;
                      }
                      if (pageNum > 1 && pageNum < totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-indigo-400 to-blue-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-indigo-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}

                    {currentPage < totalPages - 2 && totalPages > 4 && (
                      <span className="px-1">...</span>
                    )}

                    {totalPages > 1 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentPage === totalPages
                            ? "bg-gradient-to-r from-indigo-400 to-blue-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-indigo-50"
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-indigo-600 hover:bg-indigo-50"}`}
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30">
            <div className="sticky top-0 bg-white/70 p-4 border-b border-white/30 flex justify-between items-center backdrop-blur-sm">
              <h3 className="text-xl font-bold text-gray-800">
                SAT Feedback for {selectedEntry.studentName}
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100/50"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              {loadingFeedback && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-600">Generating personalized SAT feedback...</p>
                </div>
              )}

              {/* Success or info message */}
{feedbackSuccess && (
  <div className="mb-4 p-4 bg-green-50/80 rounded-lg border border-green-100 backdrop-blur-sm">
    <div className="flex items-center text-green-600">
      <FiCheckCircle className="mr-2" />
      <p>Feedback sent successfully!</p>
    </div>
  </div>
)}

{/* Info for already sent */}
{feedbackError === "Feedback already exists for this submission." && (
  <div className="mb-4 p-4 bg-blue-50/80 rounded-lg border border-blue-100 backdrop-blur-sm">
    <div className="flex items-center text-blue-600">
      <FiInfo className="mr-2" />
      <p>Feedback for this submission has already been sent.</p>
    </div>
  </div>
)}

{/* Other errors */}
{feedbackError && feedbackError !== "Feedback already exists for this submission." && (
  <div className="mb-4 p-4 bg-rose-50/80 rounded-lg border border-rose-100 backdrop-blur-sm">
    <div className="flex items-center text-rose-600">
      <FiAlertCircle className="mr-2" />
      <p>{feedbackError}</p>
    </div>
  </div>
)}


              {!loadingFeedback && !feedbackError && feedbackObj && (
                <div className="space-y-6">
                  <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-100/50 backdrop-blur-sm">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                      <FiCheckCircle className="mr-2" />
                      Overall Summary
                    </h4>
                    <p className="text-gray-700">
                      {feedbackObj.overallSummary || "No summary available."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/70 p-4 rounded-lg border border-emerald-100/50 backdrop-blur-sm">
                      <h4 className="font-bold text-emerald-800 mb-2">Strengths</h4>
                      {feedbackObj.topicStrengths?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {feedbackObj.topicStrengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No notable strengths identified</p>
                      )}
                    </div>

                    <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-100/50 backdrop-blur-sm">
                      <h4 className="font-bold text-amber-800 mb-2">Areas for Improvement</h4>
                      {feedbackObj.topicWeaknesses?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {feedbackObj.topicWeaknesses.map((weakness, idx) => (
                            <li key={idx}>{weakness}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No areas for improvement noted</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-50/70 p-4 rounded-lg border border-purple-100/50 backdrop-blur-sm">
                    <h4 className="font-bold text-purple-800 mb-2">Suggested Practice</h4>
                    {feedbackObj.suggestedPractice?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {feedbackObj.suggestedPractice.map((practice, idx) => (
                          <li key={idx}>{practice}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No practice suggestions available</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!loadingFeedback && feedbackObj && !feedbackSuccess && (
              <div className="sticky bottom-0 bg-white/70 p-4 border-t border-white/30 flex justify-end backdrop-blur-sm">
                <button
                  onClick={sendFeedback}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all shadow-sm hover:shadow-md"
                >
                  <FiSend className="mr-2" />
                  Send Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
