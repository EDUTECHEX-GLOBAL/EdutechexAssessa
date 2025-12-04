import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaCheck, FaEdit, FaTrash, FaArrowLeft, FaCheckCircle, FaFilter, FaQuestionCircle, FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewAssessmentPage({ onBack }) {
  const [assessments, setAssessments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempQuestion, setTempQuestion] = useState({});
  const [approving, setApproving] = useState(false);
  const [assessmentType, setAssessmentType] = useState("standard");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo"));
  const token = teacherInfo?.token;
  const detailPanelRef = useRef(null);
  const topSectionRef = useRef(null);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Auto-scroll to questions when an assessment is selected
  useEffect(() => {
    if (selected && detailPanelRef.current) {
      setTimeout(() => {
        detailPanelRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        // Show scroll to top button after scrolling down
        setTimeout(() => setShowScrollTop(true), 500);
      }, 100);
    }
  }, [selected]);

  // Hide scroll to top button when no assessment is selected
  useEffect(() => {
    if (!selected) {
      setShowScrollTop(false);
    }
  }, [selected]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const url =
          assessmentType === "standard"
            ? `${process.env.REACT_APP_API_URL}/api/assessments/teacher/all?status=${filterStatus}`
            : `${process.env.REACT_APP_API_URL}/api/sat-assessments/teacher/all?status=${filterStatus}`;

        const res = await axios.get(url, { headers });
        const data = res.data || [];

        setAssessments(data);

        if (difficultyFilter && difficultyFilter.trim() !== "") {
          const df = difficultyFilter.trim().toLowerCase();
          setFiltered(
            data.filter((a) => {
              const d = (a.difficulty || "").toString().toLowerCase();
              return d === df;
            })
          );
        } else {
          setFiltered(data);
        }

        setSelected(null);
        setEditingIndex(null);
      } catch (err) {
        console.error("Failed to load assessments", err);
        alert("Failed to load assessments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [assessmentType, filterStatus, difficultyFilter]);

  // Scroll to top function
  const scrollToTop = () => {
    if (topSectionRef.current) {
      topSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowScrollTop(false);
  };

  // Difficulty level data with colors and icons
  const difficultyLevels = [
    { value: "", label: "All Difficulties", color: "bg-gray-100", textColor: "text-gray-700" },
    { value: "easy", label: "Easy", color: "bg-green-100", textColor: "text-green-700" },
    { value: "medium", label: "Medium", color: "bg-yellow-100", textColor: "text-yellow-700" },
    { value: "hard", label: "Hard", color: "bg-orange-100", textColor: "text-orange-700" },
    { value: "very hard", label: "Very Hard", color: "bg-red-100", textColor: "text-red-700" },
  ];

  const getDifficultyColor = (difficulty) => {
    const level = difficultyLevels.find(level => level.value === difficulty?.toLowerCase());
    return level ? `${level.color} ${level.textColor}` : "bg-gray-100 text-gray-700";
  };

  const applyFilter = (status) => {
    setFilterStatus(status);
  };

  const handleSelect = (a) => {
    setSelected(a);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setTempQuestion({ ...selected.questions[index] });
  };

  const handleSave = async () => {
    const updatedQuestions = [...selected.questions];
    updatedQuestions[editingIndex] = tempQuestion;

    try {
      const baseUrl = assessmentType === "standard" ? "assessments" : "sat-assessments";

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/${baseUrl}/${selected._id}/questions`,
        { questions: updatedQuestions },
        { headers }
      );

      setSelected({ ...selected, questions: updatedQuestions });
      setEditingIndex(null);
    } catch (err) {
      alert("Failed to update questions");
    }
  };

  const handleDelete = async (index) => {
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    const updatedQuestions = selected.questions.filter((_, i) => i !== index);

    try {
      const baseUrl = assessmentType === "standard" ? "assessments" : "sat-assessments";

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/${baseUrl}/${selected._id}/questions`,
        { questions: updatedQuestions },
        { headers }
      );

      setSelected({ ...selected, questions: updatedQuestions });
    } catch (err) {
      alert("Failed to delete question");
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      const baseUrl = assessmentType === "standard" ? "assessments" : "sat-assessments";

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/${baseUrl}/${selected._id}/approve`,
        {},
        { headers }
      );

      alert("Assessment approved!");
      setSelected(null);
      setEditingIndex(null);
    } catch (err) {
      alert("Approval failed");
    } finally {
      setApproving(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const questionVariants = {
    hidden: { opacity: 0, height: 0 },
    show: { opacity: 1, height: "auto" }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Scroll to Top Button - Glass morphism style */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-8 z-50 p-4 rounded-2xl transition-all duration-300 hover:scale-110 group backdrop-blur-lg border border-white/20 shadow-lg"
            style={{ 
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}
            title="Back to Assessments"
          >
            <div className="relative">
              <FaArrowUp className="text-lg text-indigo-600/80 group-hover:text-indigo-700 transition-colors" />
              <div className="absolute -top-10 right-1/2 transform translate-x-1/2 bg-gray-800/90 text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm">
                Back to Assessments
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800/90 rotate-45"></div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Top Section Ref for scrolling */}
      <div ref={topSectionRef}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <button
              onClick={onBack}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
            >
              <FaArrowLeft className="mr-2" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Review Assessments</h1>
            <p className="text-gray-500 mt-1">
              {assessmentType === "standard" ? "Standard Assessments" : "SAT Assessments"}
            </p>
          </div>

          {/* Filters Container */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center text-gray-500 mb-1">
                <FaFilter className="mr-2" />
                <span className="text-sm font-medium">Filter by status</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["pending", "approved", "all"].map((status) => (
                  <button
                    key={status}
                    onClick={() => applyFilter(status)}
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                      filterStatus === status
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Difficulty Filter */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center text-gray-500 mb-1">
                <FaFilter className="mr-2" />
                <span className="text-sm font-medium">Filter by difficulty</span>
              </div>
              <div className="relative">
                <select
                  className="appearance-none mt-1 pl-3 pr-8 py-2 border border-gray-300 rounded-lg w-full sm:w-48 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  {difficultyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Type Selector */}
        <div className="flex mb-8 bg-white p-1 rounded-xl shadow-inner border border-gray-100 w-fit">
          {[
            { value: "standard", label: "Standard" },
            { value: "sat", label: "SAT" }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setAssessmentType(type.value)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                assessmentType === type.value
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <FaQuestionCircle className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No assessments found</h3>
            <p className="text-gray-500 mt-1">
              There are no {filterStatus === "all" ? "" : filterStatus} assessments to display.
            </p>
          </div>
        )}

        {/* Enhanced Assessment Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((a) => (
            <motion.div
              key={a._id}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              onClick={() => handleSelect(a)}
              className={`bg-white border rounded-xl p-5 cursor-pointer transition-all relative overflow-hidden ${
                selected?._id === a._id
                  ? "border-indigo-500 ring-2 ring-indigo-100"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              {/* Status ribbon */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-lg ${
                a.isApproved ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
              }`}>
                {a.isApproved ? "Approved" : "Pending"}
              </div>

              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
                    {assessmentType === "standard" ? a.assessmentName : a.satTitle}
                  </h3>

                  {/* Difficulty badge */}
                  {a.difficulty && (
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-3 ${getDifficultyColor(a.difficulty)}`}>
                      {String(a.difficulty).toUpperCase()}
                    </span>
                  )}

                  <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {assessmentType === "standard" ? a.subject : a.sectionType}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    {assessmentType === "standard"
                      ? `Grade ${a.gradeLevel}`
                      : "SAT Assessment"}
                  </span>
                  <div className="flex items-center">
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {a.questions.length} {a.questions.length === 1 ? "Question" : "Questions"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Detail Panel with ref for auto-scroll */}
      <div ref={detailPanelRef}>
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-10 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {assessmentType === "standard"
                        ? selected.assessmentName
                        : selected.satTitle}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-sm px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200">
                        {assessmentType === "standard" ? selected.subject : selected.sectionType}
                      </span>
                      <span className="text-sm px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200">
                        {selected.questions.length} Questions
                      </span>
                      {selected.difficulty && (
                        <span className={`text-sm px-3 py-1 rounded-full shadow-sm border ${getDifficultyColor(selected.difficulty)} border-transparent`}>
                          Difficulty: {String(selected.difficulty).toUpperCase()}
                        </span>
                      )}
                      {assessmentType === "standard" && (
                        <span className="text-sm px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200">
                          Grade {selected.gradeLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence>
                  {selected.questions.map((q, i) => (
                    <motion.div
                      key={i}
                      variants={questionVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      layout
                      className="mb-6 p-5 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors relative bg-white shadow-sm"
                    >
                      {/* Edit/Delete/Save buttons */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        {editingIndex !== i ? (
                          <>
                            <button
                              onClick={() => handleEdit(i)}
                              className="p-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors"
                              title="Edit question"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(i)}
                              className="p-2 text-red-600 hover:text-red-800 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                              title="Delete question"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleSave}
                            className="p-2 text-green-600 hover:text-green-800 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                            title="Save changes"
                          >
                            <FaCheck size={14} />
                          </button>
                        )}
                      </div>

                      {/* Question Content */}
                      {editingIndex === i ? (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">Question Text</label>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={tempQuestion.questionText}
                            onChange={(e) =>
                              setTempQuestion({
                                ...tempQuestion,
                                questionText: e.target.value,
                              })
                            }
                            rows={3}
                          />

                          {tempQuestion.options?.map((opt, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <span className="text-gray-500 w-6">{String.fromCharCode(65 + j)}.</span>
                              <input
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...tempQuestion.options];
                                  updated[j] = e.target.value;
                                  setTempQuestion({
                                    ...tempQuestion,
                                    options: updated,
                                  });
                                }}
                              />
                              {j === tempQuestion.correctAnswer && (
                                <span className="text-green-500 text-sm">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <span className="bg-indigo-100 text-indigo-800 font-medium rounded-full w-6 h-6 flex items-center justify-center text-sm mt-0.5 flex-shrink-0">
                              {i + 1}
                            </span>
                            <p className="text-gray-800 flex-1">{q.questionText}</p>
                          </div>

                          {/* Optional passage (SAT-specific) */}
                          {q.passage && (
                            <div className="mt-3 pl-9">
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
                                <strong className="text-yellow-700 block mb-1 text-sm">Passage</strong>
                                <p className="text-sm text-gray-700 whitespace-pre-line">{q.passage}</p>
                              </div>
                            </div>
                          )}

                          {/* Options (if MCQ) */}
                          {q.type === "mcq" && q.options?.length > 0 && (
                            <div className="mt-3 pl-9 space-y-2">
                              {q.options.map((opt, j) => (
                                <div
                                  key={j}
                                  className={`p-2 rounded ${
                                    j === q.correctAnswer
                                      ? "bg-green-50 border border-green-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <span className="text-gray-500 mr-2">{String.fromCharCode(65 + j)}.</span>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Grid-in input info (SAT only) */}
                          {q.type === "grid_in" && (
                            <div className="mt-3 pl-9">
                              <div className="bg-blue-50 border border-blue-200 p-2 rounded inline-block">
                                <span className="text-sm font-medium text-blue-700">Answer:</span>
                                <span className="ml-2 font-mono bg-white px-2 py-1 rounded text-blue-800">
                                  {q.correctAnswer}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!selected.isApproved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 pt-6 border-t border-gray-200"
                  >
                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center ${
                        approving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {approving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="mr-2" />
                          Approve & Publish Assessment
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                      Once approved, this assessment will be available for student assignments.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}