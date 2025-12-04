export default function ProctoringHeader({ 
  isScreenLocked, 
  violationCount, 
  timeLeft, 
  assessment,
  currentSessionId,
  proctoringService,
  onQuitTest 
}) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{assessment.assessmentName}</h2>
        <p className="text-gray-600">{assessment.subject} • {assessment.gradeLevel}</p>
        {currentSessionId && (
          <p className="text-sm text-blue-600 mt-1">
            {proctoringService ? "Real Mode (Proctored)" : "Test Mode"}
          </p>
        )}
      </div>

      {/* Proctoring Status Indicators */}
      <div className="flex items-center gap-4">
        {isScreenLocked && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Screen Lock Active
          </div>
        )}
        
        {violationCount > 0 && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {violationCount} Violation(s)
          </div>
        )}

        {/* Quit Test Button */}
        {proctoringService && (
        <button
            onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuitTest(); // ✅ Fixed: use onQuitTest instead of handleQuitTest
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Quit Test
        </button>
        )}

        {/* Timer */}
        {timeLeft > 0 && (
          <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Time: {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        )}
      </div>
    </div>
  );
}