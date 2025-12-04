export default class ProctoringService {
  constructor(sessionId, onViolation, onScreenLock, onAutoSubmit) {
    this.sessionId = sessionId;
    this.onViolation = onViolation;
    this.onScreenLock = onScreenLock;
    this.onAutoSubmit = onAutoSubmit;
    this.isActive = false;
    this.isScreenLocked = false;
    this.violationCount = 0;
    this.maxViolations = 3;
    this.faceDetectionInterval = null;
    this.fullScreenElement = null;
    this.microphoneCheckInterval = null;
    this.faceDetectionFailures = 0;
    this.maxFaceDetectionFailures = 5;
    this.fullscreenCheckInterval = null;
    this.shouldBeActive = true;   //Track if service should process violations
  }

  async initialize() {
  if (this.isActive) return;

  try {
    // Try to get media with relaxed constraints
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }).catch(error => {
      console.warn('Camera/microphone access not available:', error.message);
      // Return a dummy stream or null to continue without media
      return null;
    });

    this.setupEventListeners();
    this.isActive = true;

    // Only initialize face detection if we have a media stream
    if (this.mediaStream) {
      await this.initializeFaceDetection();
    } else {
      console.log('Proctoring service running without camera/microphone');
    }

  } catch (error) {
    console.warn('Proctoring initialization failed, continuing without media:', error.message);
    // Don't throw error - continue without camera/microphone
    this.setupEventListeners();
    this.isActive = true;
  }
}

  setupEventListeners() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    document.addEventListener('contextmenu', this.preventContextMenu);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    document.addEventListener('keydown', this.preventShortcuts);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    window.addEventListener('resize', this.handleResize);
    this.preventDeveloperTools();
  }

  async enableScreenLock() {
    // Check if we're already in fullscreen
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      this.isScreenLocked = true;
      if (this.onScreenLock) {
        this.onScreenLock(true);
      }
      return;
    }

    try {
      // Use document element directly
      const element = document.documentElement;
      
      let promise;
      if (element.requestFullscreen) {
        promise = element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        promise = element.webkitRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }

      await promise;
      
      this.isScreenLocked = true;
      this.fullScreenElement = element;
      
      // Enhanced security measures
      this.disableEscapeKey();
      this.preventUserActions();
      this.enhancedFullscreenMonitoring();
      
      if (this.onScreenLock) {
        this.onScreenLock(true);
      }
      
      console.log('Screen lock enabled successfully');
      
    } catch (error) {
      console.error('Failed to enable screen lock:', error);
      
      // Continue without screen lock but don't crash
      this.isScreenLocked = false;
      if (this.onScreenLock) {
        this.onScreenLock(false);
      }
      
      // Only log violation for unexpected errors
      if (!error.message.includes('user gesture') && 
          !error.message.includes('not supported')) {
        this.logViolation('fullscreen_failed', { error: error.message });
      }
    }
  }

  // Add missing preventUserActions method
  preventUserActions() {
    // Prevent text selection
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
    
    // Prevent drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
      e.preventDefault();
    });
  }

  disableEscapeKey() {
    document.addEventListener('keydown', this.preventEscapeKey, true);
  }

  preventEscapeKey = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      this.logViolation('escape_attempt');
    }
  };

  // FIXED: Prevent fullscreen loop
  handleFullscreenChange = () => {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    
    if (!isFullscreen && this.isScreenLocked) {
      // User exited fullscreen - log violation but don't auto-reenable
      this.logViolation('fullscreen_exit_attempt');
      
      // Update state to reflect that we're no longer locked
      this.isScreenLocked = false;
      if (this.onScreenLock) {
        this.onScreenLock(false);
      }
    } else if (isFullscreen) {
      // We're in fullscreen mode
      this.isScreenLocked = true;
      if (this.onScreenLock) {
        this.onScreenLock(true);
      }
    }
  };

  handleResize = () => {
    if (this.isScreenLocked && (window.screenTop < 0 || window.screenLeft < 0)) {
      this.logViolation('window_resize_attempt');
    }
  };

  preventDeveloperTools() {
    const blockedCombinations = [
      { key: 'F12', preventDefault: true },
      { ctrlKey: true, shiftKey: true, key: 'i' },
      { ctrlKey: true, shiftKey: true, key: 'j' },
      { ctrlKey: true, key: 'u' }
    ];

    document.addEventListener('keydown', (e) => {
      for (const combo of blockedCombinations) {
        const matches = Object.keys(combo).every(key => {
          if (key === 'preventDefault') return true;
          return e[key] === combo[key];
        });

        if (matches) {
          e.preventDefault();
          e.stopPropagation();
          this.logViolation('developer_tools_attempt', { key: e.key });
          return false;
        }
      }
    }, true);
  }

  async initializeFaceDetection() {
    const video = document.createElement('video');
    video.srcObject = this.mediaStream;
    video.play();

    // Only set one interval for face detection
    if (!this.faceDetectionInterval) {
      this.faceDetectionInterval = setInterval(() => {
        this.checkFacePresence(video);
      }, 5000);
    }
  }

  checkFacePresence(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const brightness = this.calculateAverageBrightness(imageData);

    if (brightness < 50) {
      this.logViolation('low_light_condition');
    }
  }

  calculateAverageBrightness(imageData) {
    let total = 0;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      total += brightness;
    }

    return total / (data.length / 4);
  }

  handleVisibilityChange = () => {
    if (document.hidden) {
      this.logViolation('tab_switch');
      // Don't auto-refocus as it causes issues
    }
  };

  preventContextMenu = (e) => {
    e.preventDefault();
    this.logViolation('right_click');
  };

  handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = 'Are you sure you want to leave? This may invalidate your assessment.';
    this.logViolation('page_leave_attempt');
  };

  preventShortcuts = (e) => {
    const blockedKeys = ['F12', 'F5', 'F11', 'PrintScreen', 'ScrollLock', 'Pause'];
    const refreshCombos = [
      { ctrlKey: true, key: 'r' },
      { ctrlKey: true, shiftKey: true, key: 'r' },
      { metaKey: true, key: 'r' }
    ];

    const isRefreshCombo = refreshCombos.some(combo =>
      e.ctrlKey === (combo.ctrlKey || false) &&
      e.shiftKey === (combo.shiftKey || false) &&
      e.metaKey === (combo.metaKey || false) &&
      e.key.toLowerCase() === combo.key
    );

    if (blockedKeys.includes(e.key) || isRefreshCombo) {
      e.preventDefault();
      e.stopPropagation();
      this.logViolation('keyboard_shortcut', { key: e.key });
    }
  };

    async logViolation(type, details = {}) {
  // Don't log violations if service is not supposed to be active
  if (!this.shouldBeActive) return;
  
  try {
    if (this.violationCount < this.maxViolations) {
      this.violationCount++;
    }
    
    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
    
    await fetch("/api/proctoring/log-violation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId: this.sessionId,
        violationType: type,
        details: { ...details, count: this.violationCount }
      }),
    });

    if (this.onViolation) {
      this.onViolation({ 
        type, 
        details, 
        count: this.violationCount 
      });
    }
    
    if (this.violationCount >= this.maxViolations && this.onAutoSubmit) {
      console.log(`Max violations reached (${this.violationCount}), triggering auto-submit`);
      this.onAutoSubmit('max_violations_reached');
    }
    
  } catch (error) {
    console.error("Failed to log violation:", error);
  }
}

