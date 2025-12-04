import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AssessmentUploadForm from './AssessmentUploadForm';
import SatAssessmentUploadForm from './SatAssessmentUploadForm';

export default function UploadAssessmentModal({ onClose }) {
  const [assessmentType, setAssessmentType] = useState(null);

  const handleTypeSelect = (type) => {
    setAssessmentType(type);
  };

  const handleBack = () => {
    setAssessmentType(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-5">
          <h2 className="text-xl font-semibold text-white">
            {assessmentType ? 'Upload Assessment' : 'Select Assessment Type'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!assessmentType ? (
              // Step 1: Select Type
              <motion.div
                key="type-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Choose Assessment Type</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Select the type of assessment you want to upload
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTypeSelect('standard')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">Standard</span>
                    <span className="text-sm text-gray-500 mt-1">Regular assessments</span>
                  </button>

                  <button
                    onClick={() => handleTypeSelect('sat')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center"
                  >
                    <div className="bg-indigo-100 p-3 rounded-full mb-3">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">SAT</span>
                    <span className="text-sm text-gray-500 mt-1">SAT specific assessments</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              // Step 2: Show Form
              <motion.div
                key="form-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500">Assessment Type</p>
                    <h3 className="text-lg font-medium text-gray-800">
                      {assessmentType === 'sat' ? 'SAT Assessment' : 'Standard Assessment'}
                    </h3>
                  </div>
                  <button
                    onClick={handleBack}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    ← Change Type
                  </button>
                </div>

                {assessmentType === 'standard' ? (
                  <AssessmentUploadForm onClose={onClose} />
                ) : (
                  <SatAssessmentUploadForm onClose={onClose} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}