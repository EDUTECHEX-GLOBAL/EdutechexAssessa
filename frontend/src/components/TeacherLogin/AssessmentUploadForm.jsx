import { useState } from 'react';
import { FaTimes, FaFileUpload, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AssessmentUploadForm({ onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [assessmentName, setAssessmentName] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Validate file type and size
  const validateFile = (file) => {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/x-markdown'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) {
    alert('Please upload a valid file type (PDF, DOC, DOCX, MD)');
    return false;
  }

  if (file.size > maxSize) {
    alert('File size exceeds 10MB limit');
    return false;
  }

  return true;
};

  // File input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      }
    }
  };

  // Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      }
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !assessmentName || !subject || !gradeLevel) {
      alert('Please fill all fields and select a file.');
      return;
    }

    const teacherInfo = localStorage.getItem('teacherInfo')
      ? JSON.parse(localStorage.getItem('teacherInfo'))
      : null;

    const token = teacherInfo?.token;
    if (!token) {
      alert('You are not authenticated. Please login again.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assessmentName', assessmentName);
    formData.append('subject', subject);
    formData.append('gradeLevel', gradeLevel);

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/assessments/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUploadSuccess(true);
      console.log('Upload response:', response.data);
      if (onUploadSuccess && typeof onUploadSuccess === "function") {
  const newAssessmentId = response?.data?.assessment?._id;
  if (newAssessmentId) {
    onUploadSuccess(newAssessmentId);
  }
}

    } catch (error) {
      console.error('Upload failed:', error);
      const message =
        error.response?.data?.message || 'Upload failed. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-gray-200"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-center">
                <h3 className="text-lg font-semibold text-white">Upload Successful</h3>
              </div>
              
              <div className="p-5 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                  <FaCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-md font-medium text-gray-800 mb-1">
                  Assessment Uploaded Successfully!
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Your file has been processed and is now available.
                </p>
                <p className="text-xs text-gray-400">
                  Uploaded by: <span className="font-medium">
                    {JSON.parse(localStorage.getItem('teacherInfo'))?.name || "Teacher"}
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 px-4 py-3 flex justify-center">
                <button
                  onClick={() => {
                    setUploadSuccess(false);
                    onClose();
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Assessment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter assessment name"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter subject"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Grade Level <span className="text-red-500">*</span>
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            >
              <option value="">Select Grade</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Assessment File <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`mt-1 relative border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <FaFileUpload
                  className={`text-3xl ${dragActive ? 'text-indigo-600' : 'text-gray-400'}`}
                />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Click to upload</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.md"
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, MD up to 10MB</p>
              </div>
            </div>

            {fileName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
              >
                <span className="text-sm text-gray-700 truncate max-w-xs">{fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFileName('');
                  }}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaTimes />
                </button>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center min-w-28"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-1" />
                  Uploading...
                </>
              ) : (
                'Upload Assessment'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