// Add this method to forcefully release media devices
forceReleaseMediaDevices() {
  if (this.mediaStream) {
    this.mediaStream.getTracks().forEach(track => {
      track.stop();
      track.enabled = false;
    });
    this.mediaStream = null;
  }
  
  // Additional cleanup for media devices
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // This helps ensure devices are released
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        // Ignore errors, we're just trying to release devices
      });
  }
}

  async cleanup() {
  // Set service as inactive to prevent further violations
  this.shouldBeActive = false;
  
  // Clear all intervals
  if (this.faceDetectionInterval) {
    clearInterval(this.faceDetectionInterval);
    this.faceDetectionInterval = null;
  }
  if (this.fullscreenCheckInterval) {
    clearInterval(this.fullscreenCheckInterval);
    this.fullscreenCheckInterval = null;
  }
  if (this.microphoneCheckInterval) {
    clearInterval(this.microphoneCheckInterval);
    this.microphoneCheckInterval = null;
  }
  
  // Force release media devices
  this.forceReleaseMediaDevices();
    
    // Exit fullscreen safely
    if (this.isScreenLocked && (document.fullscreenElement || document.webkitFullscreenElement)) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
    
    // Remove all event listeners
    const events = {
      'visibilitychange': this.handleVisibilityChange,
      'contextmenu': this.preventContextMenu,
      'beforeunload': this.handleBeforeUnload,
      'keydown': this.preventShortcuts,
      'fullscreenchange': this.handleFullscreenChange,
      'webkitfullscreenchange': this.handleFullscreenChange,
      'resize': this.handleResize,
      'keydown': this.preventEscapeKey
    };
    
    Object.entries(events).forEach(([event, handler]) => {
      if (handler) {
        document.removeEventListener(event, handler);
        window.removeEventListener(event, handler);
      }
    });
    
    // Remove preventUserActions events
    document.removeEventListener('selectstart', this.preventUserActions);
    document.removeEventListener('dragstart', this.preventUserActions);
    document.removeEventListener('drop', this.preventUserActions);
    
    this.isActive = false;
    this.isScreenLocked = false;
    
    if (this.onScreenLock) {
      this.onScreenLock(false);
    }
    console.log('Proctoring service cleaned up completely');
  }

  // ==== ENHANCED MONITORING METHODS ====

  startStricterMediaMonitoring() {
  // Only start media monitoring if we have a media stream
  if (this.mediaStream) {
    if (!this.microphoneCheckInterval) {
      this.microphoneCheckInterval = setInterval(() => {
        this.checkMicrophoneActivity();
      }, 3000);
    }

    if (!this.faceDetectionInterval) {
      this.enhancedFaceDetection();
    }
  } else {
    console.log('Media monitoring disabled - no camera/microphone available');
  }
}

