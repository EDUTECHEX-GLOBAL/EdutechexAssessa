import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProctoringModal from "./ProctoringModal";
import useProctoringManager from "./ProctoringManager";
import ProctoringHeader from "./ProctoringHeader";
import QuitConfirmationModal from "./QuitConfirmationModal";
import SubscriptionWall from "./SubscriptionWall"; // NEW

export default function AssessmentsPage({ onBackHome }) {
  // State declarations for assessments, current question, answers, timer, etc.
  const [assessments, setAssessments] = useState([]);
  const [satAssessments, setSatAssessments] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [viewType, setViewType] = useState("standard");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  
  // Proctoring related state
  const [showProctoringModal, setShowProctoringModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState(null);
  const [showStartButton, setShowStartButton] = useState(false);
  
  // NEW SUBSCRIPTION STATES
  const [showSubscriptionWall, setShowSubscriptionWall] = useState(false);
  const [subscriptionUsage, setSubscriptionUsage] = useState(null);
  
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Proctoring Manager callbacks - MOVE THESE BEFORE THE HOOK
  const handleProctoringReady = (sessionId) => {
    console.log("Proctoring ready with session:", sessionId);
  };

   const handleProctoringViolation = (violation) => {
  // Don't show violations if assessment is already submitted
  if (submissionResult) return;
  
  console.log("Proctoring violation detected:", violation);
  
  const violationMessage = `Proctoring alert: ${violation.type} (${violation.count}/3)`;
  
  toast.warning(violationMessage, {
    autoClose: 2000, // 3 seconds for regular violations
    position: "top-center"
  });
};


        // Force submit function for auto-submission (bypasses validation)
  const forceSubmitAssessment = async () => {
    if (isSubmitting || submissionResult || !currentAssessment) return;
    
    setIsSubmitting(true);
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const isSAT = currentAssessment.type === "sat";
      let payload;
      
      // Prepare answers - fill null answers with appropriate default values
      if (isSAT) {
        payload = {
          answers: answers.map((answer, i) => {
            const question = currentAssessment.questions[i];
            if (question.type === "mcq") {
              return typeof answer === "number" ? answer : -1; // -1 for unanswered MCQ
            } else {
              return typeof answer === "string" ? answer.trim() : ""; // empty for unanswered grid-in
            }
          }),
          timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
          mode: selectedMode // ADDED: mode parameter
        };
      } else {
        payload = {
          answers: answers.map((selectedIndex) => 
            selectedIndex !== null ? selectedIndex : -1 // -1 for unanswered
          ),
          timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
          mode: selectedMode // ADDED: mode parameter
        };
      }
      
      const endpoint = isSAT
        ? `/api/sat-assessments/${currentAssessment._id}/submit`
        : `/api/assessments/${currentAssessment._id}/submit`;
      
      console.log('Auto-submitting assessment with payload:', payload);
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (res.ok) {
        const { score, totalMarks, percentage } = data;
        toast.success(`Assessment submitted! Your score: ${score}/${totalMarks}`);
        setSubmissionResult({ score, totalMarks, percentage });
        
        // End proctoring session
        if (proctoringManager.currentSessionId && data.submissionId) {
          await proctoringManager.cleanupProctoring(data.submissionId);
        }
        
        // Refresh assessments list
        if (isSAT) {
          const updatedSatRes = await fetch("/api/sat-assessments/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedSatData = await updatedSatRes.json();
          setSatAssessments(updatedSatData);
        } else {
          const updatedStandardRes = await fetch("/api/assessments/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedStandardData = await updatedStandardRes.json();
          setAssessments(updatedStandardData);
        }
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Error auto-submitting assessment:", err);
      toast.error(err.message || "Error submitting assessment");
    } finally {
      setIsSubmitting(false);
    }
  };
   const handleAutoSubmit = (reason, sessionId) => {
  // Don't process if already submitted
  if (submissionResult) return;
  
  console.log(`Auto-submitting assessment due to: ${reason}`);
  setAutoSubmitReason(reason);
  
  toast.error(`Assessment auto-submitted due to proctoring violations!`, {
    autoClose: 4000, // 4 seconds for auto-submit
    position: "top-center"
  });
  
  forceSubmitAssessment();
};

  const handleSessionEnd = () => {
    console.log("Proctoring session ended");
  };

  // Use the ProctoringManager hook - AFTER callback definitions
  const proctoringManager = useProctoringManager({
    assessment: currentAssessment,
    mode: selectedMode,
    onProctoringReady: handleProctoringReady,
    onViolation: handleProctoringViolation,
    onAutoSubmit: handleAutoSubmit,
    onSessionEnd: handleSessionEnd
  });

  // NEW: Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
        const res = await fetch("/api/subscription/my-subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setSubscriptionUsage(data.usage);
        }
      } catch (err) {
        console.error("Error fetching subscription status:", err);
      }
    };
    fetchSubscriptionStatus();
  }, []);

  // Enable screen lock after component mounts and user has interacted
 useEffect(() => {
  if (currentAssessment && selectedMode === 'real' && proctoringManager.proctoringService && !submissionResult) {
    const enableLockImmediately = async () => {
      try {
        console.log('Attempting to enable screen lock immediately...');
        const success = await proctoringManager.enableScreenLock();
        if (!success) {
          console.warn("Screen lock not available. Continuing in test mode.");
        } else {
          console.log('Screen lock enabled successfully');
        }
      } catch (error) {
        console.warn("Screen lock failed:", error.message);
      }
    };
    
    Promise.resolve().then(enableLockImmediately);
  }
}, [currentAssessment, selectedMode, proctoringManager.proctoringService, submissionResult]);

  // Fetch assessments from API on component mount
  // Fetch assessments from API on component mount
