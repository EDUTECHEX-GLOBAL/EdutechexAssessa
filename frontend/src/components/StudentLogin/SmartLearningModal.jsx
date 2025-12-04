import { useState, useEffect } from "react";

/**
 * Modal for students to review and complete learning tasks
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Object} props.task - The current task
 * @param {Function} props.onClose - Close handler
 */
export default function SmartLearningModal({ isOpen, task, onClose }) {
  const [step, setStep] = useState(1);
  const [understanding, setUnderstanding] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Reset state when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUnderstanding(0);
      setAnswer("");
      setIsCorrect(null);
      setValidationError(null);
    }
  }, [isOpen, task]);

  /**
   * Validate and submit the student's explanation
   */
  const handleSubmit = async () => {
  if (!answer.trim()) {
    setValidationError("Please write an explanation");
    return;
  }

  setIsValidating(true);
  setValidationError(null);

  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token;

    // Step 1: Validate explanation
    const response = await fetch("/api/study-plan/validate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        text: answer,
        question: task.questionText || task.description
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setValidationError(data.message || "Server error");
      return;
    }

    const { isValid, feedback } = data;

    if (!isValid) {
      setValidationError(feedback || "Explanation doesn't match the question");
      return;
    }

    // ✅ Step 2: Persist completion to MongoDB
    const resolvedTaskId = task.taskId || task.id; // ✅ fallback if taskId missing

await fetch(`/api/study-plan/task/${resolvedTaskId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    isCompleted: true,
    notes: answer
  })
});

    // ✅ Step 3: Update local UI
    onClose(task.id);
  } catch (err) {
    console.error("Validation error:", err);
    setValidationError("Validation failed. Please try again.");
  } finally {
    setIsValidating(false);
  }
};


  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold text-indigo-700">
          {task.type === 'concept' ? 'Concept Review' :
            task.type === 'remediation' ? 'Question Review' : 'Practice Session'}
        </h2>

        {/* Step 1: Question/Concept Review */}
        {step === 1 && (
          <>
            {task.type === 'remediation' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3">
                <p className="font-semibold text-sm">❌ You missed this question:</p>
                <p className="text-sm mt-1">{task.questionText}</p>
                <div className="text-xs mt-2 grid grid-cols-2 gap-1">
                  <span className="text-red-600">Your answer: {task.studentAnswer}</span>
                  <span className="text-green-600">Correct: {task.correctAnswer}</span>
                </div>
              </div>
            )}

            {/* Understanding Rating */}
            <div className="pt-4">
              <p className="text-sm mb-2">Rate your understanding now (1-5):</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setUnderstanding(num)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${understanding === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={understanding < 1}
                className={`px-4 py-2 text-sm rounded ${understanding < 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2: Explanation Input and Submit */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">
              Explain this in your own words (min 20 characters):
            </p>
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Type your explanation here..."
            />

            {validationError && (
              <div className="text-red-500 text-sm mt-1">{validationError}</div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isValidating || answer.length < 20}
                className={`px-4 py-2 text-sm rounded ${isValidating || answer.length < 20
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {isValidating ? 'Validating...' : 'Mark Complete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