enhancedFaceDetection() {
  if (!this.mediaStream) return;
  
  const video = document.createElement('video');
  video.srcObject = this.mediaStream;
  video.play();

  if (this.faceDetectionInterval) {
    clearInterval(this.faceDetectionInterval);
  }
  
  this.faceDetectionInterval = setInterval(async () => {
    const faceDetected = await this.detectFacePresence(video);
    if (!faceDetected) {
      this.faceDetectionFailures++;
      if (this.faceDetectionFailures >= this.maxFaceDetectionFailures) {
        this.logViolation('face_not_detected', { consecutiveFailures: this.faceDetectionFailures });
      }
    } else {
      this.faceDetectionFailures = 0;
    }
  }, 4000);
}

  async detectFacePresence(video) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const brightness = this.calculateAverageBrightness(imageData);
      const contrast = this.calculateContrast(imageData);

      return brightness > 30 && brightness < 200 && contrast > 25;
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  }

  calculateContrast(imageData) {
    const data = imageData.data;
    let sum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += brightness;
      count++;
    }

    const mean = sum / count;
    let variance = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(brightness - mean, 2);
    }

    return Math.sqrt(variance / count);
  }

  enhancedFullscreenMonitoring() {
    if (!this.fullscreenCheckInterval) {
      this.fullscreenCheckInterval = setInterval(() => {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (!isFullscreen && this.isScreenLocked) {
          // Use the main handler instead of creating a separate one
          this.handleFullscreenChange();
        }
      }, 1000);
    }
  }
}