useEffect(() => {
  const fetchAssessments = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;
      if (!token) {
        toast.error("No token found. Please log in again.");
        return;
      }
      
      const standardRes = await fetch("/api/assessments/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const standardData = await standardRes.json();
      if (Array.isArray(standardData)) {
        setAssessments(standardData);
      } else {
        toast.error("Failed to load standard assessments");
      }
      
      const satRes = await fetch("/api/sat-assessments/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const satData = await satRes.json();
      if (Array.isArray(satData)) {
        setSatAssessments(satData);
      } else {
        toast.error("Failed to load SAT assessments");
      }
    } catch (err) {
      toast.error("Failed to load assessments");
    }
  };
  fetchAssessments();
}, []);

// NEW: Debug subscription state changes
useEffect(() => {
  console.log("🔍 DEBUG: subscriptionUsage updated:", subscriptionUsage);
}, [subscriptionUsage]);

// Timer effect for assessment countdown
useEffect(() => {
  if (!currentAssessment || timeLeft <= 0 || submissionResult) return;
  
  timerRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerRef.current);
        handleSubmitAssessment();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timerRef.current);
}, [currentAssessment, submissionResult]);

const getViolationMessage = (reason) => {
  const messages = {
    'max_violations_reached': 'Multiple proctoring violations',
    'fullscreen_exit_attempt': 'Repeated fullscreen exit attempts'
  };
  return messages[reason] || 'Proctoring policy violation';
};

  // Timer effect for assessment countdown
  useEffect(() => {
    if (!currentAssessment || timeLeft <= 0 || submissionResult) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, [currentAssessment, submissionResult]);

  // NEW: Unified attempt function with subscription check
  const handleAttemptClick = (assessment, isSAT = false) => {
    setSelectedAssessment({ ...assessment, type: isSAT ? "sat" : "standard" });
    setShowProctoringModal(true);
  };

// This function is called after mode selection
const handleModeSelected = async (mode) => {
  setShowProctoringModal(false);
  setSelectedMode(mode);
  
  try {
    // ✅ CHECK SUBSCRIPTION FOR ALL MODES (BOTH test AND real)
    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
    
    // Get fresh subscription data from API
    const subscriptionRes = await fetch("/api/subscription/my-subscription", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (subscriptionRes.ok) {
      const subscriptionData = await subscriptionRes.json();
      
      console.log("🔍 Subscription Check:", {
        canAttemptAssessment: subscriptionData.canAttemptAssessment,
        subscriptionStatus: subscriptionData.subscription?.status,
        planName: subscriptionData.subscription?.planId?.name,
        totalAttemptsUsed: subscriptionData.usage?.totalAttemptsUsed,
        maxTotalAttempts: subscriptionData.usage?.maxTotalAttempts
      });
      
      // If user cannot attempt ANY assessment, show subscription wall
      if (!subscriptionData.canAttemptAssessment) {
        console.log("🔍 DEBUG: Showing subscription wall - total limit reached");
        setShowSubscriptionWall(true);
        return; // Stop here - don't proceed with assessment
      }
      
      // If allowed, track the attempt (for ALL modes)
      await trackAssessmentAttempt();
      
      // Update usage state after tracking
      const updatedRes = await fetch("/api/subscription/my-subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setSubscriptionUsage(updatedData.usage);
      }
    }
    
    // Proceed with assessment loading only if subscription allows
    if (selectedAssessment.type === "sat") {
      await handleAttemptSATAssessment(selectedAssessment._id);
    } else {
      await handleAttemptAssessment(selectedAssessment._id);
    }
    
    // For real mode, show start button
    if (mode === "real") {
      setShowStartButton(true);
    }
  } catch (error) {
    console.error("Failed to start assessment:", error);
  }
};

  // Track assessment attempt for ALL modes
  const trackAssessmentAttempt = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      await fetch("/api/subscription/track-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error tracking attempt:", err);
    }
  };

  // Handle standard assessment attempt
  const handleAttemptAssessment = async (assessmentId) => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch(`/api/assessments/${assessmentId}/attempt`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load assessment");
      }
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions available - please contact your teacher");
      }
      setCurrentAssessment({
        ...data,
        type: "standard"
      });
      setTimeLeft(data.timeLimit * 60);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setSubmissionResult(null);
    } catch (err) {
      console.error("Assessment load error:", err.message);
      toast.error(err.message);
    }
  };

  // Handle SAT assessment attempt
  const handleAttemptSATAssessment = async (assessmentId) => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch(`/api/sat-assessments/${assessmentId}/attempt`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load SAT assessment");
      }
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No SAT questions available");
      }
      setCurrentAssessment({
        ...data,
        assessmentName: data.satTitle,
        subject: data.sectionType,
        gradeLevel: "SAT",
        timeLimit: data.timeLimit || 30,
        type: "sat"
      });
      setTimeLeft((data.timeLimit || 30) * 60);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setSubmissionResult(null);
    } catch (err) {
      console.error("SAT Assessment load error:", err.message);
      toast.error(err.message);
    }
  };

  // Handle MCQ answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (submissionResult) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Handle grid-in answer input
  const handleGridAnswerChange = (e) => {
    const value = e.target.value;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  // Navigation between questions
  const handleNextQuestion = () => {
    if (currentAssessment && currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Quit test handlers
  const handleQuitTest = () => {
    setShowQuitConfirm(true);
  };


  const cancelQuitTest = () => {
    setShowQuitConfirm(false);
  };

  // Submit assessment and calculate results
  const handleSubmitAssessment = async () => {
    if (isSubmitting || submissionResult || !currentAssessment) return;
    
    const unanswered = answers.findIndex(a => a === null || a === undefined);
    if (unanswered !== -1) {
      toast.error(`Please answer question ${unanswered + 1} before submitting`);
      setCurrentQuestionIndex(unanswered);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const isSAT = currentAssessment.type === "sat";
      let payload;
      
      if (isSAT) {
        payload = {
          answers: answers.map((answer, i) => {
            const question = currentAssessment.questions[i];
            if (question.type === "mcq") {
              return typeof answer === "number" ? answer : -1;
            } else {
              return typeof answer === "string" ? answer.trim() : "";
            }
          }),
          timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
          mode: selectedMode // ADDED: mode parameter
        };
      } else {
        payload = {
          answers: answers.map((selectedIndex) => selectedIndex !== null ? selectedIndex : -1),
          timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
          mode: selectedMode // ADDED: mode parameter
        };
      }
      
      const endpoint = isSAT
        ? `/api/sat-assessments/${currentAssessment._id}/submit`
        : `/api/assessments/${currentAssessment._id}/submit`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (res.ok) {
        const { score, totalMarks, percentage } = data;
        toast.success(`Assessment submitted! Your score: ${score}/${totalMarks}`);
        setSubmissionResult({ score, totalMarks, percentage });
        
        if (proctoringManager.currentSessionId && data.submissionId) {
          await proctoringManager.cleanupProctoring(data.submissionId);
        }
        
        if (isSAT) {
          const updatedSatRes = await fetch("/api/sat-assessments/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedSatData = await updatedSatRes.json();
          setSatAssessments(updatedSatData);
        } else {
          const updatedStandardRes = await fetch("/api/assessments/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedStandardData = await updatedStandardRes.json();
          setAssessments(updatedStandardData);
        }
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      toast.error(err.message || "Error submitting assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render assessment taking interface with proper null checks
  if (currentAssessment) {
    // Safety check - if currentAssessment exists but questions don't
    if (!currentAssessment.questions) {
      return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error loading assessment questions</p>
            <button 
              onClick={() => setCurrentAssessment(null)}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    const totalQuestions = currentAssessment.questions.length;
    const isLastQuestion = currentQuestionIndex === currentAssessment.questions.length - 1;


       // NEW: Force submit function for quit test (bypasses validation)
const forceSubmitAssessment = async () => {
  if (isSubmitting || submissionResult || !currentAssessment) return;
  
  setIsSubmitting(true);
  try {
    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
    const isSAT = currentAssessment.type === "sat";
    let payload;
    
    // Prepare answers - fill null answers with appropriate default values
    if (isSAT) {
      payload = {
        answers: answers.map((answer, i) => {
          const question = currentAssessment.questions[i];
          if (question.type === "mcq") {
            return typeof answer === "number" ? answer : -1; // -1 for unanswered MCQ
          } else {
            return typeof answer === "string" ? answer.trim() : ""; // empty for unanswered grid-in
          }
        }),
        timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
        mode: selectedMode // ADDED: mode parameter
      };
    } else {
      payload = {
        answers: answers.map((selectedIndex) => 
          selectedIndex !== null ? selectedIndex : -1 // -1 for unanswered
        ),
        timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
        mode: selectedMode // ADDED: mode parameter
      };
    }
    
    const endpoint = isSAT
      ? `/api/sat-assessments/${currentAssessment._id}/submit`
      : `/api/assessments/${currentAssessment._id}/submit`;
    
    console.log('Force submitting assessment with payload:', payload);
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    if (res.ok) {
      const { score, totalMarks, percentage } = data;
      toast.success(`Assessment submitted! Your score: ${score}/${totalMarks}`);
      setSubmissionResult({ score, totalMarks, percentage });
      
      // End proctoring session
      if (proctoringManager.currentSessionId && data.submissionId) {
        await proctoringManager.cleanupProctoring(data.submissionId);
      }
      
      // Refresh assessments list
      if (isSAT) {
        const updatedSatRes = await fetch("/api/sat-assessments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedSatData = await updatedSatRes.json();
        setSatAssessments(updatedSatData);
      } else {
        const updatedStandardRes = await fetch("/api/assessments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedStandardData = await updatedStandardRes.json();
        setAssessments(updatedStandardData);
      }
    } else {
      throw new Error(data.message || "Submission failed");
    }
  } catch (err) {
    console.error("Error force submitting assessment:", err);
    toast.error(err.message || "Error submitting assessment");
  } finally {
    setIsSubmitting(false);
  }
};

// Add this function to handle going back to assessments properly
const handleBackToAssessments = () => {
  setCurrentAssessment(null);
  setSubmissionResult(null);
  setSelectedMode(null);
  setAutoSubmitReason(null); // Clear auto-submit reason
  
  // Cleanup proctoring service
  if (proctoringManager.currentSessionId) {
    proctoringManager.cleanupProctoring();
  }
};
// Update the quit test handler to use the force submission
const confirmQuitTest = async () => {
  setShowQuitConfirm(false);
  toast.info('Submitting assessment with your current answers...');
  await forceSubmitAssessment(); // Use force submission instead of regular one
};

// Update the regular submit function to be simpler
const handleSubmitAssessment = async () => {
  if (isSubmitting || submissionResult || !currentAssessment) return;
  
  // Only validate if not forced by quit
  const unanswered = answers.findIndex(a => a === null || a === undefined);
  if (unanswered !== -1) {
    toast.error(`Please answer question ${unanswered + 1} before submitting`);
    setCurrentQuestionIndex(unanswered);
    return;
  }
  
  // Use the same logic as force submit but with validation
  await forceSubmitAssessment();
};
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
        {/* Back button */}
        <button
        onClick={handleBackToAssessments}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        
        {/* Proctoring Header */}
        <ProctoringHeader
          isScreenLocked={proctoringManager.isScreenLocked}
          violationCount={proctoringManager.violationCount}
          timeLeft={timeLeft}
          assessment={currentAssessment}
          currentSessionId={proctoringManager.currentSessionId}
          proctoringService={selectedMode === 'real'}
          onQuitTest={handleQuitTest}
        />

        {showStartButton && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
      <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Secure Assessment Ready</h3>
      <p className="text-gray-600 mb-6">Click the button below to enable screen lock and begin your proctored assessment.</p>
      <button
        onClick={async () => {
          setShowStartButton(false);
          if (proctoringManager.proctoringService) {
            const success = await proctoringManager.enableScreenLock();
            if (!success) {
              toast.info("Continuing assessment without screen lock");
            }
          }
        }}
        className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold text-lg"
      >
        🚀 Start Secure Assessment
      </button>
      <p className="text-xs text-gray-500 mt-4">Screen lock, tab monitoring, and keyboard protection will be enabled</p>
    </div>
  </div>
)}

        {/* Auto-submission reason display */}
        {autoSubmitReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Auto-Submitted:</span> 
              {getViolationMessage(autoSubmitReason)}
            </div>
          </div>
        )}

        {/* Violation warning display - Only show if less than max violations */}
        {proctoringManager.violationCount > 0 && proctoringManager.violationCount < 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Proctoring Alert:</span> 
              You have {proctoringManager.violationCount} violation(s). After 3 violations, your assessment will be automatically submitted.
            </div>
          </div>
        )}

        {/* Progress bar */}
        {!submissionResult && (
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-teal-600 h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main question/answer interface */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {submissionResult ? (
            <div className="text-center space-y-6 py-8">
              <div className="inline-block p-4 bg-green-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">Assessment Submitted!</h3>
              
              <div className="max-w-md mx-auto bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg border border-teal-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Your Score</p>
                    <p className="text-3xl font-bold text-teal-600">
                      {submissionResult.score}<span className="text-gray-400">/{submissionResult.totalMarks}</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Percentage</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {submissionResult.percentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <button
              className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
              onClick={handleBackToAssessments}
              >
                Back to Assessments
              </button>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-teal-100 text-teal-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    {currentQuestionIndex + 1}
                  </span>
                  <p className="text-lg font-semibold text-gray-800 whitespace-pre-line pt-1">
                    {currentQuestion.questionText?.replace(/^\d+[\.\)]\s*/, '') || 'Question text not available'}
                  </p>
                </div>
                {currentQuestion.passage && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
                    <h4 className="font-semibold text-yellow-800 mb-2">Passage</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {currentQuestion.passage}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.type === "mcq" && currentQuestion.options?.length === 4 ? (
                  currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        answers[currentQuestionIndex] === index
                          ? "bg-teal-50 border-teal-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            answers[currentQuestionIndex] === index
                              ? "border-teal-500 bg-teal-500"
                              : "border-gray-300"
                          }`}
                        >
                          {answers[currentQuestionIndex] === index && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    value={answers[currentQuestionIndex] || ""}
                    onChange={handleGridAnswerChange}
                    className="w-full border border-gray-300 p-3 rounded-lg text-lg"
                  />
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
                <div>
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={handlePrevQuestion}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>
                  )}
                </div>
                
                <div className="flex justify-end">
                  {!isLastQuestion ? (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-medium"
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitAssessment}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Assessment
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-pink-500 p-4 bg-pink-50 rounded-lg">
              No question found for this index. Please contact your instructor.
            </div>
          )}
        </div>

        <QuitConfirmationModal
          isOpen={showQuitConfirm}
          onConfirm={confirmQuitTest}
          onCancel={cancelQuitTest}
        />
      </div>
    );
  }

  // NEW: Handle subscription upgrade
  const handleUpgrade = (planId) => {
    // For now, just show a message. You can integrate Stripe here later.
    toast.info("Subscription upgrade feature coming soon!");
    setShowSubscriptionWall(false);
  };

  // Main assessments list view
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ProctoringModal
        isOpen={showProctoringModal}
        onClose={() => setShowProctoringModal(false)}
        onModeSelect={handleModeSelected}
        assessment={selectedAssessment}
      />
      
      {/* NEW: Subscription Wall */}
      {showSubscriptionWall && (
        <SubscriptionWall
          onUpgrade={handleUpgrade}
          onCancel={() => setShowSubscriptionWall(false)}
          attemptsUsed={subscriptionUsage?.realModeAttemptsUsed || 0}
        />
      )}
      
      <button
        onClick={onBackHome}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-500 font-medium pb-5"
      >
        ← Back Home
      </button>
     
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-violet-700">Available Assessments</h2>
        <div className="flex items-center gap-4">
          {(viewType === "sat" || viewType === "standard") && (
            <div className="relative">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very hard">Very Hard</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewType("standard")}
          className={`px-4 py-2 rounded-lg border font-semibold transition ${
            viewType === "standard"
              ? "bg-teal-600 text-white"
              : "bg-white text-teal-600 border-teal-600"
          }`}
        >
          Standard Assessments
        </button>
        <button
          onClick={() => setViewType("sat")}
          className={`px-4 py-2 rounded-lg border font-semibold transition ${
            viewType === "sat"
              ? "bg-pink-400 text-white"
              : "bg-white text-pink-600 border-pink-600"
          }`}
        >
          SAT Assessments
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(viewType === "standard" ? assessments : satAssessments)
          .filter((a) => difficultyFilter ? a.difficulty === difficultyFilter : true)
          .map((a) => (
            <div key={a._id} className="border p-4 rounded-lg shadow bg-white hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-gray-800">
                {viewType === "standard" ? a.assessmentName : a.satTitle}
              </h3>
              <p className="text-gray-600 mt-2">
                {viewType === "standard" ? `Subject: ${a.subject}` : `Section: ${a.sectionType}`}
              </p>
              <p className="text-gray-600">
                {viewType === "standard" 
                  ? `Difficulty: ${a.difficulty?.toUpperCase() || "N/A"} • Grade: ${a.gradeLevel}`
                  : `Difficulty: ${a.difficulty?.toUpperCase() || "N/A"}`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Uploaded: {new Date(a.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {a.questions?.length || 0} questions • {a.timeLimit || 30} mins
              </p>
              {a.submission ? (
                <div className="mt-3 w-full bg-green-500 text-white text-center py-2 rounded font-semibold">
                  Completed! {a.submission.score}/{a.submission.totalMarks}
                </div>
              ) : (
                <button
                  onClick={() => handleAttemptClick(a, viewType === "sat")}
                  className="mt-3 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
                >
                  {viewType === "standard" ? "Attempt Assessment" : "Attempt SAT"}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}