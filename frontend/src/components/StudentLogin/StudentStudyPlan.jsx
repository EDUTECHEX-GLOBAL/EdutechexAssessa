import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SmartLearningModal from "./SmartLearningModal";
import { motion } from "framer-motion";

// Enhanced color palette with gradients
const colors = {
  primary: "#6366F1",
  primaryLight: "#818CF8",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  background: "#F8FAFC",
  cardBg: "#FFFFFF",
  glassBg: "rgba(255, 255, 255, 0.8)",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  border: "rgba(226, 232, 240, 0.6)",
  highlight: "rgba(99, 102, 241, 0.1)",
  gradients: {
    primary: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    secondary: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    accent: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    danger: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
  }
};

export default function StudentStudyPlan({ onBackHome }) {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [isDarkMode] = useState(false);

  const fetchStudyPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        throw new Error("Authentication required");
      }

      const targetStudentId = studentId || userInfo._id;
      
      const response = await fetch(`/api/study-plan/${targetStudentId}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPlan(data);
      
      const initialCompleted = {};
      data.subjects?.forEach(subject => {
        subject.topics?.forEach(topic => {
          topic.tasks?.forEach(task => {
            if (task.isCompleted) {
              initialCompleted[task.id] = true;
            }
          });
        });
      });
      setCompletedTasks(initialCompleted);
    } catch (err) {
      console.error("Study plan fetch failed:", err);
      setError(err.message);
      
      if (err.message.includes("401")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId) => {
  setCompletedTasks(prev => ({
    ...prev,
    [taskId]: true // always set true after valid completion
  }));
};


  const renderTask = (task) => {
  if (!task) return null;
  
  // Determine completion status (prioritize explicit completion over percentage)
  const isExplicitlyCompleted = completedTasks[task.id];
  const completionPercentage = task.completionPercentage || 0;
  const isPartiallyComplete = !isExplicitlyCompleted && completionPercentage > 0;
  const isFullyComplete = isExplicitlyCompleted || completionPercentage >= 100;

  // Task type icons
  const taskTypeIcon = {
    'concept': '🧠',
    'remediation': '🔧',
    'practice': '📝'
  }[task.type] || '📌';

  // Priority styling
  const taskPriority = task.priority || 'low';
  const priorityColors = {
    high: { 
      bg: "bg-gradient-to-br from-red-50 to-red-100", 
      text: "text-red-600", 
      border: "border-red-200/80",
      glow: "before:absolute before:inset-0 before:bg-red-100/20 before:rounded-xl before:blur-sm"
    },
    medium: { 
      bg: "bg-gradient-to-br from-amber-50 to-amber-100", 
      text: "text-amber-600", 
      border: "border-amber-200/80",
      glow: "before:absolute before:inset-0 before:bg-amber-100/20 before:rounded-xl before:blur-sm"
    },
    low: { 
      bg: "bg-gradient-to-br from-blue-50 to-blue-100", 
      text: "text-blue-600", 
      border: "border-blue-200/80",
      glow: "before:absolute before:inset-0 before:bg-blue-100/20 before:rounded-xl before:blur-sm"
    }
  }[taskPriority] || { 
    bg: "bg-gradient-to-br from-blue-50 to-blue-100", 
    text: "text-blue-600", 
    border: "border-blue-200/80" 
  };

  return (
    <motion.div 
      key={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative p-5 rounded-2xl ${
        isFullyComplete 
          ? 'bg-gray-50/60 border-gray-200/50' 
          : `${priorityColors.bg} ${priorityColors.border} border ${priorityColors.glow || ''}`
      } backdrop-blur-sm transition-all duration-300 overflow-hidden group hover:shadow-lg`}
    >
      {/* Task content */}
      <div className="relative z-10 flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{taskTypeIcon}</span>
            <h4 className={`font-semibold text-lg ${
              isFullyComplete ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {task.title || 'Untitled Task'}
            </h4>
            {task.priority === 'high' && !isFullyComplete && (
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-red-100 to-red-200 text-red-700 font-medium shadow-xs">
                Urgent
              </span>
            )}
          </div>
          <p className={`text-sm ${
            isFullyComplete ? 'text-gray-400' : 'text-gray-600'
          } ml-10`}>
            {task.description || 'No description available'}
          </p>
          
          {task.type === 'remediation' && task.marksLost && !task.isCompleted && (
  <div className="mt-3 flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-400 shadow-xs"></div>
    <span className="text-xs font-medium text-red-600">
      Lost {task.marksLost} marks - Needs attention
    </span>
  </div>
)}

        </div>
        
        {/* Updated Completion Button */}
        <button
          onClick={() => !isFullyComplete && setActiveTask(task)}
          disabled={isFullyComplete}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform ${
            isFullyComplete 
              ? 'bg-gray-200 text-gray-500 cursor-default' 
              : isPartiallyComplete
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-indigo-600 border-2 border-indigo-100 shadow-sm hover:shadow-md hover:scale-105 hover:bg-gradient-to-br from-indigo-50 to-indigo-100'
          }`}
        >
          {isFullyComplete ? (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Done
            </span>
          ) : isPartiallyComplete ? (
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-pulse"></div>
              {completionPercentage}%
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start
            </span>
          )}
        </button>
      </div>
      
      {/* Subtle completion toggle (only show for incomplete tasks) */}
      {!isFullyComplete && (
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleTaskCompletion(task.id)}
          className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Complete
        </motion.button>
      )}
    </motion.div>
  );
};

  const renderSubject = (subject) => {
    if (!subject) return null;
    
    const completedMinutes = subject.topics?.reduce((sum, topic) => {
      return sum + ((topic.tasks || []).filter(t => completedTasks[t.id]).length * 15);
    }, 0) || 0;

    const completionPercentage = Math.min(Math.round(completedMinutes / (subject.totalMinutes || 1) * 100), 100);

    return (
      <motion.div 
        key={subject.subject}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 p-6 rounded-3xl shadow-lg border border-gray-200/50 overflow-hidden relative backdrop-blur-sm"
      >
        {/* Decorative gradient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full opacity-60 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-green-100/30 rounded-full opacity-60 -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
          <div className="flex-1 flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-inner border border-white/50">
              <span className="text-3xl">{
                subject.subject === 'Math' ? '🧮' :
                subject.subject === 'Science' ? '🔬' :
                subject.subject === 'English' ? '📖' :
                subject.subject === 'History' ? '🏛️' : '📚'
              }</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {subject.subject || 'Unknown Subject'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {subject.goal || 'Master key concepts and skills'}
              </p>
              
              {/* Progress indicator (mobile) */}
              <div className="mt-3 md:hidden w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-indigo-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xs" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress indicator (desktop) */}
          <div className="hidden md:block w-56">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-indigo-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xs" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{completedMinutes} mins completed</span>
              <span>{subject.totalMinutes || 0} mins total</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-8">
          {(subject.topics || []).map(topic => (
            <div key={topic.name} className="border-t border-gray-100/50 pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {topic.name || 'General Topic'}
                  </h4>
                  {topic.description && (
                    <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                  )}
                </div>
                {(topic.wrongCount || topic.marksLost) && (
                  <div className="flex gap-2">
                    {topic.wrongCount ? (
                      <span className="text-xs px-2 py-1 bg-gradient-to-br from-red-50 to-red-100 text-red-600 rounded-full font-medium shadow-xs">
                        {topic.wrongCount} mistakes
                      </span>
                    ) : null}
                    {topic.marksLost ? (
                      <span className="text-xs px-2 py-1 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-full font-medium shadow-xs">
                        Lost {topic.marksLost} marks
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(topic.tasks || []).map(renderTask)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const filteredSubjects = plan?.subjects?.filter(subject => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") {
      return subject.topics?.some(topic => 
        topic.tasks?.some(task => completedTasks[task.id])
      );
    }
    if (activeTab === "pending") {
      return subject.topics?.some(topic => 
        topic.tasks?.some(task => !completedTasks[task.id])
      );
    }
    return true;
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/login");
      return;
    }
    
    fetchStudyPlan();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="w-16 h-16 mb-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Crafting Your Study Plan</h3>
          <p className="text-gray-500">Analyzing your learning patterns...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen px-4 bg-gradient-to-br from-gray-50 to-indigo-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/90 p-8 rounded-3xl shadow-lg border border-gray-200/50 text-center backdrop-blur-sm"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center border border-red-200/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchStudyPlan}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
            >
              Try Again
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBackHome}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Back to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex justify-center items-center h-screen px-4 bg-gradient-to-br from-gray-50 to-indigo-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/90 p-8 rounded-3xl shadow-lg border border-gray-200/50 text-center backdrop-blur-sm"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center border border-indigo-200/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Study Plan Yet</h3>
          <p className="text-gray-600 mb-6">Complete an assessment to generate your personalized learning roadmap.</p>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackHome}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
        >
          <div>
            <motion.button
              whileHover={{ x: -3 }}
              onClick={onBackHome}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </motion.button>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                My Study Plan
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium shadow-xs border border-white/50">
                  Week {plan.week || 'Current'}
                </span>
                {plan.dueDate && (
                  <span className="text-sm text-gray-600">
                    Due {new Date(plan.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <motion.div 
            className="flex gap-1 p-1 bg-white/80 rounded-xl shadow-xs border border-gray-200/50 backdrop-blur-sm"
            whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          >
            {['all', 'pending', 'completed'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
                whileHover={activeTab !== tab ? { scale: 1.05 } : {}}
                whileTap={activeTab !== tab ? { scale: 0.95 } : {}}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        </motion.header>

        {/* AI Recommendation */}
        {plan.aiTip && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 backdrop-blur-sm relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full -ml-8 -mb-8"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm border border-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-indigo-800 mb-2">AI Learning Tip</h4>
                <p className="text-indigo-700">{plan.aiTip}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Focus Areas */}
        {(plan.focusAreas?.length > 0) && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Priority Focus Areas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {plan.focusAreas.slice(0, 4).map((area, index) => {
                const colorVariants = [
                  { 
                    bg: "bg-gradient-to-br from-red-500 to-red-400", 
                    text: "text-red-600", 
                    light: "bg-gradient-to-br from-red-50 to-red-100",
                    border: "border-red-200/50"
                  },
                  { 
                    bg: "bg-gradient-to-br from-amber-500 to-amber-400", 
                    text: "text-amber-600", 
                    light: "bg-gradient-to-br from-amber-50 to-amber-100",
                    border: "border-amber-200/50"
                  },
                  { 
                    bg: "bg-gradient-to-br from-green-500 to-green-400", 
                    text: "text-green-600", 
                    light: "bg-gradient-to-br from-green-50 to-green-100",
                    border: "border-green-200/50"
                  },
                  { 
                    bg: "bg-gradient-to-br from-blue-500 to-blue-400", 
                    text: "text-blue-600", 
                    light: "bg-gradient-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200/50"
                  }
                ];
                const colors = colorVariants[index % 4];
                
                return (
                  <motion.div 
                    key={`${area.subject}-${area.topic}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -5, 
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    className={`bg-white/80 p-5 rounded-2xl border ${colors.border} shadow-sm overflow-hidden relative backdrop-blur-sm`}
                  >
                    {/* Color accent */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${colors.bg}`}></div>
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center flex-shrink-0 border border-white/50 text-xl`}>
  {area.icon || '📘'}
</div>

                      <div>
                        <h3 className="font-semibold text-gray-900">{area.topic || 'General Topic'}</h3>
                        <p className="text-sm text-gray-500">{area.subject || 'General Subject'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mistakes</span>
                        <span className={`font-semibold ${colors.text}`}>{area.wrongCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Marks Lost</span>
                        <span className={`font-semibold ${colors.text}`}>{area.marksLost || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Completion</span>
                        <span className={`font-semibold ${colors.text}`}>{area.completion || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${colors.bg}`} 
                          style={{ width: `${area.completion || 0}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Subjects List */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-10"
        >
          {filteredSubjects?.length > 0 ? (
            filteredSubjects.map(renderSubject)
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 p-8 rounded-3xl border border-gray-200/50 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center border border-gray-200/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === 'completed' ? 'No completed tasks yet' : 'All caught up!'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {activeTab === 'completed' 
                  ? 'Start working on your tasks to see them appear here.' 
                  : 'You have no pending tasks. Great work!'}
              </p>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Task Modal */}
     <SmartLearningModal
  isOpen={!!activeTask}
  task={{ ...activeTask, taskId: activeTask?.taskId || activeTask?.id }}
  onClose={(taskId) => {
    if (taskId) toggleTaskCompletion(taskId);
    setActiveTask(null);
  }}
/>


    </div>
  );
}