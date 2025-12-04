import { useState } from "react";

export default function ProctoringModal({ 
  isOpen, 
  onClose, 
  onModeSelect, 
  assessment 
}) {
  const [selectedMode, setSelectedMode] = useState("test");
  const [isLoading, setIsLoading] = useState(false);
  const [compatibilityCheck, setCompatibilityCheck] = useState({
    fullscreen: false,
    camera: false,
    microphone: false,
    supported: false
  });

  if (!isOpen) return null;

  // Strict browser compatibility check - camera and microphone are MANDATORY
  const checkBrowserCompatibility = async () => {
    const supports = {
      fullscreen: !!document.fullscreenEnabled || !!document.webkitFullscreenEnabled,
      mediaDevices: !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia,
    };

    let cameraAccess = false;
    let microphoneAccess = false;

    // Test camera/microphone permissions - NOW MANDATORY
    if (supports.mediaDevices) {
      try {
        // List available devices first to see what's available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        
        console.log('Available devices:', devices);
        console.log('Has camera:', hasCamera, 'Has microphone:', hasMicrophone);

        if (!hasCamera || !hasMicrophone) {
          throw new Error('Camera or microphone hardware not detected');
        }

        // Try to access both camera and microphone - BOTH ARE REQUIRED
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        
        // Check if we actually got video tracks
        const videoTracks = stream.getVideoTracks();
        cameraAccess = videoTracks.length > 0 && videoTracks[0].readyState === 'live';
        
        // Check if we actually got audio tracks
        const audioTracks = stream.getAudioTracks();
        microphoneAccess = audioTracks.length > 0 && audioTracks[0].readyState === 'live';
        
        // Stop the stream immediately after checking
        stream.getTracks().forEach(track => track.stop());

        if (!cameraAccess || !microphoneAccess) {
          throw new Error('Camera or microphone access denied');
        }
      } catch (error) {
        console.log('Camera/microphone access failed:', error);
        // If permission is denied or devices not found, block Real Mode
        cameraAccess = false;
        microphoneAccess = false;
      }
    }

    const compatibility = {
      fullscreen: supports.fullscreen,
      camera: cameraAccess,
      microphone: microphoneAccess,
      // ALL THREE are now required for Real Mode
      supported: supports.fullscreen && cameraAccess && microphoneAccess
    };

    setCompatibilityCheck(compatibility);
    return compatibility;
  };

  const handleContinue = async () => {
    if (selectedMode === "real") {
      setIsLoading(true);
      
      // Check browser compatibility with STRICT requirements
      const compatibility = await checkBrowserCompatibility();
      
      if (!compatibility.supported) {
        let errorMessage = "Real Mode requires all of the following:\n\n";
        if (!compatibility.fullscreen) errorMessage += "• Fullscreen mode support\n";
        if (!compatibility.camera) errorMessage += "• Camera access and permissions\n";
        if (!compatibility.microphone) errorMessage += "• Microphone access and permissions\n";
        errorMessage += "\nPlease ensure:\n";
        errorMessage += "• You're using Chrome or Firefox\n";
        errorMessage += "• Camera and microphone are connected\n";
        errorMessage += "• You've granted camera and microphone permissions\n";
        errorMessage += "• No other app is using your camera/microphone";
        
        alert(errorMessage);
        setIsLoading(false);
        return;
      }
    }
    
    onModeSelect(selectedMode);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Select Attempt Mode
        </h2>
        <p className="text-gray-600 mb-6">
          How would you like to attempt <strong>{assessment.assessmentName || assessment.satTitle}</strong>?
        </p>

        {/* Mode Selection Cards */}
        <div className="space-y-4 mb-6">
          {/* Test Mode Card */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              selectedMode === "test" 
                ? "border-teal-500 bg-teal-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedMode("test")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMode === "test" 
                  ? "border-teal-500 bg-teal-500" 
                  : "border-gray-300"
              }`}>
                {selectedMode === "test" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Test Mode</h3>
                <p className="text-sm text-gray-600">
                  Practice mode without monitoring. Suitable for self-assessment.
                </p>
                <div className="mt-2 text-xs text-green-600">
                  <span className="font-semibold">✓</span> No restrictions
                  <br />
                  <span className="font-semibold">✓</span> Practice environment
                </div>
              </div>
            </div>
          </div>

          {/* Real Mode Card */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              selectedMode === "real" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedMode("real")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMode === "real" 
                  ? "border-blue-500 bg-blue-500" 
                  : "border-gray-300"
              }`}>
                {selectedMode === "real" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Real Mode</h3>
                <p className="text-sm text-gray-600">
                  Proctored mode with advanced monitoring. Required for official assessments.
                </p>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  <li>• 🔒 Full screen lock enabled</li>
                  <li>• ⚠️ Tab switching detection</li>
                  <li>• ⌨️ Keyboard shortcut blocking</li>
                  <li>• 📹 Camera monitoring (Required)</li>
                  <li>• 🎤 Microphone monitoring (Required)</li>
                </ul>
                
                {/* Compatibility Status */}
                {selectedMode === "real" && (
                  <div className="mt-2 text-xs">
                    <div className={`flex items-center gap-1 ${compatibilityCheck.fullscreen ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="font-semibold">{compatibilityCheck.fullscreen ? '✓' : '✗'}</span>
                      Fullscreen: <span className="font-semibold">Required</span>
                    </div>
                    <div className={`flex items-center gap-1 ${compatibilityCheck.camera ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="font-semibold">{compatibilityCheck.camera ? '✓' : '✗'}</span>
                      Camera: <span className="font-semibold">Required</span>
                    </div>
                    <div className={`flex items-center gap-1 ${compatibilityCheck.microphone ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="font-semibold">{compatibilityCheck.microphone ? '✓' : '✗'}</span>
                      Microphone: <span className="font-semibold">Required</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Browser Compatibility Warning */}
        {selectedMode === "real" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> Real Mode requires fullscreen, camera, and microphone access. 
              All three are <span className="font-semibold">mandatory</span> for proctored assessments.
              {!compatibilityCheck.fullscreen && " Please use Chrome or Firefox for best compatibility."}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {selectedMode === "real" ? "Checking..." : "Continuing..."}
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}