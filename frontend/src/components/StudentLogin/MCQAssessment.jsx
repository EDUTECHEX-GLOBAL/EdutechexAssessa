
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaCheck, FaTimes, FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import aiAgentAPI from "../../api/aiAgentAPI";

const MCQAssessment = ({
  loading,
  generatedQuestions,
  parsedQuestions,
  selectedAnswers,
  onAnswerSelect,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (submitted) {
      setShowResults(true);
    }

  }, [submitted]);

  // Prepare answers and correctAnswers objects for API
  // src/components/MCQAssessment.jsx  (or wherever MCQAssessment lives)
const prepareAnswersPayload = () => {
  const answers = {};
  const correctAnswers = {};

  parsedQuestions.forEach((q, i) => {
    // what the user selected (–1 if none)
    answers[i] = selectedAnswers[i] ?? -1;

    // q.answer is a letter "A"–"D". Convert to 0–3:
    const correctIndex = q.answer.charCodeAt(0) - "A".charCodeAt(0);

    // only store valid indexes
    correctAnswers[i] = correctIndex >= 0 && correctIndex < q.options.length
      ? correctIndex
      : null;
  });

  return { answers, correctAnswers };
};


  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { answers, correctAnswers } = prepareAnswersPayload();

      // Make API call to backend /evaluate-score endpoint
      const response = await aiAgentAPI.post("/evaluate-score", {
        answers,
        correctAnswers,
      });

      if (response.data.success) {
        setScore(response.data.score);
        setSubmitted(true);
      } else {
        setError(response.data.error || "Failed to evaluate score.");
      }
    } catch (err) {
      setError(err.message || "Error submitting assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!generatedQuestions) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  if (parsedQuestions.length === 0) {
  return (
    <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200/50 mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Generated Questions
      </h3>
      <div className="prose prose-sm max-w-none">
        {generatedQuestions ? (
          // only pass a string into ReactMarkdown
          typeof generatedQuestions === "string" ? (
            <ReactMarkdown>{generatedQuestions}</ReactMarkdown>
          ) : (
            // fallback: show pretty-printed JSON if it's an object/array
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(generatedQuestions, null, 2)}
            </pre>
          )
        ) : (
          <p className="text-gray-500">No questions generated yet.</p>
        )}
      </div>
    </div>
  );
}


  if (showResults) {
    return (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200/50 mt-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-indigo-600 mb-2">
            Assessment Results
          </h3>
          <div className="inline-block bg-indigo-50/50 rounded-full px-6 py-3 mb-4">
            <p className="text-lg font-semibold">
              Your score: {score} out of {parsedQuestions.length}
            </p>
            <p className="text-sm">
              ({Math.round((score / parsedQuestions.length) * 100)}%)
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {parsedQuestions.map((question, qIndex) => (
  <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
    <p className="font-medium mb-3">
      {qIndex + 1}. {question.question}
    </p>
    <div className="space-y-2">
  {question.options.map((option, oIndex) => {
    // Map the letter ("A"–"D") back to 0–3
    const correctIndex = question.answer.charCodeAt(0) - "A".charCodeAt(0);
    const userSelected = selectedAnswers[qIndex];

    const isCorrect     = oIndex === correctIndex;
    const isUserSelected = oIndex === userSelected;

    return (
      <div
        key={oIndex}
        className={`p-2 rounded ${
          isCorrect
            ? "bg-green-50 border border-green-200"
            : isUserSelected
            ? "bg-red-50 border border-red-200"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex items-center">
          {isCorrect ? (
            <FaCheck className="text-green-500 mr-2" />
          ) : isUserSelected ? (
            <FaTimes className="text-red-500 mr-2" />
          ) : (
            <span className="w-4 h-4 mr-2"></span>
          )}
          <span>{option}</span>
        </div>
      </div>
    );
  })}
</div>



              {/* <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium">Explanation:</p>
                <p>{question.explanation || "No explanation provided."}</p>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200/50 mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Assessment Questions
      </h3>

      <div className="mb-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="font-medium mb-3">
            {currentQuestion + 1}. {parsedQuestions[currentQuestion].question}
          </p>
          <div className="space-y-3">
            {parsedQuestions[currentQuestion].options.map((option, oIndex) => (
              <div
                key={oIndex}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedAnswers[currentQuestion] === oIndex
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
                onClick={() => onAnswerSelect(currentQuestion, oIndex)}
              >
                <div className="flex items-center">
                  <div
                    className={`mr-3 flex items-center justify-center w-5 h-5 rounded-full border ${
                      selectedAnswers[currentQuestion] === oIndex
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedAnswers[currentQuestion] === oIndex && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <label
                    htmlFor={`q${currentQuestion}-o${oIndex}`}
                    className="cursor-pointer flex-1"
                  >
                    {option}
                  </label>
                </div>
                <input
                  type="radio"
                  id={`q${currentQuestion}-o${oIndex}`}
                  name={`question-${currentQuestion}`}
                  checked={selectedAnswers[currentQuestion] === oIndex}
                  onChange={() => onAnswerSelect(currentQuestion, oIndex)}
                  className="hidden"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
        >
          Previous
        </button>

        {currentQuestion < parsedQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-600 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmitAssessment}
            disabled={
              Object.keys(selectedAnswers).length !== parsedQuestions.length ||
              isSubmitting
            }
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center disabled:opacity-50 hover:bg-indigo-600 transition-colors"
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaPaperPlane className="mr-2" />
            )}
            Submit Assessment
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 text-red-600 text-center font-semibold">{error}</p>
      )}

      <div className="mt-4 flex justify-center space-x-2">
  {(() => {
    const visibleCount = 5;
    const start = Math.floor(currentQuestion / visibleCount) * visibleCount;
    const end = Math.min(start + visibleCount, parsedQuestions.length);

    return (
      <>
        {start > 0 && (
          <button
            onClick={() => setCurrentQuestion(start - 1)}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            ←
          </button>
        )}

        {parsedQuestions.slice(start, end).map((_, index) => {
          const questionIndex = start + index;
          return (
            <button
              key={questionIndex}
              onClick={() => setCurrentQuestion(questionIndex)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentQuestion === questionIndex
                  ? "bg-indigo-500 text-white"
                  : selectedAnswers[questionIndex] !== undefined
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {questionIndex + 1}
            </button>
          );
        })}

        {end < parsedQuestions.length && (
          <button
            onClick={() => setCurrentQuestion(end)}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            →
          </button>
        )}
      </>
    );
  })()}
</div>

    </div>
  );
};

export default MCQAssessment;
