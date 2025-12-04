import { useEffect, useState } from 'react';

const ViolationAlert = ({ violation, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [violation, onClose]);

    const getViolationMessage = (type) => {
        const messages = {
            'tab_switch': 'Warning: Please do not switch tabs during the assessment',
            'inactivity': 'Warning: No activity detected. Please continue the assessment',
            'audio_silence': 'Warning: Microphone not detecting audio',
            'no_face_detected': 'Warning: Face not detected in camera',
            'multiple_faces': 'Warning: Multiple faces detected',
            'right_click': 'Warning: Right-click is disabled during assessment',
            'keyboard_shortcut': 'Warning: Keyboard shortcuts are disabled',
            'auto_submit': 'Assessment submitted automatically due to excessive violations'
        };
        return messages[type] || 'Proctoring violation detected';
    };

    const getViolationSeverity = (type) => {
        const severe = ['tab_switch', 'multiple_faces', 'auto_submit'];
        return severe.includes(type) ? 'high' : 'medium';
    };

    const severity = getViolationSeverity(violation.type);

    if (!visible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm ${
                severity === 'high' 
                    ? 'bg-red-50 border-red-500 text-red-800' 
                    : 'bg-yellow-50 border-yellow-500 text-yellow-800'
            }`}>
                <div className="flex items-start gap-3">
                    <div className={`text-lg mt-0.5 ${
                        severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                        ⚠️
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold">Proctoring Alert</h4>
                        <p className="text-sm mt-1">{getViolationMessage(violation.type)}</p>
                        {violation.details && (
                            <p className="text-xs opacity-75 mt-1">
                                {violation.details.count && `Violation #${violation.details.count}`}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-lg"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViolationAlert;