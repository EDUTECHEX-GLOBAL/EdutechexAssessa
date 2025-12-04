import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { generateStandardScorecardPDF } from "./StandardScorecardPDF";


const Progress = ({ onBack }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        const response = await axios.get(`${API_BASE}/api/assessments/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setProgressData(response.data);
        } else {
          console.warn("Unexpected response:", response.data);
          setProgressData([]);
        }
      } catch (err) {
        setError("Failed to load progress data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [API_BASE]);

  const averageScore = progressData.length > 0 
    ? (progressData.reduce((sum, item) => sum + item.score, 0) / progressData.length).toFixed(1)
    : 0;

  const highestScore = progressData.length > 0
    ? Math.max(...progressData.map(item => item.score))
    : 0;

  const completionRate = progressData.length > 0 
    ? ((progressData.filter(item => item.percentage >= 100).length / progressData.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10"
        >
          <div>
            <div className="flex items-center">
              <motion.span 
                onClick={onBack}
                whileHover={{ x: -3 }}
                className="flex items-center text-gray-500 hover:text-amber-700 cursor-pointer mr-4 transition-colors mb-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </motion.span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
              Progress Dashboard
            </h1>
            <p className="text-md text-gray-600">Visualize your learning journey and achievements</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"
            ></motion.div>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm"
            whileHover={{ x: 5 }}
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
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Total Assessments */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal-100 opacity-30"></div>
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total Assessments</h3>
                    <p className="text-3xl font-bold text-teal-600">{progressData.length}</p>
                  </div>
                </div>
              </motion.div>

              {/* Average Score */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-100 opacity-30"></div>
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Average Score</h3>
                    <p className="text-3xl font-bold text-indigo-800">{averageScore}</p>
                  </div>
                </div>
              </motion.div>

              {/* Highest Score */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-100 opacity-30"></div>
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Highest Score</h3>
                    <p className="text-3xl font-bold text-purple-800">{highestScore}</p>
                  </div>
                </div>
              </motion.div>

              {/* Completion Rate */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-green-100 opacity-30"></div>
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Completion Rate</h3>
                    <p className="text-3xl font-bold text-green-600">{completionRate.toFixed(0)}%</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-6">
              {progressData.length > 0 ? (
                progressData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className={`mt-1 flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${
                            item.percentage >= 80 ? 'bg-green-100 text-green-600' :
                            item.percentage >= 50 ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <span className="text-xl font-bold">{item.percentage.toFixed(0)}%</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{item.assessmentTitle}</h3>
                            <p className="text-gray-500 text-sm mt-1">
                              {new Date(item.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                              {item.score} points
                            </span>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-600">{item.percentage.toFixed(0)}% completed</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage.toFixed(0)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                            className={`h-2.5 rounded-full ${
                              item.percentage >= 80 ? 'bg-green-500' :
                              item.percentage >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                          ></motion.div>
                        </div>
                      </div>
                      {/* Download Scorecard Button */}
<div className="mt-4 flex justify-end">
  <button
    onClick={() => generateStandardScorecardPDF(item)}
    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
  >
    Download Scorecard
  </button>
</div>

                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100"
                >
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No progress records yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Complete some assessments to track your learning journey here. Your progress will appear once you start.</p>
                  <button 
                    onClick={onBack}
                    className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Back to Assessments
                  </button>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Progress;
