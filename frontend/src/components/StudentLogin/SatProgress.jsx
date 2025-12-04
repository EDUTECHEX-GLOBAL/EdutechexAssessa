// frontend/src/components/StudentLogin/SatProgress.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { generateScorecardPDF } from './ScorecardPDF';

const SatProgress = ({ onBack }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo?.token;

        // Primary: fetch the detailed submissions API you added
        let res;
        try {
          res = await axios.get(`${API_BASE}/api/sat-assessments/my-progress`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          // fallback: if my-progress not available or returns 404, try /all
          console.warn('my-progress failed, falling back to /all', err?.message);
          res = await axios.get(`${API_BASE}/api/sat-assessments/all`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        const data = Array.isArray(res.data) ? res.data : [];

        // Normalize both possible shapes:
        // - my-progress: [{ assessmentTitle, sectionType, difficulty, score, totalMarks, percentage, submittedDate }]
        // - all: [{ satTitle, sectionType, difficulty, submission: { score, totalMarks, percentage, submittedAt } }]
        const normalized = data.map((item) => {
          // If already shaped (my-progress)
          if (item.assessmentTitle || item.score !== undefined) {
            return {
              _id: item._id,
              assessmentTitle: item.assessmentTitle || item.assessment || item.satTitle || 'Untitled',
              sectionType: item.sectionType || 'Unknown',
              difficulty: item.difficulty || '—',
              score: item.score ?? (item.submission?.score ?? null),
              totalMarks: item.totalMarks ?? (item.submission?.totalMarks ?? null),
              percentage: typeof item.percentage === 'number' ? item.percentage : (item.submission?.percentage ?? 0),
              submittedDate: item.submittedDate || item.submission?.submittedAt || item.submission?.createdAt || item.submission?.submittedDate || item.submission?.submittedAt || null,
              timeTaken: item.timeTaken ?? item.submission?.timeTaken ?? 0,
              studentName: item.studentName || "—",
              studentEmail: item.studentEmail || "—",

            };
          }

          // if it's an assessment object from /all
          if (item.satTitle) {
            return {
              _id: item._id,
              assessmentTitle: item.satTitle,
              sectionType: item.sectionType || 'Unknown',
              difficulty: item.difficulty || '—',
              score: item.submission?.score ?? null,
              totalMarks: item.submission?.totalMarks ?? null,
              percentage: item.submission?.percentage ?? 0,
              submittedDate: item.submission?.submittedAt || item.submission?.createdAt || null,
              timeTaken: item.submission?.timeTaken ?? 0,
            };
          }

          // fallback: try to conservatively map whatever we have
          return {
            _id: item._id,
            assessmentTitle: item.title || 'Untitled',
            sectionType: item.sectionType || 'Unknown',
            difficulty: item.difficulty || '—',
            score: item.score ?? null,
            totalMarks: item.totalMarks ?? null,
            percentage: item.percentage ?? 0,
            submittedDate: item.submittedAt || item.createdAt || null,
            timeTaken: item.timeTaken ?? 0,
          };
        });

        setRows(normalized);
      } catch (e) {
        console.error(e);
        setError('Failed to load SAT progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [API_BASE]);

  // Simplified downloadScorecard function
  const downloadScorecard = (s) => {
    generateScorecardPDF(s); // Use the imported function
  };

  // compute stats only for rows that have numeric percentage
  const numericPercentages = rows.map(r => Number(r.percentage)).filter(n => !isNaN(n));
  const avg = numericPercentages.length > 0 ? (numericPercentages.reduce((a,b) => a+b, 0) / numericPercentages.length).toFixed(1) : 0;
  const best = numericPercentages.length > 0 ? Math.max(...numericPercentages).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div className="mb-4 md:mb-0">
            <motion.button
              onClick={onBack}
              whileHover={{ x: -3 }}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </motion.button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">SAT Progress Tracker</h1>
            <p className="text-md text-gray-600">Monitor your performance and download detailed score reports</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/30"
          >
            <p className="text-sm text-gray-500">Performance Trend</p>
            <div className="flex items-center mt-1">
              <span className="text-lg font-semibold text-blue-600">Improving</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
              className="rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
            />
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-md p-6 rounded-xl shadow-lg text-white border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Total Attempts</div>
                    <div className="text-3xl font-bold mt-1">{rows.length}</div>
                  </div>
                  <div className="bg-blue-700/50 backdrop-blur-sm p-3 rounded-full border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-500/80 to-purple-600/80 backdrop-blur-md p-6 rounded-xl shadow-lg text-white border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Average Score</div>
                    <div className="text-3xl font-bold mt-1">{avg}%</div>
                  </div>
                  <div className="bg-purple-700/50 backdrop-blur-sm p-3 rounded-full border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-md p-6 rounded-xl shadow-lg text-white border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Best Score</div>
                    <div className="text-3xl font-bold mt-1">{best}%</div>
                  </div>
                  <div className="bg-green-700/50 backdrop-blur-sm p-3 rounded-full border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-amber-500/80 to-amber-600/80 backdrop-blur-md p-6 rounded-xl shadow-lg text-white border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Improvement Needed</div>
                    <div className="text-xl font-bold mt-1">{best < 70 ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="bg-amber-700/50 backdrop-blur-sm p-3 rounded-full border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {rows.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/70 backdrop-blur-md p-12 rounded-2xl shadow-md border border-white/30 text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No SAT attempts yet</h3>
                <p className="text-gray-500">Complete your first SAT assessment to track your progress here.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/30 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100/30">
                  <h2 className="text-xl font-semibold text-gray-800">Assessment History</h2>
                  <p className="text-gray-600 mt-1">Your complete SAT attempt history with performance metrics</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/50">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/30 divide-y divide-gray-200/30">
                      {rows.map((s) => (
                        <motion.tr 
                          key={s._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.7)" }}
                          className="transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{s.assessmentTitle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{s.sectionType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              s.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              s.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              s.difficulty === 'Hard' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {s.difficulty || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-800">
                              {s.score !== null && s.totalMarks !== null ? `${s.score} / ${s.totalMarks}` : 'Not Attempted'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    s.percentage >= 80 ? 'bg-green-500' : 
                                    s.percentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`} 
                                  style={{ width: `${Math.min(100, s.percentage)}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${
                                s.percentage >= 80 ? 'text-green-700' : 
                                s.percentage >= 50 ? 'text-blue-700' : 'text-yellow-700'
                              }`}>
                                {Number(s.percentage || 0).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {s.submittedDate ? new Date(s.submittedDate).toLocaleDateString() : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.button
                              onClick={() => downloadScorecard(s)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium shadow-md transition-all duration-200 flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200/30">
                  <p className="text-xs text-gray-600">
                    Showing {rows.length} assessment{rows.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SatProgress;