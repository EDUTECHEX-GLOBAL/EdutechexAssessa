import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import ProctoringService from "./ProctoringService";

const useProctoringManager = ({ 
  assessment, 
  mode, 
  onProctoringReady,
  onViolation,
  onAutoSubmit,
  onSessionEnd
}) => {
  const [proctoringService, setProctoringService] = useState(null);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const startProctoringSession = useCallback(async (assessment, mode) => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      
      const response = await fetch("/api/proctoring/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentId: assessment._id,
          assessmentType: assessment.type === "sat" ? "sat" : "standard",
          mode: mode
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to start session");
      }

      return data.sessionId;
    } catch (error) {
      console.error("Failed to start proctoring session:", error);
      throw error;
    }
  }, []);

  const initializeProctoring = useCallback(async () => {
    if (!assessment || !mode) return;

    try {
      const sessionId = await startProctoringSession(assessment, mode);
      setCurrentSessionId(sessionId);

      if (mode === "real") {
        const service = new ProctoringService(
          sessionId,
          handleProctoringViolation,
          handleScreenLockChange,
          handleAutoSubmit
        );
        
        await service.initialize();
        setProctoringService(service);
      }

      if (onProctoringReady) {
        onProctoringReady(sessionId);
      }
      
    } catch (error) {
      console.error("Proctoring initialization failed:", error);
      toast.error(error.message);
      if (onProctoringReady) {
        onProctoringReady(null);
      }
    }
  }, [assessment, mode, startProctoringSession, onProctoringReady]);

  const enableScreenLock = useCallback(async () => {
  if (proctoringService && mode === "real") {
    try {
      console.log('ProctoringManager: Enabling screen lock...');
      await proctoringService.enableScreenLock();
      return true;
    } catch (error) {
      console.error("Failed to enable screen lock:", error);
      // Don't show toast here to avoid interrupting user experience
      return false;
    }
  }
  return true;
}, [proctoringService, mode]);

  const handleProctoringViolation = useCallback((violation) => {
    setViolationCount(violation.count);
    if (onViolation) {
      onViolation(violation);
    }
  }, [onViolation]);

  const handleScreenLockChange = useCallback((locked) => {
    setIsScreenLocked(locked);
  }, []);

  const handleAutoSubmit = useCallback((reason) => {
    if (onAutoSubmit) {
      onAutoSubmit(reason, currentSessionId);
    }
  }, [currentSessionId, onAutoSubmit]);

  const endProctoringSession = useCallback(async (submissionId) => {
    if (!currentSessionId) return;

    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      
      const response = await fetch("/api/proctoring/end-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          submissionId: submissionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end proctoring session');
      }

      if (proctoringService) {
        await proctoringService.cleanup();
        setProctoringService(null);
      }

      setCurrentSessionId(null);
      if (onSessionEnd) {
        onSessionEnd();
      }
      
    } catch (error) {
      console.error("Failed to end proctoring session:", error);
    }
  }, [currentSessionId, proctoringService, onSessionEnd]);

  useEffect(() => {
    if (assessment && mode) {
      initializeProctoring();
    }

    return () => {
      if (proctoringService) {
        proctoringService.cleanup();
      }
    };
  }, [assessment, mode]);

  // Add cleanup effect for when component unmounts
useEffect(() => {
  return () => {
    if (proctoringService) {
      console.log('Cleaning up proctoring service on unmount');
      proctoringService.cleanup();
    }
  };
}, [proctoringService]);

return {
  isScreenLocked,
  violationCount,
  currentSessionId,
  proctoringService,
  enableScreenLock,
  cleanupProctoring: endProctoringSession
};
};

export default useProctoringManager;