import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

export default function SatAssessmentPreviewPage() {
  const { assessmentId } = useParams();
  const [searchParams] = useSearchParams();
  const assessmentType = searchParams.get("type");
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeQuestion, setActiveQuestion] = useState(0);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const endpoint = assessmentType === "sat" 
          ? `/api/generated-assessments/sat/${assessmentId}`
          : `/api/generated-assessments/standard/${assessmentId}`;
        
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch assessment");
        
        const data = await res.json();
        setAssessment(data);
      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError("Failed to load assessment preview");
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId, assessmentType]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "bg-green-50 text-green-700 border-green-200";
      case "medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "hard": return "bg-orange-50 text-orange-700 border-orange-200";
      case "very hard": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Enhanced helper function to get correct answer text safely
  const getCorrectAnswerInfo = (question) => {
    if (!question || !question.options || question.options.length === 0) {
      return null;
    }

    const correctAnswer = question.correctAnswer;
    
    if (correctAnswer === null || correctAnswer === undefined || correctAnswer === '') {
      return null;
    }

    try {
      let optionIndex = -1;

      // Handle string formats
      if (typeof correctAnswer === 'string') {
        const cleanAnswer = correctAnswer.trim().toUpperCase();
        
        // Handle "A", "B", "C", "D"
        if (/^[A-D]$/.test(cleanAnswer)) {
          optionIndex = cleanAnswer.charCodeAt(0) - 65; // A->0, B->1, etc.
        } 
        // Handle "0", "1", "2", "3"
        else if (/^[0-3]$/.test(cleanAnswer)) {
          optionIndex = parseInt(cleanAnswer, 10);
        }
        // Handle numbers as strings like "1", "2", etc.
        else if (/^\d+$/.test(cleanAnswer)) {
          optionIndex = parseInt(cleanAnswer, 10);
        }
      } 
      // Handle number formats directly
      else if (typeof correctAnswer === 'number') {
        optionIndex = correctAnswer;
      }

      // Validate the option index is within range
      if (optionIndex >= 0 && optionIndex < question.options.length) {
        const optionLetter = String.fromCharCode(65 + optionIndex);
        return {
          letter: optionLetter,
          text: question.options[optionIndex],
          index: optionIndex
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error parsing correct answer:', error);
      return null;
    }
  };

  // Helper to check if an option is correct
  const isOptionCorrect = (optionIndex, correctAnswerInfo) => {
    if (!correctAnswerInfo) return false;
    return optionIndex === correctAnswerInfo.index;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading assessment preview...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Assessment Not Found</h3>
            <p className="text-slate-600 mb-6">{error || "The requested assessment could not be loaded."}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition font-medium shadow-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions?.[activeQuestion];
  const correctAnswerInfo = currentQuestion ? getCorrectAnswerInfo(currentQuestion) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors font-medium group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Assessments
            </button>
            
            <div className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              {assessmentType === "sat" ? "SAT Assessment" : "Standard Assessment"} Preview
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">
                    {assessment.satTitle || assessment.assessmentName || "Untitled Assessment"}
                  </h1>
                  <p className="text-slate-600">
                    {assessment.sectionType || assessment.subject || "General Assessment"}
                  </p>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-lg border ${getDifficultyColor(assessment.difficulty)} font-medium`}>
                {assessment.difficulty || "N/A"}
              </div>
            </div>

            {/* Assessment Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-700 mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-indigo-900">{assessment.questionsCount || assessment.questions?.length || 0}</p>
              </div>
              
              <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm font-medium text-emerald-700 mb-1">Teacher</p>
                <p className="text-xl font-bold text-emerald-900">{assessment.teacher?.name || "Unknown"}</p>
              </div>
              
              <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm font-medium text-amber-700 mb-1">Created Date</p>
                <p className="text-lg font-bold text-amber-900">
                  {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Questions Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Questions ({assessment.questions?.length || 0})
              </h2>
              
              {!assessment.questions || assessment.questions.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">No questions available</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {assessment.questions.map((question, index) => (
                    <button
                      key={question._id || index}
                      onClick={() => setActiveQuestion(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        activeQuestion === index 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Q{index + 1}</span>
                        {question.difficulty && (
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty.charAt(0)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <span className="text-blue-600 font-bold text-lg">{activeQuestion + 1}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Question {activeQuestion + 1}</h2>
                    {currentQuestion?.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(currentQuestion.difficulty)}`}>
                        {currentQuestion.difficulty}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                  {activeQuestion + 1} of {assessment.questions?.length || 0}
                </div>
              </div>

              {/* Question Content */}
              <div className="mb-8">
                <div className="prose max-w-none">
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
                    <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap">
                      {currentQuestion?.questionText || "No question text available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              {currentQuestion?.options && currentQuestion.options.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Answer Choices</h3>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optIndex) => {
                      const optionLetter = String.fromCharCode(65 + optIndex);
                      const isCorrect = isOptionCorrect(optIndex, correctAnswerInfo);
                      
                      return (
                        <div 
                          key={optIndex}
                          className={`p-4 rounded-lg border transition-all ${
                            isCorrect 
                              ? 'bg-green-50 border-green-300 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <span className="font-semibold text-sm">{optionLetter}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-800">{option}</p>
                            </div>
                            {isCorrect && (
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Correct Answer
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Correct Answer Section - Always show the actual answer */}
              {correctAnswerInfo && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Correct Answer</p>
                      <p className="text-slate-700">
                        Option {correctAnswerInfo.letter}: {correctAnswerInfo.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Explanation (if available) */}
              {currentQuestion?.explanation && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Explanation
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              {assessment.questions && assessment.questions.length > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                    disabled={activeQuestion === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                      activeQuestion === 0 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <button
                    onClick={() => setActiveQuestion(prev => Math.min(assessment.questions.length - 1, prev + 1))}
                    disabled={activeQuestion === assessment.questions.length - 1}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                      activeQuestion === assessment.questions.length - 1
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}